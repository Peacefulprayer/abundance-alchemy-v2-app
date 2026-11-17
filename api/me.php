<?php
include_once 'config.php';

aa_require_method('GET');
$identity = aa_require_authenticated_session();
$userId = $identity['userId'];

try {
    $userCols = aa_table_columns($conn, 'users');
    $lastPracticeSelect = aa_has_col($userCols, 'last_practice_date')
        ? ', last_practice_date'
        : ', NULL AS last_practice_date';

    $cycleSelect = aa_has_col($userCols, 'cycle_preference')
        ? ', cycle_preference' : ", 'DAILY' AS cycle_preference";
    $cycleSelect .= aa_has_col($userCols, 'cycle_started_at')
        ? ', cycle_started_at' : ', NULL AS cycle_started_at';
    $stmt = $conn->prepare("
        SELECT id, name, email, level, streak, focus_area, affirmations_completed{$lastPracticeSelect}{$cycleSelect}
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
        'gratitudeLogs' => aa_read_gratitude_logs($conn, (int)$user['id']),
        'name' => (string)$user['name'],
        'email' => (string)$user['email'],
        'streak' => isset($user['streak']) ? (int)$user['streak'] : 0,
        'level' => isset($user['level']) ? (int)$user['level'] : 1,
        'focusAreas' => $focusAreas,
        'affirmationsCompleted' => isset($user['affirmations_completed']) ? (int)$user['affirmations_completed'] : 0,
        'cyclePreference' => in_array($user['cycle_preference'] ?? '', ['DAILY', 'WEEKLY', 'MONTHLY'], true)
            ? $user['cycle_preference'] : 'DAILY',
        'cycleStartedAt' => !empty($user['cycle_started_at'])
            ? (new DateTimeImmutable($user['cycle_started_at'], new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z')
            : null,
        'lastPracticeDate' => !empty($user['last_practice_date'])
            ? (new DateTimeImmutable($user['last_practice_date'], new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s\Z')
            : null,
    ]);
} catch (Throwable $e) {
    error_log('[api/me.php] Failed to load current user: ' . $e->getMessage());
    aa_error_response('Server error', 500);
}
