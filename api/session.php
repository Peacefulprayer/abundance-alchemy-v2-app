<?php
// Shared session bootstrap for API endpoints.

require_once __DIR__ . '/../security.php';

$secure = aa_is_https_request();
$cookieParams = session_get_cookie_params();
$apiSessionName = 'AA_API_SESSID';
$apiSessionInactivityTimeout = 60 * 60 * 8;
$apiSessionAbsoluteLifetime = 60 * 60 * 24 * 7;

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name($apiSessionName);
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string)$apiSessionAbsoluteLifetime);
}

session_set_cookie_params([
    'lifetime' => 0,
    'path' => $cookieParams['path'],
    'domain' => $cookieParams['domain'],
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$apiLastActivity = isset($_SESSION['api_last_activity']) ? (int)$_SESSION['api_last_activity'] : 0;
$apiAuthenticatedAt = isset($_SESSION['api_authenticated_at']) ? (int)$_SESSION['api_authenticated_at'] : 0;
$hasAuthenticatedIdentity = !empty($_SESSION['user_id']) && !empty($_SESSION['user_email']);
$isExpiredByInactivity = $apiLastActivity > 0 && (time() - $apiLastActivity) > $apiSessionInactivityTimeout;
$isExpiredByAbsoluteLifetime = $apiAuthenticatedAt > 0 && (time() - $apiAuthenticatedAt) > $apiSessionAbsoluteLifetime;

if ($hasAuthenticatedIdentity && ($isExpiredByInactivity || $isExpiredByAbsoluteLifetime)) {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }
    session_destroy();
    session_start();
}

if (!empty($_SESSION['user_id']) && !empty($_SESSION['user_email'])) {
    if (empty($_SESSION['api_authenticated_at'])) {
        $_SESSION['api_authenticated_at'] = time();
    }
    $_SESSION['api_last_activity'] = time();
}
