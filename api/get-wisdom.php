<?php
include_once 'config.php';

$category = isset($_GET['category']) ? $_GET['category'] : 'GENERAL';

$query = "SELECT text FROM wisdom WHERE category = :cat AND is_active = 1 ORDER BY RAND() LIMIT 1";
$stmt = $conn->prepare($query);
$stmt->bindParam(":cat", $category);
$stmt->execute();

if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($row);
} else {
    // Fallback if DB is empty
    echo json_encode(["text" => "Your thoughts are the seeds of your reality."]);
}
?>