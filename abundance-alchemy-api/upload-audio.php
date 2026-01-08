<?php
include_once 'config.php'; // $conn, CORS, JSON

// Ensure the target directory exists
$target_dir = "../assets/audio/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

if (isset($_FILES['audioFile']) && isset($_POST['email']) && isset($_POST['category'])) {

    $email    = trim($_POST['email']);
    $category = trim($_POST['category']); // 'MORNING_IAM', 'EVENING_ILOVE', or 'MEDITATION'
    $file     = $_FILES['audioFile'];

    // 1. Validate MIME type + extension
    $allowedMime = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/ogg',
        'audio/x-ogg',
        'audio/flac',
    ];
    $allowedExt  = ['mp3', 'wav', 'ogg', 'flac'];

    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($mimeType, $allowedMime, true) || !in_array($ext, $allowedExt, true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid audio file type"]);
        exit();
    }

    // 2. Validate Size (Limit 15MB)
    $maxSize = 15 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File too large. Max 15MB."]);
        exit();
    }

    // 3. Unique, safe filename
    $safeBase   = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
    $filename   = "user_" . time() . "_" . bin2hex(random_bytes(4)) . "_" . $safeBase . "." . $ext;
    $targetFile = $target_dir . $filename;

    // 4. Move file & insert into DB
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {

        $dbCategory = ($category === 'MEDITATION') ? 'MEDITATION' : 'MUSIC';
        $label      = pathinfo($file["name"], PATHINFO_FILENAME);

        $query = "
    INSERT INTO soundscapes (name, url, category, user_email, is_active)
    VALUES (:name, :url, :cat, NULL, 1)
";
$stmt = $conn->prepare($query);
$stmt->bindParam(":name",  $label);
$stmt->bindParam(":url",   $filename);
$stmt->bindParam(":cat",   $dbCategory);
// Note: we no longer bind :email, uploads are global for now


        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "File uploaded"]);
        } else {
            @unlink($targetFile); // Clean up if DB fails
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save file"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing data"]);
}