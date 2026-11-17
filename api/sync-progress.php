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
if (isset($data['expectedUserId']) && (string)$data['expectedUserId'] !== (string)$userId) {
    aa_error_response('Account changed. Please sign in to the original account to save.', 409, ['success' => false]);
}
$userCols = aa_table_columns($conn, 'users');
$completionEvents = [];
$hasCompletionEvents = array_key_exists('practiceCompletions', $data);
if ($hasCompletionEvents) {
    if (!is_array($data['practiceCompletions']) || count($data['practiceCompletions']) > 5000) {
        aa_error_response('Invalid practice completions', 400, ['success' => false]);
    }
    foreach ($data['practiceCompletions'] as $event) {
        if (!is_array($event) || !is_string($event['id'] ?? null) ||
            !preg_match('/^[a-zA-Z0-9_-]{1,128}$/D', $event['id']) ||
            !is_string($event['date'] ?? null) || !preg_match('/^\d{4}-\d{2}-\d{2}T/', $event['date'])) {
            aa_error_response('Invalid practice completion', 400, ['success' => false]);
        }
        try {
            $date = new DateTimeImmutable($event['date'], new DateTimeZone('UTC'));
            $errors = DateTimeImmutable::getLastErrors();
            if ($errors !== false && ($errors['warning_count'] || $errors['error_count'])) throw new InvalidArgumentException();
            $completionEvents[$event['id']] = $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.v');
        } catch (Throwable $e) {
            aa_error_response('Invalid practice completion date', 400, ['success' => false]);
        }
    }
    if ($completionEvents && !aa_table_exists($conn, 'user_practice_completions')) {
        aa_error_response('Practice completion storage requires a schema update', 503, ['success' => false]);
    }
}
$gratitudeLogs = [];
if (array_key_exists('gratitudeLogs', $data)) {
    try {
        $gratitudeLogs = aa_validate_gratitude_logs($data['gratitudeLogs']);
    } catch (InvalidArgumentException $e) {
        aa_error_response($e->getMessage(), 400, ['success' => false]);
    }
    if ($gratitudeLogs && !aa_table_exists($conn, 'user_gratitude_logs')) {
        aa_error_response('Gratitude storage requires a schema update', 503, ['success' => false]);
    }
}

$cyclePreference = $data['cyclePreference'] ?? null;
$cycleStartedAt = $data['cycleStartedAt'] ?? null;
if ($cyclePreference !== null && !in_array($cyclePreference, ['DAILY', 'WEEKLY', 'MONTHLY'], true)) {
    aa_error_response('Invalid practice period', 400, ['success' => false]);
}
if ($cyclePreference !== null && (!aa_has_col($userCols, 'cycle_preference') || !aa_has_col($userCols, 'cycle_started_at'))) {
    aa_error_response('Practice period storage requires a schema update', 503, ['success' => false]);
}
if ($cycleStartedAt !== null) {
    if (!is_string($cycleStartedAt) || trim($cycleStartedAt) === '') {
        aa_error_response('Invalid practice period start', 400, ['success' => false]);
    }
    try {
        $cycleDate = new DateTimeImmutable($cycleStartedAt, new DateTimeZone('UTC'));
        $errors = DateTimeImmutable::getLastErrors();
        if ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0)) {
            aa_error_response('Invalid practice period start', 400, ['success' => false]);
        }
        $cycleStartedAt = $cycleDate->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        aa_error_response('Invalid practice period start', 400, ['success' => false]);
    }
}

$name = null;
if (array_key_exists('name', $data)) {
    if (!is_string($data['name'])) {
        aa_error_response('Invalid name', 400, ['success' => false]);
    }
    $name = trim($data['name']);
    $nameLength = function_exists('mb_strlen') ? mb_strlen($name, 'UTF-8') : strlen($name);
    if ($name === '' || $nameLength > 255) {
        aa_error_response('Name must be between 1 and 255 characters', 400, ['success' => false]);
    }
}

