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
    return ['christian', 'muslim', 'traditional', 'universal'];
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
                'O Allah, I begin with gratitude for Your mercy and care. Guide me on the straight path and grant me wisdom in every decision today.',
                'O Allah, purify my heart, forgive my shortcomings, and strengthen my character. Let my actions be sincere and beneficial to others.',
                'O Allah, bless my family, protect my livelihood, and increase me in patience, gratitude, and steadfast faith.',
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

    $count = (int)$conn->query('SELECT COUNT(*) FROM prayer_content')->fetchColumn();
    if ($count > 0) {
        return;
    }

    $insert = $conn->prepare(
        'INSERT INTO prayer_content (path_key, content_type, sort_order, title, body, is_active)
         VALUES (:path_key, :content_type, :sort_order, :title, :body, 1)'
    );

    foreach (aa_default_prayer_catalog() as $pathKey => $content) {
        foreach (($content['guideSteps'] ?? []) as $index => $body) {
            $insert->execute([
                ':path_key' => $pathKey,
                ':content_type' => 'guide_step',
                ':sort_order' => $index + 1,
                ':title' => '',
                ':body' => $body,
            ]);
        }

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

