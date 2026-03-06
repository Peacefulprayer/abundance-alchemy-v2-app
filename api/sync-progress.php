<?php
include_once 'config.php';

function aa_table_columns(PDO $conn, string $table): array {
    try {
        $stmt = $conn->query("DESCRIBE `$table`");
        $cols = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $cols[] = (string)($row['Field'] ?? '');
        }
        return $cols;
    } catch (Throwable $e) {
        return [];
    }
}

function aa_has_col(array $cols, string $name): bool {
    return in_array($name, $cols, true);
}

$data = json_decode(file_get_contents("php://input"));

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

if ($userId > 0 && $data) {
    api_require_csrf();
    $userCols = aa_table_columns($conn, 'users');
    // Convert array to JSON string for storage if multiple, or just take the first string
    $focusArea = '';
    if (isset($data->focusAreas)) {
        $focusArea = is_array($data->focusAreas) ? implode(", ", $data->focusAreas) : (string)$data->focusAreas;
    } elseif (isset($data->focusArea)) {
        $focusArea = (string)$data->focusArea;
    }

    $streak = isset($data->streak) ? (int)$data->streak : 0;
    $level = isset($data->level) ? (int)$data->level : 1;
    $affirmationsCompleted = isset($data->affirmationsCompleted) ? (int)$data->affirmationsCompleted : 0;
    $lastPracticeDate = null;
    if (isset($data->lastPracticeDate) && is_string($data->lastPracticeDate) && trim($data->lastPracticeDate) !== '') {
        $lastPracticeDate = trim($data->lastPracticeDate);
    } elseif (isset($data->last_practice_date) && is_string($data->last_practice_date) && trim($data->last_practice_date) !== '') {
        $lastPracticeDate = trim($data->last_practice_date);
    }

    $setClauses = [
        "streak = :streak",
        "level = :level",
        "affirmations_completed = :ac",
        "focus_area = :fa",
    ];
    if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
        $setClauses[] = "last_practice_date = :lpd";
    }

    $query = "
        UPDATE users
        SET " . implode(",\n            ", $setClauses) . "
        WHERE id = :uid
    ";
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(":streak", $streak, PDO::PARAM_INT);
    $stmt->bindParam(":level", $level, PDO::PARAM_INT);
    $stmt->bindParam(":ac", $affirmationsCompleted, PDO::PARAM_INT);
    $stmt->bindParam(":fa", $focusArea);
    if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
        $stmt->bindParam(":lpd", $lastPracticeDate);
    }
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
