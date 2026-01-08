<?php
require_once '../config.php';
require_once '../db.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

try {
    $stmt = $pdo->query("SELECT slot, image_url FROM backgrounds WHERE is_active = 1");
    $result = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $slot = $row['slot'];
        $result[$slot] = [
            'imageUrl' => $row['image_url'],
        ];
    }

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error loading backgrounds']);
}