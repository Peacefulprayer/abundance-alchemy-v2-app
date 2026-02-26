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

function hasColumn(PDO $pdo, string $table, string $column): bool
{
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$table}` LIKE :column");
        $stmt->execute([':column' => $column]);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        return false;
    }
}

$showAll = isset($_GET['all']) && $_GET['all'] === '1';

// ---------- Background credits ----------
$hasBgCreator = hasColumn($pdo, 'backgrounds', 'creator_name');
$backgroundRows = [];

try {
    $bgSql = $hasBgCreator
        ? "SELECT slot, image_url, creator_name, is_active FROM backgrounds"
        : "SELECT slot, image_url, is_active FROM backgrounds";
    if (!$showAll) {
        $bgSql .= " WHERE is_active = 1";
    }
    $bgSql .= " ORDER BY slot ASC";

    $backgroundRows = $pdo->query($bgSql)->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $backgroundRows = [];
}

$backgroundMissingCreator = 0;
foreach ($backgroundRows as $row) {
    $creator = trim((string)($row['creator_name'] ?? ''));
    if ($creator === '') {
        $backgroundMissingCreator++;
    }
}

// ---------- Soundscape/music credits ----------
$soundColumnsWanted = [
    'id',
    'name',
    'url',
    'category',
    'usage_purpose',
    'creator_name',
    'creator_website',
    'source_name',
    'source_url',
    'license_type',
    'license_notes',
    'is_active',
    'is_public',
    'created_at',
];

$soundColumnsAvailable = [];
foreach ($soundColumnsWanted as $col) {
    if (hasColumn($pdo, 'soundscapes', $col)) {
        $soundColumnsAvailable[] = $col;
    }
}

$soundRows = [];
if (!empty($soundColumnsAvailable)) {
    $soundSql = 'SELECT ' . implode(', ', $soundColumnsAvailable) . ' FROM soundscapes';
    if (!$showAll && in_array('is_active', $soundColumnsAvailable, true)) {
        $soundSql .= ' WHERE is_active = 1';
    }

    if (in_array('created_at', $soundColumnsAvailable, true)) {
        $soundSql .= ' ORDER BY created_at DESC';
    } elseif (in_array('id', $soundColumnsAvailable, true)) {
        $soundSql .= ' ORDER BY id DESC';
    } else {
        $soundSql .= ' ORDER BY name ASC';
    }

    try {
        $soundRows = $pdo->query($soundSql)->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $soundRows = [];
    }
}

$soundMissingCreator = 0;
foreach ($soundRows as $row) {
    $creator = trim((string)($row['creator_name'] ?? ''));
    if ($creator === '') {
        $soundMissingCreator++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Credits Report - Abundance Alchemy Admin</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          crossorigin="anonymous">
    <style>
        body { padding: 20px; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
</head>
<body>
<?php include __DIR__ . '/header.php'; ?>

<div class="container mt-4">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <h1 class="h4 mb-0">Credits Report</h1>
        <?php if ($showAll): ?>
            <a href="credits.php" class="btn btn-outline-secondary btn-sm">Show Active Only</a>
        <?php else: ?>
            <a href="credits.php?all=1" class="btn btn-outline-secondary btn-sm">Show All (Including Inactive)</a>
        <?php endif; ?>
    </div>

    <p class="text-muted small mb-4">
        Admin attribution report for images and audio. This is intended to feed a future public credit screen.
    </p>

    <h2 class="h5 mb-2">Background Image Credits</h2>
    <p class="text-muted small mb-2">
        Rows: <strong><?= (int)count($backgroundRows) ?></strong> |
        Missing creator: <strong><?= (int)$backgroundMissingCreator ?></strong>
    </p>
    <?php if (!$hasBgCreator): ?>
        <div class="alert alert-warning small">
            <strong>Missing schema:</strong> <code>backgrounds.creator_name</code> not found.
            Run:
            <span class="mono">ALTER TABLE backgrounds ADD COLUMN creator_name VARCHAR(255) NULL AFTER image_url;</span>
        </div>
    <?php endif; ?>
    <div class="table-responsive mb-5">
        <table class="table table-sm table-striped align-middle">
            <thead>
                <tr>
                    <th>Slot</th>
                    <th>Creator</th>
                    <th>Image URL</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($backgroundRows)): ?>
                    <tr><td colspan="4" class="text-muted">No background records found.</td></tr>
                <?php else: ?>
                    <?php foreach ($backgroundRows as $row): ?>
                        <?php
                        $creator = trim((string)($row['creator_name'] ?? ''));
                        $imageUrl = trim((string)($row['image_url'] ?? ''));
                        $isActive = (int)($row['is_active'] ?? 0) === 1;
                        ?>
                        <tr>
                            <td class="mono"><?= h($row['slot'] ?? '') ?></td>
                            <td><?= $creator !== '' ? h($creator) : '<span class="text-muted">—</span>' ?></td>
                            <td>
                                <?php if ($imageUrl !== ''): ?>
                                    <a href="<?= h($imageUrl) ?>" target="_blank" rel="noopener" class="mono small">
                                        <?= h($imageUrl) ?>
                                    </a>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td><?= $isActive ? 'Active' : 'Inactive' ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <h2 class="h5 mb-2">Music / Soundscape Credits</h2>
    <p class="text-muted small mb-2">
        Rows: <strong><?= (int)count($soundRows) ?></strong> |
        Missing creator: <strong><?= (int)$soundMissingCreator ?></strong>
    </p>
    <div class="table-responsive">
        <table class="table table-sm table-striped align-middle">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Purpose</th>
                    <th>Creator</th>
                    <th>Source</th>
                    <th>License</th>
                    <th>Audio URL</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php if (empty($soundRows)): ?>
                    <tr><td colspan="9" class="text-muted">No soundscape records found.</td></tr>
                <?php else: ?>
                    <?php foreach ($soundRows as $row): ?>
                        <?php
                        $creatorName = trim((string)($row['creator_name'] ?? ''));
                        $creatorWebsite = trim((string)($row['creator_website'] ?? ''));
                        $sourceName = trim((string)($row['source_name'] ?? ''));
                        $sourceUrl = trim((string)($row['source_url'] ?? ''));
                        $licenseType = trim((string)($row['license_type'] ?? ''));
                        $licenseNotes = trim((string)($row['license_notes'] ?? ''));
                        $audioUrl = trim((string)($row['url'] ?? ''));
                        $isActive = (int)($row['is_active'] ?? 0) === 1;
                        $isPublic = (int)($row['is_public'] ?? 0) === 1;
                        ?>
                        <tr>
                            <td class="mono"><?= h($row['id'] ?? '') ?></td>
                            <td><?= h($row['name'] ?? '') ?></td>
                            <td><?= h($row['category'] ?? '') ?></td>
                            <td class="mono small"><?= h($row['usage_purpose'] ?? '') ?></td>
                            <td>
                                <?php if ($creatorName !== '' && $creatorWebsite !== ''): ?>
                                    <a href="<?= h($creatorWebsite) ?>" target="_blank" rel="noopener"><?= h($creatorName) ?></a>
                                <?php elseif ($creatorName !== ''): ?>
                                    <?= h($creatorName) ?>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if ($sourceName !== '' && $sourceUrl !== ''): ?>
                                    <a href="<?= h($sourceUrl) ?>" target="_blank" rel="noopener"><?= h($sourceName) ?></a>
                                <?php elseif ($sourceName !== ''): ?>
                                    <?= h($sourceName) ?>
                                <?php elseif ($sourceUrl !== ''): ?>
                                    <a href="<?= h($sourceUrl) ?>" target="_blank" rel="noopener" class="mono small"><?= h($sourceUrl) ?></a>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if ($licenseType !== ''): ?>
                                    <div><?= h($licenseType) ?></div>
                                <?php endif; ?>
                                <?php if ($licenseNotes !== ''): ?>
                                    <div class="small text-muted"><?= h($licenseNotes) ?></div>
                                <?php endif; ?>
                                <?php if ($licenseType === '' && $licenseNotes === ''): ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <?php if ($audioUrl !== ''): ?>
                                    <a href="<?= h($audioUrl) ?>" target="_blank" rel="noopener" class="mono small">
                                        <?= h($audioUrl) ?>
                                    </a>
                                <?php else: ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </td>
                            <td><?= $isActive ? 'Active' : 'Inactive' ?> / <?= $isPublic ? 'Public' : 'Private' ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
