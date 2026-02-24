<?php
// Shared session bootstrap for API endpoints.

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$cookieParams = session_get_cookie_params();
$apiSessionName = 'AA_API_SESSID';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name($apiSessionName);
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
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
