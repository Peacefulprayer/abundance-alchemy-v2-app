<?php
include_once 'config.php';

aa_require_method('POST');

function aa_send_password_reset_email_fallback(string $email, string $name = ''): void
{
    $templatePath = __DIR__ . '/../admin/email_templates/password_reset.txt';
    $template = @file_get_contents($templatePath);
    if ($template === false || trim($template) === '') {
        $template = "Hello {name},\n\nWe received a request to reset your Abundance Alchemy password. If you made this request, please contact support or use the latest reset instructions provided by the team.\n\nEmail: {email}\n";
    }

    $body = str_replace(
        ['{name}', '{email}'],
        [$name !== '' ? $name : 'there', $email],
        $template
    );

    $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
    @mail($email, 'Abundance Alchemy Password Reset', $body, 'From: no-reply@' . $serverName);
}

$data = aa_read_json_input();
$email = trim((string)($data['email'] ?? ''));

if ($email === '') {
    aa_error_response('Email required', 400);
}

try {
    $stmt = $conn->prepare('SELECT id, name, email FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['email'])) {
        aa_send_password_reset_email_fallback($user['email'], (string)($user['name'] ?? ''));
    }

    aa_json_response(['message' => 'Reset link sent']);
} catch (Throwable $e) {
    error_log('[api/request-password-reset.php] Reset request failed: ' . $e->getMessage());
    aa_error_response('Error', 500);
}
