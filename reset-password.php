<?php
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/api/helpers.php';

aa_send_common_security_headers();
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow');

$token = trim((string)($_POST['token'] ?? $_GET['token'] ?? ''));
$message = '';
$error = '';
$success = false;
$resetRecord = null;
$appRoot = aa_public_app_root_path();
$returnHref = $appRoot === '' ? './' : $appRoot . '/';

if ($token !== '' && aa_password_reset_token_is_well_formed($token)) {
    $resetRecord = aa_find_valid_password_reset($pdo, $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rateLimit = aa_rate_limit_consume('reset_password_submit', 10, 60 * 60, $token);
    if (!$rateLimit['allowed']) {
        $error = 'Too many reset attempts. Please wait and try again.';
    } elseif (!aa_password_reset_token_is_well_formed($token) || !$resetRecord) {
        $error = 'This password reset link is invalid or has expired.';
    } else {
        $password = (string)($_POST['password'] ?? '');
        $passwordConfirm = (string)($_POST['password_confirm'] ?? '');

        if (strlen($password) < 8) {
            $error = 'Password must be at least 8 characters.';
        } elseif (!hash_equals($password, $passwordConfirm)) {
            $error = 'Passwords do not match.';
        } else {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            if ($passwordHash === false) {
                $error = 'Unable to reset password right now.';
            } elseif (aa_consume_password_reset($pdo, $token, $passwordHash)) {
                $success = true;
                $message = 'Your password has been updated. You can return to the app and sign in.';
                $resetRecord = null;
            } else {
                $error = 'This password reset link is invalid or has expired.';
            }
        }
    }
}

$emailHint = '';
if (is_array($resetRecord) && !empty($resetRecord['email'])) {
    $emailHint = (string)$resetRecord['email'];
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Password | Abundance Alchemy</title>
  <style>
    :root {
      color-scheme: dark;
      --bg-1: #0f172a;
      --bg-2: #1e293b;
      --card: rgba(15, 23, 42, 0.9);
      --border: rgba(251, 191, 36, 0.28);
      --text: #f8fafc;
      --muted: #cbd5e1;
      --accent: #f59e0b;
      --accent-2: #fb923c;
      --danger: #fca5a5;
      --success: #86efac;
      --input: rgba(15, 23, 42, 0.92);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Avenir Next", Avenir, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top, rgba(251, 191, 36, 0.14), transparent 40%),
        linear-gradient(180deg, var(--bg-1), #020617 70%);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: min(100%, 440px);
      padding: 28px;
      border-radius: 24px;
      background: var(--card);
      border: 1px solid var(--border);
      box-shadow: 0 24px 64px rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(18px);
    }

    .eyebrow {
      margin: 0 0 10px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 10px;
      font-size: 30px;
      line-height: 1.15;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
    }

    .status {
      margin-top: 18px;
      padding: 14px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .status.error {
      background: rgba(127, 29, 29, 0.35);
      border: 1px solid rgba(248, 113, 113, 0.28);
      color: var(--danger);
    }

    .status.success {
      background: rgba(20, 83, 45, 0.35);
      border: 1px solid rgba(74, 222, 128, 0.28);
      color: var(--success);
    }

    form {
      margin-top: 22px;
    }

    label {
      display: block;
      margin-bottom: 14px;
      font-size: 14px;
      color: var(--muted);
    }

    input {
      width: 100%;
      margin-top: 8px;
      padding: 14px 16px;
      border-radius: 14px;
      border: 1px solid rgba(148, 163, 184, 0.25);
      background: var(--input);
      color: var(--text);
      font-size: 16px;
      outline: none;
    }

    input:focus {
      border-color: rgba(251, 191, 36, 0.7);
      box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18);
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 18px;
      flex-wrap: wrap;
    }

    .button,
    .link-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid transparent;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
    }

    .button {
      background: linear-gradient(135deg, var(--accent), var(--accent-2));
      color: #111827;
    }

    .link-button {
      border-color: rgba(148, 163, 184, 0.3);
      color: var(--text);
      background: transparent;
    }

    .meta {
      margin-top: 14px;
      font-size: 13px;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Abundance Alchemy</p>
    <h1>Reset your password</h1>
    <?php if ($success): ?>
      <p><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
      <div class="status success">Your reset link has been consumed and can no longer be used.</div>
      <div class="actions">
        <a class="link-button" href="<?= htmlspecialchars($returnHref, ENT_QUOTES, 'UTF-8') ?>">Return to the app</a>
      </div>
    <?php elseif ($resetRecord): ?>
      <p>Create a new password for <?= htmlspecialchars($emailHint, ENT_QUOTES, 'UTF-8') ?>. This link expires after one hour and can only be used once.</p>
      <?php if ($error !== ''): ?>
        <div class="status error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>
      <form method="post" action="">
        <input type="hidden" name="token" value="<?= htmlspecialchars($token, ENT_QUOTES, 'UTF-8') ?>">
        <label>
          New password
          <input type="password" name="password" autocomplete="new-password" required minlength="8">
        </label>
        <label>
          Confirm password
          <input type="password" name="password_confirm" autocomplete="new-password" required minlength="8">
        </label>
        <div class="actions">
          <button class="button" type="submit">Update password</button>
          <a class="link-button" href="<?= htmlspecialchars($returnHref, ENT_QUOTES, 'UTF-8') ?>">Cancel</a>
        </div>
      </form>
      <p class="meta">Use a password you do not reuse elsewhere.</p>
    <?php else: ?>
      <p>This password reset link is invalid, expired, or has already been used.</p>
      <?php if ($error !== ''): ?>
        <div class="status error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
      <?php endif; ?>
      <div class="actions">
        <a class="link-button" href="<?= htmlspecialchars($returnHref, ENT_QUOTES, 'UTF-8') ?>">Return to the app</a>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>
