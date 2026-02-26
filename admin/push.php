<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit();
}

function h($value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function tableExists(PDO $pdo, string $table): bool
{
    try {
        $stmt = $pdo->prepare('SHOW TABLES LIKE :table');
        $stmt->execute([':table' => $table]);
        return (bool)$stmt->fetchColumn();
    } catch (Throwable $e) {
        return false;
    }
}

function columnExists(PDO $pdo, string $table, string $column): bool
{
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
        $stmt->execute([':column' => $column]);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return false;
    }
}

$dbOk = true;
$notes = [];

$usersTableExists = tableExists($pdo, 'users');
$pushTokenColumnExists = $usersTableExists && columnExists($pdo, 'users', 'push_token');

$totalUsers = null;
$usersWithPushToken = null;
$sampleUsers = [];

if ($usersTableExists) {
    try {
        $totalUsers = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    } catch (Throwable $e) {
        $dbOk = false;
        $notes[] = 'Unable to read total users.';
    }

    if ($pushTokenColumnExists) {
        try {
            $usersWithPushToken = (int)$pdo
                ->query("SELECT COUNT(*) FROM users WHERE push_token IS NOT NULL AND TRIM(push_token) <> ''")
                ->fetchColumn();

            $stmt = $pdo->query("
                SELECT id, name, email, push_token
                FROM users
                WHERE push_token IS NOT NULL AND TRIM(push_token) <> ''
                ORDER BY id DESC
                LIMIT 15
            ");
            $sampleUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            $dbOk = false;
            $notes[] = 'Unable to read push token stats.';
        }
    }
} else {
    $dbOk = false;
    $notes[] = 'users table not found.';
}

// This repo currently has local device notifications/reminders in-app,
// but no server-side broadcast sender (FCM/WebPush worker).
$hasSenderPipeline = false;

$pipelineReadiness = [
    'users table' => $usersTableExists,
    'users.push_token column' => $pushTokenColumnExists,
    'registered token count > 0' => ($usersWithPushToken ?? 0) > 0,
    'server sender pipeline (FCM/WebPush)' => $hasSenderPipeline,
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Push Notifications - Abundance Alchemy Admin</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          crossorigin="anonymous">
    <style>
        body { padding: 20px; }
        .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 0.85rem;
        }
    </style>
</head>
<body>
<?php include __DIR__ . '/header.php'; ?>

<div class="container mt-4">
    <h1 class="h4 mb-2">Push Notifications</h1>
    <p class="text-muted mb-4">
        This page is now active (404 removed). It reports current push readiness and token coverage.
    </p>

    <?php if (!$dbOk && !empty($notes)): ?>
        <div class="alert alert-warning">
            <strong>Database/Schema warnings:</strong>
            <ul class="mb-0 mt-2">
                <?php foreach ($notes as $note): ?>
                    <li><?= h($note) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="text-muted small">Total Users</div>
                    <div class="h3 mb-0"><?= $totalUsers !== null ? (int)$totalUsers : '—' ?></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="text-muted small">Users With Push Token</div>
                    <div class="h3 mb-0"><?= $usersWithPushToken !== null ? (int)$usersWithPushToken : '—' ?></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="text-muted small">Sender Pipeline</div>
                    <div class="h5 mb-0">
                        <?= $hasSenderPipeline ? 'Configured' : 'Not Configured Yet' ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card mb-4">
        <div class="card-header"><strong>Readiness Checklist</strong></div>
        <div class="card-body">
            <ul class="mb-0">
                <?php foreach ($pipelineReadiness as $label => $ok): ?>
                    <li>
                        <?= $ok ? '✅' : '⬜' ?> <?= h($label) ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>

    <div class="card mb-4">
        <div class="card-header"><strong>Current State</strong></div>
        <div class="card-body">
            <p class="mb-2">
                The app currently supports <strong>device-local reminders/notifications</strong> (client side), which is why users can still receive reminders without server broadcast.
            </p>
            <p class="mb-0">
                A true admin “send push to all users” flow requires a server sender (FCM/WebPush) plus subscription/token management endpoint.
            </p>
        </div>
    </div>

    <div class="card">
        <div class="card-header"><strong>Recent Users With Tokens (Sample)</strong></div>
        <div class="card-body">
            <?php if (empty($sampleUsers)): ?>
                <p class="text-muted mb-0">No push tokens found yet.</p>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="table table-sm align-middle mb-0">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Token (truncated)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($sampleUsers as $u): ?>
                            <?php
                            $token = trim((string)($u['push_token'] ?? ''));
                            $tokenDisplay = strlen($token) > 40
                                ? substr($token, 0, 18) . '...' . substr($token, -16)
                                : $token;
                            ?>
                            <tr>
                                <td><?= (int)($u['id'] ?? 0) ?></td>
                                <td><?= h($u['name'] ?? '') ?></td>
                                <td><?= h($u['email'] ?? '') ?></td>
                                <td class="mono"><?= h($tokenDisplay) ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
</body>
</html>
