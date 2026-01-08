<?php
// Admin initialization: secure session + CSRF helpers.

// Configure secure session cookie settings before starting session
$secure       = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$cookieParams = session_get_cookie_params();

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => $cookieParams['path'],
    'domain'   => $cookieParams['domain'],
    'secure'   => $secure,
    'httponly' => true,
    'samesite' => 'Strict',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// Ensure CSRF token exists for this session
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

/**
 * Get current CSRF token string.
 */
function aa_get_csrf_token(): string
{
    return $_SESSION['csrf_token'] ?? '';
}

/**
 * Echo a hidden CSRF input field inside a <form>.
 * Usage: <form ...><?php aa_csrf_field(); ?><!-- other fields --></form>
 */
function aa_csrf_field(): void
{
    $token = htmlspecialchars(aa_get_csrf_token(), ENT_QUOTES, 'UTF-8');
    echo '<input type="hidden" name="csrf_token" value="' . $token . '">';
}

/**
 * Verify CSRF token on POST.
 * Call this near the top of admin scripts handling POST requests.
 */
function aa_require_valid_csrf(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        $postToken    = $_POST['csrf_token'] ?? '';

        if (!$sessionToken || !$postToken || !hash_equals($sessionToken, $postToken)) {
            http_response_code(400);
            die('Invalid request (CSRF token mismatch).');
        }
    }
}