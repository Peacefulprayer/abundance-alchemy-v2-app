<?php
include_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

// Simple admin check (enhance with proper auth in production)
$admin_token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
if ($admin_token !== 'YOUR_ADMIN_TOKEN_HERE') { // Change this!
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Admin access required"]);
    exit();
}

// Ensure upload directory exists
$target_dir = "../assets/audio/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Get all form data
    $name = trim($_POST['name'] ?? '');
    $category = trim($_POST['category'] ?? 'GENERAL');
    $usage_purpose = trim($_POST['usage_purpose'] ?? 'meditation');
    $duration = (int)($_POST['duration_seconds'] ?? 0);
    $bpm = (int)($_POST['bpm'] ?? 0) ?: null;
    $energy_level = trim($_POST['energy_level'] ?? 'medium');
    $is_loopable = isset($_POST['is_loopable']) ? (int)$_POST['is_loopable'] : 1;
    $is_public = isset($_POST['is_public']) ? (int)$_POST['is_public'] : 1;
    $tags = trim($_POST['tags'] ?? '');
    $mood = trim($_POST['mood'] ?? '');
    
    // Metadata fields
    $creator_name = trim($_POST['creator_name'] ?? '');
    $creator_website = trim($_POST['creator_website'] ?? '');
    $source_name = trim($_POST['source_name'] ?? '');
    $source_url = trim($_POST['source_url'] ?? '');
    $license_type = trim($_POST['license_type'] ?? '');
    $license_notes = trim($_POST['license_notes'] ?? '');
    
    // Validate required fields
    if (!isset($_FILES['audioFile']) || empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit();
    }
    
    $file = $_FILES['audioFile'];
    
    // 1. File validation
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
    
    // 2. Size limit (25MB for admin uploads)
    $maxSize = 25 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "File too large. Max 25MB."]);
        exit();
    }
    
    // 3. Generate safe filename
    $safeBase = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
    $filename = "admin_" . time() . "_" . bin2hex(random_bytes(4)) . "_" . $safeBase . "." . $ext;
    $targetFile = $target_dir . $filename;
    
    // 4. Move file
    if (!move_uploaded_file($file["tmp_name"], $targetFile)) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save file"]);
        exit();
    }
    
    // 5. Auto-detect duration if not provided (optional - requires getID3 library)
    if ($duration <= 0) {
        $duration = detectAudioDuration($targetFile);
    }
    
    // 6. Insert into database
    $query = "
        INSERT INTO soundscapes 
        (name, url, category, usage_purpose, duration_seconds, 
         bpm, energy_level, is_loopable, tags, mood,
         creator_name, creator_website, source_name, source_url, 
         license_type, license_notes, is_active, is_public, user_email)
        VALUES 
        (:name, :url, :category, :purpose, :duration,
         :bpm, :energy, :loopable, :tags, :mood,
         :creator_name, :creator_website, :source_name, :source_url,
         :license_type, :license_notes, 1, :is_public, NULL)
    ";
    
    try {
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":url", $filename);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":purpose", $usage_purpose);
        $stmt->bindParam(":duration", $duration);
        $stmt->bindParam(":bpm", $bpm);
        $stmt->bindParam(":energy", $energy_level);
        $stmt->bindParam(":loopable", $is_loopable);
        $stmt->bindParam(":tags", $tags);
        $stmt->bindParam(":mood", $mood);
        $stmt->bindParam(":creator_name", $creator_name);
        $stmt->bindParam(":creator_website", $creator_website);
        $stmt->bindParam(":source_name", $source_name);
        $stmt->bindParam(":source_url", $source_url);
        $stmt->bindParam(":license_type", $license_type);
        $stmt->bindParam(":license_notes", $license_notes);
        $stmt->bindParam(":is_public", $is_public);
        
        if ($stmt->execute()) {
            $soundscape_id = $conn->lastInsertId();
            
            echo json_encode([
                "success" => true, 
                "message" => "Audio uploaded successfully",
                "data" => [
                    "id" => $soundscape_id,
                    "name" => $name,
                    "filename" => $filename,
                    "duration" => $duration,
                    "duration_formatted" => $duration ? sprintf("%d:%02d", floor($duration / 60), $duration % 60) : null,
                    "bpm" => $bpm,
                    "energy_level" => $energy_level,
                    "is_loopable" => $is_loopable,
                    "audio_url" => "https://yourdomain.com/abundance-alchemy/api/assets/audio/" . $filename
                ]
            ]);
        } else {
            @unlink($targetFile);
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "message" => "Database error",
                "error_info" => $stmt->errorInfo()
            ]);
        }
    } catch (Exception $e) {
        @unlink($targetFile);
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Database exception",
            "error" => $e->getMessage()
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}

// Optional: Audio duration detection function
function detectAudioDuration($filepath) {
    // Method 1: Using getID3 (install via composer: composer require james-heinrich/getid3)
    if (class_exists('getID3')) {
        $getID3 = new getID3();
        $fileInfo = $getID3->analyze($filepath);
        return isset($fileInfo['playtime_seconds']) ? (int)round($fileInfo['playtime_seconds']) : 0;
    }
    
    // Method 2: Using FFmpeg command line (if available)
    if (function_exists('shell_exec')) {
        $cmd = "ffmpeg -i " . escapeshellarg($filepath) . " 2>&1 | grep Duration | cut -d ' ' -f 4 | sed s/,//";
        $duration = shell_exec($cmd);
        if ($duration) {
            $parts = explode(':', $duration);
            if (count($parts) === 3) {
                return (int)($parts[0] * 3600 + $parts[1] * 60 + $parts[2]);
            }
        }
    }
    
    // Method 3: For MP3 files only (rough estimate)
    if (strtolower(pathinfo($filepath, PATHINFO_EXTENSION)) === 'mp3') {
        $filesize = filesize($filepath);
        // Rough estimate: 128kbps = ~1KB per second
        return (int)($filesize / 128);
    }
    
    return 0;
}