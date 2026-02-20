<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit();
}

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid affirmation id']);
    exit();
}

try {
    $stmt = $conn->prepare("
        DELETE FROM user_affirmations
        WHERE id = :id
          AND user_id = :uid
        LIMIT 1
    ");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'deleted' => $stmt->rowCount() > 0,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo json_encode(['message' => 'Delete failed', 'error' => $e->getMessage()]);
    } else {
        echo json_encode(['message' => 'Delete failed']);
    }
}
?>
