<?php
include_once 'config.php';

aa_require_method('GET');
$identity = aa_get_session_identity();
$ownerBinding = aa_resolve_owner_binding($conn, 'user_affirmations', $identity['userId'], $identity['userEmail']);

if (!$ownerBinding) {
    aa_json_response([], 401);
}

if (!aa_has_col($ownerBinding['columns'], 'text') || !aa_has_col($ownerBinding['columns'], 'type')) {
    error_log('[api/get-user-affirmations.php] user_affirmations missing required text/type columns');
    aa_json_response([]);
}

try {
    $hasCategory = aa_has_col($ownerBinding['columns'], 'category');
    $hasCreatedAt = aa_has_col($ownerBinding['columns'], 'created_at');
    $categorySelect = $hasCategory ? 'category' : 'NULL AS category';
    $createdAtSelect = $hasCreatedAt ? 'created_at' : 'NULL AS created_at';
    $query = "
        SELECT id, text, type, {$categorySelect}, {$createdAtSelect}
        FROM user_affirmations
        WHERE {$ownerBinding['column']} = :owner
        ORDER BY " . ($hasCreatedAt ? 'created_at DESC' : 'id DESC');

    $stmt = $conn->prepare($query);
    $stmt->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
    $stmt->execute();

    aa_json_response($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Throwable $e) {
    error_log('[api/get-user-affirmations.php] Read failed: ' . $e->getMessage());
    aa_json_response([], 500);
}
