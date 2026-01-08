<?php
include_once 'config.php';

$email = isset($_GET['email']) ? $_GET['email'] : null;

// Fetch items categorized as Music, Chant, or Meditation
// Include User uploads (where user_email matches) AND Global tracks (where user_email is NULL)
$query = "SELECT * FROM soundscapes 
          WHERE is_active = 1 
          AND category IN ('MEDITATION', 'CHANT', 'MUSIC')
          AND (user_email IS NULL OR user_email = :email)
          ORDER BY name ASC";

$stmt = $conn->prepare($query);
if ($email) {
    $stmt->bindParam(":email", $email);
} else {
    // Bind empty string if no email provided so the query works safely
    $empty = '';
    $stmt->bindParam(":email", $empty);
}

$stmt->execute();

$data = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $data[] = $row;
}

// Return a direct array, which matches what apiService.ts expects
echo json_encode($data);
?>