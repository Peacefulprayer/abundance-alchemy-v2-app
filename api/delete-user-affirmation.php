<?php
include_once 'config.php';

aa_require_method('POST');
$data = aa_read_json_input();
$id = isset($data['id']) ? (int)$data['id'] : 0;
$identity = aa_require_authenticated_session();
$ownerBinding = aa_resolve_owner_binding($conn, 'user_affirmations', $identity['userId'], $identity['userEmail']);

if (!$ownerBinding) {
    aa_error_response('Unauthorized', 401);
}

api_require_csrf();

if ($id <= 0) {
    aa_error_response('Invalid affirmation id', 400);
}

try {
    $stmt = $conn->prepare("
        DELETE FROM user_affirmations
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
    error_log('[api/delete-user-affirmation.php] Delete failed: ' . $e->getMessage());
    aa_error_response('Delete failed', 500);
}
