<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

aa_ensure_admin_mfa_columns($pdo);

$adminId = (int)$_SESSION['admin_id'];
$message = '';
$error = '';

$loadAdmin = static function () use ($pdo, $adminId): ?array {
    $stmt = $pdo->prepare('SELECT id, name, email, role, password_hash, totp_secret, totp_enabled FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([$adminId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return is_array($row) ? $row : null;
};

$admin = $loadAdmin();
if (!$admin) {
    header('Location: logout.php');
    exit;
}

if (empty($_SESSION['admin_mfa_setup_secret']) && empty($admin['totp_secret'])) {
    $_SESSION['admin_mfa_setup_secret'] = aa_generate_totp_secret();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    aa_require_valid_csrf();
    $action = trim((string)($_POST['action'] ?? ''));
    $password = (string)($_POST['current_password'] ?? '');
    $code = trim((string)($_POST['code'] ?? ''));

    if (!password_verify($password, (string)$admin['password_hash'])) {
        $error = 'Current password is required.';
    } elseif ($action === 'enable_mfa') {
        $secret = trim((string)($_SESSION['admin_mfa_setup_secret'] ?? ''));
        if ($secret === '') {
            $secret = aa_generate_totp_secret();
            $_SESSION['admin_mfa_setup_secret'] = $secret;
        }

        if (!aa_verify_totp_code($secret, $code)) {
            $error = 'Verification code is invalid.';
        } else {
            $stmt = $pdo->prepare('UPDATE admins SET totp_secret = ?, totp_enabled = 1 WHERE id = ?');
            $stmt->execute([$secret, $adminId]);
            unset($_SESSION['admin_mfa_setup_secret']);
            aa_log_auth_event($pdo, 'admin_mfa_enabled', true, (string)$admin['email'], $adminId, 'admin');
            $message = 'Multi-factor authentication is now enabled.';
            $admin = $loadAdmin();
        }
    } elseif ($action === 'disable_mfa') {
        if (!aa_verify_totp_code((string)($admin['totp_secret'] ?? ''), $code)) {
            $error = 'Verification code is invalid.';
        } else {
            $stmt = $pdo->prepare('UPDATE admins SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?');
            $stmt->execute([$adminId]);
            $_SESSION['admin_mfa_setup_secret'] = aa_generate_totp_secret();
            aa_log_auth_event($pdo, 'admin_mfa_disabled', true, (string)$admin['email'], $adminId, 'admin');
            $message = 'Multi-factor authentication has been disabled.';
            $admin = $loadAdmin();
        }
    }
}

$setupSecret = !empty($admin['totp_secret']) ? (string)$admin['totp_secret'] : (string)($_SESSION['admin_mfa_setup_secret'] ?? '');
$otpauthUri = $setupSecret !== '' ? aa_admin_totp_otpauth_uri((string)$admin['email'], $setupSecret) : '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Security - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        .aa-qr-shell {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: flex-start;
        }

        .aa-qr-card {
            min-width: 220px;
            padding: 1rem;
            border-radius: 1rem;
            background: #ffffff;
            border: 1px solid rgba(15, 23, 42, 0.08);
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        }

        .aa-qr-target {
            width: 192px;
            min-height: 192px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }

        .aa-qr-target img,
        .aa-qr-target canvas {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0 auto;
        }
    </style>
</head>
<body class="bg-light">
<?php include 'header.php'; ?>
<div class="container py-5" style="max-width: 760px;">
    <h2>Security</h2>
    <p class="text-muted">Protect admin access with a time-based one-time password authenticator app.</p>

    <?php if ($message): ?><div class="alert alert-success"><?= htmlspecialchars($message) ?></div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-danger"><?= htmlspecialchars($error) ?></div><?php endif; ?>

    <div class="card shadow-sm p-4">
        <h5 class="mb-3">Admin MFA</h5>
        <p>Status:
            <strong><?= !empty($admin['totp_enabled']) ? 'Enabled' : 'Disabled' ?></strong>
        </p>

        <?php if (empty($admin['totp_enabled'])): ?>
            <p class="mb-2">Add this secret to your authenticator app, then enter the current password and generated code to enable MFA.</p>
            <div class="alert alert-secondary">
                <div class="aa-qr-shell">
                    <div class="aa-qr-card text-center">
                        <div
                            id="admin-mfa-qr"
                            class="aa-qr-target"
                            data-otpauth="<?= htmlspecialchars($otpauthUri, ENT_QUOTES, 'UTF-8') ?>"
                        >
                            <span class="text-muted small">QR code loading...</span>
                        </div>
                        <div class="mt-3 small text-muted">
                            Scan this with Google Authenticator or another TOTP app.
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <div><strong>Secret:</strong> <code><?= htmlspecialchars($setupSecret) ?></code></div>
                        <div class="mt-2"><strong>otpauth URI:</strong> <code><?= htmlspecialchars($otpauthUri) ?></code></div>
                        <div class="mt-2 text-muted small">
                            Manual setup still works if QR loading is blocked.
                        </div>
                    </div>
                </div>
            </div>
            <form method="post" class="row g-3">
                <?php aa_csrf_field(); ?>
                <input type="hidden" name="action" value="enable_mfa">
                <div class="col-md-6">
                    <label class="form-label">Current Password</label>
                    <input type="password" name="current_password" class="form-control" autocomplete="current-password" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Authenticator Code</label>
                    <input type="text" name="code" class="form-control" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required>
                </div>
                <div class="col-12">
                    <button class="btn btn-primary">Enable MFA</button>
                </div>
            </form>
        <?php else: ?>
            <p class="mb-2">MFA is active for this admin account. To disable it, confirm with the current password and a valid authenticator code.</p>
            <form method="post" class="row g-3">
                <?php aa_csrf_field(); ?>
                <input type="hidden" name="action" value="disable_mfa">
                <div class="col-md-6">
                    <label class="form-label">Current Password</label>
                    <input type="password" name="current_password" class="form-control" autocomplete="current-password" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Authenticator Code</label>
                    <input type="text" name="code" class="form-control" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required>
                </div>
                <div class="col-12">
                    <button class="btn btn-outline-danger">Disable MFA</button>
                </div>
            </form>
        <?php endif; ?>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
  (function () {
    var target = document.getElementById('admin-mfa-qr');
    if (!target || typeof QRCode === 'undefined') {
      if (target) {
        target.innerHTML = '<span class="text-danger small">QR code unavailable. Use the secret below.</span>';
      }
      return;
    }

    var otpauth = target.getAttribute('data-otpauth') || '';
    if (!otpauth) {
      target.innerHTML = '<span class="text-danger small">Missing setup code.</span>';
      return;
    }

    target.innerHTML = '';
    new QRCode(target, {
      text: otpauth,
      width: 192,
      height: 192,
      correctLevel: QRCode.CorrectLevel.M
    });
  })();
</script>
</body>
</html>
