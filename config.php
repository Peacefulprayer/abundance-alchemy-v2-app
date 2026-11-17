<?php

$localConfigPath = __DIR__ . '/config.local.php';
if (is_file($localConfigPath)) {
    require_once $localConfigPath;
}

function aa_env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }

    $trimmed = trim((string)$value);
    return $trimmed === '' ? $default : $trimmed;
}

function aa_env_bool(string $key, bool $default = false): bool
{
    $value = aa_env_value($key);
    if ($value === null) {
        return $default;
    }

    $normalized = strtolower($value);
    if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
        return true;
    }
    if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
        return false;
    }

    return $default;
}

function aa_env_csv(string $key, array $default = []): array
{
    $value = aa_env_value($key);
    if ($value === null) {
        return $default;
    }

    $parts = array_values(array_filter(array_map(
        static fn (string $item): string => trim($item),
        explode(',', $value)
    )));

    return $parts ?: $default;
}

if (!defined('DB_HOST')) {
    define('DB_HOST', aa_env_value('AA_DB_HOST', '127.0.0.1'));
}

if (!defined('DB_PORT')) {
    define('DB_PORT', (int)aa_env_value('AA_DB_PORT', '3306'));
}

if (!defined('DB_NAME')) {
    define('DB_NAME', aa_env_value('AA_DB_NAME', 'abundance_alchemy'));
}

if (!defined('DB_USER')) {
    define('DB_USER', aa_env_value('AA_DB_USER', 'root'));
}

if (!defined('DB_PASSWORD')) {
    define('DB_PASSWORD', aa_env_value('AA_DB_PASSWORD', ''));
}

if (!defined('DB_CHARSET')) {
    define('DB_CHARSET', aa_env_value('AA_DB_CHARSET', 'utf8mb4'));
}

if (!defined('GEMINI_API_KEY')) {
    define('GEMINI_API_KEY', aa_env_value('AA_GEMINI_API_KEY', ''));
}

if (!defined('DEBUG_MODE')) {
    define('DEBUG_MODE', aa_env_bool('AA_DEBUG_MODE', false));
}

if (!defined('APP_BASE_URL')) {
    define('APP_BASE_URL', rtrim((string)aa_env_value('AA_APP_BASE_URL', ''), '/'));
}

if (!defined('PRIVATE_UPLOADS_DIR')) {
    define('PRIVATE_UPLOADS_DIR', aa_env_value('AA_PRIVATE_UPLOADS_DIR', dirname(__DIR__) . '/abundance-alchemy-private'));
}

if (!defined('ALLOWED_ORIGINS')) {
    define('ALLOWED_ORIGINS', serialize(aa_env_csv('AA_ALLOWED_ORIGINS', [
        'http://localhost:5173',
        'https://abundantthought.com',
    ])));
}
