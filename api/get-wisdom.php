<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');

include_once 'config.php';

$category = isset($_GET['category']) ? trim($_GET['category']) : 'GENERAL';
$count = isset($_GET['count']) ? max(1, min(10, intval($_GET['count']))) : 1;
$session_id = isset($_GET['session_id']) ? trim($_GET['session_id']) : '';

$valid_categories = [
    'Peace',
    'Purpose',
    'Love & Relationships',
    'Wealth & Abundance',
    'Confidence & Inner Strength',
    'Health & Wholeness',
    'Self-Love & Worthiness',
    'GENERAL',
];

if (!in_array($category, $valid_categories, true)) {
    $category = 'GENERAL';
}

try {
    if ($session_id) {
        $seed = crc32($session_id . $category . date('Y-m-d'));
        $query = "SELECT id, text, author, source FROM wisdom WHERE category = :cat AND is_active = 1 ORDER BY RAND($seed) LIMIT :count";
    } else {
        $query = "SELECT id, text, author, source FROM wisdom WHERE category = :cat AND is_active = 1 ORDER BY RAND() LIMIT :count";
    }
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":cat", $category, PDO::PARAM_STR);
    $stmt->bindParam(":count", $count, PDO::PARAM_INT);
    $stmt->execute();
    
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($rows)) {
        $result = [];
        foreach ($rows as $row) {
            $result[] = [
                'text' => $row['text'],
                'author' => $row['author'] ?: '',
                'source' => $row['source'] ?: '',
            ];
        }
        
        if ($count === 1) {
            echo json_encode($result[0]);
        } else {
            echo json_encode($result);
        }
    } else {
        $fallback = get_fallback_quote($category);
        if ($count === 1) {
            echo json_encode($fallback);
        } else {
            echo json_encode([$fallback]);
        }
    }
} catch (Exception $e) {
    $fallback = get_fallback_quote($category);
    if ($count === 1) {
        echo json_encode($fallback);
    } else {
        echo json_encode([$fallback]);
    }
}

function get_fallback_quote(string $category): array {
    $fallbacks = [
        'Peace' => [
            'text' => 'Peace comes from within. Do not seek it without.',
            'author' => 'Buddha',
            'source' => '',
        ],
        'Purpose' => [
            'text' => 'The purpose of life is growth.',
            'author' => 'Wallace D. Wattles',
            'source' => 'The Science of Getting Rich',
        ],
        'Love & Relationships' => [
            'text' => 'Love one another, but make not a bond of love.',
            'author' => 'Kahlil Gibran',
            'source' => 'The Prophet',
        ],
        'Wealth & Abundance' => [
            'text' => 'What the mind of man can conceive and believe, it can achieve.',
            'author' => 'Napoleon Hill',
            'source' => 'Think and Grow Rich',
        ],
        'Confidence & Inner Strength' => [
            'text' => 'I am confident, steady, and fully supported by life.',
            'author' => 'I Am Practice',
            'source' => '',
        ],
        'Health & Wholeness' => [
            'text' => 'I am whole, healthy, and healed in mind, body, and spirit.',
            'author' => 'I Am Practice',
            'source' => '',
        ],
        'Self-Love & Worthiness' => [
            'text' => 'I am worthy of love, respect, and divine good.',
            'author' => 'I Am Practice',
            'source' => '',
        ],
        'GENERAL' => [
            'text' => 'Your thoughts are the seeds of your reality. Plant them with intention.',
            'author' => 'The Abundance Alchemist',
            'source' => '',
        ],
    ];
    
    return $fallbacks[$category] ?? $fallbacks['GENERAL'];
}
