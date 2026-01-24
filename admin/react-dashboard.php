<?php
require_once __DIR__ . '/admin_init.php';
require_once __DIR__ . '/../db.php';

// Require admin login
if (empty($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Abundant Alchemy Admin – React Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- You can reuse Bootstrap if you want your header/footer consistent -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          crossorigin="anonymous">
    <style>
        body {
            margin: 0;
            background: #0f172a;
            color: #e5e7eb;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .aa-react-shell {
            display: flex;
            height: calc(100vh - 60px);
        }
        #aa-admin-react-root {
            flex: 1;
            min-width: 0;
        }
    </style>
</head>
<body>

<?php include __DIR__ . '/header.php'; ?>

<div class="aa-react-shell">
    <!-- React app will mount here -->
    <div id="aa-admin-react-root"></div>
</div>

<!-- Built React bundle from Vite (see vite.config.ts) -->
<script type="module" src="/abundance-alchemy/admin/react-dist/admin-dashboard.js"></script>
</body>
</html>