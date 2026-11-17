<?php
include_once 'config.php';

aa_require_method('POST');
$identity = aa_require_authenticated_session();
api_require_csrf();

if (isset($_POST['email'])) {
    $postedEmail = trim((string)$_POST['email']);
    if ($postedEmail !== '' && strcasecmp($postedEmail, $identity['userEmail']) !== 0) {
        aa_error_response('Email mismatch', 403);
    }
}

$fileKey = null;
if (isset($_FILES['audioFile'])) {
    $fileKey = 'audioFile';
} elseif (isset($_FILES['audio_file'])) {
    $fileKey = 'audio_file';
}

if (!$fileKey) {
    aa_error_response('Missing audio file', 400);
}

$allowedCategories = ['MORNING_IAM', 'EVENING_ILOVE', 'MEDITATION', 'PRAYER', 'GENERAL', 'AMBIENCE'];
$category = strtoupper(trim((string)($_POST['category'] ?? 'GENERAL')));
if (!in_array($category, $allowedCategories, true)) {
    $category = 'GENERAL';
}
$usage_purpose = trim((string)($_POST['purpose'] ?? 'meditation'));
$usage_purpose = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $usage_purpose);
if ($usage_purpose === '') {
    $usage_purpose = 'meditation';
}

$file = $_FILES[$fileKey];
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
    aa_error_response('Invalid upload payload', 400);
}

// File validation
$allowedMime = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/x-ogg', 'audio/flac'];
$allowedExt = ['mp3', 'wav', 'ogg', 'flac'];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($mimeType, $allowedMime, true) || !in_array($ext, $allowedExt, true)) {
    aa_error_response('Invalid audio file type', 400);
}

// Size limit (15MB for user uploads)
$maxSize = 15 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    aa_error_response('File too large. Max 15MB.', 400);
}

$safeBase = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$filename = "user_" . time() . "_" . bin2hex(random_bytes(4)) . "_" . $safeBase . "." . $ext;
$targetDir = aa_ensure_private_audio_storage_dir();
$targetFile = $targetDir . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($file["tmp_name"], $targetFile)) {
    aa_error_response('Failed to save file', 500);
}

$name = pathinfo($file["name"], PATHINFO_FILENAME);
$query = "
    INSERT INTO soundscapes 
    (name, url, category, usage_purpose, user_email, 
     is_active, is_public, creator_name, license_type,
     duration_seconds, bpm, energy_level, is_loopable, tags, mood)
    VALUES 
    (:name, :url, :category, :purpose, :email,
     1, 0, :creator_name, :license,
     NULL, NULL, 'medium', 1, '', '')
";

$creator_name = "User Upload";
$license = "Personal Use";
$storageKey = aa_private_soundscape_key($filename);

$stmt = $conn->prepare($query);
$stmt->bindParam(":name", $name);
$stmt->bindParam(":url", $storageKey);
$stmt->bindParam(":category", $category);
$stmt->bindParam(":purpose", $usage_purpose);
$stmt->bindValue(":email", $identity['userEmail'], PDO::PARAM_STR);
$stmt->bindParam(":creator_name", $creator_name);
$stmt->bindParam(":license", $license);

if (!$stmt->execute()) {
    @unlink($targetFile);
    aa_error_response('Database error', 500);
}

$recordId = (int)$conn->lastInsertId();
$apiBasePath = rtrim(str_replace('\\', '/', dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
$audioUrl = ($apiBasePath !== '' ? $apiBasePath : '') . '/private-audio.php?id=' . $recordId;

aa_json_response([
    "success" => true,
    "message" => "Your audio has been uploaded!",
    "is_public" => false,
    "filename" => $filename,
    "id" => $recordId,
    "audio_url" => $audioUrl,
]);
