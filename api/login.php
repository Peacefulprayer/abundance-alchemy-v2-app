<?php
include_once 'config.php';

aa_require_method('POST');
$data = aa_read_json_input();

$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    aa_error_response('Missing credentials', 400);
}

$rateLimit = aa_rate_limit_consume('api_login', 20, 15 * 60, $email);
if (!$rateLimit['allowed']) {
    aa_log_auth_event($conn, 'login_rate_limited', false, $email, null, 'user');
    aa_error_response('Too many login attempts. Please try again later.', 429, [
        'retryAfter' => $rateLimit['retry_after'],
    ]);
}

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
        SELECT id, name, email, password_hash, level, streak, focus_area, affirmations_completed{$lastPracticeSelect}{$cycleSelect}
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || empty($user['password_hash']) || !password_verify($password, $user['password_hash'])) {
        aa_log_auth_event($conn, 'login_failed', false, $email, null, 'user');
        aa_error_response('Invalid email or password', 401);
    }

    $update = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $update->execute([$user['id']]);

    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['user_email'] = (string)$user['email'];
    $_SESSION['user_name'] = (string)($user['name'] ?? '');
    $_SESSION['api_authenticated_at'] = time();
    $_SESSION['api_last_activity'] = time();
    aa_log_auth_event($conn, 'login_succeeded', true, (string)$user['email'], (int)$user['id'], 'user');

    $focusAreas = [];
    if (!empty($user['focus_area'])) {
        $focusAreas = array_values(array_filter(array_map('trim', explode(',', (string)$user['focus_area']))));
    }

    aa_json_response([
        'id' => (int)$user['id'],
        'gratitudeLogs' => aa_read_gratitude_logs($conn, (int)$user['id']),
        'name' => (string)($user['name'] ?? ''),
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
    error_log('[api/login.php] Login failed: ' . $e->getMessage());
    aa_log_auth_event($conn, 'login_error', false, $email, null, 'user', ['error' => 'server_error']);
    aa_error_response('Error', 500);
}
