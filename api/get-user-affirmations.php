<?php
include_once 'config.php';

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

if ($userId > 0) {
    $query = "
        SELECT id, text, type, created_at
        FROM user_affirmations
        WHERE user_id = :uid
        ORDER BY created_at DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":uid", $userId, PDO::PARAM_INT);
    $stmt->execute();
    
    $data = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    http_response_code(401);
    echo json_encode([]);
}
?>
