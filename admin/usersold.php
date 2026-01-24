<?php
session_start();
require_once '../db.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

$msg = '';
$upload_dir = 'user_uploads/';
$email_sent_count = 0; // for bulk "Email sent" indicator

// ---------------------------------------------------------------------
// Helper: get template directory / paths
// ---------------------------------------------------------------------
function getEmailTemplateDir() {
    // Lives in /abundance-alchemy/admin/email_templates
    $template_dir = __DIR__ . '/email_templates';
    if (!file_exists($template_dir)) {
        mkdir($template_dir, 0777, true);
    }
    return $template_dir;
}

function getSystemFromName() {
    $template_dir = getEmailTemplateDir();
    $from_path = $template_dir . '/from_name.txt';
    $default   = 'Abundant Admin';
    if (file_exists($from_path)) {
        $name = trim(file_get_contents($from_path));
        if ($name !== '') {
            return $name;
        }
    }
    return $default;
}

// ---------------------------------------------------------------------
// Helper: Welcome / Farewell emails
// ---------------------------------------------------------------------
function sendWelcomeEmail($email, $name, $overrideFromName = '') {
    if (!$email) return;

    $template_dir = getEmailTemplateDir();
    $welcome_path = $template_dir . '/welcome.txt';

    if (!file_exists($welcome_path)) {
        $default = "Hi {name},\n\nWelcome to Abundant Alchemy.\n\n"
                 . "We’re honored to walk with you in your I Am Practice.\n\n"
                 . "With gratitude,\nAbundant Alchemy";
        file_put_contents($welcome_path, $default);
    }

    $welcome_tpl = file_get_contents($welcome_path);
    $body = str_replace(
        array('{name}', '{email}'),
        array($name, $email),
        $welcome_tpl
    );

    $fromName   = $overrideFromName !== '' ? $overrideFromName : getSystemFromName();
    $fromHeader = "From: " . $fromName . " <admin@" . $_SERVER['SERVER_NAME'] . ">";

    @mail(
        $email,
        "Welcome to Abundant Alchemy",
        $body,
        $fromHeader
    );
}

function sendFarewellEmail($email, $name, $overrideFromName = '') {
    if (!$email) return;

    $template_dir  = getEmailTemplateDir();
    $farewell_path = $template_dir . '/farewell.txt';

    if (!file_exists($farewell_path)) {
        $default = "Hi {name},\n\nWe're sorry to see you go.\n\n"
                 . "Thank you for the time we shared on this journey.\n\n"
                 . "With appreciation,\nAbundant Alchemy";
        file_put_contents($farewell_path, $default);
    }

    $farewell_tpl = file_get_contents($farewell_path);
    $body = str_replace(
        array('{name}', '{email}'),
        array($name, $email),
        $farewell_tpl
    );

    $fromName   = $overrideFromName !== '' ? $overrideFromName : getSystemFromName();
    $fromHeader = "From: " . $fromName . " <admin@" . $_SERVER['SERVER_NAME'] . ">";

    @mail(
        $email,
        "Goodbye from Abundant Alchemy",
        $body,
        $fromHeader
    );
}

// ---------------------------------------------------------------------
// Password reset helpers (token creation kept, emails disabled below)
// ---------------------------------------------------------------------
function generateResetToken() {
    if (function_exists('random_bytes')) {
        return bin2hex(random_bytes(32));
    } elseif (function_exists('openssl_random_pseudo_bytes')) {
        return bin2hex(openssl_random_pseudo_bytes(32));
    } else {
        return bin2hex(md5(uniqid(mt_rand(), true)));
    }
}

/**
 * Create or reuse a password reset token for a user.
 * TTL: default 1440 minutes (24 hours).
 */
