<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

$focus_categories = [
    'Peace',
    'Purpose',
    'Love & Relationships',
    'Wealth & Abundance',
    'Confidence & Inner Strength',
    'Health & Wholeness',
    'Self-Love & Worthiness',
    'GENERAL',
];

$msg = '';
$msgType = 'success';

// Pagination
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$per_page = 25;
$offset = ($page - 1) * $per_page;

$category_filter = isset($_GET['category']) ? trim((string)$_GET['category']) : '';
if ($category_filter !== '' && !in_array($category_filter, $focus_categories, true)) {
    $category_filter = '';
}

// Single add
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'single') {
    aa_require_valid_csrf();

    $text = trim((string)($_POST['text'] ?? ''));
    $category = trim((string)($_POST['category'] ?? ''));
    $author = trim((string)($_POST['author'] ?? ''));
    $source = trim((string)($_POST['source'] ?? ''));
    $mood_tag = trim((string)($_POST['mood_tag'] ?? ''));

    if ($text !== '' && in_array($category, $focus_categories, true)) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE text=? AND category=?");
        $stmt->execute([$text, $category]);
        if ($stmt->fetchColumn() > 0) {
            $msg = "Duplicate quote found! Not added.";
            $msgType = 'warning';
        } else {
            $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, author, source, mood_tag, is_active) VALUES (?, ?, ?, ?, ?, 1)");
            $stmt->execute([$text, $category, $author, $source, $mood_tag]);
            $msg = "Wisdom quote added successfully!";
            $msgType = 'success';
        }
    } else {
        $msg = "Please provide valid text and select a category.";
        $msgType = 'error';
    }
}

// Bulk multiline paste
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'bulk_text') {
    aa_require_valid_csrf();

    $bulk_text = trim((string)($_POST['bulk_wisdom'] ?? ''));
    $bulk_category = trim((string)($_POST['bulk_category'] ?? ''));
    $bulk_author = trim((string)($_POST['bulk_author'] ?? ''));
    $bulk_source = trim((string)($_POST['bulk_source'] ?? ''));

    if ($bulk_text !== '' && in_array($bulk_category, $focus_categories, true)) {
        $lines = explode("\n", $bulk_text);
        $added = 0;
        $skipped = 0;
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line !== '') {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE text=? AND category=?");
                $stmt->execute([$line, $bulk_category]);
                if ($stmt->fetchColumn() > 0) {
                    $skipped++;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, author, source, is_active) VALUES (?, ?, ?, ?, 1)");
                    $stmt->execute([$line, $bulk_category, $bulk_author, $bulk_source]);
                    $added++;
                }
            }
        }
        $msg = "Added $added quotes. " . ($skipped > 0 ? "Skipped $skipped duplicates." : "");
        $msgType = $added > 0 ? 'success' : 'warning';
    } else {
        $msg = "Please provide valid bulk text and select a category.";
        $msgType = 'error';
    }
}

// Bulk CSV/txt upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'bulk_csv' && !empty($_FILES['csv_file']['tmp_name'])) {
    aa_require_valid_csrf();

    $csv_category = trim((string)($_POST['csv_category'] ?? ''));
    $added = 0;
    $skipped = 0;
    $errors = [];

    $ext = strtolower(pathinfo($_FILES['csv_file']['name'], PATHINFO_EXTENSION));
    if (($ext === 'csv' || $ext === 'txt') && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
        $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
        while (($row = fgetcsv($file)) !== false) {
            $text = isset($row[0]) ? trim($row[0]) : '';
            $author = isset($row[1]) ? trim($row[1]) : '';
            $source = isset($row[2]) ? trim($row[2]) : '';
            $mood_tag = isset($row[3]) ? trim($row[3]) : '';

            if ($text !== '') {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE text=? AND category=?");
                $stmt->execute([$text, $csv_category]);
                if ($stmt->fetchColumn() > 0) {
                    $skipped++;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, author, source, mood_tag, is_active) VALUES (?, ?, ?, ?, ?, 1)");
                    $stmt->execute([$text, $csv_category, $author, $source, $mood_tag]);
                    $added++;
                }
            }
        }
        fclose($file);
        $msg = "Uploaded $added quotes. " . ($skipped > 0 ? "Skipped $skipped duplicates." : "");
        $msgType = $added > 0 ? 'success' : 'warning';
    } else {
        $msg = "Please upload a valid .csv or .txt file.";
        $msgType = 'error';
    }
}

