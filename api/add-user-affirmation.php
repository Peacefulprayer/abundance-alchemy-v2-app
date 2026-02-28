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

$data = json_decode(file_get_contents("php://input"), true);

if (is_array($data) && !empty($data['text']) && !empty($data['type'])) {
    $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
    $userEmail = trim((string)($_SESSION['user_email'] ?? ''));
    $type = strtoupper(trim((string)$data['type']));
    $allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
    $text = trim((string)$data['text']);
    $category = trim((string)($data['category'] ?? ''));
    $affirmCols = aa_table_columns($conn, 'user_affirmations');
    $hasUserId = aa_has_col($affirmCols, 'user_id');
    $hasUserEmail = aa_has_col($affirmCols, 'user_email');
    $hasEmail = aa_has_col($affirmCols, 'email');
    $hasText = aa_has_col($affirmCols, 'text');
    $hasType = aa_has_col($affirmCols, 'type');
    $hasCategory = aa_has_col($affirmCols, 'category');
    $hasCreatedAt = aa_has_col($affirmCols, 'created_at');
    $hasIdentity = ($hasUserId && $userId > 0) || (($hasUserEmail || $hasEmail) && $userEmail !== '');

    if (!$hasText || !$hasType) {
        http_response_code(500);
        echo json_encode(["message" => "User affirmations table is missing required columns"]);
        exit();
    }

    if ($hasIdentity && $text !== '' && in_array($type, $allowedTypes, true)) {
        api_require_csrf();
        $columns = [];
        $values = [];

        try {
            if ($hasUserId && $userId > 0) {
                $columns[] = 'user_id';
                $values[] = ':uid';
            } elseif ($hasUserEmail && $userEmail !== '') {
                $columns[] = 'user_email';
                $values[] = ':uemail';
            } elseif ($hasEmail && $userEmail !== '') {
                $columns[] = 'email';
                $values[] = ':uemail';
            } else {
                http_response_code(500);
                echo json_encode(["message" => "User affirmations table is not configured for user ownership"]);
                exit();
            }

            $columns[] = 'text';
            $values[] = ':text';
            $columns[] = 'type';
            $values[] = ':type';
            if ($hasCategory) {
                $columns[] = 'category';
                $values[] = ':category';
            }

            if ($hasCreatedAt) {
                $columns[] = 'created_at';
                $values[] = 'NOW()';
            }

            $query = "INSERT INTO user_affirmations (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $values) . ")";
            $insert = $conn->prepare($query);

            if ($hasUserId && $userId > 0) {
                $insert->bindValue(":uid", $userId, PDO::PARAM_INT);
            } elseif (($hasUserEmail || $hasEmail) && $userEmail !== '') {
                $insert->bindValue(":uemail", $userEmail, PDO::PARAM_STR);
            }

            $insert->bindValue(":text", $text, PDO::PARAM_STR);
            $insert->bindValue(":type", $type, PDO::PARAM_STR);
            if ($hasCategory) {
                $insert->bindValue(":category", $category !== '' ? $category : 'General', PDO::PARAM_STR);
            }

            if ($insert->execute()) {
                echo json_encode([
                    "success" => true,
                    "id" => $conn->lastInsertId(),
                    "message" => "Affirmation added"
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Database error"]);
            }
        } catch (Throwable $e) {
            error_log('[api/add-user-affirmation.php] Insert failed: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Unable to save affirmation"]);
        }
    } else {
        http_response_code(400);
        if (!$hasIdentity) {
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
