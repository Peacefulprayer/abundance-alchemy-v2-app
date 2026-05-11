<?php

function aa_json_response($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function aa_error_response(string $message, int $status = 400, array $extra = []): void
{
    aa_json_response(array_merge(['message' => $message], $extra), $status);
}

function aa_require_method($allowedMethods): void
{
    $allowed = is_array($allowedMethods) ? $allowedMethods : [$allowedMethods];
    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $normalized = array_map(static fn ($item) => strtoupper((string)$item), $allowed);
    if (!in_array($method, $normalized, true)) {
        aa_error_response('Method not allowed', 405);
    }
}

function aa_read_json_input(): array
{
    static $decoded = null;
    if ($decoded !== null) {
        return $decoded;
    }

    $raw = file_get_contents('php://input');
    $parsed = json_decode($raw ?: '', true);
    $decoded = is_array($parsed) ? $parsed : [];
    return $decoded;
}

function aa_table_columns(PDO $conn, string $table): array
{
    try {
        $stmt = $conn->query("DESCRIBE `$table`");
        $cols = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $cols[] = (string)($row['Field'] ?? '');
        }
        return $cols;
    } catch (Throwable $e) {
        return [];
    }
}

function aa_has_col(array $cols, string $name): bool
{
    return in_array($name, $cols, true);
}

function aa_table_exists(PDO $conn, string $table): bool
{
    try {
        $stmt = $conn->prepare('SHOW TABLES LIKE :table');
        $stmt->bindValue(':table', $table, PDO::PARAM_STR);
        $stmt->execute();
        return (bool)$stmt->fetch(PDO::FETCH_NUM);
    } catch (Throwable $e) {
        return false;
    }
}

function aa_get_session_identity(): array
{
    return [
        'userId' => isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0,
        'userEmail' => trim((string)($_SESSION['user_email'] ?? '')),
        'userName' => trim((string)($_SESSION['user_name'] ?? '')),
    ];
}

function aa_require_authenticated_session(): array
{
    $identity = aa_get_session_identity();
    if ($identity['userId'] <= 0 || $identity['userEmail'] === '') {
        aa_error_response('Unauthorized', 401);
    }
    return $identity;
}

function aa_resolve_owner_binding(PDO $conn, string $table, int $userId, string $userEmail): ?array
{
    $cols = aa_table_columns($conn, $table);
    if (aa_has_col($cols, 'user_id') && $userId > 0) {
        return [
            'columns' => $cols,
            'column' => 'user_id',
            'value' => $userId,
            'pdoType' => PDO::PARAM_INT,
        ];
    }
    if (aa_has_col($cols, 'user_email') && $userEmail !== '') {
        return [
            'columns' => $cols,
            'column' => 'user_email',
            'value' => $userEmail,
            'pdoType' => PDO::PARAM_STR,
        ];
    }
    if (aa_has_col($cols, 'email') && $userEmail !== '') {
        return [
            'columns' => $cols,
            'column' => 'email',
            'value' => $userEmail,
            'pdoType' => PDO::PARAM_STR,
        ];
    }
    return null;
}

function aa_allowed_prayer_paths(): array
{
    return ['christian', 'muslim', 'buddhist', 'traditional', 'science_of_mind', 'universal'];
}

function aa_normalize_prayer_path(string $value): string
{
    $normalized = strtolower(trim($value));
    return in_array($normalized, aa_allowed_prayer_paths(), true) ? $normalized : 'universal';
}