// Inline edit
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'edit_row' && isset($_POST['id'])) {
    aa_require_valid_csrf();

    $id = intval($_POST['id']);
    $text = trim((string)($_POST['text'] ?? ''));
    $category = trim((string)($_POST['category'] ?? ''));
    $author = trim((string)($_POST['author'] ?? ''));
    $source = trim((string)($_POST['source'] ?? ''));
    $mood_tag = trim((string)($_POST['mood_tag'] ?? ''));

    if ($text !== '' && in_array($category, $focus_categories, true) && $id > 0) {
        $stmt = $pdo->prepare("UPDATE wisdom SET text=?, category=?, author=?, source=?, mood_tag=? WHERE id=?");
        $stmt->execute([$text, $category, $author, $source, $mood_tag, $id]);
        $msg = "Wisdom quote updated successfully!";
        $msgType = 'success';
    } else {
        $msg = "Please provide valid text and select a category.";
        $msgType = 'error';
    }
}

// Mass activation/deactivation
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'bulk_status' && !empty($_POST['chk']) && isset($_POST['set_active'])) {
    aa_require_valid_csrf();

    $ids = array_map('intval', $_POST['chk']);
    $set_status = intval($_POST['set_active']);
    $ids_sql = implode(',', $ids);
    $pdo->query("UPDATE wisdom SET is_active = $set_status WHERE id IN ($ids_sql)");
    $msg = "Updated status for " . count($ids) . " quote(s).";
    $msgType = 'success';
}

// Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['del_id'])) {
    aa_require_valid_csrf();

    $stmt = $pdo->prepare("DELETE FROM wisdom WHERE id=?");
    $stmt->execute([intval($_POST['del_id'])]);
    $msg = "Wisdom quote deleted.";
    $msgType = 'success';
}

// Export
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'export' && !empty($_POST['export_ids'])) {
    aa_require_valid_csrf();

    $ids = array_map('intval', $_POST['export_ids']);
    $ids_sql = implode(',', $ids);
    $data = $pdo->query("SELECT * FROM wisdom WHERE id IN ($ids_sql)")->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($data)) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="wisdom_export_' . date('Ymd_His') . '.csv"');
        $f = fopen('php://output', 'w');
        fputcsv($f, array_keys($data[0]));
        foreach ($data as $row) fputcsv($f, $row);
        fclose($f);
        exit;
    }
}

// Fetch counts by category
$category_counts = [];
foreach ($focus_categories as $cat) {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE category = ?");
    $stmt->execute([$cat]);
    $category_counts[$cat] = (int)$stmt->fetchColumn();
}

// Fetch all wisdom for current filter
$where_sql = '';
$params = [];
if ($category_filter !== '') {
    $where_sql = "WHERE category = :category";
    $params[':category'] = $category_filter;
}

