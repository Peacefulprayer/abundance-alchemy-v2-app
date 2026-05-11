<?php
include_once 'config.php';

aa_require_method('GET');

try {
    $identity = aa_get_session_identity();
    $userEmail = $identity['userEmail'] !== '' ? $identity['userEmail'] : null;
    $apiBasePath = rtrim(str_replace('\\', '/', dirname((string)($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
    $purpose = $_GET['purpose'] ?? null;
    $category = $_GET['category'] ?? null;
    $energy = $_GET['energy'] ?? null;
    $isPublicOnly = isset($_GET['public_only']) && $_GET['public_only'] === '1';

    $sql = "SELECT 
                id, name, url, category, usage_purpose, user_email,
                creator_name, creator_website, source_name, source_url,
                license_type, license_notes, duration_seconds, bpm, 
                energy_level, is_loopable, tags, mood, is_public, is_active,
                created_at
            FROM soundscapes 
            WHERE is_active = 1";

    $params = [];

    if ($isPublicOnly || !$userEmail) {
        $sql .= ' AND is_public = 1';
    } else {
        $sql .= ' AND (is_public = 1 OR user_email = :user_email)';
        $params[':user_email'] = $userEmail;
    }

    if ($purpose && in_array($purpose, ['ambience', 'meditation', 'iam_practice', 'ilove_practice', 'button', 'voice', 'transition'], true)) {
        $sql .= ' AND usage_purpose = :purpose';
        $params[':purpose'] = $purpose;
    }

    if ($category) {
        $sql .= ' AND category = :category';
        $params[':category'] = $category;
    }

    if ($energy && in_array($energy, ['low', 'medium', 'high'], true)) {
        $sql .= ' AND energy_level = :energy';
        $params[':energy'] = $energy;
    }

    $sql .= ' ORDER BY CASE WHEN user_email IS NOT NULL THEN 0 ELSE 1 END, created_at DESC';

    $stmt = $conn->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $appBasePath = '/abundance-alchemy';
    foreach ($rows as &$row) {
        if ($row['duration_seconds']) {
            $minutes = floor($row['duration_seconds'] / 60);
            $seconds = $row['duration_seconds'] % 60;
            $row['duration_formatted'] = sprintf('%d:%02d', $minutes, $seconds);
        } else {
            $row['duration_formatted'] = null;
        }

        $rawUrl = trim((string)($row['url'] ?? ''));
        if ($rawUrl === '') {
            $row['audio_url'] = null;
        } elseif (aa_is_private_soundscape_url($rawUrl)) {
            $row['audio_url'] = ($apiBasePath !== '' ? $apiBasePath : '') . '/private-audio.php?id=' . (int)$row['id'];
        } elseif (preg_match('#^https?://#i', $rawUrl)) {
            $row['audio_url'] = $rawUrl;
        } else {
            $normalized = str_replace('\\', '/', ltrim($rawUrl, '/'));
            if (strpos($normalized, 'abundance-alchemy/') === 0) {
                $row['audio_url'] = '/' . $normalized;
            } elseif (strpos($normalized, 'assets/') === 0 || strpos($normalized, 'admin/') === 0) {
                $row['audio_url'] = $appBasePath . '/' . $normalized;
            } elseif (strpos($normalized, 'uploads/') === 0 || strpos($normalized, 'user_uploads/') === 0) {
                $row['audio_url'] = $appBasePath . '/admin/' . $normalized;
            } elseif (strpos($normalized, '/') === false) {
                $row['audio_url'] = $appBasePath . '/assets/audio/' . $normalized;
            } else {
                $row['audio_url'] = $appBasePath . '/' . $normalized;
            }
        }

        $row['is_user_upload'] = !empty($row['user_email']);
        $row['is_private_upload'] = aa_is_private_soundscape_url($rawUrl);
        $row['is_practice_length'] = (bool)($row['duration_seconds'] && $row['duration_seconds'] >= 55 && $row['duration_seconds'] <= 125);
    }
    unset($row);

    aa_json_response([
        'success' => true,
        'data' => $rows,
        'count' => count($rows),
        'filters_applied' => [
            'user_email' => $userEmail ? true : false,
            'purpose' => $purpose,
            'category' => $category,
            'energy' => $energy,
            'public_only' => $isPublicOnly || !$userEmail,
        ],
    ]);
} catch (Throwable $e) {
    error_log('[api/get-soundscapes.php] Failed to load soundscapes: ' . $e->getMessage());
    aa_json_response([
        'success' => false,
        'message' => 'Failed to load soundscapes',
    ], 500);
}
