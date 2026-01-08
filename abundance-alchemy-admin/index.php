<?php
// /abundance-alchemy/admin/index.php
session_start();

// If already logged in, send to the main admin screen (users). Otherwise to login.
if (isset($_SESSION['admin_id'])) {
    header('Location: users.php');
} else {
    header('Location: login.php');
}
exit;
