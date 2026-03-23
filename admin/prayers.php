<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../api/helpers.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

aa_ensure_prayer_content_table($pdo);
aa_seed_default_prayer_content($pdo);
aa_ensure_user_prayers_table($pdo);

$flash = '';
$validPaths = aa_allowed_prayer_paths();
$validTypes = ['guide_step', 'session_prayer'];

$normalizePath = static function (string $value) use ($validPaths): string {
    $candidate = strtolower(trim($value));
    return in_array($candidate, $validPaths, true) ? $candidate : 'universal';
};

$normalizeType = static function (string $value) use ($validTypes): string {
    $candidate = strtolower(trim($value));
    return in_array($candidate, $validTypes, true) ? $candidate : 'session_prayer';
};

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    aa_require_valid_csrf();
    $mode = (string)($_POST['mode'] ?? '');

    if ($mode === 'add_content') {
        $pathKey = $normalizePath((string)($_POST['path_key'] ?? 'universal'));
        $contentType = $normalizeType((string)($_POST['content_type'] ?? 'session_prayer'));
        $sortOrder = max(1, (int)($_POST['sort_order'] ?? 1));
        $title = trim((string)($_POST['title'] ?? ''));
        $body = trim((string)($_POST['body'] ?? ''));

        if ($body !== '') {
            $stmt = $pdo->prepare('
                INSERT INTO prayer_content (path_key, content_type, sort_order, title, body, is_active)
                VALUES (:path_key, :content_type, :sort_order, :title, :body, 1)
            ');
            $stmt->execute([
                ':path_key' => $pathKey,
                ':content_type' => $contentType,
                ':sort_order' => $sortOrder,
                ':title' => $title,
                ':body' => $body,
            ]);
            $flash = 'Prayer content added.';
        }
    }

    if ($mode === 'edit_content') {
        $id = (int)($_POST['id'] ?? 0);
        $pathKey = $normalizePath((string)($_POST['path_key'] ?? 'universal'));
        $contentType = $normalizeType((string)($_POST['content_type'] ?? 'session_prayer'));
        $sortOrder = max(1, (int)($_POST['sort_order'] ?? 1));
        $title = trim((string)($_POST['title'] ?? ''));
        $body = trim((string)($_POST['body'] ?? ''));
        if ($id > 0 && $body !== '') {
            $stmt = $pdo->prepare('
                UPDATE prayer_content
                SET path_key = :path_key,
                    content_type = :content_type,
                    sort_order = :sort_order,
                    title = :title,
                    body = :body
                WHERE id = :id
            ');
            $stmt->execute([
                ':id' => $id,
                ':path_key' => $pathKey,
                ':content_type' => $contentType,
                ':sort_order' => $sortOrder,
                ':title' => $title,
                ':body' => $body,
            ]);
            $flash = 'Prayer content updated.';
        }
    }

    if ($mode === 'toggle_content') {
        $id = (int)($_POST['id'] ?? 0);
        $isActive = isset($_POST['is_active']) && (int)$_POST['is_active'] === 1 ? 1 : 0;
        if ($id > 0) {
            $stmt = $pdo->prepare('UPDATE prayer_content SET is_active = :is_active WHERE id = :id');
            $stmt->execute([
                ':id' => $id,
                ':is_active' => $isActive,
            ]);
            $flash = 'Prayer content status updated.';
        }
    }

    if ($mode === 'delete_user_prayer') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare('UPDATE user_prayers SET is_active = 0 WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $flash = 'User prayer removed.';
        }
    }
}

