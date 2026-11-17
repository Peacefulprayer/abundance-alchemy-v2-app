<?php

function aa_background_modes(): array
{
    return ['inherit', 'image', 'color', 'none'];
}

function aa_background_section_slots(): array
{
    return [
        'SECTION_ENTRY'        => 'Section Default: Entry Flow (Splash/Auth/Onboarding)',
        'SECTION_CORE'         => 'Section Default: Core App (Dashboard/Library/Settings/Profile/Stats)',
        'SECTION_AFFIRM_IAM'   => 'Section Default: Morning "I Am" Flow',
        'SECTION_AFFIRM_ILOVE' => 'Section Default: Evening "I Love" Flow',
        'SECTION_MEDITATION'   => 'Section Default: Meditation Flow',
        'SECTION_PRAYER'       => 'Section Default: Prayer (Omba) Flow',
    ];
}

function aa_background_global_slots(): array
{
    return [
        'HOME' => 'Global Fallback (App Wide)',
    ];
}

function aa_background_screen_slots(): array
{
    return [
        'PRE_SPLASH'          => 'Pre-Splash',
        'SPLASH'              => 'Splash Intro',
        'SPLASH_WELCOME'      => 'Splash Welcome (welcome.mp3)',
        'WELCOME'             => 'Welcome',
        'NAMING_CEREMONY'     => 'Sacred Naming Ceremony',
        'AUTH'                => 'Login / Register',
        'RETURN_PORTAL'       => 'Return Portal',
        'ONBOARDING'          => 'Onboarding',
        'TUTORIAL'            => 'Tutorial',
        'DASHBOARD'           => 'Dashboard',
        'PRACTICE_PREP'       => 'Practice Prep - Invocation Screen',
        'LIBRARY'             => 'Library (Maktaba)',
        'IAM_SETUP'           => 'Morning "I Am" - Setup',
        'IAM_PRACTICE'        => 'Morning "I Am" - Practice',
        'ILOVE_SETUP'         => 'Evening "I Love" - Setup',
        'ILOVE_PRACTICE'      => 'Evening "I Love" - Practice',
        'MEDITATION_SETUP'    => 'Meditation - Setup',
        'MEDITATION_PRACTICE' => 'Meditation - Session',
        'PRAYER_SETUP'        => 'Prayer (Omba) - Setup',
        'PRAYER_GUIDE'        => 'Prayer (Omba) - Guide',
        'PRAYER_SESSION'      => 'Prayer (Omba) - Session',
        'SETTINGS'            => 'Settings',
        'PROFILE'             => 'Profile',
        'STATS'               => 'Stats',
        'PROGRESS'            => 'Progress / Journey Overview',
    ];
}

function aa_background_screen_fallback_sections(): array
{
    return [
        'PRE_SPLASH'          => 'SECTION_ENTRY',
        'SPLASH'              => 'SECTION_ENTRY',
        'SPLASH_WELCOME'      => 'SECTION_ENTRY',
        'WELCOME'             => 'SECTION_ENTRY',
        'NAMING_CEREMONY'     => 'SECTION_ENTRY',
        'AUTH'                => 'SECTION_ENTRY',
        'RETURN_PORTAL'       => 'SECTION_ENTRY',
        'ONBOARDING'          => 'SECTION_ENTRY',
        'TUTORIAL'            => 'SECTION_ENTRY',
        'DASHBOARD'           => 'SECTION_CORE',
        'PRACTICE_PREP'       => 'SECTION_CORE',
        'LIBRARY'             => 'SECTION_CORE',
        'SETTINGS'            => 'SECTION_CORE',
        'PROFILE'             => 'SECTION_CORE',
        'STATS'               => 'SECTION_CORE',
        'PROGRESS'            => 'SECTION_CORE',
        'IAM_SETUP'           => 'SECTION_AFFIRM_IAM',
        'IAM_PRACTICE'        => 'SECTION_AFFIRM_IAM',
        'ILOVE_SETUP'         => 'SECTION_AFFIRM_ILOVE',
        'ILOVE_PRACTICE'      => 'SECTION_AFFIRM_ILOVE',
        'MEDITATION_SETUP'    => 'SECTION_MEDITATION',
        'MEDITATION_PRACTICE' => 'SECTION_MEDITATION',
        'PRAYER_SETUP'        => 'SECTION_PRAYER',
        'PRAYER_GUIDE'        => 'SECTION_PRAYER',
        'PRAYER_SESSION'      => 'SECTION_PRAYER',
    ];
}

