<?php
// API: request password reset
// POST JSON: { "email": "user@example.com" }

include_once 'config.php';                       // $conn, CORS & JSON headers
require_once __DIR__ . '/../password-reset-helpers.php'; // $pdo in that file, but helpers accept any PDO

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

$email = isset($data['email']) ? trim($data['email']) : '';

if ($email === '') {
    http_response_code(400);
    echo json_encode(["message" => "Email required"]);
    exit();
}

try {
    $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['email'])) {
        // Use the same helper used by forgot-password.php
        aa_send_password_reset_email_public(
            $conn,                    // $conn is also a PDO instance
            (int)$user['id'],
            $user['email'],
            $user['name'] ?? ''
        );
    }

    // Same message as before, but now actually sends an email if possible.
    echo json_encode(["message" => "Reset link sent"]);
} catch (PDOException $e) {
    error_log('[api/request-password-reset.php] Reset request failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Error"]);
}