function aa_default_prayer_catalog(): array
{
    return [
        'christian' => [
            'guideSteps' => [
                'Begin with gratitude and recognition of God\'s presence.',
                'Confess what needs healing and ask for wisdom clearly.',
                'Pray blessings over your family, work, and purpose today.',
                'Close with trust, thanksgiving, and quiet reflection.',
            ],
            'sessionPrayers' => [
                'Heavenly Father, thank You for life today. Guide my words, my work, and my heart in wisdom and love. Strengthen me to walk in peace and purpose.',
                'Lord, purify my thoughts and align me with Your will. Help me forgive quickly, lead bravely, and serve faithfully in all I do.',
                'God, bless my home, my relationships, and my calling. Let Your favor rest on my steps, and let my life reflect Your goodness.',
            ],
        ],
        'muslim' => [
            'guideSteps' => [
                'Set intention with humility and stillness before Allah.',
                'Open with praise, then ask for guidance and mercy.',
                'Pray for family, community, and righteous action.',
                'Close in gratitude and remain in calm remembrance.',
            ],
            'sessionPrayers' => [
                'Bismillah al-Rahman al-Raheem. In the name of God, the Most Merciful, the Beneficent. O Allah, guide me on the straight path and grant me wisdom in every decision today.',
                'Bismillah al-Rahman al-Raheem. In the name of God, the Most Merciful, the Beneficent. O Allah, purify my heart, forgive my shortcomings, and strengthen my character. Let my actions be sincere and beneficial to others.',
                'O Allah, bless my family, protect my livelihood, and increase me in patience, gratitude, and steadfast faith.',
            ],
        ],
        'buddhist' => [
            'guideSteps' => [
                'Begin by settling the breath and resting attention in the present moment.',
                'Name the intention to cultivate clarity, compassion, and wise action.',
                'Offer loving-kindness for yourself, for others, and for all beings.',
                'Close in mindfulness, returning gently to the next right step.',
            ],
            'sessionPrayers' => [
                'May this mind become calm, clear, and awake. May I meet this moment with mindfulness, compassion, and wise understanding.',
                'May I release grasping and return to the steady rhythm of the breath. May clarity guide my thoughts, speech, and actions.',
                'May I be rooted in loving-kindness. May others be safe and peaceful. May all beings be held in compassion and freedom from suffering.',
            ],
        ],
        'traditional' => [
            'guideSteps' => [
                'Ground yourself and honor the Creator and your ancestors.',
                'Speak your gratitude and name what you seek direction in.',
                'Ask for protection, strength, and upright character.',
                'Close by committing your actions to wisdom and service.',
            ],
            'sessionPrayers' => [
                'Creator of life, I give thanks for breath, family, and another day. Ancestors of light, guide my path with wisdom and courage.',
                'May my words be clean, my heart be steady, and my hands be useful. Keep me aligned with truth, dignity, and service.',
                'I pray for protection over my home and strength for my purpose. Let what I build bring healing, honor, and abundance.',
            ],
        ],
        'science_of_mind' => [
            'guideSteps' => [
                'Recognition: Acknowledge the Presence, Power, and intelligence of the Divine.',
                'Unification: Remember that the same Divine life lives and moves through you now.',
                'Realization: Speak your desired truth as already active, whole, guided, and unfolding.',
                'Thanksgiving: Give thanks that the prayer is already answered in Spirit.',
                'Release: Let go, trust the law in motion, and rest in calm expectancy.',
            ],
            'sessionPrayers' => [
                'There is one Life, one Presence, one boundless Intelligence expressing as all things. I recognize that this Divine life is here now.',
                'I am one with this Presence. Its wisdom guides my mind, its peace steadies my heart, and its abundance moves freely through my life.',
                'I speak the word for clarity, healing, love, and right action. What I need is already being revealed, organized, and fulfilled.',
                'I give thanks that the answer is active now, even before I can see every detail. I rest in trust and spiritual certainty.',
                'I release this word into the creative law of life, knowing it is done. And so it is.',
            ],
        ],
        'universal' => [
            'guideSteps' => [
                'Take three slow breaths and center your intention.',
                'Name what you are grateful for right now.',
                'Speak your request for clarity, peace, and guidance.',
                'Close by affirming love, responsibility, and trust.',
            ],
            'sessionPrayers' => [
                'Source of life, thank You for this moment. Fill me with calm, clarity, and compassion as I move through this day.',
                'Guide my thoughts toward truth, my words toward kindness, and my actions toward meaningful service.',
                'I release fear, welcome wisdom, and choose love. May peace guide me, and may my work bless others.',
            ],
        ],
    ];
}