function createPasswordResetToken(PDO $pdo, $userId, $ttlMinutes = 1440) {
    // Reuse a valid, unused token if it exists
    $stmt = $pdo->prepare("
        SELECT token, expires_at
        FROM password_resets
        WHERE user_id = :uid
          AND used = 0
          AND expires_at > NOW()
        ORDER BY id DESC
        LIMIT 1
    ");
    $stmt->execute([':uid' => $userId]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        return $existing['token'];
    }

    // Otherwise, clear old tokens and create a new one
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
    $stmt->execute([$userId]);

    $token     = generateResetToken();
    $expiresAt = (new DateTime('+' . $ttlMinutes . ' minutes'))->format('Y-m-d H:i:s');

    $stmt = $pdo->prepare("
        INSERT INTO password_resets (user_id, token, expires_at)
        VALUES (:user_id, :token, :expires_at)
    ");
    $stmt->execute([
        ':user_id'    => $userId,
        ':token'      => $token,
        ':expires_at' => $expiresAt,
    ]);

    return $token;
}

/**
 * ADMIN PASSWORD RESET EMAIL IS TEMPORARILY DISABLED
 *
 * This function now returns immediately so the app stops sending
 * password reset emails from the admin panel.
 *
 * When you're ready later, you can re-enable by removing the early return
 * and restoring the old logic.
 */
function sendPasswordResetEmail(PDO $pdo, $userId, $email, $name, $overrideFromName = '') {
    if (!$email) return;

    // HARD KILL-SWITCH:
    return;

    // --- previous logic is intentionally disabled for now ---
}

// ---------------------------------------------------------------------
// Load current email templates and from name for the settings UI
// ---------------------------------------------------------------------
$template_dir  = getEmailTemplateDir();
$welcome_path  = $template_dir . '/welcome.txt';
$farewell_path = $template_dir . '/farewell.txt';
$from_path     = $template_dir . '/from_name.txt';

if (!file_exists($welcome_path)) {
    $default_welcome = "Hi {name},\n\nWelcome to Abundant Alchemy.\n\n"
                     . "We’re honored to walk with you in your I Am Practice.\n\n"
                     . "With gratitude,\nAbundant Alchemy";
    file_put_contents($welcome_path, $default_welcome);
}
if (!file_exists($farewell_path)) {
    $default_farewell = "Hi {name},\n\nWe're sorry to see you go.\n\n"
                      . "Thank you for the time we shared on this journey.\n\n"
                      . "With appreciation,\nAbundant Alchemy";
    file_put_contents($farewell_path, $default_farewell);
}
if (!file_exists($from_path)) {
    file_put_contents($from_path, "Abundant Admin");
}

$current_welcome_tpl  = file_get_contents($welcome_path);
$current_farewell_tpl = file_get_contents($farewell_path);
$current_from_name    = trim(file_get_contents($from_path));
if ($current_from_name === '') {
    $current_from_name = 'Abundant Admin';
}

// ---------------------------------------------------------------------
// Handle saving email templates / default from name
// ---------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_email_templates'])) {
    $new_from_name = isset($_POST['system_from_name']) ? trim($_POST['system_from_name']) : '';
    $new_welcome   = isset($_POST['welcome_template']) ? trim($_POST['welcome_template']) : '';
    $new_farewell  = isset($_POST['farewell_template']) ? trim($_POST['farewell_template']) : '';

    if ($new_from_name === '') {
        $new_from_name = 'Abundant Admin';
    }
    if ($new_welcome !== '') {
        file_put_contents($welcome_path, $new_welcome);
        $current_welcome_tpl = $new_welcome;
    }
    if ($new_farewell !== '') {
        file_put_contents($farewell_path, $new_farewell);
        $current_farewell_tpl = $new_farewell;
    }
    file_put_contents($from_path, $new_from_name);
    $current_from_name = $new_from_name;

    $msg = "Email settings updated.";
}

// ---------------------------------------------------------------------
// Bulk CSV Upload (also triggers welcome emails)
// ---------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['upload_bulk']) && !empty($_FILES['csv_file']['tmp_name'])) {
    $added   = 0;
    $skipped = array();
    $ext     = strtolower(pathinfo($_FILES['csv_file']['name'], PATHINFO_EXTENSION));

    if (($ext === 'csv' || $ext === 'txt') && is_uploaded_file($_FILES['csv_file']['tmp_name'])) {
        $file = fopen($_FILES['csv_file']['tmp_name'], 'r');
        while (($row = fgetcsv($file)) !== false) {
            $name     = isset($row[0]) ? trim($row[0]) : '';
            $email    = isset($row[1]) ? trim($row[1]) : '';
            $password = isset($row[2]) ? $row[2] : '';
            $level    = isset($row[3]) ? intval($row[3]) : 1;
            $streak   = isset($row[4]) ? intval($row[4]) : 0;
            $focus    = isset($row[5]) ? trim($row[5]) : '';
            $more     = isset($row[6]) ? trim($row[6]) : '';

            if (!$email) {
                continue;
            }

            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email=?");
            $stmt->execute(array($email));

            if ($stmt->fetchColumn() == 0) {
                $pw_hash = password_hash($password ? $password : 'ChangeMe123!', PASSWORD_DEFAULT);
                $pdo->prepare("INSERT INTO users (name, email, password_hash, level, streak, focus_area, more_info) VALUES (?, ?, ?, ?, ?, ?, ?)")
                    ->execute(array($name, $email, $pw_hash, $level, $streak, $focus, $more));
                $added++;

                sendWelcomeEmail($email, $name);
            } else {
                $skipped[] = $email;
            }
        }
        fclose($file);
        $msg = "$added users imported. " . ($skipped ? "Skipped: " . htmlspecialchars(implode(", ", $skipped)) : "");
    } else {
        $msg = "Upload a valid .csv or .txt file.";
    }
}

