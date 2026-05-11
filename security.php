<?php

function aa_is_https_request(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') {
        return true;
    }

    if (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
        return true;
    }

    $forwardedProto = strtolower(trim((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')));
    if ($forwardedProto !== '') {
        $parts = array_map('trim', explode(',', $forwardedProto));
        if (in_array('https', $parts, true)) {
            return true;
        }
    }

    $forwardedSsl = strtolower(trim((string)($_SERVER['HTTP_X_FORWARDED_SSL'] ?? '')));
    if ($forwardedSsl === 'on') {
        return true;
    }

    return false;
}

function aa_send_common_security_headers(): void
{
    if (headers_sent()) {
        return;
    }

    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cross-Origin-Opener-Policy: same-origin');
    header('Cross-Origin-Resource-Policy: same-site');
    header('X-Permitted-Cross-Domain-Policies: none');
    header("Content-Security-Policy: base-uri 'self'; frame-ancestors 'self'; form-action 'self'");
    header(
        'Permissions-Policy: accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()'
    );

    if (aa_is_https_request()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
}

function aa_client_ip(): string
{
    $candidates = [];

    $forwardedFor = trim((string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''));
    if ($forwardedFor !== '') {
        $candidates = array_merge($candidates, array_map('trim', explode(',', $forwardedFor)));
    }

    $remoteAddr = trim((string)($_SERVER['REMOTE_ADDR'] ?? ''));
    if ($remoteAddr !== '') {
        $candidates[] = $remoteAddr;
    }

    foreach ($candidates as $candidate) {
        if (filter_var($candidate, FILTER_VALIDATE_IP)) {
            return $candidate;
        }
    }

    return 'unknown';
}

function aa_rate_limit_consume(string $scope, int $limit, int $windowSeconds, ?string $subject = null): array
{
    if ($limit < 1 || $windowSeconds < 1) {
        return [
            'allowed' => true,
            'remaining' => $limit,
            'retry_after' => 0,
        ];
    }

    $baseDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'aa_rate_limits';
    if (!is_dir($baseDir) && !@mkdir($baseDir, 0700, true) && !is_dir($baseDir)) {
        return [
            'allowed' => true,
            'remaining' => $limit,
            'retry_after' => 0,
        ];
    }

    $keyParts = [
        $scope,
        aa_client_ip(),
        strtolower(trim((string)$subject)),
    ];
    $hash = hash('sha256', implode('|', $keyParts));
    $path = $baseDir . DIRECTORY_SEPARATOR . $hash . '.json';
    $now = time();

    $state = [
        'count' => 0,
        'reset_at' => $now + $windowSeconds,
    ];

    if (is_file($path)) {
        $raw = @file_get_contents($path);
        $decoded = json_decode($raw ?: '', true);
        if (is_array($decoded) && isset($decoded['count'], $decoded['reset_at'])) {
            $state['count'] = (int)$decoded['count'];
            $state['reset_at'] = (int)$decoded['reset_at'];
        }
    }

    if ($state['reset_at'] <= $now) {
        $state = [
            'count' => 0,
            'reset_at' => $now + $windowSeconds,
        ];
    }

    $state['count'] += 1;
    @file_put_contents($path, json_encode($state), LOCK_EX);

    $allowed = $state['count'] <= $limit;
    return [
        'allowed' => $allowed,
        'remaining' => max(0, $limit - $state['count']),
        'retry_after' => $allowed ? 0 : max(1, $state['reset_at'] - $now),
    ];
}

function aa_ensure_auth_events_table(PDO $conn): void
{
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS auth_events (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            event_type VARCHAR(64) NOT NULL,
            actor_type VARCHAR(32) NOT NULL DEFAULT 'user',
            actor_id BIGINT NULL,
            email VARCHAR(255) NULL,
            was_success TINYINT(1) NOT NULL DEFAULT 0,
            ip_address VARCHAR(64) NULL,
            user_agent VARCHAR(512) NULL,
            details_json TEXT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_auth_events_event_type (event_type),
            KEY idx_auth_events_actor_type (actor_type),
            KEY idx_auth_events_email (email),
            KEY idx_auth_events_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function aa_log_auth_event(
    PDO $conn,
    string $eventType,
    bool $wasSuccess,
    string $email = '',
    ?int $actorId = null,
    string $actorType = 'user',
    array $details = []
): void {
    try {
        aa_ensure_auth_events_table($conn);

        $stmt = $conn->prepare(
            'INSERT INTO auth_events (event_type, actor_type, actor_id, email, was_success, ip_address, user_agent, details_json)
             VALUES (:event_type, :actor_type, :actor_id, :email, :was_success, :ip_address, :user_agent, :details_json)'
        );
        $stmt->bindValue(':event_type', $eventType, PDO::PARAM_STR);
        $stmt->bindValue(':actor_type', $actorType, PDO::PARAM_STR);
        if ($actorId === null) {
            $stmt->bindValue(':actor_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':actor_id', $actorId, PDO::PARAM_INT);
        }
        $stmt->bindValue(':email', $email !== '' ? $email : null, $email !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':was_success', $wasSuccess ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':ip_address', aa_client_ip(), PDO::PARAM_STR);
        $userAgent = substr(trim((string)($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 512);
        $stmt->bindValue(':user_agent', $userAgent !== '' ? $userAgent : null, $userAgent !== '' ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $detailsJson = $details ? json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : null;
        $stmt->bindValue(':details_json', $detailsJson !== false ? $detailsJson : null, $detailsJson ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->execute();
    } catch (Throwable $e) {
        error_log('[security.php] Failed to log auth event: ' . $e->getMessage());
    }
}

function aa_table_has_column(PDO $conn, string $table, string $column): bool
{
    try {
        $stmt = $conn->query("SHOW COLUMNS FROM `$table` LIKE " . $conn->quote($column));
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return false;
    }
}

function aa_ensure_admin_mfa_columns(PDO $conn): void
{
    if (!aa_table_has_column($conn, 'admins', 'totp_secret')) {
        $conn->exec("ALTER TABLE admins ADD COLUMN totp_secret VARCHAR(64) NULL AFTER password_hash");
    }

    if (!aa_table_has_column($conn, 'admins', 'totp_enabled')) {
        $conn->exec("ALTER TABLE admins ADD COLUMN totp_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER totp_secret");
    }
}

function aa_totp_base32_alphabet(): string
{
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
}

function aa_generate_totp_secret(int $length = 32): string
{
    $alphabet = aa_totp_base32_alphabet();
    $maxIndex = strlen($alphabet) - 1;
    $secret = '';
    for ($i = 0; $i < $length; $i++) {
        $secret .= $alphabet[random_int(0, $maxIndex)];
    }
    return $secret;
}

function aa_base32_decode(string $value): string
{
    $clean = strtoupper(preg_replace('/[^A-Z2-7]/', '', $value) ?? '');
    if ($clean === '') {
        return '';
    }

    $alphabet = aa_totp_base32_alphabet();
    $bits = '';
    $length = strlen($clean);
    for ($i = 0; $i < $length; $i++) {
        $index = strpos($alphabet, $clean[$i]);
        if ($index === false) {
            return '';
        }
        $bits .= str_pad(decbin($index), 5, '0', STR_PAD_LEFT);
    }

    $binary = '';
    $bitLength = strlen($bits);
    for ($i = 0; $i + 8 <= $bitLength; $i += 8) {
        $binary .= chr(bindec(substr($bits, $i, 8)));
    }

    return $binary;
}

function aa_totp_code(string $secret, ?int $timestamp = null, int $period = 30, int $digits = 6): string
{
    $key = aa_base32_decode($secret);
    if ($key === '') {
        return '';
    }

    $time = $timestamp ?? time();
    $counter = (int)floor($time / $period);
    $binaryCounter = pack('N*', 0) . pack('N*', $counter);
    $hash = hash_hmac('sha1', $binaryCounter, $key, true);
    $offset = ord(substr($hash, -1)) & 0x0F;
    $segment = substr($hash, $offset, 4);
    $value = unpack('N', $segment)[1] & 0x7FFFFFFF;

    return str_pad((string)($value % (10 ** $digits)), $digits, '0', STR_PAD_LEFT);
}

function aa_verify_totp_code(string $secret, string $code, int $window = 1): bool
{
    $normalizedCode = preg_replace('/\D+/', '', $code) ?? '';
    if ($normalizedCode === '' || strlen($normalizedCode) !== 6) {
        return false;
    }

    for ($offset = -$window; $offset <= $window; $offset++) {
        $candidate = aa_totp_code($secret, time() + ($offset * 30));
        if ($candidate !== '' && hash_equals($candidate, $normalizedCode)) {
            return true;
        }
    }

    return false;
}

function aa_admin_totp_is_enabled(array $admin): bool
{
    return !empty($admin['totp_enabled']) && !empty($admin['totp_secret']);
}

function aa_admin_totp_otpauth_uri(string $label, string $secret, string $issuer = 'Abundance Alchemy'): string
{
    return 'otpauth://totp/' . rawurlencode($issuer . ':' . $label)
        . '?secret=' . rawurlencode($secret)
        . '&issuer=' . rawurlencode($issuer)
        . '&algorithm=SHA1&digits=6&period=30';
}
