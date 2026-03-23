<?php
include_once 'config.php';

function aa_norm(string $value): string
{
    $value = strtolower(trim($value));
    return preg_replace('/\s+/', ' ', $value) ?? '';
}

function aa_focus_aliases(string $focusLabel): array
{
    $focus = aa_norm($focusLabel);
    if ($focus === '' || $focus === 'general') {
        return [];
    }

    $catalog = [
        'peace' => ['Peace', 'Amani'],
        'purpose' => ['Purpose', 'Kusudi'],
        'love' => ['Love & Relationships', 'Love Relationships', 'Love', 'Relationships', 'Upendo na Mahusiano'],
        'wealth' => ['Wealth & Abundance', 'Wealth Abundance', 'Abundance', 'Prosperity', 'Utajiri na Wingi'],
        'confidence' => ['Confidence & Inner Strength', 'Confidence', 'Inner Strength', 'Kujiamini na Nguvu ya Ndani'],
        'health' => ['Health & Wholeness', 'Health', 'Wholeness', 'Afya na Ukamilifu'],
        'self-love' => ['Self-Love & Worthiness', 'Self Love', 'Worthiness', 'Kujipenda na Ustahili'],
    ];

    if (strpos($focus, 'peace') !== false || strpos($focus, 'amani') !== false) {
        return $catalog['peace'];
    }
    if (strpos($focus, 'purpose') !== false || strpos($focus, 'kusudi') !== false) {
        return $catalog['purpose'];
    }
    if (strpos($focus, 'love') !== false || strpos($focus, 'upendo') !== false || strpos($focus, 'relationship') !== false) {
        return $catalog['love'];
    }
    if (strpos($focus, 'wealth') !== false || strpos($focus, 'abundance') !== false || strpos($focus, 'utajiri') !== false || strpos($focus, 'wingi') !== false) {
        return $catalog['wealth'];
    }
    if (strpos($focus, 'confidence') !== false || strpos($focus, 'strength') !== false || strpos($focus, 'kujiamini') !== false || strpos($focus, 'nguvu') !== false) {
        return $catalog['confidence'];
    }
    if (strpos($focus, 'health') !== false || strpos($focus, 'wholeness') !== false || strpos($focus, 'afya') !== false || strpos($focus, 'ukamilifu') !== false) {
        return $catalog['health'];
    }
    if (strpos($focus, 'self-love') !== false || strpos($focus, 'self love') !== false || strpos($focus, 'worth') !== false || strpos($focus, 'kujipenda') !== false || strpos($focus, 'ustahili') !== false) {
        return $catalog['self-love'];
    }

    return [$focusLabel];
}

function aa_unique_texts(array $rows): array
{
    $seen = [];
    $out = [];
    foreach ($rows as $row) {
        $text = trim((string)$row);
        if ($text === '') {
            continue;
        }
        $key = aa_norm($text);
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        $out[] = $text;
    }
    return $out;
}

function aa_filter_recent(array $pool, array $recent): array
{
    if (empty($recent)) {
        return $pool;
    }
    $recentMap = [];
    foreach ($recent as $text) {
        $recentMap[aa_norm((string)$text)] = true;
    }

    return array_values(array_filter($pool, static function ($text) use ($recentMap) {
        return !isset($recentMap[aa_norm((string)$text)]);
    }));
}

function aa_store_recent(string $type, string $text, int $window): void
{
    if (!isset($_SESSION['recent_affirmations']) || !is_array($_SESSION['recent_affirmations'])) {
        $_SESSION['recent_affirmations'] = [];
    }
    if (!isset($_SESSION['recent_affirmations'][$type]) || !is_array($_SESSION['recent_affirmations'][$type])) {
        $_SESSION['recent_affirmations'][$type] = [];
    }

    $recent = $_SESSION['recent_affirmations'][$type];
    $normalized = aa_norm($text);

    $recent = array_values(array_filter($recent, static function ($item) use ($normalized) {
        return aa_norm((string)$item) !== $normalized;
    }));

    $recent[] = $text;
    if (count($recent) > $window) {
        $recent = array_slice($recent, -$window);
    }
    $_SESSION['recent_affirmations'][$type] = $recent;
}

$allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
$type = isset($_GET['type']) ? strtoupper(trim((string)$_GET['type'])) : 'MORNING_IAM';
if (!in_array($type, $allowedTypes, true)) {
    $type = 'MORNING_IAM';
}

$focusLabel = isset($_GET['category']) ? trim((string)$_GET['category']) : '';
$focusCategories = aa_focus_aliases($focusLabel);
$identity = aa_get_session_identity();
$ownerBinding = aa_resolve_owner_binding($conn, 'user_affirmations', $identity['userId'], $identity['userEmail']);
$focusWeight = 70;
$recentWindow = 10;

try {
    $globalPool = [];
    $focusPool = [];

    if ($ownerBinding && aa_has_col($ownerBinding['columns'], 'text') && aa_has_col($ownerBinding['columns'], 'type')) {
        $userStmt = $conn->prepare("
            SELECT text
            FROM user_affirmations
            WHERE {$ownerBinding['column']} = :owner
              AND type = :type
            ORDER BY id DESC
        ");
        $userStmt->bindValue(':owner', $ownerBinding['value'], $ownerBinding['pdoType']);
        $userStmt->bindValue(':type', $type, PDO::PARAM_STR);
        $userStmt->execute();

        foreach ($userStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $text = trim((string)($row['text'] ?? ''));
            if ($text !== '') {
                $globalPool[] = $text;
                $focusPool[] = $text;
            }
        }
    }

    $sysStmt = $conn->prepare("
        SELECT text, category
        FROM affirmations
        WHERE type = :type
          AND is_active = 1
        ORDER BY id DESC
    ");
    $sysStmt->bindValue(':type', $type, PDO::PARAM_STR);
    $sysStmt->execute();

    foreach ($sysStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $text = trim((string)($row['text'] ?? ''));
        $category = trim((string)($row['category'] ?? ''));
        if ($text === '') {
            continue;
        }
        $globalPool[] = $text;

        if (!empty($focusCategories)) {
            $isMatch = false;
            foreach ($focusCategories as $focusCategory) {
                if (aa_norm($focusCategory) === aa_norm($category)) {
                    $isMatch = true;
                    break;
                }
            }
            if ($isMatch) {
                $focusPool[] = $text;
            }
        }
    }

    $globalPool = aa_unique_texts($globalPool);
    $focusPool = aa_unique_texts($focusPool);

    $recentForType = [];
    if (isset($_SESSION['recent_affirmations'][$type]) && is_array($_SESSION['recent_affirmations'][$type])) {
        $recentForType = $_SESSION['recent_affirmations'][$type];
    }

    $globalFiltered = aa_filter_recent($globalPool, $recentForType);
    $focusFiltered = aa_filter_recent($focusPool, $recentForType);

    $selectedPool = [];
    $roll = random_int(1, 100);
    if (!empty($focusFiltered) && $roll <= $focusWeight) {
        $selectedPool = $focusFiltered;
    } elseif (!empty($globalFiltered)) {
        $selectedPool = $globalFiltered;
    } elseif (!empty($focusPool)) {
        $selectedPool = $focusPool;
    } else {
        $selectedPool = $globalPool;
    }

    if (!empty($selectedPool)) {
        $index = random_int(0, count($selectedPool) - 1);
        $picked = $selectedPool[$index];
        aa_store_recent($type, $picked, $recentWindow);
        aa_json_response(['text' => $picked]);
    }

    $fallback = $type === 'EVENING_ILOVE'
        ? 'I love the life I am building.'
        : 'I am aligned with my highest good.';
    aa_json_response(['text' => $fallback]);
} catch (Throwable $e) {
    error_log('[api/get-affirmation.php] Failed to load affirmation: ' . $e->getMessage());
    aa_error_response('Failed to load affirmation', 500);
}
