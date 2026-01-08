<?php
session_start();
require_once '../db.php';
if (!isset($_SESSION['admin_id'])) { header("Location: login.php"); exit; }

$upload_dir = 'user_uploads/';
$msg = '';
$welcome_path = __DIR__ . '/email_templates/welcome.txt';
if (!is_dir(dirname($welcome_path))) mkdir(dirname($welcome_path), 0777, true);
// Default template if not exists
if (!file_exists($welcome_path)) file_put_contents($welcome_path, "Welcome {name}!\n\nThank you for joining Abundance Alchemy.");

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'add') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $level = intval($_POST['level']);
    $streak = intval($_POST['streak']);
    $focus = trim($_POST['focus_area']);
    $more = trim($_POST['more_info']);
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email=?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        $msg = "User with that email already exists!";
    } else {
        $pw_hash = password_hash($password, PASSWORD_DEFAULT);
        $profile_img = '';
        if (!empty($_FILES['profile_img']['name'])) {
            $img_name = 'u_' . time() . '_' . rand(1,9999) . '.' . pathinfo($_FILES['profile_img']['name'], PATHINFO_EXTENSION);
            $img_path = $upload_dir . $img_name;
            if (move_uploaded_file($_FILES['profile_img']['tmp_name'], $img_path)) {
                $profile_img = $img_name;
            }
        }
        $pdo->prepare("INSERT INTO users (name, email, password_hash, level, streak, focus_area, profile_img, more_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$name, $email, $pw_hash, $level, $streak, $focus, $profile_img, $more]);

        // WELCOME EMAIL
        $email_tpl = file_get_contents($welcome_path);
        $body = str_replace(['{name}','{email}'], [$name, $email], $email_tpl);
        @mail($email, "Welcome to Abundance Alchemy", $body, "From: admin@".$_SERVER['SERVER_NAME']);
        $msg = "User added and welcome email sent!";
    }
}

// Handle template edit/save
if (isset($_POST['save_template'])) {
    $tpl = $_POST['welcome_template'] ?? '';
    file_put_contents($welcome_path, $tpl);
    $msg = "Welcome email template updated.";
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Add User - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
</head>
<body>
<?php include("header.php"); ?>
<div class="container mt-4" style="max-width:640px;">
    <a href="users.php" class="btn btn-secondary mb-3">&larr; Back to Users</a>
    <h4>Add User</h4>
    <?php if ($msg): ?><div class="alert alert-info"><?=htmlspecialchars($msg)?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" class="mb-5 row g-2">
        <input type="hidden" name="mode" value="add">
        <div class="col-6">
            <input type="text" name="name" required class="form-control" placeholder="Name">
        </div>
        <div class="col-6">
            <input type="email" name="email" required class="form-control" placeholder="Email">
        </div>
        <div class="col-6">
            <input type="password" name="password" required class="form-control" placeholder="Password">
        </div>
        <div class="col-3">
            <input type="number" name="level" min="1" value="1" class="form-control" placeholder="Level">
        </div>
        <div class="col-3">
            <input type="number" name="streak" min="0" value="0" class="form-control" placeholder="Streak">
        </div>
        <div class="col-6">
            <input type="text" name="focus_area" class="form-control" placeholder="Focus Area">
        </div>
        <div class="col-6">
            <input type="file" name="profile_img" class="form-control" accept="image/*">
        </div>
        <div class="col-12">
            <input type="text" name="more_info" class="form-control" placeholder="More Info">
        </div>
        <div class="col-auto">
            <button class="btn btn-primary">Add User and Email</button>
        </div>
    </form>
    <h5>Edit Welcome Email Template</h5>
    <form method="post">
        <textarea name="welcome_template" class="form-control mb-2" rows="6"><?=htmlspecialchars(file_get_contents($welcome_path))?></textarea>
        <button class="btn btn-secondary" name="save_template">Save Template</button>
        <div class="text-muted"><small>Use <b>{name}</b> and <b>{email}</b> placeholders.</small></div>
    </form>
</div>
</body>
</html>