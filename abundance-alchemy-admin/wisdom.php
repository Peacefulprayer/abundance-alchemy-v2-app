<?php
session_start();
require_once '../db.php';
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

$msg = '';
// Single add
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['mode'] === 'single' && !empty($_POST['text']) && !empty($_POST['category'])) {
        $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, mood_tag) VALUES (?, ?, ?)");
        $stmt->execute([trim($_POST['text']), $_POST['category'], $_POST['mood_tag'] ?? '']);
        $msg = "Wisdom added!";
    }
    // Bulk text paste
    if ($_POST['mode'] === 'bulk_text' && !empty($_POST['bulk_wisdom'])) {
        $bulk = explode("\n", $_POST['bulk_wisdom']);
        $added = 0; $skipped = [];
        foreach ($bulk as $line) {
            $line = trim($line);
            if ($line !== '') {
                // duplicate check (text+category)
                $dup = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE text=? AND category=?");
                $dup->execute([$line, $_POST['bulk_category']]);
                if ($dup->fetchColumn() > 0) {
                    $skipped[] = $line;
                } else {
                    $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, mood_tag) VALUES (?, ?, ?)");
                    $stmt->execute([$line, $_POST['bulk_category'], $_POST['bulk_mood_tag'] ?? '']);
                    $added++;
                }
            }
        }
        $msg = "$added bulk wisdoms added." . ($skipped ? " Skipped: ".count($skipped)." duplicates." : "");
        if ($skipped) $msg .= " Skipped: ".htmlspecialchars(implode(", ", $skipped));
    }
    // Bulk CSV/txt upload
    if ($_POST['mode'] === 'bulk_csv' && !empty($_FILES['csv_file']['tmp_name'])) {
        $added = 0; $skipped = [];
        $ext = strtolower(pathinfo($_FILES['csv_file']['name'], PATHINFO_EXTENSION));
        if (($ext === 'csv' || $ext === 'txt') && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
            $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
            while (($row = fgetcsv($file)) !== false) {
                $text = isset($row[0]) ? trim($row[0]) : '';
                $mood = isset($row[1]) ? trim($row[1]) : '';
                if ($text !== '') {
                    $dup = $pdo->prepare("SELECT COUNT(*) FROM wisdom WHERE text=? AND category=?");
                    $dup->execute([$text, $_POST['csv_category']]);
                    if ($dup->fetchColumn() > 0) {
                        $skipped[] = $text;
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO wisdom (text, category, mood_tag) VALUES (?, ?, ?)");
                        $stmt->execute([$text, $_POST['csv_category'], $mood]);
                        $added++;
                    }
                }
            }
            fclose($file);
            $msg = "$added bulk wisdoms from file uploaded." . ($skipped ? " Skipped: ".count($skipped)." duplicates." : "");
            if ($skipped) $msg .= " Skipped: ".htmlspecialchars(implode(", ", $skipped));
        } else {
            $msg = "Upload a valid .csv or .txt file.";
        }
    }
    // Inline edit
    if ($_POST['mode'] === 'edit_row' && isset($_POST['id'])) {
        $stmt = $pdo->prepare("UPDATE wisdom SET text=?, category=?, mood_tag=? WHERE id=?");
        $stmt->execute([$_POST['text'], $_POST['category'], $_POST['mood_tag'], intval($_POST['id'])]);
        $msg = "Wisdom updated!";
    }
    // Mass activation/deactivation
    if ($_POST['mode'] === 'bulk_status' && !empty($_POST['chk']) && isset($_POST['set_active'])) {
        $ids = array_map('intval', $_POST['chk']);
        $ids_sql = implode(',', $ids);
        $set_status = intval($_POST['set_active']);
        $pdo->query("UPDATE wisdom SET is_active = $set_status WHERE id IN ($ids_sql)");
        $msg = "Selected wisdom status updated.";
    }
    // Delete
    if (isset($_POST['del_id'])) {
        $stmt = $pdo->prepare("DELETE FROM wisdom WHERE id=?");
        $stmt->execute([$_POST['del_id']]);
        $msg = "Wisdom deleted.";
    }
    // Export
    if ($_POST['mode'] === 'export' && !empty($_POST['export_ids'])) {
        $ids = array_map('intval', $_POST['export_ids']);
        $ids_sql = implode(',', $ids);
        $data = $pdo->query("SELECT * FROM wisdom WHERE id IN ($ids_sql)")->fetchAll(PDO::FETCH_ASSOC);
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="wisdom_export.csv"');
        $f = fopen('php://output', 'w');
        fputcsv($f, array_keys($data[0]));
        foreach ($data as $row) fputcsv($f, $row);
        fclose($f);
        exit;
    }
}