// ---------------------------------------------------------------------
// Bulk Actions: delete, resetpw (disabled), export, email selected
// ---------------------------------------------------------------------
if (isset($_POST['bulk_action']) && $_POST['bulk_action'] !== '') {
    $action  = $_POST['bulk_action'];
    $ids     = isset($_POST['chk']) ? array_map('intval', (array)$_POST['chk']) : array();
    $ids_sql = $ids ? implode(',', $ids) : '';

    if (in_array($action, array('delete', 'resetpw', 'export', 'email')) && empty($ids)) {
        $msg = "No users selected for bulk action.";
    } else {
        if ($action === 'delete' && $ids_sql) {
            $pdo->query("DELETE FROM users WHERE id IN ($ids_sql)");
            $msg = "Selected users deleted.";
        } elseif ($action === 'resetpw' && $ids_sql) {
            // TEMP: do not send any reset emails to prevent spam
            $msg = "Password reset email sending is temporarily disabled for bulk actions.";
        } elseif ($action === 'export' && $ids_sql) {
            $data = $pdo->query("SELECT * FROM users WHERE id IN ($ids_sql)")->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($data)) {
                header('Content-Type: text/csv');
                header('Content-Disposition: attachment; filename="users_export.csv"');
                $f = fopen('php://output', 'w');
                fputcsv($f, array_keys($data[0]));
                foreach ($data as $row) fputcsv($f, $row);
                fclose($f);
                exit;
            }
        } elseif ($action === 'email' && $ids_sql) {
            $subject       = isset($_POST['bulk_email_subject']) ? trim($_POST['bulk_email_subject']) : '';
            $bodyTpl       = isset($_POST['bulk_email_body']) ? trim($_POST['bulk_email_body']) : '';
            $bulkFromName  = isset($_POST['bulk_email_from_name']) ? trim($_POST['bulk_email_from_name']) : '';

            if ($subject === '' || $bodyTpl === '') {
                $msg = "Please enter a subject and message before sending email.";
            } else {
                $stmt = $pdo->query("SELECT id, name, email, level, streak, focus_area FROM users WHERE id IN ($ids_sql)");
                $recipients = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $sent       = 0;
                $fromName   = $bulkFromName !== '' ? $bulkFromName : getSystemFromName();
                $fromHeader = "From: " . $fromName . " <admin@" . $_SERVER['SERVER_NAME'] . ">";

                foreach ($recipients as $usr) {
                    if (empty($usr['email'])) {
                        continue;
                    }
                    $body = str_replace(
                        array('{name}', '{email}', '{level}', '{streak}', '{focus}'),
                        array(
                            $usr['name'],
                            $usr['email'],
                            $usr['level'],
                            $usr['streak'],
                            $usr['focus_area']
                        ),
                        $bodyTpl
                    );
                    @mail(
                        $usr['email'],
                        $subject,
                        $body,
                        $fromHeader
                    );
                    $sent++;
                }
                $email_sent_count = $sent;
                $msg = "Email sent to $sent user(s).";
            }
        }
    }
}

