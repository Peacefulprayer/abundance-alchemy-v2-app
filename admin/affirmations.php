<?php
session_start();
require_once '../db.php';
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

$msg = '';

// Determine type filter for listing ("", MORNING_IAM, EVENING_ILOVE)
$type_filter = isset($_GET['type_filter']) ? $_GET['type_filter'] : '';
$valid_types = ['MORNING_IAM', 'EVENING_ILOVE'];
if (!in_array($type_filter, $valid_types)) {
    $type_filter = ''; // default to all types if invalid
}

// For heading label
$section_label = 'All Affirmations';
if ($type_filter === 'MORNING_IAM') {
    $section_label = 'I Am Library';
} elseif ($type_filter === 'EVENING_ILOVE') {
    $section_label = 'I Love Library';
}

// Single and bulk add, checks for duplicates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Single add
    if (isset($_POST['mode']) && $_POST['mode'] === 'single' && !empty($_POST['text']) && !empty($_POST['type']) && !empty($_POST['category'])) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM affirmations WHERE text=? AND type=? AND category=?");
        $stmt->execute([trim($_POST['text']), $_POST['type'], $_POST['category']]);
        if ($stmt->fetchColumn() > 0) {
            $msg = "Duplicate found! Not added.";
        } else {
            $stmt = $pdo->prepare("INSERT INTO affirmations (text, type, category, is_active) VALUES (?, ?, ?, 1)");
            $stmt->execute([trim($_POST['text']), $_POST['type'], $_POST['category']]);
            $msg = "Affirmation added!";
        }
    }

    // Bulk multi-line paste
    if (isset($_POST['mode']) && $_POST['mode'] === 'bulk_text' && !empty($_POST['bulk_affirmations'])) {
        $bulk = explode("\n", $_POST['bulk_affirmations']);
        $added = 0; $skipped = [];
        foreach ($bulk as $line) {
            $line = trim($line);
            if ($line !== '') {
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM affirmations WHERE text=? AND type=? AND category=?");
                $stmt->execute([$line, $_POST['bulk_type'], $_POST['bulk_category']]);
                if ($stmt->fetchColumn() > 0) {
                    $skipped[] = $line;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO affirmations (text, type, category, is_active) VALUES (?, ?, ?, 1)");
                    $stmt->execute([$line, $_POST['bulk_type'], $_POST['bulk_category']]);
                    $added++;
                }
            }
        }
        $msg = "$added bulk affirmations added!" . ($skipped ? " Skipped: ".count($skipped)." duplicates." : "");
        if ($skipped) $msg .= " Skipped: " . htmlspecialchars(implode(", ", $skipped));
    }

    // Bulk CSV/txt upload
    if (isset($_POST['mode']) && $_POST['mode'] === 'bulk_csv' && !empty($_FILES['csv_file']['tmp_name'])) {
        $added = 0; $skipped = [];
        $ext = strtolower(pathinfo($_FILES['csv_file']['name'], PATHINFO_EXTENSION));
        if (($ext === 'csv' || $ext === 'txt') && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
            $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
            while (($row = fgetcsv($file)) !== false) {
                $text = isset($row[0]) ? trim($row[0]) : '';
                if ($text !== '') {
                    $stmt = $pdo->prepare("SELECT COUNT(*) FROM affirmations WHERE text=? AND type=? AND category=?");
                    $stmt->execute([$text, $_POST['csv_type'], $_POST['csv_category']]);
                    if ($stmt->fetchColumn() > 0) {
                        $skipped[] = $text;
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO affirmations (text, type, category, is_active) VALUES (?, ?, ?, 1)");
                        $stmt->execute([$text, $_POST['csv_type'], $_POST['csv_category']]);
                        $added++;
                    }
                }
            }
            fclose($file);
            $msg = "$added bulk affirmations from file uploaded!" . ($skipped ? " Skipped: ".count($skipped)." duplicates." : "");
            if ($skipped) $msg .= " Skipped: " . htmlspecialchars(implode(", ", $skipped));
        } else {
            $msg = "Upload a valid .csv or .txt file.";
        }
    }

    // Inline edit
    if (isset($_POST['mode']) && $_POST['mode'] === 'edit_row' && isset($_POST['id'])) {
        $stmt = $pdo->prepare("UPDATE affirmations SET text=?, type=?, category=? WHERE id=?");
        $stmt->execute([$_POST['text'], $_POST['type'], $_POST['category'], intval($_POST['id'])]);
        $msg = "Affirmation updated!";
    }

    // Mass activation/deactivation
    if (isset($_POST['mode']) && $_POST['mode'] === 'bulk_status' && !empty($_POST['chk']) && isset($_POST['set_active']) && $_POST['set_active'] !== '') {
        $ids = array_map('intval', $_POST['chk']);
        if (!empty($ids)) {
            $ids_sql = implode(',', $ids);
            $set_status = intval($_POST['set_active']);
            $pdo->query("UPDATE affirmations SET is_active = $set_status WHERE id IN ($ids_sql)");
            $msg = "Selected affirmations status updated.";
        }
    }

    // Delete
    if (isset($_POST['del_id'])) {
        $stmt = $pdo->prepare("DELETE FROM affirmations WHERE id=?");
        $stmt->execute([$_POST['del_id']]);
        $msg = "Affirmation deleted.";
    }

    // Export
    if (isset($_POST['mode']) && $_POST['mode'] === 'export' && !empty($_POST['export_ids'])) {
        $ids = array_map('intval', $_POST['export_ids']);
        if (!empty($ids)) {
            $ids_sql = implode(',', $ids);
            $data = $pdo->query("SELECT * FROM affirmations WHERE id IN ($ids_sql)")->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($data)) {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="affirmations_export.csv"');
                $f = fopen('php://output', 'w');
                fputcsv($f, array_keys($data[0]));
                foreach ($data as $row) fputcsv($f, $row);
                fclose($f);
                exit;
            }
        }
    }
}

