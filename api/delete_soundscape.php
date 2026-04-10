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
if ($storedUrl === '') {
    aa_error_response('Stored soundscape filename is invalid', 400);
}

$audioBase = realpath(__DIR__ . '/../assets/audio');
if ($audioBase === false || !is_dir($audioBase)) {
    aa_error_response('Audio storage directory is unavailable', 500);
}

$targetFile = $audioBase . DIRECTORY_SEPARATOR . $storedUrl;
$deletedFile = true;
if (file_exists($targetFile)) {
    $deletedFile = unlink($targetFile);
    if (!$deletedFile) {
        aa_error_response('Failed to delete audio file', 500);
    }
}

$deleteStmt = $conn->prepare('DELETE FROM soundscapes WHERE id = :id AND user_email = :email');
$deleteStmt->bindValue(':id', (int)$row['id'], PDO::PARAM_INT);
$deleteStmt->bindValue(':email', $identity['userEmail'], PDO::PARAM_STR);
$deleteStmt->execute();

aa_json_response([
    'success' => true,
    'deleted_file' => $deletedFile,
    'removed_record' => $deleteStmt->rowCount() > 0,
]);
