<?php
include_once 'config.php';

aa_require_method('POST');
api_require_csrf();
$identity = aa_require_authenticated_session();
$data = aa_read_json_input();

$pathKey = aa_normalize_prayer_path((string)($data['pathId'] ?? $data['path'] ?? 'universal'));
$title = trim((string)($data['title'] ?? ''));
$body = trim((string)($data['text'] ?? $data['body'] ?? ''));

if ($body === '') {
    aa_error_response('Prayer text is required', 400);
}

if (mb_strlen($body) > 3000) {
    aa_error_response('Prayer text is too long', 400);
}

if (mb_strlen($title) > 120) {
    aa_error_response('Prayer title is too long', 400);
}

try {
    aa_ensure_user_prayers_table($conn);
    $ownerBinding = aa_resolve_owner_binding($conn, 'user_prayers', $identity['userId'], $identity['userEmail']);
    if (!$ownerBinding) {
        aa_error_response('User prayers table is not configured for ownership', 500);
    }

    $insert = $conn->prepare("
        INSERT INTO user_prayers ({$ownerBinding['column']}, path_key, title, body, is_active)
        VALUES (:owner, :path_key, :title, :body, 1)
    ");
    $insert->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
    $insert->bindValue(':path_key', $pathKey, PDO::PARAM_STR);
    $insert->bindValue(':title', $title, PDO::PARAM_STR);
    $insert->bindValue(':body', $body, PDO::PARAM_STR);
    $insert->execute();

    aa_json_response([
        'success' => true,
        'id' => (string)$conn->lastInsertId(),
        'message' => 'Prayer saved',
    ], 201);
} catch (Throwable $e) {
    error_log('[api/add-user-prayer.php] Failed to save user prayer: ' . $e->getMessage());
    aa_error_response('Unable to save prayer', 500);
}