// ---------------------------------------------------------------------
// Individual row actions: reset (disabled) / delete (with farewell) / edit
// ---------------------------------------------------------------------
if (isset($_POST['reset_id'])) {
    // TEMP: do not send any reset emails to prevent spam
    $msg = "Password reset email sending is temporarily disabled for individual users.";
}

if (isset($_POST['delete_id'])) {
    $deleteId = (int)$_POST['delete_id'];

    $stmt = $pdo->prepare("SELECT name, email FROM users WHERE id=?");
    $stmt->execute(array($deleteId));
    $usr = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usr && !empty($usr['email'])) {
        sendFarewellEmail($usr['email'], $usr['name']);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id=?");
    $stmt->execute(array($deleteId));
    $msg = "User deleted" . ($usr && !empty($usr['email']) ? " and farewell email sent." : ".");
}

if (isset($_POST['update_id'])) {
    $id    = intval($_POST['update_id']);
    $name  = trim($_POST['name']);
    $email = trim($_POST['email']);
    $level = intval($_POST['level']);
    $streak = intval($_POST['streak']);
    $focus  = trim($_POST['focus_area']);
    $more   = trim($_POST['more_info']);
    $profile_img = isset($_POST['old_profile_img']) ? $_POST['old_profile_img'] : '';

    if (!empty($_FILES['profile_img']['name'])) {
        $img_name = 'u_' . $id . '_' . time() . '.' . pathinfo($_FILES['profile_img']['name'], PATHINFO_EXTENSION);
        $img_path = $upload_dir . $img_name;
        if (move_uploaded_file($_FILES['profile_img']['tmp_name'], $img_path)) {
            $profile_img = $img_name;
        }
    }

    if (!empty($_POST['password'])) {
        $pw_hash = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET name=?, email=?, level=?, streak=?, focus_area=?, password_hash=?, profile_img=?, more_info=? WHERE id=?");
        $stmt->execute(array($name, $email, $level, $streak, $focus, $pw_hash, $profile_img, $more, $id));
        $msg = "User info and password updated!";
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name=?, email=?, level=?, streak=?, focus_area=?, profile_img=?, more_info=? WHERE id=?");
        $stmt->execute(array($name, $email, $level, $streak, $focus, $profile_img, $more, $id));
        $msg = "User info updated!";
    }
}

// ---------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------
$page     = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$per_page = 50;
$offset   = ($page - 1) * $per_page;
$total    = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

$stmt = $pdo->prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?");
$stmt->bindValue(1, $per_page, PDO::PARAM_INT);
$stmt->bindValue(2, $offset,   PDO::PARAM_INT);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

