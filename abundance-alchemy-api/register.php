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

// CORS + JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Get JSON input
$raw  = file_get_contents("php://input");
$data = json_decode($raw);

// Basic validation
if (!$data || !isset($data->name, $data->email, $data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields"]);
    exit();
}

$name     = trim((string) $data->name);
$email    = trim((string) $data->email);
$password = (string) $data->password;

if ($name === '' || $email === '') {
    http_response_code(400);
    echo json_encode(["message" => "Name and email are required"]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid email address"]);
    exit();
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "An account with this email already exists"]);
        exit();
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Optional focus areas (front-end may send array of strings)
    $focusArea = '';
    if (isset($data->focusAreas) && is_array($data->focusAreas)) {
        $focusArea = implode(',', array_map('strval', $data->focusAreas));
    }

    // Insert user: match your schema
    // users: id, name, email, password_hash, created_at, last_login,
    //        level, streak, focus_area, push_token, profile_img, more_info, affirmations_completed
    $sql = "INSERT INTO users
                (name, email, password_hash, level, streak, focus_area, profile_img, more_info)
            VALUES
                (:name, :email, :password_hash, :level, :streak, :focus_area, :profile_img, :more_info)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name'          => $name,
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':level'         => 1,
        ':streak'        => 0,
        ':focus_area'    => $focusArea,
        ':profile_img'   => '',
        ':more_info'     => '',
    ]);

    $userId = (int) $pdo->lastInsertId();

    // ------------------------------------------------------------------
    // SEND WELCOME EMAIL (same template as admin/add-user.php)
    // ------------------------------------------------------------------
    $welcome_path = __DIR__ . '/../admin/email_templates/welcome.txt';
    $welcome_dir  = dirname($welcome_path);

    if (!is_dir($welcome_dir)) {
        mkdir($welcome_dir, 0777, true);
    }

    if (!file_exists($welcome_path)) {
        $default_tpl = "Welcome {name}!\n\nThank you for joining Abundance Alchemy.";
        file_put_contents($welcome_path, $default_tpl);
    }

    $email_tpl = @file_get_contents($welcome_path);
    if ($email_tpl !== false) {
        $body = str_replace(
            ['{name}', '{email}'],
            [$name, $email],
            $email_tpl
        );

        $serverName = $_SERVER['SERVER_NAME'] ?? 'abundantthought.com';
        @mail($email, "Welcome to Abundance Alchemy", $body, "From: admin@" . $serverName);
    }

    // ------------------------------------------------------------------
    // Return success with ID - matches your original API shape
    // ------------------------------------------------------------------
    http_response_code(201);
    echo json_encode([
        "id"     => $userId,
        "name"   => $name,
        "email"  => $email,
        "streak" => 0,
        "level"  => 1,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    // You can hide the error in production if you want
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}