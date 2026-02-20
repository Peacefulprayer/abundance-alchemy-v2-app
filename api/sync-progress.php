<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

if ($userId > 0 && $data) {
    // Convert array to JSON string for storage if multiple, or just take the first string
    $focusArea = '';
    if (isset($data->focusAreas)) {
        $focusArea = is_array($data->focusAreas) ? implode(", ", $data->focusAreas) : (string)$data->focusAreas;
    }

    $streak = isset($data->streak) ? (int)$data->streak : 0;
    $level = isset($data->level) ? (int)$data->level : 1;
    $affirmationsCompleted = isset($data->affirmationsCompleted) ? (int)$data->affirmationsCompleted : 0;

    $query = "
        UPDATE users
        SET streak = :streak,
            level = :level,
            affirmations_completed = :ac,
            focus_area = :fa
        WHERE id = :uid
    ";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(":streak", $streak, PDO::PARAM_INT);
    $stmt->bindParam(":level", $level, PDO::PARAM_INT);
    $stmt->bindParam(":ac", $affirmationsCompleted, PDO::PARAM_INT);
    $stmt->bindParam(":fa", $focusArea);
    $stmt->bindParam(":uid", $userId, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed"]);
    }
} else {
    if ($userId <= 0) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid payload"]);
    }
}
?>
