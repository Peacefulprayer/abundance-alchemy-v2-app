<?php
include_once 'config.php';

aa_require_method('POST');
$data = aa_read_json_input();
$email = trim((string)($data['email'] ?? ''));

if ($email === '') {
    aa_error_response('Email required', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    aa_error_response('Invalid email address', 400);
}

$rateLimit = aa_rate_limit_consume('api_password_reset', 5, 60 * 60, $email);
if (!$rateLimit['allowed']) {
    aa_log_auth_event($conn, 'password_reset_rate_limited', false, $email, null, 'user');
    aa_error_response('Too many reset requests. Please try again later.', 429, [
        'retryAfter' => $rateLimit['retry_after'],
    ]);
}

try {
    $stmt = $conn->prepare('SELECT id, name, email FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['email'])) {
        aa_issue_password_reset(
            $conn,
            (int)($user['id'] ?? 0),
            (string)$user['email'],
            (string)($user['name'] ?? '')
        );
    }

    aa_log_auth_event(
        $conn,
        'password_reset_requested',
        true,
        $email,
        $user ? (int)($user['id'] ?? 0) : null,
        'user',
        ['matched_user' => (bool)$user]
    );

    aa_json_response(['message' => 'Reset link sent']);
} catch (Throwable $e) {
    error_log('[api/request-password-reset.php] Reset request failed: ' . $e->getMessage());
    aa_log_auth_event($conn, 'password_reset_request_error', false, $email, null, 'user', ['error' => 'server_error']);
    aa_error_response('Error', 500);
}
