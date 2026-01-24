<?php
require_once '../config.php';
require_once '../db.php';

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    http_response_code(200);
    exit();
}

// CORS + JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

$email = isset($_GET['email']) ? trim((string)$_GET['email']) : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Valid email is required"]);
    exit();
}

try {
    // Select the fields your frontend needs to validate + hydrate.
    // Add/remove columns here as needed to match your users table.
    $stmt = $pdo->prepare("
        SELECT id, name, email, level, streak, focus_area, affirmations_completed
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        exit();
    }

    $focusAreas = [];
    if (!empty($user['focus_area'])) {
        $focusAreas = array_values(array_filter(array_map('trim', explode(',', (string)$user['focus_area']))));
    }

    echo json_encode([
        "id" => (int)$user["id"],
        "name" => (string)$user["name"],
        "email" => (string)$user["email"],
        "streak" => isset($user["streak"]) ? (int)$user["streak"] : 0,
        "level" => isset($user["level"]) ? (int)$user["level"] : 1,
        "focusAreas" => $focusAreas,
        "affirmationsCompleted" => isset($user["affirmations_completed"]) ? (int)$user["affirmations_completed"] : 0
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error"]);
}