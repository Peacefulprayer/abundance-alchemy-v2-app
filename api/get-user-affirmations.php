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

$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
$userEmail = trim((string)($_SESSION['user_email'] ?? ''));
$affirmCols = aa_table_columns($conn, 'user_affirmations');
$hasUserId = aa_has_col($affirmCols, 'user_id');
$hasUserEmail = aa_has_col($affirmCols, 'user_email');
$hasEmail = aa_has_col($affirmCols, 'email');
$hasCategory = aa_has_col($affirmCols, 'category');
$hasCreatedAt = aa_has_col($affirmCols, 'created_at');

if (($hasUserId && $userId > 0) || (($hasUserEmail || $hasEmail) && $userEmail !== '')) {
    try {
        $categorySelect = $hasCategory ? 'category' : 'NULL AS category';
        $createdAtSelect = $hasCreatedAt ? 'created_at' : 'NULL AS created_at';
        $whereColumn = $hasUserId ? 'user_id' : ($hasUserEmail ? 'user_email' : 'email');
        $query = "
            SELECT id, text, type, {$categorySelect}, {$createdAtSelect}
            FROM user_affirmations
            WHERE {$whereColumn} = :owner
            ORDER BY " . ($hasCreatedAt ? "created_at DESC" : "id DESC");

        $stmt = $conn->prepare($query);
        if ($hasUserId) {
            $stmt->bindValue(":owner", $userId, PDO::PARAM_INT);
        } else {
            $stmt->bindValue(":owner", $userEmail, PDO::PARAM_STR);
        }
        $stmt->execute();

        $data = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $data[] = $row;
        }
        echo json_encode($data);
    } catch (Throwable $e) {
        error_log('[api/get-user-affirmations.php] Read failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([]);
    }
} else {
    http_response_code(401);
    echo json_encode([]);
}
?>
