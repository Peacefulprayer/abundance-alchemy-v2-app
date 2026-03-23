<?php
include_once 'config.php';

aa_require_method('GET');
$identity = aa_require_authenticated_session();
$pathKey = aa_normalize_prayer_path((string)($_GET['path'] ?? 'universal'));

try {
    aa_ensure_user_prayers_table($conn);
    $ownerBinding = aa_resolve_owner_binding($conn, 'user_prayers', $identity['userId'], $identity['userEmail']);
    if (!$ownerBinding) {
        aa_error_response('User prayers table is not configured for ownership', 500);
    }

    $stmt = $conn->prepare("
        SELECT id, path_key, title, body, created_at, updated_at
        FROM user_prayers
        WHERE {$ownerBinding['column']} = :owner
          AND path_key = :path_key
          AND is_active = 1
        ORDER BY updated_at DESC, id DESC
    ");
    $stmt->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
    $stmt->bindValue(':path_key', $pathKey, PDO::PARAM_STR);
    $stmt->execute();

    aa_json_response($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    error_log('[api/get-user-prayers.php] Failed to load user prayers: ' . $e->getMessage());
    aa_error_response('Failed to load user prayers', 500);
}