function aa_background_slots(): array
{
    return aa_background_section_slots() + aa_background_global_slots() + aa_background_screen_slots();
}

function aa_background_schema_status(PDO $conn): array
{
    $cols = function_exists('aa_table_columns') ? aa_table_columns($conn, 'backgrounds') : [];
    if ($cols === []) {
        try {
            $stmt = $conn->query('DESCRIBE backgrounds');
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $cols[] = (string)($row['Field'] ?? '');
            }
        } catch (Throwable $e) {
            $cols = [];
        }
    }
    $slots = aa_background_slots();
    $slotType = '';
    $enumValues = [];
    $missingSlotValues = [];

    try {
        $stmt = $conn->query("SHOW COLUMNS FROM backgrounds LIKE 'slot'");
        $slotColumn = $stmt ? $stmt->fetch(PDO::FETCH_ASSOC) : null;
        if ($slotColumn && isset($slotColumn['Type'])) {
            $slotType = (string)$slotColumn['Type'];
            if (stripos($slotType, 'enum(') === 0 && preg_match_all("/'([^']+)'/", $slotType, $matches)) {
                $enumValues = $matches[1] ?? [];
                foreach (array_keys($slots) as $slotKey) {
                    if (!in_array($slotKey, $enumValues, true)) {
                        $missingSlotValues[] = $slotKey;
                    }
                }
            }
        }
    } catch (Throwable $e) {
        $slotType = '';
    }

    return [
        'columns' => $cols,
        'slotType' => $slotType,
        'enumValues' => $enumValues,
        'missingSlotValues' => $missingSlotValues,
        'hasBackgroundModeColumn' => in_array('background_mode', $cols, true),
        'hasColorValueColumn' => in_array('color_value', $cols, true),
        'hasCreatorNameColumn' => in_array('creator_name', $cols, true),
    ];
}

function aa_ensure_background_schema(PDO $conn): array
{
    $errors = [];
    $status = aa_background_schema_status($conn);

    if (stripos((string)$status['slotType'], 'enum(') === 0) {
        try {
            $conn->exec('ALTER TABLE backgrounds MODIFY slot VARCHAR(64) NOT NULL');
        } catch (Throwable $e) {
            $errors[] = 'Could not change backgrounds.slot to VARCHAR(64).';
        }
    }

    if (!$status['hasBackgroundModeColumn']) {
        try {
            $conn->exec("ALTER TABLE backgrounds ADD COLUMN background_mode VARCHAR(16) NOT NULL DEFAULT 'image' AFTER slot");
        } catch (Throwable $e) {
            $errors[] = 'Could not add backgrounds.background_mode.';
        }
    }

    if (!$status['hasColorValueColumn']) {
        try {
            $conn->exec('ALTER TABLE backgrounds ADD COLUMN color_value VARCHAR(32) NULL AFTER image_url');
        } catch (Throwable $e) {
            $errors[] = 'Could not add backgrounds.color_value.';
        }
    }

    if (!$status['hasCreatorNameColumn']) {
        try {
            $conn->exec('ALTER TABLE backgrounds ADD COLUMN creator_name VARCHAR(255) NULL AFTER image_url');
        } catch (Throwable $e) {
            $errors[] = 'Could not add backgrounds.creator_name.';
        }
    }

    return $errors;
}

function aa_normalize_background_mode(?string $mode, string $imageUrl = '', string $colorValue = ''): string
{
    $normalized = strtolower(trim((string)$mode));
    if (!in_array($normalized, aa_background_modes(), true)) {
        return $imageUrl !== '' ? 'image' : 'inherit';
    }
    if ($normalized === 'image' && $imageUrl === '') {
        return 'inherit';
    }
    if ($normalized === 'color' && $colorValue === '') {
        return 'inherit';
    }
    return $normalized;
}

function aa_normalize_background_color(string $value): string
{
    $color = trim($value);
    if ($color === '') {
        return '';
    }
    if (preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/', $color) !== 1) {
        return '';
    }
    return strtoupper($color);
}

