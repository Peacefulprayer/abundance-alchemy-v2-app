<?php
include_once 'config.php';

aa_require_method('POST');
$data = aa_read_json_input();
$identity = aa_get_session_identity();
$ownerBinding = aa_resolve_owner_binding($conn, 'user_affirmations', $identity['userId'], $identity['userEmail']);
$type = strtoupper(trim((string)($data['type'] ?? '')));
$allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
$text = trim((string)($data['text'] ?? ''));
$category = trim((string)($data['category'] ?? ''));

if ($text === '' || $type === '') {
    aa_error_response('Incomplete data', 400);
}

if (!$ownerBinding) {
    aa_error_response('Unauthorized', 401);
}

if (!in_array($type, $allowedTypes, true)) {
    aa_error_response('Invalid affirmation payload', 400);
}

if (!aa_has_col($ownerBinding['columns'], 'text') || !aa_has_col($ownerBinding['columns'], 'type')) {
    aa_error_response('User affirmations table is missing required columns', 500);
}

api_require_csrf();

$columns = [$ownerBinding['column'], 'text', 'type'];
$values = [':owner', ':text', ':type'];
$hasCategory = aa_has_col($ownerBinding['columns'], 'category');
$hasCreatedAt = aa_has_col($ownerBinding['columns'], 'created_at');

if ($hasCategory) {
    $columns[] = 'category';
    $values[] = ':category';
}

if ($hasCreatedAt) {
    $columns[] = 'created_at';
    $values[] = 'NOW()';
}

try {
    $query = 'INSERT INTO user_affirmations (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $values) . ')';
    $insert = $conn->prepare($query);
    $insert->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
    $insert->bindValue(':text', $text, PDO::PARAM_STR);
    $insert->bindValue(':type', $type, PDO::PARAM_STR);
    if ($hasCategory) {
        $insert->bindValue(':category', $category !== '' ? $category : 'General', PDO::PARAM_STR);
    }
    $insert->execute();

    aa_json_response([
        'success' => true,
        'id' => $conn->lastInsertId(),
        'message' => 'Affirmation added',
    ]);
} catch (Throwable $e) {
    error_log('[api/add-user-affirmation.php] Insert failed: ' . $e->getMessage());
    aa_error_response('Unable to save affirmation', 500);
}
