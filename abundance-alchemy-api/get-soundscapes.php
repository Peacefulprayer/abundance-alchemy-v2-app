<?php
include_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Get parameters
    $user_email = $_GET['user_email'] ?? null;
    $purpose = $_GET['purpose'] ?? null;
    $category = $_GET['category'] ?? null;
    $energy = $_GET['energy'] ?? null;
    $is_public_only = isset($_GET['public_only']) && $_GET['public_only'] == '1';
    
    // Build query
    $sql = "SELECT 
                id, name, url, category, usage_purpose, user_email,
                creator_name, creator_website, source_name, source_url,
                license_type, license_notes, duration_seconds, bpm, 
                energy_level, is_loopable, tags, mood, is_public, is_active,
                created_at
            FROM soundscapes 
            WHERE is_active = 1";
    
    $params = [];
    
    // Filter logic
    if ($is_public_only) {
        $sql .= " AND is_public = 1";
    } elseif ($user_email) {
        // Show user's private tracks + all public tracks
        $sql .= " AND (is_public = 1 OR user_email = :user_email)";
        $params[':user_email'] = $user_email;
    }
    
    if ($purpose && in_array($purpose, ['ambience', 'meditation', 'iam_practice', 'ilove_practice', 'button', 'voice', 'transition'])) {
        $sql .= " AND usage_purpose = :purpose";
        $params[':purpose'] = $purpose;
    }
    
    if ($category) {
        $sql .= " AND category = :category";
        $params[':category'] = $category;
    }
    
    if ($energy && in_array($energy, ['low', 'medium', 'high'])) {
        $sql .= " AND energy_level = :energy";
        $params[':energy'] = $energy;
    }
    
    $sql .= " ORDER BY 
                CASE WHEN user_email IS NOT NULL THEN 0 ELSE 1 END,
                created_at DESC";
    
    $stmt = $conn->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response - FIXED URL CONSTRUCTION
    foreach ($rows as &$row) {
        // Add formatted duration
        if ($row['duration_seconds']) {
            $minutes = floor($row['duration_seconds'] / 60);
            $seconds = $row['duration_seconds'] % 60;
            $row['duration_formatted'] = sprintf("%d:%02d", $minutes, $seconds);
        } else {
            $row['duration_formatted'] = null;
        }
        
        // FIXED: Build correct audio URL
        $url = $row['url'];
        
        // Remove any leading slash
        $url = ltrim($url, '/');
        
        // Check what we have and build correct URL
        if (strpos($url, 'http') === 0) {
            // Already full URL
            $row['audio_url'] = $url;
        } elseif (strpos($url, 'assets/audio/') === 0) {
            // Already has correct prefix
            $row['audio_url'] = 'https://abundantthought.com/abundance-alchemy/' . $url;
        } else {
            // Just filename, add prefix
            $row['audio_url'] = 'https://abundantthought.com/abundance-alchemy/assets/audio/' . $url;
        }
        
        // Add user upload flag
        $row['is_user_upload'] = !empty($row['user_email']);
        
        // Add practice length flag (1-2 minutes for I AM/LOVE practices)
        if ($row['duration_seconds'] && $row['duration_seconds'] >= 55 && $row['duration_seconds'] <= 125) {
            $row['is_practice_length'] = true;
        } else {
            $row['is_practice_length'] = false;
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $rows,
        'count' => count($rows),
        'filters_applied' => [
            'user_email' => $user_email ? true : false,
            'purpose' => $purpose,
            'category' => $category,
            'energy' => $energy,
            'public_only' => $is_public_only
        ]
    ]);
    
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString() // Remove in production
    ]);
}