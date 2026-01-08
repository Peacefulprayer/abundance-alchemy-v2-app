<?php
include_once 'config.php';

$email = isset($_GET['email']) ? $_GET['email'] : '';

if ($email) {
    // Join to get user ID first, or just join directly
    $query = "SELECT ua.* FROM user_affirmations ua 
              JOIN users u ON ua.user_id = u.id 
              WHERE u.email = :email 
              ORDER BY ua.created_at DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    
    $data = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }
    echo json_encode($data);
} else {
    echo json_encode([]);
}
?>