function aa_ensure_prayer_content_table(PDO $conn): void
{
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS prayer_content (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            path_key VARCHAR(32) NOT NULL,
            content_type VARCHAR(32) NOT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            title VARCHAR(255) NOT NULL DEFAULT '',
            body TEXT NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_prayer_content_path_type_active (path_key, content_type, is_active, sort_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function aa_seed_default_prayer_content(PDO $conn): void
{
    aa_ensure_prayer_content_table($conn);

    $insert = $conn->prepare(
        'INSERT INTO prayer_content (path_key, content_type, sort_order, title, body, is_active)
         VALUES (:path_key, :content_type, :sort_order, :title, :body, 1)'
    );

    $exists = $conn->prepare(
        'SELECT COUNT(*) FROM prayer_content WHERE path_key = :path_key AND content_type = :content_type'
    );

    foreach (aa_default_prayer_catalog() as $pathKey => $content) {
        $exists->execute([
            ':path_key' => $pathKey,
            ':content_type' => 'guide_step',
        ]);
        $hasGuideSteps = (int)$exists->fetchColumn() > 0;
        if (!$hasGuideSteps) {
            foreach (($content['guideSteps'] ?? []) as $index => $body) {
                $insert->execute([
                    ':path_key' => $pathKey,
                    ':content_type' => 'guide_step',
                    ':sort_order' => $index + 1,
                    ':title' => '',
                    ':body' => $body,
                ]);
            }
        }

        $exists->execute([
            ':path_key' => $pathKey,
            ':content_type' => 'session_prayer',
        ]);
        $hasSessionPrayers = (int)$exists->fetchColumn() > 0;
        if (!$hasSessionPrayers) {
            foreach (($content['sessionPrayers'] ?? []) as $index => $body) {
                $insert->execute([
                    ':path_key' => $pathKey,
                    ':content_type' => 'session_prayer',
                    ':sort_order' => $index + 1,
                    ':title' => '',
                    ':body' => $body,
                ]);
            }
        }
    }
}

function aa_ensure_user_prayers_table(PDO $conn): void
{
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS user_prayers (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            user_email VARCHAR(255) NULL,
            path_key VARCHAR(32) NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT '',
            body TEXT NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY idx_user_prayers_owner_path (user_id, user_email, path_key, is_active),
            KEY idx_user_prayers_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function aa_mail_domain_from_host(string $host): string
{
    $candidate = trim($host);
    $candidate = preg_replace('/[\r\n]+/', '', $candidate) ?? '';
    $candidate = preg_replace('/:\d+$/', '', $candidate) ?? '';
    $candidate = strtolower($candidate);

    if ($candidate === '') {
        return 'localhost';
    }

    if (!preg_match('/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $candidate)) {
        return 'localhost';
    }

    return $candidate;
}

function aa_request_host(): string
{
    $forwardedHost = trim((string)($_SERVER['HTTP_X_FORWARDED_HOST'] ?? ''));
    if ($forwardedHost !== '') {
        $parts = array_map('trim', explode(',', $forwardedHost));
        $candidate = $parts[0] ?? '';
        if ($candidate !== '') {
            return $candidate;
        }
    }

    $host = trim((string)($_SERVER['HTTP_HOST'] ?? ''));
    if ($host !== '') {
        return $host;
    }

    return trim((string)($_SERVER['SERVER_NAME'] ?? 'localhost')) ?: 'localhost';
}

function aa_public_app_root_path(): string
{
    $scriptName = str_replace('\\', '/', (string)($_SERVER['SCRIPT_NAME'] ?? '/'));
    $basePath = dirname($scriptName);

    if (preg_match('#/(api|admin)$#', $basePath)) {
        $basePath = dirname($basePath);
    }

    $basePath = str_replace('\\', '/', $basePath);
    if ($basePath === '/' || $basePath === '.' || $basePath === '\\') {
        return '';
    }

    return rtrim($basePath, '/');
}

function aa_public_url(string $path = ''): string
{
    $configuredBase = defined('APP_BASE_URL') ? rtrim((string)APP_BASE_URL, '/') : '';
    if ($configuredBase !== '') {
        $normalizedPath = ltrim($path, '/');
        return $normalizedPath !== '' ? $configuredBase . '/' . $normalizedPath : $configuredBase;
    }

    $scheme = function_exists('aa_is_https_request') && aa_is_https_request() ? 'https' : 'http';
    $host = aa_request_host();
    $basePath = aa_public_app_root_path();
    $normalizedPath = ltrim($path, '/');

    $url = $scheme . '://' . $host;
    if ($basePath !== '') {
        $url .= $basePath;
    }
    if ($normalizedPath !== '') {
        $url .= '/' . $normalizedPath;
    }

    return $url;
}

function aa_private_uploads_root(): string
{
    $configured = defined('PRIVATE_UPLOADS_DIR') ? trim((string)PRIVATE_UPLOADS_DIR) : '';
    if ($configured !== '') {
        return rtrim($configured, DIRECTORY_SEPARATOR);
    }

    return dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'abundance-alchemy-private';
}

function aa_private_audio_storage_dir(): string
{
    return aa_private_uploads_root() . DIRECTORY_SEPARATOR . 'audio';
}

function aa_ensure_private_audio_storage_dir(): string
{
    $dir = aa_private_audio_storage_dir();
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Private audio storage directory is unavailable');
    }

    @chmod($dir, 0700);
    return $dir;
}

function aa_private_soundscape_key(string $filename): string
{
    return 'private:' . ltrim($filename, '/');
}

function aa_is_private_soundscape_url(string $value): bool
{
    return strncmp($value, 'private:', 8) === 0;
}

function aa_private_soundscape_filename(string $value): string
{
    if (!aa_is_private_soundscape_url($value)) {
        return '';
    }

    return basename(substr($value, 8));
}

function aa_public_audio_assets_dir(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'audio';
}

function aa_soundscape_file_path(string $storedUrl): ?string
{
    $raw = trim($storedUrl);
    if ($raw === '' || preg_match('#^https?://#i', $raw)) {
        return null;
    }

    if (aa_is_private_soundscape_url($raw)) {
        $filename = aa_private_soundscape_filename($raw);
        if ($filename === '') {
            return null;
        }

        return aa_private_audio_storage_dir() . DIRECTORY_SEPARATOR . $filename;
    }

    $normalized = str_replace('\\', '/', ltrim($raw, '/'));
    if (strpos($normalized, 'abundance-alchemy/') === 0) {
        $normalized = substr($normalized, strlen('abundance-alchemy/'));
    }

    if (strpos($normalized, 'assets/audio/') === 0) {
        return dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    }

    if (strpos($normalized, 'admin/uploads/') === 0 || strpos($normalized, 'uploads/') === 0 || strpos($normalized, 'user_uploads/') === 0) {
        return dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    }

    if (strpos($normalized, '/') === false) {
        return aa_public_audio_assets_dir() . DIRECTORY_SEPARATOR . basename($normalized);
    }

    return dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
}

function aa_delete_soundscape_file(string $storedUrl): bool
{
    $path = aa_soundscape_file_path($storedUrl);
    if ($path === null || $path === '' || !file_exists($path)) {
        return true;
    }

    return unlink($path);
}

function aa_password_reset_token_hash(string $token): string
{
    return hash('sha256', $token);
}

function aa_password_reset_token_is_well_formed(string $token): bool
{
    return preg_match('/^[a-f0-9]{64}$/', strtolower(trim($token))) === 1;
}

function aa_password_reset_ttl_seconds(): int
{
    return 60 * 60;
}

function aa_ensure_password_resets_table(PDO $conn): void
{
    $conn->exec(
        "CREATE TABLE IF NOT EXISTS password_resets (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            email VARCHAR(255) NOT NULL,
            token_hash CHAR(64) NOT NULL,
            requested_ip VARCHAR(64) NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            KEY idx_password_resets_email (email),
            KEY idx_password_resets_user_id (user_id),
            KEY idx_password_resets_token_hash (token_hash),
            KEY idx_password_resets_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function aa_send_password_reset_email(string $email, string $name, string $resetLink): bool
{
    $templatePath = __DIR__ . '/../admin/email_templates/password_reset.txt';
    $template = @file_get_contents($templatePath);
    if ($template === false || trim($template) === '') {
        $template = "Hello {name},\n\nWe received a request to reset your Abundance Alchemy password.\n\nOpen the link below to create a new password:\n{reset_link}\n\nIf you did not request this, you can ignore this email.\n";
    }

    $body = str_replace(
        ['{name}', '{email}', '{reset_link}'],
        [$name !== '' ? $name : 'there', $email, $resetLink],
        $template
    );

    $fromDomain = aa_mail_domain_from_host(aa_request_host());
    $headers = implode("\r\n", [
        'From: Abundance Alchemy <no-reply@' . $fromDomain . '>',
        'Reply-To: no-reply@' . $fromDomain,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ]);

    return @mail($email, 'Abundance Alchemy Password Reset', $body, $headers);
}

function aa_issue_password_reset(PDO $conn, int $userId, string $email, string $name = ''): bool
{
    if ($userId <= 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        if (function_exists('aa_log_auth_event')) {
            aa_log_auth_event($conn, 'password_reset_issue_rejected', false, $email, $userId > 0 ? $userId : null, 'user');
        }
        return false;
    }

    aa_ensure_password_resets_table($conn);

    $conn->prepare(
        'DELETE FROM password_resets WHERE expires_at < UTC_TIMESTAMP() OR used_at IS NOT NULL'
    )->execute();

    $invalidate = $conn->prepare(
        'UPDATE password_resets
         SET used_at = UTC_TIMESTAMP()
         WHERE user_id = :user_id
           AND used_at IS NULL
           AND expires_at >= UTC_TIMESTAMP()'
    );
    $invalidate->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $invalidate->execute();

    $token = bin2hex(random_bytes(32));
    $tokenHash = aa_password_reset_token_hash($token);
    $expiresAt = gmdate('Y-m-d H:i:s', time() + aa_password_reset_ttl_seconds());

    $insert = $conn->prepare(
        'INSERT INTO password_resets (user_id, email, token_hash, requested_ip, expires_at)
         VALUES (:user_id, :email, :token_hash, :requested_ip, :expires_at)'
    );
    $insert->bindValue(':user_id', $userId, PDO::PARAM_INT);
    $insert->bindValue(':email', $email, PDO::PARAM_STR);
    $insert->bindValue(':token_hash', $tokenHash, PDO::PARAM_STR);
    $insert->bindValue(':requested_ip', function_exists('aa_client_ip') ? aa_client_ip() : '', PDO::PARAM_STR);
    $insert->bindValue(':expires_at', $expiresAt, PDO::PARAM_STR);
    $insert->execute();

    $resetLink = aa_public_url('reset-password.php') . '?token=' . urlencode($token);
    $sent = aa_send_password_reset_email($email, $name, $resetLink);

    if (!$sent) {
        $cleanup = $conn->prepare('DELETE FROM password_resets WHERE token_hash = :token_hash LIMIT 1');
        $cleanup->bindValue(':token_hash', $tokenHash, PDO::PARAM_STR);
        $cleanup->execute();
        if (function_exists('aa_log_auth_event')) {
            aa_log_auth_event($conn, 'password_reset_email_failed', false, $email, $userId, 'user');
        }
    } elseif (function_exists('aa_log_auth_event')) {
        aa_log_auth_event($conn, 'password_reset_issued', true, $email, $userId, 'user');
    }

    return $sent;
}

function aa_find_valid_password_reset(PDO $conn, string $token): ?array
{
    if (!aa_password_reset_token_is_well_formed($token)) {
        return null;
    }

    aa_ensure_password_resets_table($conn);

    $query = $conn->prepare(
        'SELECT id, user_id, email, expires_at, used_at, created_at
         FROM password_resets
         WHERE token_hash = :token_hash
           AND used_at IS NULL
           AND expires_at >= UTC_TIMESTAMP()
         ORDER BY id DESC
         LIMIT 1'
    );
    $query->bindValue(':token_hash', aa_password_reset_token_hash($token), PDO::PARAM_STR);
    $query->execute();

    $row = $query->fetch(PDO::FETCH_ASSOC);
    return is_array($row) ? $row : null;
}

function aa_consume_password_reset(PDO $conn, string $token, string $passwordHash): bool
{
    if (!aa_password_reset_token_is_well_formed($token) || trim($passwordHash) === '') {
        return false;
    }

    aa_ensure_password_resets_table($conn);
    $tokenHash = aa_password_reset_token_hash($token);

    try {
        $conn->beginTransaction();

        $lookup = $conn->prepare(
            'SELECT id, user_id, email
             FROM password_resets
             WHERE token_hash = :token_hash
               AND used_at IS NULL
               AND expires_at >= UTC_TIMESTAMP()
             ORDER BY id DESC
             LIMIT 1
             FOR UPDATE'
        );
        $lookup->bindValue(':token_hash', $tokenHash, PDO::PARAM_STR);
        $lookup->execute();
        $reset = $lookup->fetch(PDO::FETCH_ASSOC);

        if (!$reset) {
            $conn->rollBack();
            if (function_exists('aa_log_auth_event')) {
                aa_log_auth_event($conn, 'password_reset_consume_failed', false, '', null, 'user', ['reason' => 'invalid_or_expired']);
            }
            return false;
        }

        $userId = isset($reset['user_id']) ? (int)$reset['user_id'] : 0;
        $email = trim((string)($reset['email'] ?? ''));

        if ($userId > 0) {
            $updateUser = $conn->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :user_id LIMIT 1');
            $updateUser->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
            $updateUser->bindValue(':user_id', $userId, PDO::PARAM_INT);
        } else {
            $updateUser = $conn->prepare('UPDATE users SET password_hash = :password_hash WHERE email = :email LIMIT 1');
            $updateUser->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
            $updateUser->bindValue(':email', $email, PDO::PARAM_STR);
        }
        $updateUser->execute();

        if ($updateUser->rowCount() < 1) {
            $conn->rollBack();
            if (function_exists('aa_log_auth_event')) {
                aa_log_auth_event($conn, 'password_reset_consume_failed', false, $email, $userId > 0 ? $userId : null, 'user', ['reason' => 'user_not_updated']);
            }
            return false;
        }

        $invalidate = $conn->prepare(
            'UPDATE password_resets
             SET used_at = UTC_TIMESTAMP()
             WHERE (user_id = :user_id OR email = :email)
               AND used_at IS NULL'
        );
        $invalidate->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $invalidate->bindValue(':email', $email, PDO::PARAM_STR);
        $invalidate->execute();

        $conn->commit();
        if (function_exists('aa_log_auth_event')) {
            aa_log_auth_event($conn, 'password_reset_completed', true, $email, $userId > 0 ? $userId : null, 'user');
        }
        return true;
    } catch (Throwable $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log('[api/helpers.php] Password reset consume failed: ' . $e->getMessage());
        if (function_exists('aa_log_auth_event')) {
            aa_log_auth_event($conn, 'password_reset_consume_error', false, '', null, 'user', ['error' => 'server_error']);
        }
        return false;
    }
}
