<?php
// Copy this file to config.php and fill in real values (do not commit config.php).

define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'abundance_alchemy');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_CHARSET', 'utf8mb4');

define('DEBUG_MODE', false);

// Allowed origins for API CORS (must be serialized array).
define('ALLOWED_ORIGINS', serialize([
    'http://localhost:5173',
    'https://abundantthought.com',
]));
