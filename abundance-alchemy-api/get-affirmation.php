<?php
include_once 'config.php';

$type = isset($_GET['type']) ? $_GET['type'] : 'MORNING_IAM';
$category = isset($_GET['category']) ? $_GET['category'] : 'General';

// Try to match category, otherwise just match type
$query = "SELECT text FROM affirmations WHERE type = :type AND (category = :cat OR category = 'General') AND is_active = 1 ORDER BY RAND() LIMIT 1";
$stmt = $conn->prepare($query);
$stmt->bindParam(":type", $type);
$stmt->bindParam(":cat", $category);
$stmt->execute();

if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($row);
} else {
    echo json_encode(["text" => "I am capable of creating magic."]);
}
?>