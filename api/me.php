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
if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

try {
    $userCols = aa_table_columns($pdo, 'users');
    $lastPracticeSelect = aa_has_col($userCols, 'last_practice_date')
        ? ', last_practice_date'
        : ', NULL AS last_practice_date';
    // Select the fields your frontend needs to validate + hydrate.
    // Add/remove columns here as needed to match your users table.
    $stmt = $pdo->prepare("
        SELECT id, name, email, level, streak, focus_area, affirmations_completed{$lastPracticeSelect}
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        exit();
    }

    $focusAreas = [];
    if (!empty($user['focus_area'])) {
        $focusAreas = array_values(array_filter(array_map('trim', explode(',', (string)$user['focus_area']))));
    }

    echo json_encode([
        "id" => (int)$user["id"],
        "name" => (string)$user["name"],
        "email" => (string)$user["email"],
        "streak" => isset($user["streak"]) ? (int)$user["streak"] : 0,
        "level" => isset($user["level"]) ? (int)$user["level"] : 1,
        "focusAreas" => $focusAreas,
        "affirmationsCompleted" => isset($user["affirmations_completed"]) ? (int)$user["affirmations_completed"] : 0,
        "lastPracticeDate" => $user['last_practice_date'] ?? null,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error"]);
}