$contentRows = $pdo->query('
    SELECT id, path_key, content_type, sort_order, title, body, is_active, updated_at
    FROM prayer_content
    ORDER BY path_key ASC, content_type ASC, sort_order ASC, id ASC
')->fetchAll(PDO::FETCH_ASSOC);

$userPrayerRows = $pdo->query('
    SELECT id, user_id, user_email, path_key, title, body, is_active, updated_at
    FROM user_prayers
    WHERE is_active = 1
    ORDER BY updated_at DESC, id DESC
    LIMIT 100
')->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Prayers - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
    body { font-family: Trebuchet MS, sans-serif; background: #fff; }
    .btn-primary { background: #FF6600; border: none; }
    .edit-row { background: #f9f9f9; }
    textarea { min-height: 120px; }
    </style>
    <script>
    function toggleEdit(id) {
        document.getElementById('row' + id).style.display = 'none';
        document.getElementById('edit' + id).style.display = 'table-row';
    }
    function cancelEdit(id) {
        document.getElementById('row' + id).style.display = 'table-row';
        document.getElementById('edit' + id).style.display = 'none';
    }
    </script>
</head>
<body>
<?php include 'header.php'; ?>
<div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="mb-0">Manage Prayer Content</h4>
        <span class="badge bg-secondary">Curated + User Prayer Support</span>
    </div>

    <?php if ($flash !== ''): ?>
        <div class="alert alert-success"><?=htmlspecialchars($flash, ENT_QUOTES, 'UTF-8')?></div>
    <?php endif; ?>

    <div class="card mb-4">
        <div class="card-body">
            <h5 class="card-title">Add Curated Prayer Content</h5>
            <form method="post" class="row g-3">
                <?php aa_csrf_field(); ?>
                <input type="hidden" name="mode" value="add_content">
                <div class="col-md-3">
                    <label class="form-label">Path</label>
                    <select name="path_key" class="form-select">
                        <?php foreach ($validPaths as $pathKey): ?>
                            <option value="<?=htmlspecialchars($pathKey, ENT_QUOTES, 'UTF-8')?>"><?=htmlspecialchars(ucfirst($pathKey), ENT_QUOTES, 'UTF-8')?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Type</label>
                    <select name="content_type" class="form-select">
                        <option value="guide_step">Guide Step</option>
                        <option value="session_prayer">Session Prayer</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Order</label>
                    <input type="number" min="1" name="sort_order" value="1" class="form-control">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Title (optional)</label>
                    <input type="text" name="title" class="form-control" maxlength="255">
                </div>
                <div class="col-12">
                    <label class="form-label">Body</label>
                    <textarea name="body" class="form-control" required></textarea>
                </div>
                <div class="col-12">
                    <button class="btn btn-primary">Add Prayer Content</button>
                </div>
            </form>
        </div>
    </div>

    <div class="card mb-4">
        <div class="card-body">
            <h5 class="card-title">Curated Prayer Content</h5>
            <table class="table table-bordered align-middle">
                <thead>
                    <tr>
                        <th>Path</th>
                        <th>Type</th>
                        <th>Order</th>
                        <th>Body</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($contentRows as $row): ?>
                        <tr id="row<?=$row['id']?>">
                            <td><?=htmlspecialchars($row['path_key'], ENT_QUOTES, 'UTF-8')?></td>
                            <td><?=htmlspecialchars($row['content_type'], ENT_QUOTES, 'UTF-8')?></td>
                            <td><?=$row['sort_order']?></td>
                            <td>
                                <?php if (!empty($row['title'])): ?>
                                    <div class="fw-bold mb-1"><?=htmlspecialchars($row['title'], ENT_QUOTES, 'UTF-8')?></div>
                                <?php endif; ?>
                                <?=nl2br(htmlspecialchars($row['body'], ENT_QUOTES, 'UTF-8'))?>
                            </td>
                            <td><?=$row['is_active'] ? 'Active' : 'Inactive'?></td>
                            <td class="text-nowrap">
                                <button type="button" class="btn btn-sm btn-info" onclick="toggleEdit(<?=$row['id']?>)">Edit</button>
                                <form method="post" style="display:inline">
                                    <?php aa_csrf_field(); ?>
                                    <input type="hidden" name="mode" value="toggle_content">
                                    <input type="hidden" name="id" value="<?=$row['id']?>">
                                    <input type="hidden" name="is_active" value="<?=$row['is_active'] ? '0' : '1'?>">
                                    <button class="btn btn-sm btn-outline-secondary"><?=$row['is_active'] ? 'Deactivate' : 'Activate'?></button>
                                </form>
                            </td>
                        </tr>
                        <tr class="edit-row" id="edit<?=$row['id']?>" style="display:none;">
                            <td colspan="6">
                                <form method="post" class="row g-2">
                                    <?php aa_csrf_field(); ?>
                                    <input type="hidden" name="mode" value="edit_content">
                                    <input type="hidden" name="id" value="<?=$row['id']?>">
                                    <div class="col-md-2">
                                        <select name="path_key" class="form-select">
                                            <?php foreach ($validPaths as $pathKey): ?>
                                                <option value="<?=htmlspecialchars($pathKey, ENT_QUOTES, 'UTF-8')?>" <?=$row['path_key'] === $pathKey ? 'selected' : ''?>><?=htmlspecialchars(ucfirst($pathKey), ENT_QUOTES, 'UTF-8')?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <select name="content_type" class="form-select">
                                            <?php foreach ($validTypes as $type): ?>
                                                <option value="<?=htmlspecialchars($type, ENT_QUOTES, 'UTF-8')?>" <?=$row['content_type'] === $type ? 'selected' : ''?>><?=htmlspecialchars($type, ENT_QUOTES, 'UTF-8')?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-1">
                                        <input type="number" min="1" name="sort_order" value="<?=$row['sort_order']?>" class="form-control">
                                    </div>
                                    <div class="col-md-3">
                                        <input type="text" name="title" value="<?=htmlspecialchars($row['title'], ENT_QUOTES, 'UTF-8')?>" class="form-control" maxlength="255" placeholder="Title (optional)">
                                    </div>
                                    <div class="col-md-4">
                                        <textarea name="body" class="form-control" required><?=htmlspecialchars($row['body'], ENT_QUOTES, 'UTF-8')?></textarea>
                                    </div>
                                    <div class="col-12">
                                        <button class="btn btn-primary btn-sm">Save</button>
                                        <button type="button" class="btn btn-secondary btn-sm" onclick="cancelEdit(<?=$row['id']?>)">Cancel</button>
                                    </div>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="card mb-5">
        <div class="card-body">
            <h5 class="card-title">Recent User Prayers</h5>
            <table class="table table-bordered align-middle">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Path</th>
                        <th>Prayer</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($userPrayerRows as $row): ?>
                        <tr>
                            <td><?=htmlspecialchars((string)($row['user_email'] ?: ('#' . $row['user_id'])), ENT_QUOTES, 'UTF-8')?></td>
                            <td><?=htmlspecialchars($row['path_key'], ENT_QUOTES, 'UTF-8')?></td>
                            <td>
                                <?php if (!empty($row['title'])): ?>
                                    <div class="fw-bold mb-1"><?=htmlspecialchars($row['title'], ENT_QUOTES, 'UTF-8')?></div>
                                <?php endif; ?>
                                <?=nl2br(htmlspecialchars($row['body'], ENT_QUOTES, 'UTF-8'))?>
                            </td>
                            <td><?=htmlspecialchars((string)$row['updated_at'], ENT_QUOTES, 'UTF-8')?></td>
                            <td>
                                <form method="post">
                                    <?php aa_csrf_field(); ?>
                                    <input type="hidden" name="mode" value="delete_user_prayer">
                                    <input type="hidden" name="id" value="<?=$row['id']?>">
                                    <button class="btn btn-sm btn-danger" onclick="return confirm('Remove this user prayer from active use?')">Remove</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
