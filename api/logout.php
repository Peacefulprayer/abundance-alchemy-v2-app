<?php
include_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

api_require_csrf();

$identity = aa_get_session_identity();
if ($identity['userId'] > 0 && $identity['userEmail'] !== '') {
    aa_log_auth_event($conn, 'logout_succeeded', true, $identity['userEmail'], $identity['userId'], 'user');
}

// Clear session data
$_SESSION = [];

// Remove session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}

session_destroy();

echo json_encode(["success" => true]);
