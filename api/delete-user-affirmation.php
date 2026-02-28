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
$id = isset($data['id']) ? (int)$data['id'] : 0;
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
$userEmail = trim((string)($_SESSION['user_email'] ?? ''));
$affirmCols = aa_table_columns($conn, 'user_affirmations');
$hasUserId = aa_has_col($affirmCols, 'user_id');
$hasUserEmail = aa_has_col($affirmCols, 'user_email');
$hasEmail = aa_has_col($affirmCols, 'email');
$canIdentify = ($hasUserId && $userId > 0) || (($hasUserEmail || $hasEmail) && $userEmail !== '');

if (!$canIdentify) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit();
}

api_require_csrf();

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid affirmation id']);
    exit();
}

try {
    $ownerColumn = $hasUserId ? 'user_id' : ($hasUserEmail ? 'user_email' : 'email');
    $stmt = $conn->prepare("
        DELETE FROM user_affirmations
        WHERE id = :id
          AND {$ownerColumn} = :owner
        LIMIT 1
    ");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    if ($hasUserId) {
        $stmt->bindValue(':owner', $userId, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(':owner', $userEmail, PDO::PARAM_STR);
    }
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'deleted' => $stmt->rowCount() > 0,
    ]);
} catch (Throwable $e) {
    error_log('[api/delete-user-affirmation.php] Delete failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Delete failed']);
}
?>
