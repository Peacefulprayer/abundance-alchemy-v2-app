<?php
include_once 'config.php';

aa_require_method('POST');

$identity = aa_require_authenticated_session();
api_require_csrf();

$input = aa_read_json_input();
$soundscapeId = isset($input['soundscapeId']) ? (int)$input['soundscapeId'] : 0;
$requestedFilename = trim((string)($input['filename'] ?? ''));

if ($soundscapeId <= 0 && $requestedFilename === '') {
    aa_error_response('Missing soundscape identifier', 400);
}

$sql = 'SELECT id, url, user_email FROM soundscapes WHERE user_email = :email';
$params = [':email' => $identity['userEmail']];

if ($soundscapeId > 0) {
    $sql .= ' AND id = :id';
    $params[':id'] = $soundscapeId;
} else {
    $sql .= ' AND url = :url';
    $params[':url'] = basename($requestedFilename);
}

$sql .= ' LIMIT 1';

$stmt = $conn->prepare($sql);
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value, $key === ':id' ? PDO::PARAM_INT : PDO::PARAM_STR);
}
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    aa_error_response('Soundscape not found', 404);
}

$storedUrl = basename((string)($row['url'] ?? ''));
$storedUrlRaw = trim((string)($row['url'] ?? ''));
if ($storedUrlRaw === '') {
    aa_error_response('Stored soundscape filename is invalid', 400);
}

if (!aa_delete_soundscape_file($storedUrlRaw)) {
    aa_error_response('Failed to delete audio file', 500);
}

$deleteStmt = $conn->prepare('DELETE FROM soundscapes WHERE id = :id AND user_email = :email');
$deleteStmt->bindValue(':id', (int)$row['id'], PDO::PARAM_INT);
$deleteStmt->bindValue(':email', $identity['userEmail'], PDO::PARAM_STR);
$deleteStmt->execute();

aa_json_response([
    'success' => true,
    'deleted_file' => true,
    'removed_record' => $deleteStmt->rowCount() > 0,
]);
