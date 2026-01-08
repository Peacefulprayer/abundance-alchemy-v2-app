<?php
include_once 'config.php';

$type = isset($_GET['type']) ? $_GET['type'] : 'MORNING_IAM';

$query = "SELECT * FROM system_affirmations WHERE type = :type";
$stmt = $conn->prepare($query);
$stmt->bindParam(":type", $type);
$stmt->execute();

$affirmations = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $affirmations[] = $row;
}

echo json_encode($affirmations);
?>