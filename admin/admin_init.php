<?php
// Admin initialization: isolated secure session + CSRF helpers.

require_once __DIR__ . '/../security.php';

aa_send_common_security_headers();

$secure = aa_is_https_request();
$cookieParams = session_get_cookie_params();
$adminSessionName = 'AA_ADMIN_SESSID';
$adminSessionLifetime = 60 * 60 * 12; // 12 hours (sliding inactivity timeout)
$adminCookiePath = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/');
if ($adminCookiePath === '') {
    $adminCookiePath = '/';
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    // Keep admin session isolated from API/web app sessions.
    session_name($adminSessionName);
    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string)$adminSessionLifetime);

    session_set_cookie_params([
        'lifetime' => $adminSessionLifetime,
        'path'     => $adminCookiePath,
        'domain'   => $cookieParams['domain'],
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

// Sliding inactivity timeout.
$lastActivity = isset($_SESSION['admin_last_activity']) ? (int)$_SESSION['admin_last_activity'] : 0;
if ($lastActivity > 0 && (time() - $lastActivity) > $adminSessionLifetime) {
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
$_SESSION['admin_last_activity'] = time();

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
