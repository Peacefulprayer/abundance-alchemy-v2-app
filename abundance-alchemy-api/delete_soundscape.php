<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$soundscapeId = $input['soundscapeId'] ?? '';
$filename = $input['filename'] ?? '';

if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'No filename provided']);
    exit;
}

// Determine which folder (music or meditation)
$musicPath = '../assets/audio/music/' . $filename;
$meditationPath = '../assets/audio/meditation/' . $filename;

$deleted = false;

if (file_exists($musicPath)) {
    $deleted = unlink($musicPath);
} elseif (file_exists($meditationPath)) {
    $deleted = unlink($meditationPath);
}

echo json_encode([
    'success' => $deleted,
    'error' => $deleted ? null : 'File not found or permission denied'
]);
?>