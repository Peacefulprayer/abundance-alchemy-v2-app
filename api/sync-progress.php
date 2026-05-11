<?php
include_once 'config.php';

aa_require_method('POST');
$data = aa_read_json_input();
$identity = aa_require_authenticated_session();
$userId = $identity['userId'];

if (empty($data)) {
    aa_error_response('Invalid payload', 400, ['success' => false]);
}

api_require_csrf();
$userCols = aa_table_columns($conn, 'users');

$focusArea = '';
if (isset($data['focusAreas'])) {
    $focusArea = is_array($data['focusAreas']) ? implode(', ', $data['focusAreas']) : (string)$data['focusAreas'];
} elseif (isset($data['focusArea'])) {
    $focusArea = (string)$data['focusArea'];
}

$streak = isset($data['streak']) ? (int)$data['streak'] : 0;
$level = isset($data['level']) ? (int)$data['level'] : 1;
$affirmationsCompleted = isset($data['affirmationsCompleted']) ? (int)$data['affirmationsCompleted'] : 0;
$lastPracticeDate = null;
if (!empty($data['lastPracticeDate']) && is_string($data['lastPracticeDate'])) {
    $lastPracticeDate = trim($data['lastPracticeDate']);
} elseif (!empty($data['last_practice_date']) && is_string($data['last_practice_date'])) {
    $lastPracticeDate = trim($data['last_practice_date']);
}

$setClauses = [
    'streak = :streak',
    'level = :level',
    'affirmations_completed = :ac',
    'focus_area = :fa',
];
if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
    $setClauses[] = 'last_practice_date = :lpd';
}

try {
    $query = "
        UPDATE users
        SET " . implode(",\n            ", $setClauses) . "
        WHERE id = :uid
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':streak', $streak, PDO::PARAM_INT);
    $stmt->bindValue(':level', $level, PDO::PARAM_INT);
    $stmt->bindValue(':ac', $affirmationsCompleted, PDO::PARAM_INT);
    $stmt->bindValue(':fa', $focusArea, PDO::PARAM_STR);
    if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
        $stmt->bindValue(':lpd', $lastPracticeDate, PDO::PARAM_STR);
    }
    $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
    $stmt->execute();

    aa_json_response(['success' => true]);
} catch (Throwable $e) {
    error_log('[api/sync-progress.php] Update failed: ' . $e->getMessage());
    aa_error_response('Update failed', 500, ['success' => false]);
}
