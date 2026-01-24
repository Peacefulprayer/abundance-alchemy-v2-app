<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

header('Content-Type: application/json; charset=UTF-8');

// Admin-only guard
if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

// Optional: basic search & limit
$q     = isset($_GET['q']) ? trim($_GET['q']) : '';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
if ($limit < 1)   $limit = 50;
if ($limit > 200) $limit = 200;

try {
    if ($q !== '') {
        $like = '%' . $q . '%';
        $stmt = $pdo->prepare("
            SELECT
                id,
                name,
                email,
                level,
                streak,
                focus_area,
                sessions_completed,
                created_at,
                last_login
            FROM users
            WHERE name  LIKE :q
               OR email LIKE :q
            ORDER BY created_at DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':q', $like, PDO::PARAM_STR);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare("
            SELECT
                id,
                name,
                email,
                level,
                streak,
                focus_area,
                sessions_completed,
                created_at,
                last_login
            FROM users
            ORDER BY created_at DESC
            LIMIT :limit
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    }

    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "items" => $users,
        "count" => count($users),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo json_encode(["message" => "DB error: " . $e->getMessage()]);
    } else {
        echo json_encode(["message" => "Server error"]);
    }
}