foreach (['streak', 'level', 'affirmationsCompleted'] as $field) {
    if (isset($data[$field]) && (!is_int($data[$field]) || $data[$field] < 0 || $data[$field] > 2147483647)) {
        aa_error_response('Invalid progress value', 400, ['success' => false]);
    }
}

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
    'streak = GREATEST(streak, :streak)',
    'level = GREATEST(level, :level)',
    $hasCompletionEvents ? 'affirmations_completed = GREATEST(affirmations_completed, :ac) + :new_completions' : 'affirmations_completed = GREATEST(affirmations_completed, :ac)',
    'focus_area = :fa',
];
if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
    try {
        $date = new DateTimeImmutable($lastPracticeDate, new DateTimeZone('UTC'));
        $dateErrors = DateTimeImmutable::getLastErrors();
        if ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) {
            aa_error_response('Invalid practice date', 400, ['success' => false]);
        }
        $lastPracticeDate = $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    } catch (Throwable $e) {
        aa_error_response('Invalid practice date', 400, ['success' => false]);
    }
    $setClauses[0] = 'streak = CASE WHEN DATE(:streak_same_day) = DATE(last_practice_date) THEN GREATEST(streak, :same_day_streak) WHEN last_practice_date IS NULL OR :streak_date >= last_practice_date THEN :streak ELSE streak END';
    $setClauses[] = "last_practice_date = GREATEST(COALESCE(last_practice_date, '1000-01-01'), :lpd)";
}
if ($lastPracticeDate !== null && !aa_has_col($userCols, 'last_practice_date')) {
    aa_error_response('Progress storage requires a schema update', 503, ['success' => false]);
}
if ($name !== null) {
    $setClauses[] = 'name = :name';
}
if ($cyclePreference !== null) {
    $setClauses[] = 'cycle_preference = :cycle';
}
if ($cycleStartedAt !== null) {
    $setClauses[] = 'cycle_started_at = :cycle_start';
}

try {
    $conn->beginTransaction();
    $newCompletions = 0;
    if ($completionEvents) {
        $saveCompletion = $conn->prepare('INSERT INTO user_practice_completions (user_id, client_id, completed_at)
            VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE client_id = VALUES(client_id)');
        // Stable insertion order prevents two overlapping batches taking ledger locks in opposite order.
        ksort($completionEvents);
        foreach ($completionEvents as $id => $date) {
            $saveCompletion->execute([$userId, $id, $date]);
            if ($saveCompletion->rowCount() === 1) $newCompletions++;
        }
    }
    $query = "
        UPDATE users
        SET " . implode(",\n            ", $setClauses) . "
        WHERE id = :uid
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':streak', $streak, PDO::PARAM_INT);
    $stmt->bindValue(':level', $level, PDO::PARAM_INT);
    $stmt->bindValue(':ac', max(0, $affirmationsCompleted - count($completionEvents)), PDO::PARAM_INT);
    if ($hasCompletionEvents) $stmt->bindValue(':new_completions', $newCompletions, PDO::PARAM_INT);
    $stmt->bindValue(':fa', $focusArea, PDO::PARAM_STR);
    if ($cyclePreference !== null) {
        $stmt->bindValue(':cycle', $cyclePreference, PDO::PARAM_STR);
    }
    if ($cycleStartedAt !== null) {
        $stmt->bindValue(':cycle_start', $cycleStartedAt, PDO::PARAM_STR);
    }
    if ($name !== null) {
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
    }
    if (aa_has_col($userCols, 'last_practice_date') && $lastPracticeDate !== null) {
        $stmt->bindValue(':lpd', $lastPracticeDate, PDO::PARAM_STR);
        $stmt->bindValue(':streak_date', $lastPracticeDate, PDO::PARAM_STR);
        $stmt->bindValue(':streak_same_day', $lastPracticeDate, PDO::PARAM_STR);
        $stmt->bindValue(':same_day_streak', $streak, PDO::PARAM_INT);
    }
    $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
    $stmt->execute();
    if ($gratitudeLogs) {
        $saveLog = $conn->prepare('INSERT INTO user_gratitude_logs
            (user_id, client_id, logged_at, text, focus_area, session_type)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE client_id = VALUES(client_id)');
        foreach ($gratitudeLogs as $log) {
            $saveLog->execute([$userId, $log['id'], $log['date'], $log['text'], $log['focusArea'], $log['sessionType']]);
        }
    }
    $conn->commit();
    if ($name !== null) {
        $_SESSION['user_name'] = $name;
    }

    aa_json_response(['success' => true]);
} catch (Throwable $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log('[api/sync-progress.php] Update failed: ' . $e->getMessage());
    aa_error_response('Update failed', 500, ['success' => false]);
}
