<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

$pending = $_SESSION['pending_admin_login'] ?? null;
if (!is_array($pending) || empty($pending['id']) || empty($pending['email'])) {
    header('Location: login.php');
    exit;
}

if ((time() - (int)($pending['started_at'] ?? 0)) > 10 * 60) {
    unset($_SESSION['pending_admin_login']);
    header('Location: login.php');
    exit;
}

aa_ensure_admin_mfa_columns($pdo);

$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    aa_require_valid_csrf();
    $code = trim((string)($_POST['code'] ?? ''));

    $stmt = $pdo->prepare('SELECT id, name, email, role, totp_secret, totp_enabled FROM admins WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$pending['id']]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || !aa_admin_totp_is_enabled($admin)) {
        aa_log_auth_event($pdo, 'admin_mfa_failed', false, (string)$pending['email'], (int)$pending['id'], 'admin', ['reason' => 'config_missing']);
        unset($_SESSION['pending_admin_login']);
        $err = 'Multi-factor verification is unavailable for this account.';
    } elseif (!aa_verify_totp_code((string)$admin['totp_secret'], $code)) {
        aa_log_auth_event($pdo, 'admin_mfa_failed', false, (string)$admin['email'], (int)$admin['id'], 'admin', ['reason' => 'invalid_code']);
        $err = 'Invalid verification code.';
    } else {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        $_SESSION['admin_name'] = (string)$admin['name'];
        $_SESSION['admin_role'] = (string)$admin['role'];
        $_SESSION['admin_email'] = (string)$admin['email'];
        unset($_SESSION['pending_admin_login']);
        aa_log_auth_event($pdo, 'admin_mfa_verified', true, (string)$admin['email'], (int)$admin['id'], 'admin');
        aa_log_auth_event($pdo, 'admin_login_succeeded', true, (string)$admin['email'], (int)$admin['id'], 'admin', ['via' => 'mfa']);
        header('Location: dashboard.php');
        exit;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Verify MFA - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        body { background: #fff; font-family: Trebuchet MS, sans-serif; }
        .verify-box { max-width: 430px; margin: 80px auto; padding: 32px; border-radius: 8px; box-shadow: 0 0 16px #eee; }
        .btn-primary { background: #FF6600; border: none; }
    </style>
</head>
<body>
    <div class="verify-box bg-light">
        <h3 class="text-center mb-3">Admin Verification</h3>
        <p class="text-muted text-center">Enter the 6-digit code from your authenticator app for <?= htmlspecialchars((string)$pending['email']) ?>.</p>
        <?php if ($err): ?>
          <div class="alert alert-danger"><?= htmlspecialchars($err) ?></div>
        <?php endif; ?>
        <form method="post" autocomplete="one-time-code">
            <?php aa_csrf_field(); ?>
            <div class="mb-3">
                <label>Verification Code</label>
                <input type="text" name="code" class="form-control" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required autofocus>
            </div>
            <button class="btn btn-primary w-100">Verify</button>
        </form>
        <div class="text-center mt-3">
            <a href="login.php">Start over</a>
        </div>
    </div>
</body>
</html>
