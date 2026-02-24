<?php
include_once 'config.php';

echo json_encode([
    'token' => api_get_csrf_token(),
]);
