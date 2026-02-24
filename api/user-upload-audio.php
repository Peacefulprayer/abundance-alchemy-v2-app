<?php
include_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

// Require authenticated app session for uploads.
$userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
$sessionEmail = isset($_SESSION['user_email']) ? trim((string)$_SESSION['user_email']) : '';
if ($userId <= 0 || $sessionEmail === '' || !filter_var($sessionEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

api_require_csrf();

// Never trust client-provided email for ownership.
if (isset($_POST['email'])) {
    $postedEmail = trim((string)$_POST['email']);
    if ($postedEmail !== '' && strcasecmp($postedEmail, $sessionEmail) !== 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Email mismatch"]);
        exit();
    }
}

$fileKey = null;
if (isset($_FILES['audioFile'])) {
    $fileKey = 'audioFile';
} elseif (isset($_FILES['audio_file'])) {
    $fileKey = 'audio_file';
}

if (!$fileKey) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing audio file"]);
    exit();
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
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid upload payload"]);
    exit();
}

$target_dir = "../assets/audio/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

// File validation
$allowedMime = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/x-ogg', 'audio/flac'];
$allowedExt = ['mp3', 'wav', 'ogg', 'flac'];

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($mimeType, $allowedMime, true) || !in_array($ext, $allowedExt, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid audio file type"]);
    exit();
}

// Size limit (15MB for user uploads)
$maxSize = 15 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "File too large. Max 15MB."]);
    exit();
}

// Generate safe filename
$safeBase = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
$filename = "user_" . time() . "_" . bin2hex(random_bytes(4)) . "_" . $safeBase . "." . $ext;
$targetFile = $target_dir . $filename;

// Move file
if (move_uploaded_file($file["tmp_name"], $targetFile)) {
    $name = pathinfo($file["name"], PATHINFO_FILENAME);

    // Simple user insert - minimal data
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

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":url", $filename);
    $stmt->bindParam(":category", $category);
    $stmt->bindParam(":purpose", $usage_purpose);
    $stmt->bindParam(":email", $sessionEmail);
    $stmt->bindParam(":creator_name", $creator_name);
    $stmt->bindParam(":license", $license);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "Your audio has been uploaded!",
            "is_public" => false,
            "filename" => $filename,
            "id" => $conn->lastInsertId(),
            "audio_url" => "https://abundantthought.com/abundance-alchemy/assets/audio/" . $filename
        ]);
    } else {
        @unlink($targetFile);
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save file"]);
}
