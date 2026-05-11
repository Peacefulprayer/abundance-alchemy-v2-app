<?php
// Local overrides for config.php. Keep this file untracked as config.local.php.

define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_NAME', 'abundance_alchemy');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_CHARSET', 'utf8mb4');

// Optional: server-side Gemini key for AI copy generation.
define('GEMINI_API_KEY', '');

define('DEBUG_MODE', false);

// Optional public base URL for generated absolute links.
define('APP_BASE_URL', 'https://example.com/abundance-alchemy');

// Store private user uploads outside the web root.
define('PRIVATE_UPLOADS_DIR', dirname(__DIR__) . '/abundance-alchemy-private');

define('ALLOWED_ORIGINS', serialize([
    'http://localhost:5173',
    'https://abundantthought.com',
]));
