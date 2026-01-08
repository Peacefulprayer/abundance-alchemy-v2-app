<?php
require_once '../config.php';
require_once '../db.php';

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    http_response_code(200);
    exit();
}

// CORS + JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

$raw  = file_get_contents("php://input");
$data = json_decode($raw);

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing credentials"]);
    exit();
}

$email    = trim((string) $data->email);
$password = (string) $data->password;

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['password_hash']) && password_verify($password, $user['password_hash'])) {
        // Update last_login
        $update = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $update->execute([$user['id']]);

        echo json_encode([
            "name"                  => $user['name'],
            "email"                 => $user['email'],
            "streak"                => (int)($user['streak'] ?? 0),
            "level"                 => (int)($user['level'] ?? 1),
            "focusAreas"            => $user['focus_area']
                ? explode(',', $user['focus_area'])
                : ["Wealth"],
            "affirmationsCompleted" => (int)($user['affirmations_completed'] ?? 0),
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error"]);
}