$total_pages = ceil($total / $per_page);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Manage Users - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        :root {
            --aa-primary: #ff6a1a;
            --aa-primary-soft: rgba(255,106,26,0.08);
            --aa-bg: #f5f6fa;
        }

        body {
            font-family: "Trebuchet MS", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #fff 0, #f5f6fa 45%, #eceff4 100%);
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

        .aa-page-title h4 {
            margin: 0;
            font-weight: 700;
            letter-spacing: .02em;
        }

        .aa-page-subtitle {
            font-size: .9rem;
            color: #6c757d;
        }

        .aa-metrics {
            display: flex;
            flex-wrap: wrap;
            gap: .75rem;
            align-items: center;
        }

        .aa-metric-pill {
            padding: .35rem .75rem;
            border-radius: 999px;
            background: #fff;
            border: 1px solid rgba(0,0,0,.04);
            box-shadow: 0 2px 4px rgba(15,23,42,.04);
            font-size: .82rem;
            display: inline-flex;
            align-items: center;
            gap: .35rem;
        }

        .aa-metric-pill strong {
            font-weight: 700;
        }

        .aa-metric-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--aa-primary);
        }

        .btn-primary {
            background: var(--aa-primary);
            border-color: var(--aa-primary);
        }

        .btn-primary:hover {
            background: #e95e16;
            border-color: #e95e16;
        }

        .aa-card-main {
            border-radius: 1rem;
            border: 1px solid rgba(15,23,42,.05);
            box-shadow:
                0 18px 45px rgba(15,23,42,.08),
                0 1px 0 rgba(255,255,255,.8) inset;
            overflow: hidden;
        }

        .aa-card-main .card-header {
            background: linear-gradient(90deg, #ffffff, #fff7f2);
            border-bottom: 1px solid rgba(0,0,0,.02);
        }

        .aa-card-main .card-body {
            background: #ffffff;
        }

        .table {
            font-size: .9rem;
        }

        .table thead th {
            white-space: nowrap;
            font-size: .78rem;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: #6c757d;
            background: #f8fafc;
        }

        .table tbody tr:hover {
            background-color: #fff9f5;
        }

        .avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 0 0 1px #fff, 0 0 0 1px rgba(15,23,42,.09);
        }

        .avatar-placeholder {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #cfd4e1, #e2e7f0);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: .7rem;
            font-weight: 600;
            color: #fff;
        }

        .edit-form {
            background: #fcfcfc;
            border-radius: .75rem;
            padding: .75rem .9rem;
            margin-bottom: .35rem;
            border: 1px dashed rgba(148,163,184,.7);
        }

        .edit-form .form-control {
            font-size: .82rem;
        }

        .aa-bulk-row {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;
            align-items: center;
        }

        .aa-bulk-row > * {
            flex-shrink: 0;
        }

        .aa-bulk-row select {
            min-width: 160px;
        }

        .aa-bulk-row input[type="file"] {
            max-width: 280px;
        }

        .bulk-email-help, .bulk-email-placeholder-tip {
            font-size: .8rem;
        }

        .aa-autorefresh-toggle {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            font-size: .8rem;
            cursor: pointer;
            user-select: none;
        }

        .aa-autorefresh-toggle input {
            cursor: pointer;
        }

        .aa-badge-level {
            font-size: .72rem;
            padding: .25rem .55rem;
            border-radius: 999px;
        }

        @media (max-width: 992px) {
            .aa-page-header {
                align-items: flex-start;
            }
        }
    </style>
    <script>
        let usersEditOpen = false;
        let usersRefreshTimer = null;

        function toggleEdit(id) {
            const row = document.getElementById('row' + id);
            const edit = document.getElementById('edit' + id);
            if (row && edit) {
                row.style.display  = 'none';
                edit.style.display = 'table-row';
                usersEditOpen = true;
            }
        }

        function cancelEdit(id) {
            const row = document.getElementById('row' + id);
            const edit = document.getElementById('edit' + id);
            if (row && edit) {
                row.style.display  = 'table-row';
                edit.style.display = 'none';
                usersEditOpen = false;
            }
        }

        function toggleAll(source) {
            const checkboxes = document.getElementsByName('chk[]');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = source.checked;
            }
        }

        function aaStartAutoRefresh() {
            if (usersRefreshTimer) return;
            usersRefreshTimer = setInterval(function () {
                if (!usersEditOpen) {
                    location.reload();
                }
            }, 30000);
        }

        function aaStopAutoRefresh() {
            if (usersRefreshTimer) {
                clearInterval(usersRefreshTimer);
                usersRefreshTimer = null;
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            const autoToggle = document.getElementById('aa-auto-refresh');
            if (!autoToggle) return;

            const saved = localStorage.getItem('aa_users_auto_refresh');
            if (saved === '1') {
                autoToggle.checked = true;
                aaStartAutoRefresh();
            }

            autoToggle.addEventListener('change', function () {
                if (this.checked) {
                    localStorage.setItem('aa_users_auto_refresh', '1');
                    aaStartAutoRefresh();
                } else {
                    localStorage.setItem('aa_users_auto_refresh', '0');
                    aaStopAutoRefresh();
                }
            });
        });
    </script>
