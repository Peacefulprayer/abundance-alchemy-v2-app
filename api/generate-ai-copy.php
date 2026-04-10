<?php
include_once 'config.php';

aa_require_method('POST');
aa_require_authenticated_session();
api_require_csrf();

function aa_gemini_api_key(): string
{
    if (defined('GEMINI_API_KEY') && is_string(GEMINI_API_KEY) && trim(GEMINI_API_KEY) !== '') {
        return trim(GEMINI_API_KEY);
    }

    $envValue = getenv('GEMINI_API_KEY');
    if (is_string($envValue) && trim($envValue) !== '') {
        return trim($envValue);
    }

    $serverValue = $_SERVER['GEMINI_API_KEY'] ?? '';
    if (is_string($serverValue) && trim($serverValue) !== '') {
        return trim($serverValue);
    }

    $envArrayValue = $_ENV['GEMINI_API_KEY'] ?? '';
    if (is_string($envArrayValue) && trim($envArrayValue) !== '') {
        return trim($envArrayValue);
    }

    return '';
}

function aa_ai_copy_prompt(array $data): ?string
{
    $type = trim((string)($data['type'] ?? ''));
    $focusArea = substr(trim((string)($data['focusArea'] ?? '')), 0, 120);
    $practiceType = trim((string)($data['practiceType'] ?? ''));

    if ($type === 'alchemist_wisdom') {
        return 'Generate a short, inspiring wisdom quote (maximum 20 words) about personal transformation, abundance mindset, or spiritual growth. Make it mystical and alchemical in tone. Do not use quotation marks.';
    }

    if ($type === 'meditation_wisdom') {
        $topic = $focusArea !== '' ? $focusArea : 'stillness';
        return "Generate a deep, calming wisdom quote (max 15 words) specifically about {$topic}. It should serve as a focus point for meditation. Do not use quotation marks.";
    }

    if ($type === 'personalized_affirmation') {
        $topic = $focusArea !== '' ? $focusArea : 'your highest self';
        $typeContext = $practiceType === 'EVENING_ILOVE'
            ? 'loving, heart-centered "I love" statement'
            : 'empowering, present-tense "I am" statement';
        return "Generate one powerful {$typeContext} affirmation focused on {$topic}. Maximum 15 words. Use simple, direct language. Do not use quotation marks.";
    }

    return null;
}

function aa_ai_extract_text(array $decoded): string
{
    $parts = $decoded['candidates'][0]['content']['parts'] ?? [];
    if (!is_array($parts)) {
        return '';
    }

    $segments = [];
    foreach ($parts as $part) {
        $text = trim((string)($part['text'] ?? ''));
        if ($text !== '') {
            $segments[] = $text;
        }
    }

    return trim(implode("\n", $segments));
}

function aa_ai_request(string $apiKey, string $prompt): array
{
    $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    $payload = json_encode([
        'contents' => [[
            'parts' => [[
                'text' => $prompt,
            ]],
        ]],
        'generationConfig' => [
            'temperature' => 0.8,
            'maxOutputTokens' => 80,
        ],
    ]);

    if ($payload === false) {
        return ['ok' => false, 'status' => 500, 'body' => ''];
    }

    if (function_exists('curl_init')) {
        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 15,
        ]);
        $body = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            return ['ok' => false, 'status' => 502, 'body' => $error];
        }

        return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'body' => $body];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", [
                'Content-Type: application/json',
                'X-goog-api-key: ' . $apiKey,
            ]),
            'content' => $payload,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ]);

    $body = @file_get_contents($endpoint, false, $context);
    $status = 0;
    if (!empty($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches)) {
        $status = (int)$matches[1];
    }

    if ($body === false) {
        return ['ok' => false, 'status' => 502, 'body' => ''];
    }

    return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'body' => $body];
}

$data = aa_read_json_input();
$prompt = aa_ai_copy_prompt($data);
if ($prompt === null) {
    aa_error_response('Unsupported AI copy request', 400);
}

$apiKey = aa_gemini_api_key();
if ($apiKey === '') {
    aa_error_response('AI service is not configured', 503);
}

$result = aa_ai_request($apiKey, $prompt);
if (!$result['ok']) {
    error_log('[api/generate-ai-copy.php] Gemini request failed with status ' . (int)$result['status'] . ': ' . substr((string)$result['body'], 0, 500));
    aa_error_response('AI service unavailable', 502);
}

$decoded = json_decode((string)$result['body'], true);
if (!is_array($decoded)) {
    error_log('[api/generate-ai-copy.php] Invalid JSON response from Gemini');
    aa_error_response('AI service unavailable', 502);
}

$text = aa_ai_extract_text($decoded);
if ($text === '') {
    error_log('[api/generate-ai-copy.php] Empty content response from Gemini');
    aa_error_response('AI service unavailable', 502);
}

aa_json_response([
    'text' => preg_replace('/^["\']|["\']$/', '', $text),
]);
