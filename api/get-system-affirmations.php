<?php
include_once 'config.php';

$allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
$type = isset($_GET['type']) ? strtoupper(trim((string)$_GET['type'])) : 'MORNING_IAM';
if (!in_array($type, $allowedTypes, true)) {
    $type = 'MORNING_IAM';
}

try {
    $query = "
        SELECT id, text, type, category, created_at
        FROM affirmations
        WHERE type = :type
          AND is_active = 1
        ORDER BY id DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindValue(':type', $type, PDO::PARAM_STR);
    $stmt->execute();

    $affirmations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($affirmations);
} catch (Throwable $e) {
    http_response_code(500);
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo json_encode(['message' => 'Failed to load affirmations', 'error' => $e->getMessage()]);
    } else {
        echo json_encode(['message' => 'Failed to load affirmations']);
    }
}
?>
