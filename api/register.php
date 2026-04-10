<?php
include_once 'config.php';

function aa_is_safe_email_recipient(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false
        && preg_match('/[\r\n]/', $email) !== 1;
}

function aa_sanitize_mail_domain(?string $host): string
{
    $candidate = trim((string)$host);
    $candidate = preg_replace('/[\r\n]+/', '', $candidate) ?? '';
    $candidate = preg_replace('/:\d+$/', '', $candidate) ?? '';

    if ($candidate === '') {
        return 'localhost';
    }

    $parsedHost = parse_url(str_contains($candidate, '://') ? $candidate : 'http://' . $candidate, PHP_URL_HOST);
    if (is_string($parsedHost) && $parsedHost !== '') {
        $candidate = strtolower($parsedHost);
    } else {
        $candidate = strtolower($candidate);
    }

    if (!preg_match('/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $candidate)) {
        return 'localhost';
    }

    return $candidate;
}

aa_require_method('POST');
$data = aa_read_json_input();

if (!$data || !isset($data['name'], $data['email'], $data['password'])) {
    aa_error_response('Missing required fields', 400);
}

$name = trim((string)$data['name']);
$email = trim((string)$data['email']);
$password = (string)$data['password'];

if ($name === '' || $email === '') {
    aa_error_response('Name and email are required', 400);
}

if (!aa_is_safe_email_recipient($email)) {
    aa_error_response('Invalid email address', 400);
}

if (strlen($password) < 8) {
    aa_error_response('Password must be at least 8 characters', 400);
}

try {
    $stmt = $conn->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        aa_error_response('An account with this email already exists', 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $focusArea = '';
    if (isset($data['focusAreas']) && is_array($data['focusAreas'])) {
        $focusArea = implode(',', array_map('strval', $data['focusAreas']));
    }

    $sql = "INSERT INTO users
                (name, email, password_hash, level, streak, focus_area, profile_img, more_info)
            VALUES
                (:name, :email, :password_hash, :level, :streak, :focus_area, :profile_img, :more_info)";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':level' => 1,
        ':streak' => 0,
        ':focus_area' => $focusArea,
        ':profile_img' => '',
        ':more_info' => '',
    ]);

    $userId = (int)$conn->lastInsertId();

    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;

    $welcomePath = __DIR__ . '/../admin/email_templates/welcome.txt';
    $template = @file_get_contents($welcomePath);
    if ($template !== false) {
        if (aa_is_safe_email_recipient($email)) {
            $body = str_replace(['{name}', '{email}'], [$name, $email], $template);
            $serverName = $_SERVER['SERVER_NAME'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost');
            $fromDomain = aa_sanitize_mail_domain($serverName);
            $headers = 'From: admin@' . $fromDomain;
            @mail($email, 'Welcome to Abundance Alchemy', $body, $headers);
        } else {
            error_log('[api/register.php] Skipped welcome email due to invalid recipient format');
        }
    }

    aa_json_response([
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'streak' => 0,
        'level' => 1,
        'focusAreas' => $focusArea ? array_values(array_filter(array_map('trim', explode(',', $focusArea)))) : [],
        'affirmationsCompleted' => 0,
    ], 201);
} catch (Throwable $e) {
    error_log('[api/register.php] Registration failed: ' . $e->getMessage());
    aa_error_response('Database error', 500);
}