// Fetch all wisdom
$wis = $pdo->query("SELECT * FROM wisdom ORDER BY category, mood_tag, created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Wisdom - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
    body { font-family: Trebuchet MS, sans-serif; background: #fff; }
    .btn-primary { background: #FF6600; border: none; }
    .edit-row { background: #f9f9f9; }
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
        checkboxes = document.getElementsByName('chk[]');
        for(var i in checkboxes)
            checkboxes[i].checked = source.checked;
    }
    </script>
</head>
<body>
<?php include("header.php"); ?>
<div class="container mt-4">
    <h4>Manage Wisdom</h4>
    <?php if ($msg): ?><div class="alert alert-success"><?=htmlspecialchars($msg)?></div><?php endif; ?>

    <!-- Single add -->
    <form method="post" class="mb-3 row g-2">
        <input type="hidden" name="mode" value="single">
        <div class="col">
            <input type="text" name="text" class="form-control" placeholder="Wisdom/Quote/Text" required>
        </div>
        <div class="col">
            <input type="text" name="category" class="form-control" placeholder="Category (Morning, Evening, General)" required>
        </div>
        <div class="col">
            <input type="text" name="mood_tag" class="form-control" placeholder="Mood Tag (optional)">
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Add Wisdom</button>
        </div>
    </form>

    <!-- Bulk multiline paste -->
    <form method="post" class="mb-3 row g-2">
        <input type="hidden" name="mode" value="bulk_text">
        <div class="col-6">
            <textarea name="bulk_wisdom" class="form-control" rows="5" placeholder="Paste multiple wisdoms (one per line)"></textarea>
        </div>
        <div class="col">
            <input type="text" name="bulk_category" class="form-control" placeholder="Category" required>
        </div>
        <div class="col">
            <input type="text" name="bulk_mood_tag" class="form-control" placeholder="Mood Tag (optional)">
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
            <input type="text" name="csv_category" class="form-control" placeholder="Category" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Upload File</button>
        </div>
        <div class="col">
            <small>File format: wisdom,text[,mood_tag]</small>
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
        <button class="btn btn-success btn-sm ms-2" type="submit" onclick="this.form.mode.value='export';" name="export">Export Selected</button>
    </div>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th><input type="checkbox" onclick="toggleAll(this)"></th>
                <th>Text</th><th>Category</th><th>Mood Tag</th><th>Active</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>
        <?php foreach ($wis as $w): ?>
            <tr id="row<?=$w['id']?>">
                <td><input type="checkbox" name="chk[]" value="<?=$w['id']?>"></td>
                <td><?=htmlspecialchars($w['text'])?></td>
                <td><?=htmlspecialchars($w['category'])?></td>
                <td><?=htmlspecialchars($w['mood_tag'])?></td>
                <td><?=isset($w['is_active']) && $w['is_active']?'Yes':'No'?></td>
                <td>
                    <button type="button" class="btn btn-sm btn-info" onclick="toggleEdit(<?=$w['id']?>)">Edit</button>
                    <form method="post" style="display:inline">
                        <input type="hidden" name="del_id" value="<?=$w['id']?>">
                        <button class="btn btn-sm btn-danger" onclick="return confirm('Delete?')">Delete</button>
                    </form>
                </td>
            </tr>
            <tr class="edit-row" id="edit<?=$w['id']?>" style="display:none;">
                <form method="post">
                <input type="hidden" name="mode" value="edit_row">
                <input type="hidden" name="id" value="<?=$w['id']?>">
                <td></td>
                <td><input type="text" name="text" class="form-control" value="<?=htmlspecialchars($w['text'])?>" required></td>
                <td><input type="text" name="category" class="form-control" value="<?=htmlspecialchars($w['category'])?>" required></td>
                <td><input type="text" name="mood_tag" class="form-control" value="<?=htmlspecialchars($w['mood_tag'])?>"></td>
                <td></td>
                <td>
                    <button class="btn btn-primary btn-sm">Save</button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="cancelEdit(<?=$w['id']?>)">Cancel</button>
                </td>
                </form>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
    </form>
</div>
</body>
</html>