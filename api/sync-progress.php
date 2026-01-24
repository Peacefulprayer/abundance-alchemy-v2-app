<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));

// The frontend sends { streak, level, affirmationsCompleted, focusAreas, email (implied via user context in some versions, check apiService) }
// We need to ensure apiService.ts sends the email in the body for sync-progress. 
// If your apiService doesn't send email in body, we need to fix apiService.ts or rely on session.
// Assuming we fix apiService to send email, or we rely on the client passing it.

// Let's verify what apiService sends. It looks like it sends: { streak, level, affirmationsCompleted, focusAreas }
// It DOES NOT currently send email in the provided code. We need to update apiService.ts to send the email.

if (!empty($data->email)) {
    // Convert array to JSON string for storage if multiple, or just take the first string
    $focusArea = is_array($data->focusAreas) ? implode(", ", $data->focusAreas) : $data->focusAreas;

    $query = "UPDATE users SET streak = :streak, level = :level, affirmations_completed = :ac, focus_area = :fa WHERE email = :email";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(":streak", $data->streak);
    $stmt->bindParam(":level", $data->level);
    $stmt->bindParam(":ac", $data->affirmationsCompleted);
    $stmt->bindParam(":fa", $focusArea);
    $stmt->bindParam(":email", $data->email);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Email missing"]);
}
?>