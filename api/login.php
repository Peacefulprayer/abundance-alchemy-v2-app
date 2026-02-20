<?php
include_once 'config.php';

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["message" => "Missing credentials"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, password_hash, level, streak, focus_area, affirmations_completed
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && !empty($user['password_hash']) && password_verify($password, $user['password_hash'])) {
        // Update last_login
        $update = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $update->execute([$user['id']]);

        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_email'] = (string)$user['email'];
        $_SESSION['user_name'] = (string)($user['name'] ?? '');

        $focusAreas = [];
        if (!empty($user['focus_area'])) {
            $focusAreas = array_values(array_filter(array_map('trim', explode(',', (string)$user['focus_area']))));
        }

        echo json_encode([
            "id" => (int)$user['id'],
            "name" => (string)($user['name'] ?? ''),
            "email" => (string)$user['email'],
            "streak" => isset($user['streak']) ? (int)$user['streak'] : 0,
            "level" => isset($user['level']) ? (int)$user['level'] : 1,
            "focusAreas" => $focusAreas,
            "affirmationsCompleted" => isset($user['affirmations_completed']) ? (int)$user['affirmations_completed'] : 0,
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error"]);
}
