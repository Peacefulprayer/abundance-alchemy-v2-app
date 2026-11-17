<?php
// Shared API bootstrap for Abundance Alchemy.
// - Sets CORS & JSON headers
// - Creates $conn PDO using root config.php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/helpers.php';

aa_send_common_security_headers();

// CORS allowlist
$origin         = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = unserialize(ALLOWED_ORIGINS);
$allowedOrigins = is_array($allowedOrigins) ? array_values($allowedOrigins) : [];

if ($origin && is_array($allowedOrigins) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Access-Control-Allow-Credentials: true");
}
header("Vary: Origin");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if ($origin && !in_array($origin, $allowedOrigins, true)) {
        http_response_code(403);
        exit();
    }
    http_response_code(200);
    exit();
}

function api_is_mutating_method(): bool
{
    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    return in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true);
}

function api_origin_is_allowed(string $candidateOrigin): bool
{
    $candidate = rtrim($candidateOrigin, '/');
    $allowed = unserialize(ALLOWED_ORIGINS);
    if (!is_array($allowed)) {
        return false;
    }
    foreach ($allowed as $item) {
        if (!is_string($item)) {
            continue;
        }
        if ($candidate === rtrim($item, '/')) {
            return true;
        }
    }
    return false;
}

function api_request_context_is_trusted(): bool
{
    $requestOrigin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($requestOrigin !== '') {
        return api_origin_is_allowed($requestOrigin);
    }

    $referer = trim((string)($_SERVER['HTTP_REFERER'] ?? ''));
    if ($referer !== '') {
        $parts = parse_url($referer);
        if (is_array($parts) && !empty($parts['scheme']) && !empty($parts['host'])) {
            $candidate = $parts['scheme'] . '://' . $parts['host'];
            if (!empty($parts['port'])) {
                $candidate .= ':' . $parts['port'];
            }
            return api_origin_is_allowed($candidate);
        }
    }

    $fetchSite = strtolower(trim((string)($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));
    if (in_array($fetchSite, ['same-origin', 'same-site', 'none'], true)) {
        return true;
    }

    return false;
}

function api_require_trusted_request_context(): void
{
    if (!api_is_mutating_method()) {
        return;
    }
    if (api_request_context_is_trusted()) {
        return;
    }

    http_response_code(403);
    echo json_encode(['message' => 'Forbidden request context']);
    exit();
}

// Block cross-site mutating requests.
api_require_trusted_request_context();

if (empty($_SESSION['api_csrf_token']) || !is_string($_SESSION['api_csrf_token'])) {
    $_SESSION['api_csrf_token'] = bin2hex(random_bytes(32));
}

function api_get_csrf_token(): string
{
    return (string)($_SESSION['api_csrf_token'] ?? '');
}

function api_require_csrf(): void
{
    if (!api_is_mutating_method()) {
        return;
    }

    $sessionToken = api_get_csrf_token();
    $headerToken = trim((string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
    if ($sessionToken === '' || $headerToken === '' || !hash_equals($sessionToken, $headerToken)) {
        http_response_code(403);
        echo json_encode(['message' => 'Invalid CSRF token']);
        exit();
    }
}

// Create PDO connection for API
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    if (defined('DB_PORT') && DB_PORT) {
        $dsn .= ";port=" . DB_PORT;
    }
    $conn = new PDO(
        $dsn,
        DB_USER,
        DB_PASSWORD,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    // Never expose database internals in API responses.
    error_log('[api/config.php] DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["message" => "Database connection error"]);
    exit();
}
