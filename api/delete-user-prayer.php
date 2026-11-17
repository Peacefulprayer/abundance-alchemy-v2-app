<?php
include_once 'config.php';

aa_require_method('POST');
api_require_csrf();
$identity = aa_require_authenticated_session();
$data = aa_read_json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    aa_error_response('Invalid prayer id', 400);
}

try {
    aa_ensure_user_prayers_table($conn);
    $ownerBinding = aa_resolve_owner_binding($conn, 'user_prayers', $identity['userId'], $identity['userEmail']);
    if (!$ownerBinding) {
        aa_error_response('User prayers table is not configured for ownership', 500);
    }

    $stmt = $conn->prepare("
        UPDATE user_prayers
        SET is_active = 0
        WHERE id = :id
          AND {$ownerBinding['column']} = :owner
        LIMIT 1
    ");
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
    $stmt->execute();

    aa_json_response([
        'success' => true,
        'deleted' => $stmt->rowCount() > 0,
    ]);
} catch (Throwable $e) {
    error_log('[api/delete-user-prayer.php] Failed to delete user prayer: ' . $e->getMessage());
    aa_error_response('Unable to delete prayer', 500);
}
