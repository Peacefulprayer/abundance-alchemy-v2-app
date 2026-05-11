<?php
include_once 'config.php';

aa_require_method('GET');
$identity = aa_require_authenticated_session();

$soundscapeId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($soundscapeId <= 0) {
    http_response_code(400);
    echo 'Invalid soundscape id';
    exit();
}

try {
    $stmt = $conn->prepare(
        'SELECT id, name, url, user_email, is_active, is_public
         FROM soundscapes
         WHERE id = :id
         LIMIT 1'
    );
    $stmt->bindValue(':id', $soundscapeId, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !(int)($row['is_active'] ?? 0)) {
        http_response_code(404);
        echo 'Audio not found';
        exit();
    }

    $ownerEmail = trim((string)($row['user_email'] ?? ''));
    if ($ownerEmail === '' || strcasecmp($ownerEmail, $identity['userEmail']) !== 0) {
        http_response_code(403);
        echo 'Forbidden';
        exit();
    }

    $storedUrl = trim((string)($row['url'] ?? ''));
    if (!aa_is_private_soundscape_url($storedUrl)) {
        http_response_code(400);
        echo 'Audio is not stored privately';
        exit();
    }

    $path = aa_soundscape_file_path($storedUrl);
    if ($path === null || !is_file($path)) {
        http_response_code(404);
        echo 'Audio file missing';
        exit();
    }

    $mimeType = 'application/octet-stream';
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $detected = $finfo->file($path);
        if (is_string($detected) && $detected !== '') {
            $mimeType = $detected;
        }
    }

    $downloadName = preg_replace('/[^a-zA-Z0-9_\-]+/', '_', (string)($row['name'] ?? 'soundscape'));
    $extension = pathinfo($path, PATHINFO_EXTENSION);
    if ($extension !== '') {
        $downloadName .= '.' . $extension;
    }

    header_remove('Content-Type');
    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . (string)filesize($path));
    header('Content-Disposition: inline; filename="' . $downloadName . '"');
    header('Cache-Control: private, no-store, max-age=0');
    header('Accept-Ranges: bytes');
    readfile($path);
    exit();
} catch (Throwable $e) {
    error_log('[api/private-audio.php] Failed to stream private audio: ' . $e->getMessage());
    http_response_code(500);
    echo 'Audio streaming failed';
    exit();
}