$total_stmt = $pdo->prepare("SELECT COUNT(*) FROM wisdom $where_sql");
if (!empty($params)) {
    foreach ($params as $k => $v) {
        $total_stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
}
$total_stmt->execute();
$total = (int)$total_stmt->fetchColumn();
$total_pages = ceil($total / $per_page);

$stmt = $pdo->prepare("SELECT * FROM wisdom $where_sql ORDER BY category, created_at DESC LIMIT :limit OFFSET :offset");
if (!empty($params)) {
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
}
$stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$wis = $stmt->fetchAll();

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function get_category_color(string $category): string {
    $colors = [
        'Peace' => 'success',
        'Purpose' => 'primary',
        'Love & Relationships' => 'danger',
        'Wealth & Abundance' => 'warning',
        'Confidence & Inner Strength' => 'info',
        'Health & Wholeness' => 'success',
        'Self-Love & Worthiness' => 'purple',
        'GENERAL' => 'secondary',
    ];
    return $colors[$category] ?? 'secondary';
}

function get_category_icon(string $category): string {
    $icons = [
        'Peace' => '🕊️',
        'Purpose' => '🎯',
        'Love & Relationships' => '💕',
        'Wealth & Abundance' => '💎',
        'Confidence & Inner Strength' => '💪',
        'Health & Wholeness' => '🌿',
        'Self-Love & Worthiness' => '✨',
        'GENERAL' => '📜',
    ];
    return $icons[$category] ?? '📜';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Manage Wisdom - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        :root {
            --aa-primary: #ff6a1a;
            --aa-primary-hover: #e95e16;
            --aa-bg: #f5f6fa;
            --aa-card-radius: 1rem;
        }

        body {
            font-family: "Trebuchet MS", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #ffffff 0, #f5f6fa 45%, #eceff4 100%);
            min-height: 100vh;
            color: #222;
        }

        .aa-page-header {
            display: flex;
            flex-wrap: wrap;
            gap: .75rem;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .aa-page-title {
            display: flex;
            flex-direction: column;
            gap: .25rem;
        }

        .aa-page-title h2 {
            margin: 0;
            font-weight: 700;
            letter-spacing: .02em;
            color: #1a1a2e;
        }

        .aa-page-subtitle {
            font-size: .9rem;
            color: #6c757d;
        }

        .aa-card {
            border-radius: var(--aa-card-radius);
            border: 1px solid rgba(15,23,42,.05);
            box-shadow: 0 4px 6px -1px rgba(15,23,42,.04), 0 18px 45px rgba(15,23,42,.08);
            background: #ffffff;
            overflow: hidden;
        }

        .aa-card-header-soft {
            background: linear-gradient(90deg, #ffffff, #fff7f2);
            border-bottom: 1px solid rgba(0,0,0,.02);
            padding: 1rem 1.25rem;
        }

        .btn-primary {
            background: var(--aa-primary);
            border-color: var(--aa-primary);
        }

        .btn-primary:hover {
            background: var(--aa-primary-hover);
            border-color: var(--aa-primary-hover);
        }

        .btn-outline-primary {
            color: var(--aa-primary);
            border-color: var(--aa-primary);
        }

        .btn-outline-primary:hover {
            background: var(--aa-primary);
            border-color: var(--aa-primary);
        }

        .category-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;
            margin-bottom: 1.5rem;
        }

        .category-tab {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
            padding: .5rem 1rem;
            border-radius: 999px;
            font-size: .85rem;
            font-weight: 500;
            text-decoration: none;
            transition: all .2s ease;
            border: 1px solid transparent;
            background: #fff;
            color: #6c757d;
            box-shadow: 0 1px 3px rgba(0,0,0,.06);
        }

        .category-tab:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,.1);
        }

        .category-tab.active {
            background: var(--aa-primary);
            color: #fff;
            box-shadow: 0 4px 12px rgba(255,106,26,.3);
        }

        .category-tab .count {
            background: rgba(255,255,255,.25);
            padding: .1rem .4rem;
            border-radius: 999px;
            font-size: .75rem;
        }

        .category-tab:not(.active) .count {
            background: #f0f0f0;
        }

        .wisdom-quote {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid rgba(0,0,0,.04);
            transition: background .15s ease;
        }

        .wisdom-quote:hover {
            background: rgba(255,106,26,.03);
        }

        .wisdom-quote:last-child {
            border-bottom: none;
        }

        .wisdom-text {
            font-size: .95rem;
            line-height: 1.6;
            margin-bottom: .5rem;
            color: #1a1a2e;
        }

        .wisdom-meta {
            display: flex;
            flex-wrap: wrap;
            gap: .75rem;
            align-items: center;
            font-size: .8rem;
        }

        .wisdom-author {
            color: #6c757d;
            font-style: italic;
        }

        .wisdom-source {
            color: var(--aa-primary);
            font-weight: 500;
        }

        .wisdom-actions {
            display: flex;
            gap: .5rem;
            opacity: 0;
            transition: opacity .15s ease;
        }

        .wisdom-quote:hover .wisdom-actions {
            opacity: 1;
        }

        .badge-category {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
            padding: .25rem .6rem;
            border-radius: 999px;
            font-size: .72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .03em;
        }

        .badge-category.bg-success { background: #d1fae5; color: #065f46; }
        .badge-category.bg-primary { background: #dbeafe; color: #1e40af; }
        .badge-category.bg-danger { background: #fce7f3; color: #9d174d; }
        .badge-category.bg-warning { background: #fef3c7; color: #92400e; }
        .badge-category.bg-info { background: #e0f2fe; color: #075985; }
        .badge-category.bg-purple { background: #f3e8ff; color: #6b21a8; }
        .badge-category.bg-secondary { background: #f3f4f6; color: #374151; }

        .badge-status {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
            padding: .2rem .5rem;
            border-radius: 999px;
            font-size: .72rem;
            font-weight: 600;
        }

        .badge-status.active {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-status.inactive {
            background: #f3f4f6;
            color: #6b7280;
        }

        .edit-modal .modal-content {
            border-radius: var(--aa-card-radius);
            border: none;
        }

        .edit-modal .modal-header {
            border-bottom: 1px solid rgba(0,0,0,.05);
            padding: 1.25rem 1.5rem;
        }

        .edit-modal .modal-body {
            padding: 1.5rem;
        }

        .form-label {
            font-weight: 600;
            font-size: .85rem;
            margin-bottom: .4rem;
            color: #374151;
        }

        .alert {
            border-radius: var(--aa-card-radius);
            border: none;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
        }

        .alert-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .alert-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .quick-add-section {
            background: linear-gradient(135deg, #fff7f2 0%, #ffffff 100%);
            border-radius: var(--aa-card-radius);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(255,106,26,.1);
        }

        .quick-add-tabs {
            display: flex;
            gap: .5rem;
            margin-bottom: 1rem;
        }

        .quick-add-tab {
            padding: .4rem .75rem;
            border-radius: .5rem;
            font-size: .85rem;
            font-weight: 500;
            border: 1px solid #e5e7eb;
            background: #fff;
            cursor: pointer;
            transition: all .15s ease;
        }

        .quick-add-tab:hover {
            border-color: var(--aa-primary);
        }

        .quick-add-tab.active {
            background: var(--aa-primary);
            color: #fff;
            border-color: var(--aa-primary);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: #6c757d;
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: .3;
        }

        .pagination {
            gap: .25rem;
        }

        .page-link {
            border-radius: .5rem;
            border: none;
            padding: .5rem .75rem;
        }

        .page-item.active .page-link {
            background: var(--aa-primary);
        }

        @media (max-width: 768px) {
            .wisdom-actions {
                opacity: 1;
            }
        }
    </style>
</head>
<body>
<?php include("header.php"); ?>

<div class="container py-4">
    <div class="aa-page-header">
        <div class="aa-page-title">
            <h2><i class="bi bi-journal-text me-2"></i>Manage Wisdom</h2>
            <div class="aa-page-subtitle">Curate wisdom quotes and teachings for the Abundance Alchemy community.</div>
        </div>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-<?= $msgType ?> alert-dismissible fade show" role="alert">
            <?= h($msg) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Category Filter Tabs -->
    <div class="category-tabs">
        <a href="wisdom.php" class="category-tab <?= $category_filter === '' ? 'active' : '' ?>">
            <span>All</span>
            <span class="count"><?= array_sum($category_counts) ?></span>
        </a>
        <?php foreach ($focus_categories as $cat): ?>
            <a href="wisdom.php?category=<?= urlencode($cat) ?>" class="category-tab <?= $category_filter === $cat ? 'active' : '' ?>">
                <span><?= get_category_icon($cat) ?> <?= h($cat) ?></span>
                <span class="count"><?= $category_counts[$cat] ?></span>
            </a>
        <?php endforeach; ?>
    </div>

    <!-- Quick Add Section -->
    <div class="quick-add-section">
        <h5 class="mb-3 fw-bold"><i class="bi bi-plus-circle me-2"></i>Add New Wisdom</h5>
        
        <div class="quick-add-tabs mb-3">
            <button type="button" class="quick-add-tab active" onclick="showAddForm('single')">
                <i class="bi bi-pencil me-1"></i>Single Quote
            </button>
            <button type="button" class="quick-add-tab" onclick="showAddForm('bulk')">
                <i class="bi bi-list-ul me-1"></i>Bulk Paste
            </button>
            <button type="button" class="quick-add-tab" onclick="showAddForm('upload')">
                <i class="bi bi-cloud-upload me-1"></i>File Upload
            </button>
        </div>

        <!-- Single Add Form -->
        <form method="post" id="form-single" class="row g-3">
            <?php aa_csrf_field(); ?>
            <input type="hidden" name="mode" value="single">
            <div class="col-12">
                <label class="form-label">Quote Text *</label>
                <textarea name="text" class="form-control" rows="3" placeholder="Enter the wisdom quote..." required></textarea>
            </div>
            <div class="col-md-4">
                <label class="form-label">Category *</label>
                <select name="category" class="form-select" required>
                    <?php foreach ($focus_categories as $cat): ?>
                        <option value="<?= h($cat) ?>"><?= h($cat) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Author</label>
                <input type="text" name="author" class="form-control" placeholder="e.g., Buddha, Wayne Dyer">
            </div>
            <div class="col-md-4">
                <label class="form-label">Source</label>
                <input type="text" name="source" class="form-control" placeholder="e.g., John 14:27">
            </div>
            <div class="col-12">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-plus-lg me-1"></i>Add Quote
                </button>
            </div>
        </form>

        <!-- Bulk Add Form -->
        <form method="post" id="form-bulk" class="row g-3" style="display: none;">
            <?php aa_csrf_field(); ?>
            <input type="hidden" name="mode" value="bulk_text">
            <div class="col-12">
                <label class="form-label">Quotes (one per line) *</label>
                <textarea name="bulk_wisdom" class="form-control" rows="5" placeholder="Paste multiple quotes here, one per line..."></textarea>
                <small class="text-muted">Each line will be added as a separate quote with the same category and author.</small>
            </div>
            <div class="col-md-4">
                <label class="form-label">Category *</label>
                <select name="bulk_category" class="form-select" required>
                    <?php foreach ($focus_categories as $cat): ?>
                        <option value="<?= h($cat) ?>"><?= h($cat) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Author</label>
                <input type="text" name="bulk_author" class="form-control" placeholder="e.g., Buddha">
            </div>
            <div class="col-md-4">
                <label class="form-label">Source</label>
                <input type="text" name="bulk_source" class="form-control" placeholder="e.g., The Dhammapada">
            </div>
            <div class="col-12">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-plus-lg me-1"></i>Add Bulk Quotes
                </button>
            </div>
        </form>

        <!-- File Upload Form -->
        <form method="post" id="form-upload" class="row g-3" enctype="multipart/form-data" style="display: none;">
            <?php aa_csrf_field(); ?>
            <input type="hidden" name="mode" value="bulk_csv">
            <div class="col-md-6">
                <label class="form-label">CSV/TXT File *</label>
                <input type="file" name="csv_file" accept=".csv,.txt" class="form-control" required>
                <small class="text-muted">Format: quote, author, source, mood_tag (one row per quote)</small>
            </div>
            <div class="col-md-4">
                <label class="form-label">Category *</label>
                <select name="csv_category" class="form-select" required>
                    <?php foreach ($focus_categories as $cat): ?>
                        <option value="<?= h($cat) ?>"><?= h($cat) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-12">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-cloud-upload me-1"></i>Upload File
                </button>
            </div>
        </form>
    </div>

    <!-- Bulk Actions Bar -->
    <form method="post" id="bulk-form">
        <?php aa_csrf_field(); ?>
        <div class="aa-card mb-4">
            <div class="card-body py-3">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div class="d-flex align-items-center gap-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="selectAll" onchange="toggleAll(this)">
                            <label class="form-check-label" for="selectAll">Select All</label>
                        </div>
                        <span class="text-muted small"><?= $total ?> quote<?= $total === 1 ? '' : 's' ?> total</span>
                    </div>
                    <div class="d-flex gap-2">
                        <select name="set_active" class="form-select form-select-sm" style="width: auto;">
                            <option value="">-- Bulk Status --</option>
                            <option value="1">Activate Selected</option>
                            <option value="0">Deactivate Selected</option>
                        </select>
                        <button type="submit" class="btn btn-sm btn-outline-primary" onclick="document.getElementById('bulk-form').action.value='bulk_status';" formaction="javascript:void(0)" id="bulk-status-btn">
                            Update Status
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" onclick="exportSelected()">
                            <i class="bi bi-download me-1"></i>Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <input type="hidden" name="mode" value="">
        <input type="hidden" name="export_ids" value="">

        <!-- Quotes List -->
        <?php if (empty($wis)): ?>
            <div class="aa-card">
                <div class="empty-state">
                    <i class="bi bi-journal-text"></i>
                    <h5>No wisdom quotes yet</h5>
                    <p>Add your first wisdom quote using the form above.</p>
                </div>
            </div>
        <?php else: ?>
            <div class="aa-card">
                <?php foreach ($wis as $w): ?>
                    <div class="wisdom-quote">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1 me-3">
                                <p class="wisdom-text">"<?= h($w['text']) ?>"</p>
                                <div class="wisdom-meta">
                                    <span class="badge-category bg-<?= get_category_color($w['category']) ?>">
                                        <?= get_category_icon($w['category']) ?> <?= h($w['category']) ?>
                                    </span>
                                    <?php if (!empty($w['author'])): ?>
                                        <span class="wisdom-author">— <?= h($w['author']) ?></span>
                                    <?php endif; ?>
                                    <?php if (!empty($w['source'])): ?>
                                        <span class="wisdom-source"><?= h($w['source']) ?></span>
                                    <?php endif; ?>
                                    <span class="badge-status <?= !empty($w['is_active']) ? 'active' : 'inactive' ?>">
                                        <i class="bi bi-<?= !empty($w['is_active']) ? 'check-circle-fill' : 'x-circle' ?>"></i>
                                        <?= !empty($w['is_active']) ? 'Active' : 'Inactive' ?>
                                    </span>
                                </div>
                            </div>
                            <div class="wisdom-actions">
                                <input type="checkbox" name="chk[]" value="<?= (int)$w['id'] ?>" class="form-check-input me-2" style="cursor: pointer;">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="editQuote(<?= (int)$w['id'] ?>, '<?= h(addslashes($w['text'])) ?>', '<?= h(addslashes($w['category'])) ?>', '<?= h(addslashes($w['author'] ?? '')) ?>', '<?= h(addslashes($w['source'] ?? '')) ?>', '<?= h(addslashes($w['mood_tag'] ?? '')) ?>')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <form method="post" style="display: inline;">
                                    <?php aa_csrf_field(); ?>
                                    <input type="hidden" name="del_id" value="<?= (int)$w['id'] ?>">
                                    <button type="submit" class="btn btn-sm btn-outline-danger" onclick="return confirm('Delete this quote?')">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <!-- Pagination -->
        <?php if ($total_pages > 1): ?>
            <nav class="mt-4">
                <ul class="pagination justify-content-center">
                    <?php if ($page > 1): ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=<?= $page - 1 ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>">
                                <i class="bi bi-chevron-left"></i>
                            </a>
                        </li>
                    <?php endif; ?>
                    
                    <?php
                    $start = max(1, $page - 2);
                    $end = min($total_pages, $page + 2);
                    if ($start > 1): ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=1<?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>">1</a>
                        </li>
                        <?php if ($start > 2): ?>
                            <li class="page-item disabled"><span class="page-link">...</span></li>
                        <?php endif; ?>
                    <?php endif; ?>
                    
                    <?php for ($p = $start; $p <= $end; $p++): ?>
                        <li class="page-item <?= $p === $page ? 'active' : '' ?>">
                            <a class="page-link" href="?page=<?= $p ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>"><?= $p ?></a>
                        </li>
                    <?php endfor; ?>
                    
                    <?php if ($end < $total_pages): ?>
                        <?php if ($end < $total_pages - 1): ?>
                            <li class="page-item disabled"><span class="page-link">...</span></li>
                        <?php endif; ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=<?= $total_pages ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>"><?= $total_pages ?></a>
                        </li>
                    <?php endif; ?>
                    
                    <?php if ($page < $total_pages): ?>
                        <li class="page-item">
                            <a class="page-link" href="?page=<?= $page + 1 ?><?= $category_filter ? '&category=' . urlencode($category_filter) : '' ?>">
                                <i class="bi bi-chevron-right"></i>
                            </a>
                        </li>
                    <?php endif; ?>
                </ul>
            </nav>
        <?php endif; ?>
    </form>
</div>

<!-- Edit Modal -->
<div class="modal fade edit-modal" tabindex="-1" id="editModal">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-pencil me-2"></i>Edit Wisdom Quote</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="post">
                <?php aa_csrf_field(); ?>
                <input type="hidden" name="mode" value="edit_row">
                <input type="hidden" name="id" id="edit_id">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Quote Text *</label>
                        <textarea name="text" id="edit_text" class="form-control" rows="4" required></textarea>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Category *</label>
                            <select name="category" id="edit_category" class="form-select" required>
                                <?php foreach ($focus_categories as $cat): ?>
                                    <option value="<?= h($cat) ?>"><?= h($cat) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Author</label>
                            <input type="text" name="author" id="edit_author" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Source</label>
                            <input type="text" name="source" id="edit_source" class="form-control">
                        </div>
                    </div>
                    <div class="mt-3">
                        <label class="form-label">Mood Tag</label>
                        <input type="text" name="mood_tag" id="edit_mood_tag" class="form-control" placeholder="Optional mood tag">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="bi bi-check-lg me-1"></i>Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
function showAddForm(type) {
    document.querySelectorAll('.quick-add-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('[id^="form-"]').forEach(f => f.style.display = 'none');
    
    document.querySelector(`.quick-add-tab[onclick="showAddForm('${type}')"]`).classList.add('active');
    document.getElementById(`form-${type}`).style.display = 'flex';
}

function toggleAll(source) {
    document.querySelectorAll('input[name="chk[]"]').forEach(cb => cb.checked = source.checked);
}

function editQuote(id, text, category, author, source, moodTag) {
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_text').value = text;
    document.getElementById('edit_category').value = category;
    document.getElementById('edit_author').value = author;
    document.getElementById('edit_source').value = source;
    document.getElementById('edit_mood_tag').value = moodTag;
    
    new bootstrap.Modal(document.getElementById('editModal')).show();
}

document.getElementById('bulk-status-btn').addEventListener('click', function() {
    const checked = document.querySelectorAll('input[name="chk[]"]:checked');
    if (checked.length === 0) {
        alert('Please select at least one quote.');
        return;
    }
    document.querySelector('input[name="mode"]').value = 'bulk_status';
    document.getElementById('bulk-form').submit();
});

function exportSelected() {
    const checked = document.querySelectorAll('input[name="chk[]"]:checked');
    if (checked.length === 0) {
        alert('Please select at least one quote to export.');
        return;
    }
    
    const ids = Array.from(checked).map(cb => cb.value);
    document.querySelector('input[name="export_ids"]').value = ids.join(',');
    document.querySelector('input[name="mode"]').value = 'export';
    document.getElementById('bulk-form').submit();
}

document.querySelectorAll('[data-bs-dismiss="alert"]').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.alert').remove();
    });
});
</script>
</body>
</html>
