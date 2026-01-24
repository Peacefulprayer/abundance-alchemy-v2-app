<?php
// Shared API bootstrap for Abundance Alchemy.
// - Sets CORS & JSON headers
// - Creates $conn PDO using root config.php

require_once __DIR__ . '/../config.php';

// CORS allowlist
$origin         = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = unserialize(ALLOWED_ORIGINS);
$defaultOrigin  = $allowedOrigins[0] ?? '*';

if ($origin && is_array($allowedOrigins) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    // fallback – you can change this to be stricter if you want
    header("Access-Control-Allow-Origin: {$defaultOrigin}");
}
header("Vary: Origin");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create PDO connection for API
try {
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASSWORD,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        http_response_code(500);
        echo json_encode(["message" => "DB Connection failed: " . $e->getMessage()]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Database connection error"]);
    }
    exit();
}