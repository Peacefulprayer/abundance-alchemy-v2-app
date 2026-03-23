<?php
include_once 'config.php';

aa_require_method('GET');
$identity = aa_get_session_identity();
$userId = $identity['userId'];

if ($userId <= 0) {
    aa_error_response('Unauthorized', 401);
}

try {
    $userCols = aa_table_columns($pdo, 'users');
    $lastPracticeSelect = aa_has_col($userCols, 'last_practice_date')
        ? ', last_practice_date'
        : ', NULL AS last_practice_date';

    $stmt = $pdo->prepare("
        SELECT id, name, email, level, streak, focus_area, affirmations_completed{$lastPracticeSelect}
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        aa_error_response('User not found', 404);
    }

    $focusAreas = [];
    if (!empty($user['focus_area'])) {
        $focusAreas = array_values(array_filter(array_map('trim', explode(',', (string)$user['focus_area']))));
    }

    aa_json_response([
        'id' => (int)$user['id'],
        'name' => (string)$user['name'],
        'email' => (string)$user['email'],
        'streak' => isset($user['streak']) ? (int)$user['streak'] : 0,
        'level' => isset($user['level']) ? (int)$user['level'] : 1,
        'focusAreas' => $focusAreas,
        'affirmationsCompleted' => isset($user['affirmations_completed']) ? (int)$user['affirmations_completed'] : 0,
        'lastPracticeDate' => $user['last_practice_date'] ?? null,
    ]);
} catch (Throwable $e) {
    error_log('[api/me.php] Failed to load current user: ' . $e->getMessage());
    aa_error_response('Server error', 500);
}
