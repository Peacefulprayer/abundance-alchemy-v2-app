<?php
require_once __DIR__ . '/admin_init.php';

$adminBasePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/admin')), '/');
if ($adminBasePath === '') {
    $adminBasePath = '/admin';
}

$target = $adminBasePath . '/admin-security.php';
$query = (string)($_SERVER['QUERY_STRING'] ?? '');
if ($query !== '') {
    $target .= '?' . $query;
}

header('Location: ' . $target, true, 302);
exit;