// --- PAGINATION + FILTER LOGIC ---
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$per_page = 50;
$offset = ($page - 1) * $per_page;

// Build WHERE clause for filter
$where_sql = '';
$params = [];
if ($type_filter !== '') {
    $where_sql = 'WHERE type = :type_filter';
    $params[':type_filter'] = $type_filter;
}

// Total count (with filter)
if ($where_sql) {
    $total_stmt = $pdo->prepare("SELECT COUNT(*) FROM affirmations $where_sql");
    foreach ($params as $k => $v) {
        $total_stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
    $total_stmt->execute();
    $total = $total_stmt->fetchColumn();
} else {
    $total = $pdo->query("SELECT COUNT(*) FROM affirmations")->fetchColumn();
}

// Fetch affirmations (with filter)
if ($where_sql) {
    $stmt = $pdo->prepare("SELECT * FROM affirmations $where_sql ORDER BY type, category, created_at DESC LIMIT :limit OFFSET :offset");
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, PDO::PARAM_STR);
    }
} else {
    $stmt = $pdo->prepare("SELECT * FROM affirmations ORDER BY type, category, created_at DESC LIMIT :limit OFFSET :offset");
}
$stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$af = $stmt->fetchAll();

$total_pages = ceil($total / $per_page);

// Helper for pagination links to preserve filter
$filter_query = $type_filter ? '&type_filter='.urlencode($type_filter) : '';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Affirmations - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
    body { font-family: Trebuchet MS, sans-serif; background: #fff; }
    .btn-primary { background: #FF6600; border: none; }
    .edit-row { background: #f5f5f5; }
    </style>
    <script>
    function toggleEdit(id) {
        document.getElementById('row'+id).style.display = 'none';
        document.getElementById('edit'+id).style.display = 'table-row';
    }
    function cancelEdit(id) {
        document.getElementById('row'+id).style.display = 'table-row';
        document.getElementById('edit'+id).style.display = 'none';
    }
    function toggleAll(source) {
        var checkboxes = document.getElementsByName('chk[]');
        for(var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = source.checked;
        }
    }
    </script>
</head>
<body>
<?php include("header.php"); ?>
<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Manage Affirmations</h4>
        <span class="badge bg-secondary"><?=$section_label?></span>
    </div>
    <?php if ($msg): ?><div class="alert alert-success"><?=htmlspecialchars($msg)?></div><?php endif; ?>

    <!-- Tabs: All / I Am / I Love -->
    <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
            <a class="nav-link <?= $type_filter=='' ? 'active' : '' ?>" href="affirmations.php">
                All Affirmations
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= $type_filter=='MORNING_IAM' ? 'active' : '' ?>" href="affirmations.php?type_filter=MORNING_IAM">
                I Am Library
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link <?= $type_filter=='EVENING_ILOVE' ? 'active' : '' ?>" href="affirmations.php?type_filter=EVENING_ILOVE">
                I Love Library
            </a>
        </li>
    </ul>

    <!-- Single add -->
    <form method="post" class="mb-3 row g-2">
        <input type="hidden" name="mode" value="single">
        <div class="col">
            <input type="text" name="text" class="form-control" placeholder="Affirmation Text" required>
        </div>
        <div class="col">
            <select name="type" class="form-select" required>
                <option value="MORNING_IAM">I Am</option>
                <option value="EVENING_ILOVE">I Love</option>
            </select>
        </div>
        <div class="col">
            <input type="text" name="category" class="form-control" placeholder="Category" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Add</button>
        </div>
    </form>

    <!-- Bulk multiline paste -->
    <form method="post" class="mb-3 row g-2">
        <input type="hidden" name="mode" value="bulk_text">
        <div class="col-6">
            <textarea name="bulk_affirmations" class="form-control" rows="5" placeholder="Paste multiple affirmations (one per line)"></textarea>
        </div>
        <div class="col">
            <select name="bulk_type" class="form-select" required>
                <option value="MORNING_IAM">I Am</option>
                <option value="EVENING_ILOVE">I Love</option>
            </select>
        </div>
        <div class="col">
            <input type="text" name="bulk_category" class="form-control" placeholder="Category" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Bulk Add</button>
        </div>
    </form>

    <!-- Bulk CSV/txt upload -->
    <form method="post" class="mb-3 row g-2" enctype="multipart/form-data">
        <input type="hidden" name="mode" value="bulk_csv">
        <div class="col">
            <input type="file" name="csv_file" accept=".csv,.txt" class="form-control" required>
        </div>
        <div class="col">
            <select name="csv_type" class="form-select" required>
                <option value="MORNING_IAM">I Am</option>
                <option value="EVENING_ILOVE">I Love</option>
            </select>
        </div>
        <div class="col">
            <input type="text" name="csv_category" class="form-control" placeholder="Category" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Upload File</button>
        </div>
    </form>

    <!-- Bulk actions: activate/deactivate, export -->
    <form method="post">
        <div class="mb-2">
            <input type="hidden" name="mode" value="">
            <select name="set_active" class="form-select d-inline w-auto">
                <option value="">-- Mass status --</option>
                <option value="1">Activate Selected</option>
                <option value="0">Deactivate Selected</option>
            </select>
            <button class="btn btn-primary btn-sm ms-1" type="submit" onclick="this.form.mode.value='bulk_status';">Update Status</button>
        </div>

        <table class="table table-bordered">
            <thead>
                <tr>
                    <th><input type="checkbox" onclick="toggleAll(this)"></th>
                    <th>Text</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($af as $a): ?>
                <tr id="row<?=$a['id']?>">
                    <td><input type="checkbox" name="chk[]" value="<?=$a['id']?>"></td>
                    <td><?=htmlspecialchars($a['text'])?></td>
                    <td><?=htmlspecialchars($a['type'])?></td>
                    <td><?=htmlspecialchars($a['category'])?></td>
                    <td><?=($a['is_active']?'Yes':'No')?></td>
                    <td>
                        <button type="button" class="btn btn-sm btn-info" onclick="toggleEdit(<?=$a['id']?>)">Edit</button>
                        <form method="post" style="display:inline">
                            <input type="hidden" name="del_id" value="<?=$a['id']?>">
                            <button class="btn btn-sm btn-danger" onclick="return confirm('Delete affirmation?')">Delete</button>
                        </form>
                    </td>
                </tr>
                <tr class="edit-row" id="edit<?=$a['id']?>" style="display:none;">
                    <form method="post">
                        <input type="hidden" name="mode" value="edit_row">
                        <input type="hidden" name="id" value="<?=$a['id']?>">
                        <td></td>
                        <td>
                            <input type="text" name="text" class="form-control" value="<?=htmlspecialchars($a['text'])?>" required>
                        </td>
                        <td>
                            <select name="type" class="form-select" required>
                                <option value="MORNING_IAM" <?=$a['type']=='MORNING_IAM'?'selected':''?>>I Am</option>
                                <option value="EVENING_ILOVE" <?=$a['type']=='EVENING_ILOVE'?'selected':''?>>I Love</option>
                            </select>
                        </td>
                        <td>
                            <input type="text" name="category" class="form-control" value="<?=htmlspecialchars($a['category'])?>" required>
                        </td>
                        <td></td>
                        <td>
                            <button class="btn btn-primary btn-sm">Save</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="cancelEdit(<?=$a['id']?>)">Cancel</button>
                        </td>
                    </form>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <!-- Export Selected (reusing chk[]) -->
        <?php if (!empty($af)): ?>
            <button class="btn btn-success btn-sm" type="submit" onclick="
                this.form.mode.value='export';
                // copy chk[] values into export_ids[]
                var form = this.form;
                var old = document.querySelectorAll('input[name^=export_ids]');
                for (var i = 0; i < old.length; i++) old[i].remove();
                var checks = document.querySelectorAll('input[name^=chk]:checked');
                for (var j = 0; j < checks.length; j++) {
                    var hidden = document.createElement('input');
                    hidden.type = 'hidden';
                    hidden.name = 'export_ids[]';
                    hidden.value = checks[j].value;
                    form.appendChild(hidden);
                }
            ">
                Export Selected
            </button>
        <?php endif; ?>
    </form>

    <!-- Pagination -->
    <?php if ($total_pages > 1): ?>
    <nav>
      <ul class="pagination mt-3">
        <?php for ($p = 1; $p <= $total_pages; $p++): ?>
          <li class="page-item <?=$p == $page ? 'active' : ''?>">
            <a class="page-link" href="?page=<?=$p?><?=$filter_query?>"><?=$p?></a>
          </li>
        <?php endfor; ?>
      </ul>
    </nav>
    <?php endif; ?>
</div>
</body>
</html>