<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->text) && !empty($data->type)) {
    $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
    $type = strtoupper(trim((string)$data->type));
    $allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
    $text = trim((string)$data->text);

    if ($userId > 0 && $text !== '' && in_array($type, $allowedTypes, true)) {
        $query = "INSERT INTO user_affirmations (user_id, text, type, created_at) VALUES (:uid, :text, :type, NOW())";
        $insert = $conn->prepare($query);
        
        $insert->bindParam(":uid", $userId);
        $insert->bindParam(":text", $text);
        $insert->bindParam(":type", $type);
        
        if ($insert->execute()) {
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Database error"]);
        }
    } else {
        http_response_code(400);
        if ($userId <= 0) {
            echo json_encode(["message" => "Unauthorized"]);
        } else {
            echo json_encode(["message" => "Invalid affirmation payload"]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
?>