function aa_normalize_background_row(array $row, array $schema): array
{
    $imageUrl = trim((string)($row['image_url'] ?? ''));
    $colorValue = aa_normalize_background_color((string)($row['color_value'] ?? ''));
    $mode = $schema['hasBackgroundModeColumn']
        ? aa_normalize_background_mode((string)($row['background_mode'] ?? ''), $imageUrl, $colorValue)
        : aa_normalize_background_mode(null, $imageUrl, $colorValue);

    return [
        'mode' => $mode,
        'image_url' => $mode === 'image' ? $imageUrl : '',
        'color_value' => $mode === 'color' ? $colorValue : '',
        'creator_name' => $schema['hasCreatorNameColumn'] ? trim((string)($row['creator_name'] ?? '')) : '',
    ];
}

function aa_fetch_backgrounds(PDO $conn): array
{
    $schema = aa_background_schema_status($conn);
    $columns = ['slot', 'image_url'];
    if ($schema['hasBackgroundModeColumn']) {
        $columns[] = 'background_mode';
    }
    if ($schema['hasColorValueColumn']) {
        $columns[] = 'color_value';
    }
    if ($schema['hasCreatorNameColumn']) {
        $columns[] = 'creator_name';
    }

    $stmt = $conn->query('SELECT ' . implode(', ', $columns) . ' FROM backgrounds WHERE is_active = 1');
    $items = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $slot = (string)($row['slot'] ?? '');
        if ($slot === '') {
            continue;
        }
        $items[$slot] = aa_normalize_background_row($row, $schema);
    }
    return $items;
}

function aa_background_api_payload(array $items): array
{
    $result = [];
    foreach ($items as $slot => $item) {
        if (($item['mode'] ?? 'inherit') === 'inherit') {
            continue;
        }
        $result[$slot] = [
            'mode' => (string)($item['mode'] ?? 'inherit'),
            'imageUrl' => (string)($item['image_url'] ?? ''),
            'colorValue' => (string)($item['color_value'] ?? ''),
            'creatorName' => (string)($item['creator_name'] ?? ''),
        ];
    }
    return $result;
}

function aa_save_background(PDO $conn, string $slot, string $mode, string $imageUrl, string $colorValue, string $creatorName): void
{
    $schema = aa_background_schema_status($conn);
    $normalizedMode = strtolower(trim($mode));
    if (!in_array($normalizedMode, aa_background_modes(), true)) {
        throw new InvalidArgumentException('Unsupported background mode.');
    }

    if ($normalizedMode === 'inherit') {
        $stmt = $conn->prepare('DELETE FROM backgrounds WHERE slot = :slot');
        $stmt->execute([':slot' => $slot]);
        return;
    }

    if (in_array($normalizedMode, ['color', 'none'], true) && (!$schema['hasBackgroundModeColumn'] || !$schema['hasColorValueColumn'])) {
        throw new RuntimeException('Background mode schema is not ready.');
    }

    $cleanImageUrl = $normalizedMode === 'image' ? trim($imageUrl) : '';
    $cleanColorValue = $normalizedMode === 'color' ? aa_normalize_background_color($colorValue) : '';
    if ($normalizedMode === 'image' && $cleanImageUrl === '') {
        throw new InvalidArgumentException('Image mode requires an image.');
    }
    if ($normalizedMode === 'color' && $cleanColorValue === '') {
        throw new InvalidArgumentException('Color mode requires a valid hex color.');
    }

    $columns = ['slot', 'image_url', 'is_active'];
    $values = [':slot', ':image_url', '1'];
    $updates = ['image_url = VALUES(image_url)', 'is_active = 1'];
    $params = [
        ':slot' => $slot,
        ':image_url' => $cleanImageUrl,
    ];

    if ($schema['hasBackgroundModeColumn']) {
        $columns[] = 'background_mode';
        $values[] = ':background_mode';
        $updates[] = 'background_mode = VALUES(background_mode)';
        $params[':background_mode'] = $normalizedMode;
    }

    if ($schema['hasColorValueColumn']) {
        $columns[] = 'color_value';
        $values[] = ':color_value';
        $updates[] = 'color_value = VALUES(color_value)';
        $params[':color_value'] = $cleanColorValue;
    }

    if ($schema['hasCreatorNameColumn']) {
        $columns[] = 'creator_name';
        $values[] = ':creator_name';
        $updates[] = 'creator_name = VALUES(creator_name)';
        $params[':creator_name'] = substr(trim($creatorName), 0, 255);
    }

    $sql = 'INSERT INTO backgrounds (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $values) . ')
        ON DUPLICATE KEY UPDATE ' . implode(', ', $updates);
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
}
