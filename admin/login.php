<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Optional CSRF check for login form – can be commented out if it causes issues
    aa_require_valid_csrf();

    $email = $_POST['email'] ?? '';
    $pass  = $_POST['password'] ?? '';
    $rateLimit = aa_rate_limit_consume('admin_login', 10, 15 * 60, (string)$email);

    if (!$rateLimit['allowed']) {
        aa_log_auth_event($pdo, 'admin_login_rate_limited', false, (string)$email, null, 'admin');
        http_response_code(429);
        $err = 'Too many login attempts. Please try again later.';
    } else {
        $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();
        if (is_array($admin)) {
            aa_ensure_admin_mfa_columns($pdo);
        }

        if ($admin && password_verify($pass, $admin['password_hash'])) {
            // Regenerate session ID on successful login
            session_regenerate_id(true);
            if (aa_admin_totp_is_enabled($admin)) {
                $_SESSION['pending_admin_login'] = [
                    'id' => (int)$admin['id'],
                    'name' => (string)$admin['name'],
                    'role' => (string)$admin['role'],
                    'email' => (string)$admin['email'],
                    'started_at' => time(),
                ];
                aa_log_auth_event($pdo, 'admin_password_verified_pending_mfa', true, (string)$admin['email'], (int)$admin['id'], 'admin');
                header("Location: verify-mfa.php");
                exit;
            }

            $_SESSION['admin_id']   = $admin['id'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_role'] = $admin['role'];
            $_SESSION['admin_email'] = $admin['email'];
            unset($_SESSION['pending_admin_login']);
            aa_log_auth_event($pdo, 'admin_login_succeeded', true, (string)$admin['email'], (int)$admin['id'], 'admin');

            header("Location: dashboard.php");
            exit;
        } else {
            aa_log_auth_event($pdo, 'admin_login_failed', false, (string)$email, null, 'admin');
            $err = "Invalid login credentials.";
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        body { background: #fff; font-family: Trebuchet MS, sans-serif; }
        .login-box { max-width: 430px; margin: 80px auto; padding: 32px; border-radius: 8px; box-shadow: 0 0 16px #eee; }
        .logo { display: block; margin: 0 auto 24px; }
        .btn-primary { background: #FF6600; border: none; }
    </style>
</head>
<body>
    <div class="login-box bg-light">
        <img src="assets/images/logo.png" width="120" class="logo" alt="Logo">
        <h3 class="text-center mb-3">Admin Login</h3>
        <?php if ($err): ?>
          <div class="alert alert-danger"><?= htmlspecialchars($err) ?></div>
        <?php endif; ?>
        <form method="post" autocomplete="off">
            <?php aa_csrf_field(); ?>
            <div class="mb-3">
                <label>Email:</label>
                <input type="email" name="email" class="form-control" required autofocus>
            </div>
            <div class="mb-3">
                <label>Password:</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button class="btn btn-primary w-100">Login</button>
        </form>
    </div>
</body>
</html>
