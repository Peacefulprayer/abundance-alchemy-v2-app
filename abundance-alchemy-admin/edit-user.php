<?php
session_start();
require_once '../db.php';
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

// Get user ID
$user_id = $_GET['id'] ?? null;
if (!$user_id) {
    header("Location: users.php");
    exit;
}

// Fetch user info
$stmt = $pdo->prepare("SELECT * FROM users WHERE id=?");
$stmt->execute([$user_id]);
$user = $stmt->fetch();
if (!$user) {
    echo "User not found.";
    exit;
}

$msg = '';
// Handle update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $level = intval($_POST['level'] ?? 1);
    $streak = intval($_POST['streak'] ?? 0);
    $focus = $_POST['focus_area'] ?? '';

    // Password update (optional)
    if (!empty($_POST['password'])) {
        $pw_hash = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET name=?, email=?, level=?, streak=?, focus_area=?, password_hash=? WHERE id=?");
        $stmt->execute([$name, $email, $level, $streak, $focus, $pw_hash, $user_id]);
        $msg = "User info and password updated!";
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name=?, email=?, level=?, streak=?, focus_area=? WHERE id=?");
        $stmt->execute([$name, $email, $level, $streak, $focus, $user_id]);
        $msg = "User info updated!";
    }
    // refresh info
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id=?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Edit User - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        body { font-family: Trebuchet MS, sans-serif; background: #fff; }
        .btn-primary { background: #FF6600; border: none; }
    </style>
</head>
<body>
<?php include("header.php"); ?>
<div class="container mt-4" style="max-width:540px;">
    <h4>Edit User</h4>
    <?php if ($msg): ?><div class="alert alert-success"><?=$msg?></div><?php endif; ?>
    <form method="post">
        <div class="mb-3">
            <label>Name:</label>
            <input type="text" name="name" class="form-control" required value="<?=htmlspecialchars($user['name'])?>">
        </div>
        <div class="mb-3">
            <label>Email:</label>
            <input type="email" name="email" class="form-control" required value="<?=htmlspecialchars($user['email'])?>">
        </div>
        <div class="mb-3">
            <label>Level:</label>
            <input type="number" name="level" class="form-control" min="1" value="<?=$user['level']?>">
        </div>
        <div class="mb-3">
            <label>Streak:</label>
            <input type="number" name="streak" class="form-control" min="0" value="<?=$user['streak']?>">
        </div>
        <div class="mb-3">
            <label>Focus Area:</label>
            <input type="text" name="focus_area" class="form-control" value="<?=htmlspecialchars($user['focus_area'])?>">
        </div>
        <div class="mb-3">
            <label>New Password (optional):</label>
            <input type="password" name="password" class="form-control" autocomplete="new-password">
            <small>Leave blank to keep current password.</small>
        </div>
        <button class="btn btn-primary">Save Changes</button>
        <a class="btn btn-secondary" href="users.php">Back to Users List</a>
    </form>
</div>
</body>
</html>