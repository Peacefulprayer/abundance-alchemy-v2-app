<?php
include_once 'config.php';

aa_require_method('GET');

$pathKey = aa_normalize_prayer_path((string)($_GET['path'] ?? 'universal'));

try {
    aa_seed_default_prayer_content($conn);

    $stmt = $conn->prepare("
        SELECT content_type, sort_order, title, body
        FROM prayer_content
        WHERE path_key = :path_key
          AND is_active = 1
        ORDER BY content_type ASC, sort_order ASC, id ASC
    ");
    $stmt->bindValue(':path_key', $pathKey, PDO::PARAM_STR);
    $stmt->execute();

    $guideSteps = [];
    $sessionPrayers = [];

    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $body = trim((string)($row['body'] ?? ''));
        if ($body === '') {
            continue;
        }

        if (($row['content_type'] ?? '') === 'guide_step') {
            $guideSteps[] = $body;
            continue;
        }

        if (($row['content_type'] ?? '') === 'session_prayer') {
            $sessionPrayers[] = $body;
        }
    }

    aa_json_response([
        'pathKey' => $pathKey,
        'guideSteps' => $guideSteps,
        'sessionPrayers' => $sessionPrayers,
    ]);
} catch (Throwable $e) {
    error_log('[api/get-prayer-content.php] Failed to load prayer content: ' . $e->getMessage());
    aa_error_response('Failed to load prayer content', 500);
}
