<?php
declare(strict_types=1);

require_once __DIR__ . '/../db.php';

function aa_normalize_text(string $text): string
{
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9\s&-]+/', ' ', $text) ?? '';
    return preg_replace('/\s+/', ' ', $text) ?? '';
}

/**
 * @return array{category:string, score:int}
 */
function aa_pick_category(string $text, array $rules): array
{
    $normalized = aa_normalize_text($text);
    $scores = [];

    foreach ($rules as $category => $keywords) {
        $score = 0;
        foreach ($keywords as $keyword) {
            $needle = aa_normalize_text($keyword);
            if ($needle !== '' && strpos($normalized, $needle) !== false) {
                // Phrase matches are stronger than single-token matches.
                $score += (strpos($needle, ' ') !== false) ? 2 : 1;
            }
        }
        $scores[$category] = $score;
    }

    arsort($scores);
    $topCategory = (string)key($scores);
    $topScore = (int)current($scores);
    $values = array_values($scores);
    $secondScore = isset($values[1]) ? (int)$values[1] : 0;

    if ($topScore <= 0) {
        return ['category' => 'General', 'score' => 0];
    }

    // If tied for highest score, skip to keep the pass conservative.
    if ($topScore === $secondScore) {
        return ['category' => 'General', 'score' => $topScore];
    }

    return ['category' => $topCategory, 'score' => $topScore];
}

$opts = getopt('', ['apply', 'dry-run', 'type::', 'limit::']);
$apply = isset($opts['apply']);
$dryRun = isset($opts['dry-run']) || !$apply;

$typeArg = isset($opts['type']) ? (string)$opts['type'] : 'MORNING_IAM';
$types = array_values(array_filter(array_map('trim', explode(',', strtoupper($typeArg)))));
$allowedTypes = ['MORNING_IAM', 'EVENING_ILOVE'];
$types = array_values(array_filter($types, static function ($type) use ($allowedTypes) {
    return in_array($type, $allowedTypes, true);
}));
if (empty($types)) {
    $types = ['MORNING_IAM'];
}

$limit = isset($opts['limit']) ? max(1, (int)$opts['limit']) : 0;

$rules = [
    'Peace' => [
        'peace', 'calm', 'still', 'serene', 'serenity', 'gentle', 'quiet',
        'harmony', 'at ease', 'centered', 'grounded', 'patient',
    ],
    'Purpose' => [
        'purpose', 'calling', 'mission', 'destiny', 'path', 'direction',
        'vision', 'intention', 'meaning', 'clarity', 'guide', 'service',
    ],
    'Love & Relationships' => [
        'love', 'relationship', 'relationships', 'partnership', 'partner',
        'family', 'friendship', 'compassion', 'connection', 'forgive',
        'intimacy', 'kindness',
    ],
    'Wealth & Abundance' => [
        'wealth', 'abundance', 'prosperity', 'money', 'rich', 'income',
        'financial', 'success', 'business', 'opportunity', 'blessing',
        'overflow', 'resources', 'increase',
    ],
    'Confidence & Inner Strength' => [
        'confidence', 'confident', 'courage', 'brave', 'bold', 'strong',
        'strength', 'power', 'powerful', 'fearless', 'resilient',
        'disciplined', 'focused', 'capable', 'leader',
    ],
    'Health & Wholeness' => [
        'health', 'healthy', 'heal', 'healing', 'body', 'mind', 'spirit',
        'wellness', 'vitality', 'energy', 'rest', 'sleep', 'nourish',
        'breathe', 'balance',
    ],
    'Self-Love & Worthiness' => [
        'worthy', 'worthiness', 'deserve', 'deserving', 'enough',
        'self love', 'self-love', 'accept myself', 'forgive myself',
        'honor myself', 'value myself', 'whole as i am', 'i am enough',
    ],
];

$placeholders = implode(',', array_fill(0, count($types), '?'));
$sql = "
    SELECT id, text, type, category
    FROM affirmations
    WHERE is_active = 1
      AND category = 'General'
      AND type IN ($placeholders)
    ORDER BY id ASC
";
if ($limit > 0) {
    $sql .= " LIMIT " . (int)$limit;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($types);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$updates = [];
$keptGeneral = 0;
$byCategory = [];

foreach ($rows as $row) {
    $id = (int)$row['id'];
    $text = (string)$row['text'];
    $result = aa_pick_category($text, $rules);
    $newCategory = $result['category'];

    if ($newCategory === 'General') {
        $keptGeneral++;
        continue;
    }

    $updates[] = [
        'id' => $id,
        'type' => (string)$row['type'],
        'from' => (string)$row['category'],
        'to' => $newCategory,
        'score' => $result['score'],
        'text' => $text,
    ];
    $byCategory[$newCategory] = ($byCategory[$newCategory] ?? 0) + 1;
}

echo "Mode: " . ($dryRun ? "DRY-RUN" : "APPLY") . PHP_EOL;
echo "Types: " . implode(', ', $types) . PHP_EOL;
echo "Scanned General rows: " . count($rows) . PHP_EOL;
echo "Proposed updates: " . count($updates) . PHP_EOL;
echo "Kept as General: " . $keptGeneral . PHP_EOL;

if (!empty($byCategory)) {
    ksort($byCategory);
    echo PHP_EOL . "Proposed category distribution:" . PHP_EOL;
    foreach ($byCategory as $category => $count) {
        echo "  - {$category}: {$count}" . PHP_EOL;
    }
}

if (!empty($updates)) {
    echo PHP_EOL . "Sample updates:" . PHP_EOL;
    $sample = array_slice($updates, 0, 15);
    foreach ($sample as $item) {
        $excerpt = substr(trim($item['text']), 0, 72);
        if (strlen((string)$item['text']) > 72) {
            $excerpt .= '...';
        }
        echo "  #{$item['id']} [{$item['type']}] {$item['from']} -> {$item['to']} (score {$item['score']}): {$excerpt}" . PHP_EOL;
    }
}

if ($dryRun) {
    echo PHP_EOL . "No changes written. Run with --apply to persist updates." . PHP_EOL;
    exit(0);
}

if (empty($updates)) {
    echo PHP_EOL . "Nothing to update." . PHP_EOL;
    exit(0);
}

$updateStmt = $pdo->prepare("
    UPDATE affirmations
    SET category = :category
    WHERE id = :id
      AND category = 'General'
");

$updatedCount = 0;
$pdo->beginTransaction();
try {
    foreach ($updates as $item) {
        $updateStmt->execute([
            ':category' => $item['to'],
            ':id' => $item['id'],
        ]);
        $updatedCount += $updateStmt->rowCount();
    }
    $pdo->commit();
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, "Failed to apply updates: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

$ids = array_map(static function ($row) {
    return (int)$row['id'];
}, $updates);
$rollbackSql = "UPDATE affirmations SET category = 'General' WHERE id IN (" . implode(',', $ids) . ");";

echo PHP_EOL . "Applied updates: {$updatedCount}" . PHP_EOL;
echo "Rollback SQL (save this):" . PHP_EOL;
echo $rollbackSql . PHP_EOL;