</head>
<body>
<?php include("header.php"); ?>
<div class="container py-4">

    <!-- Page header -->
    <div class="aa-page-header">
        <div class="aa-page-title">
            <h4>Manage Users</h4>
            <div class="aa-page-subtitle">
                View, edit, and connect with Abundance Alchemy members.
            </div>
        </div>
        <div class="aa-metrics">
            <span class="aa-metric-pill">
                <span class="aa-metric-dot"></span>
                <span><strong><?= (int)$total ?></strong> users</span>
            </span>
            <span class="aa-metric-pill">
                Last updated:
                <strong><?= date('M j, Y g:i a'); ?></strong>
            </span>
            <label class="aa-autorefresh-toggle">
                <input type="checkbox" id="aa-auto-refresh">
                <span>Auto-refresh every 30s</span>
            </label>
            <a href="add-user.php" class="btn btn-primary btn-sm">
                + Add User
            </a>
        </div>
    </div>

    <?php if ($msg): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <?= htmlspecialchars($msg) ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    <?php endif; ?>

    <!-- Main form: bulk actions, table, bulk email -->
    <form method="post" enctype="multipart/form-data">
        <div class="card aa-card-main mb-4">
            <div class="card-header">
                <div class="aa-bulk-row">
                    <!-- Bulk actions -->
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        <select name="bulk_action" class="form-select form-select-sm">
                            <option value="">Bulk Action</option>
                            <option value="delete">Delete Selected</option>
                            <option value="resetpw">Send Reset Link to Selected (DISABLED)</option>
                            <option value="export">Export Selected</option>
                        </select>
                        <button class="btn btn-primary btn-sm">
                            Apply
                        </button>
                    </div>

                    <!-- CSV Import -->
                    <div class="d-flex flex-wrap gap-2 align-items-center ms-lg-3">
                        <input type="file" name="csv_file" accept=".csv,.txt"
                               class="form-control form-control-sm">
                        <button class="btn btn-outline-secondary btn-sm" name="upload_bulk">
                            Bulk Import (CSV/TXT)
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover table-striped mb-0 align-middle">
                        <thead>
                        <tr>
                            <th style="width:32px;">
                                <input type="checkbox" onclick="toggleAll(this)">
                            </th>
                            <th>Avatar</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Level</th>
                            <th>Streak</th>
                            <th>Focus</th>
                            <th>More Info</th>
                            <th>Created</th>
                            <th style="width: 190px;">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($users as $u): ?>
                            <tr id="row<?= (int)$u['id'] ?>">
                                <td>
                                    <input type="checkbox" name="chk[]" value="<?= (int)$u['id'] ?>" class="chk">
                                </td>
                                <td>
                                    <?php if (!empty($u['profile_img'])): ?>
                                        <img src="user_uploads/<?= htmlspecialchars($u['profile_img']) ?>" class="avatar" alt="Avatar">
                                    <?php else: ?>
                                        <span class="avatar-placeholder">
                                            <?php
                                            $initials = '';
                                            if (!empty($u['name'])) {
                                                $parts = preg_split('/\s+/', trim($u['name']));
                                                $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr($parts[1] ?? '', 0, 1));
                                            }
                                            echo htmlspecialchars($initials ?: 'AA');
                                            ?>
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td><?= htmlspecialchars($u['name']) ?></td>
                                <td><a href="mailto:<?= htmlspecialchars($u['email']) ?>"><?= htmlspecialchars($u['email']) ?></a></td>
                                <td>
                                    <span class="badge bg-light text-dark border aa-badge-level">
                                        Level <?= (int)$u['level'] ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="badge bg-secondary-subtle text-dark">
                                        <?= (int)$u['streak'] ?> day(s)
                                    </span>
                                </td>
                                <td><?= htmlspecialchars($u['focus_area']) ?></td>
                                <td><?= htmlspecialchars(isset($u['more_info']) ? $u['more_info'] : '') ?></td>
                                <td><?= htmlspecialchars($u['created_at']) ?></td>
                                <td>
                                    <div class="btn-group btn-group-sm" role="group">
                                        <button class="btn btn-outline-warning"
                                                name="reset_id"
                                                value="<?= (int)$u['id'] ?>"
                                                onclick="return confirm('Password reset emails are temporarily disabled. Continue?')">
                                            Reset PW
                                        </button>
                                        <button class="btn btn-outline-danger"
                                                name="delete_id"
                                                value="<?= (int)$u['id'] ?>"
                                                onclick="return confirm('Delete this user? This cannot be undone.')">
                                            Delete
                                        </button>
                                        <button class="btn btn-outline-info"
                                                type="button"
                                                onclick="toggleEdit(<?= (int)$u['id'] ?>)">
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr class="edit-row" id="edit<?= (int)$u['id'] ?>" style="display:none;">
                                <td colspan="10">
                                    <div class="edit-form row g-2 align-items-center">
                                        <input type="hidden" name="update_id" value="<?= (int)$u['id'] ?>">
                                        <input type="hidden" name="old_profile_img" value="<?= htmlspecialchars($u['profile_img']) ?>">

                                        <div class="col-12 col-md-3 col-lg-2">
                                            <input type="text" name="name" class="form-control form-control-sm"
                                                   value="<?= htmlspecialchars($u['name']) ?>" placeholder="Name" required>
                                        </div>
                                        <div class="col-12 col-md-4 col-lg-3">
                                            <input type="email" name="email" class="form-control form-control-sm"
                                                   value="<?= htmlspecialchars($u['email']) ?>" placeholder="Email" required>
                                        </div>
                                        <div class="col-6 col-md-2 col-lg-1">
                                            <input type="number" name="level" class="form-control form-control-sm"
                                                   min="1" value="<?= (int)$u['level'] ?>" placeholder="Level">
                                        </div>
                                        <div class="col-6 col-md-2 col-lg-1">
                                            <input type="number" name="streak" class="form-control form-control-sm"
                                                   min="0" value="<?= (int)$u['streak'] ?>" placeholder="Streak">
                                        </div>
                                        <div class="col-12 col-md-4 col-lg-2">
                                            <input type="text" name="focus_area" class="form-control form-control-sm"
                                                   value="<?= htmlspecialchars($u['focus_area']) ?>" placeholder="Focus Area">
                                        </div>
                                        <div class="col-12 col-md-4 col-lg-2">
                                            <input type="text" name="more_info" class="form-control form-control-sm"
                                                   placeholder="More Info"
                                                   value="<?= htmlspecialchars(isset($u['more_info']) ? $u['more_info'] : '') ?>">
                                        </div>
                                        <div class="col-12 col-md-4 col-lg-2">
                                            <input type="file" name="profile_img" class="form-control form-control-sm" accept="image/*">
                                            <?php if (!empty($u['profile_img'])): ?>
                                                <img src="user_uploads/<?= htmlspecialchars($u['profile_img']) ?>"
                                                     class="avatar mt-2" alt="Avatar preview">
                                            <?php endif; ?>
                                        </div>
                                        <div class="col-12 col-md-4 col-lg-2">
                                            <input type="password" name="password" class="form-control form-control-sm"
                                                   placeholder="New Password (optional)">
                                        </div>
                                        <div class="col-auto">
                                            <button class="btn btn-primary btn-sm"
                                                    onclick="return confirm('Save changes for this user?')">
                                                Save
                                            </button>
                                            <button class="btn btn-secondary btn-sm" type="button"
                                                    onclick="cancelEdit(<?= (int)$u['id'] ?>)">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <?php if ($total_pages > 1): ?>
                    <div class="px-3 py-2 border-top bg-light">
                        <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <?php for ($p = 1; $p <= $total_pages; $p++): ?>
                                    <li class="page-item <?= $p == $page ? 'active' : '' ?>">
                                        <a class="page-link" href="?page=<?= $p ?>"><?= $p ?></a>
                                    </li>
                                <?php endfor; ?>
                            </ul>
                        </nav>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Bulk Email Section -->
        <div class="card p-3 mb-4">
            <h6 class="mb-2">Bulk Email to Selected Users</h6>
            <p class="bulk-email-help mb-2">
                Select one or more users above, then compose your message here and click
                <strong>Send Email to Selected</strong>.
            </p>
            <div class="mb-2">
                <label class="form-label mb-1">From Name</label>
                <input type="text" name="bulk_email_from_name" class="form-control form-control-sm"
                       value="<?= htmlspecialchars($current_from_name) ?>"
                       placeholder="e.g., Abundant Admin, Abundance Alchemist">
            </div>
            <div class="mb-2">
                <label class="form-label mb-1">Subject</label>
                <input type="text" name="bulk_email_subject" class="form-control form-control-sm"
                       placeholder="e.g., A note from Abundant Alchemy">
            </div>
            <div class="mb-1">
                <label class="form-label mb-1">Message</label>
                <textarea name="bulk_email_body" class="form-control form-control-sm" rows="4"
                          placeholder="Dear {name},&#10;&#10;Your current level is {level} with a streak of {streak} days focused on {focus}."></textarea>
            </div>
            <p class="bulk-email-placeholder-tip mb-2">
                Available placeholders:
                <code>{name}</code>, <code>{email}</code>, <code>{level}</code>, <code>{streak}</code>, <code>{focus}</code>
            </p>
            <button
                type="submit"
                name="bulk_action"
                value="email"
                class="btn btn-outline-primary btn-sm"
            >
                Send Email to Selected
            </button>

            <?php if ($email_sent_count > 0): ?>
                <div class="alert alert-success mt-2 mb-0 py-1 px-2" style="font-size:0.85rem;">
                    Email sent to <?= $email_sent_count ?> user(s).
                </div>
            <?php endif; ?>
        </div>
    </form>

    <!-- System Email Settings (separate form) -->
    <div class="card mb-4">
        <div class="card-header">
            <strong>System Email Settings</strong>
        </div>
        <div class="card-body">
            <form method="post">
                <div class="mb-3">
                    <label class="form-label">Default From Name</label>
                    <input type="text" name="system_from_name" class="form-control form-control-sm"
                           value="<?= htmlspecialchars($current_from_name) ?>"
                           placeholder="e.g., Abundant Admin, Abundance Alchemist">
                </div>
                <div class="mb-3">
                    <label class="form-label">Welcome Email Template</label>
                    <textarea name="welcome_template" class="form-control form-control-sm" rows="4"><?= htmlspecialchars($current_welcome_tpl) ?></textarea>
                    <small class="text-muted">
                        Placeholders: {name}, {email}
                    </small>
                </div>
                <div class="mb-3">
                    <label class="form-label">Farewell Email Template</label>
                    <textarea name="farewell_template" class="form-control form-control-sm" rows="4"><?= htmlspecialchars($current_farewell_tpl) ?></textarea>
                    <small class="text-muted">
                        Placeholders: {name}, {email}
                    </small>
                </div>
                <button type="submit" name="save_email_templates" class="btn btn-primary btn-sm">
                    Save Email Settings
                </button>
            </form>
        </div>
    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>