<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->text) && !empty($data->type)) {
    // 1. Get User ID from Email
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // 2. Insert Affirmation
        $query = "INSERT INTO user_affirmations (user_id, text, type, created_at) VALUES (:uid, :text, :type, NOW())";
        $insert = $conn->prepare($query);
        
        $insert->bindParam(":uid", $user['id']);
        $insert->bindParam(":text", $data->text);
        $insert->bindParam(":type", $data->type);
        
        if ($insert->execute()) {
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Database error"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
?>