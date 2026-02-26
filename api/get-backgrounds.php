<?php
include_once 'config.php';

try {
    $hasCreatorName = false;
    try {
        $colStmt = $conn->query("SHOW COLUMNS FROM backgrounds LIKE 'creator_name'");
        $hasCreatorName = $colStmt && (bool)$colStmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $hasCreatorName = false;
    }

    $sql = $hasCreatorName
        ? "SELECT slot, image_url, creator_name FROM backgrounds WHERE is_active = 1"
        : "SELECT slot, image_url FROM backgrounds WHERE is_active = 1";
    $stmt = $conn->query($sql);
    $result = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $slot = $row['slot'];
        $result[$slot] = [
            'imageUrl' => $row['image_url'],
            'creatorName' => $hasCreatorName ? (string)($row['creator_name'] ?? '') : '',
        ];
    }

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error loading backgrounds']);
}
