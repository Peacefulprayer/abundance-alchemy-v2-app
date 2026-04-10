<?php
include_once 'config.php';

aa_require_method('POST');

$identity = aa_require_authenticated_session();
api_require_csrf();

$fileKey = null;
if (isset($_FILES['audioFile'])) {
    $fileKey = 'audioFile';
} elseif (isset($_FILES['audio_file'])) {
    $fileKey = 'audio_file';
}

if ($fileKey === null) {
    aa_error_response('Missing audio file', 400);
}

$postedEmail = trim((string)($_POST['email'] ?? ''));
if ($postedEmail !== '' && strcasecmp($postedEmail, $identity['userEmail']) !== 0) {
    aa_error_response('Email mismatch', 403);
}

$category = strtoupper(trim((string)($_POST['category'] ?? 'GENERAL')));
$dbCategory = $category === 'MEDITATION' ? 'MEDITATION' : 'MUSIC';
$file = $_FILES[$fileKey];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
    aa_error_response('Invalid upload payload', 400);
}

$targetDir = __DIR__ . '/../assets/audio/';
if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    aa_error_response('Audio storage directory is unavailable', 500);
}

$allowedMime = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/x-ogg',
    'audio/flac',
];
$allowedExt = ['mp3', 'wav', 'ogg', 'flac'];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($mimeType, $allowedMime, true) || !in_array($ext, $allowedExt, true)) {
    aa_error_response('Invalid audio file type', 400);
}

$maxSize = 15 * 1024 * 1024;
if (($file['size'] ?? 0) > $maxSize) {
    aa_error_response('File too large. Max 15MB.', 400);
}

$uuid = bin2hex(random_bytes(16));
$filename = 'user_' . $uuid . '.' . $ext;
$targetFile = $targetDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
    aa_error_response('Failed to save file', 500);
}

$label = pathinfo($file['name'], PATHINFO_FILENAME);
$query = '
    INSERT INTO soundscapes (name, url, category, user_email, is_active)
    VALUES (:name, :url, :category, :email, 1)
';

$stmt = $conn->prepare($query);
$stmt->bindValue(':name', $label, PDO::PARAM_STR);
$stmt->bindValue(':url', $filename, PDO::PARAM_STR);
$stmt->bindValue(':category', $dbCategory, PDO::PARAM_STR);
$stmt->bindValue(':email', $identity['userEmail'], PDO::PARAM_STR);

if (!$stmt->execute()) {
    @unlink($targetFile);
    aa_error_response('Database error', 500);
}

aa_json_response([
    'success' => true,
    'message' => 'File uploaded',
    'filename' => $filename,
]);
