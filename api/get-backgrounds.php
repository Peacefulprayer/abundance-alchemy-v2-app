<?php
include_once 'config.php';
require_once __DIR__ . '/backgrounds-lib.php';

try {
    echo json_encode(aa_background_api_payload(aa_fetch_backgrounds($conn)));
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Error loading backgrounds']);
}
