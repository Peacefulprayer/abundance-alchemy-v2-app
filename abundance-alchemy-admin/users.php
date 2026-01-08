<?php
// /admin/users.php
session_start();
require_once '../db.php'; // provides $pdo (PDO)

// --- Auth gate (same as other admin pages)
if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

// ---------- Helpers ----------
function tableColumns(PDO $pdo, string $table): array {
    try {
        $stmt = $pdo->query("DESCRIBE `$table`");
        $cols = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $cols[] = $row['Field'];
        }
        return $cols;
    } catch (Throwable $e) {
        return [];
    }
}
function hasCol(array $cols, string $name): bool {
    return in_array($name, $cols, true);
}
function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}
function dbWarn(?Throwable $e) {
    if ($e) {
        echo "<div class='alert alert-warning py-2 my-2'><strong>DB Warning:</strong> ".h($e->getMessage())."</div>";
    }
}

// Detect available columns in users table
$usersCols = tableColumns($pdo, 'users');
$hasPreferred  = hasCol($usersCols, 'preferred_name');
$hasCreatedAt  = hasCol($usersCols, 'created_at');
$hasWelcome    = hasCol($usersCols, 'welcome_sent');
$hasStreak     = hasCol($usersCols, 'streak');
$hasLevel      = hasCol($usersCols, 'level');
$hasAffDone    = hasCol($usersCols, 'affirmations_completed');
$hasRole       = hasCol($usersCols, 'role');

// Other tables detection (safe/optional)
$affirmCols = tableColumns($pdo, 'user_affirmations'); // may or may not exist
$hasUAEmail  = hasCol($affirmCols, 'email');
$hasUAUEmail = hasCol($affirmCols, 'user_email');
$hasUACreated= hasCol($affirmCols, 'created_at');

$soundCols  = tableColumns($pdo, 'soundscapes');
$hasSSUserEmail = hasCol($soundCols, 'user_email');
$hasSSCreatedAt = hasCol($soundCols, 'created_at');

// ---------- Actions (POST) ----------
$flash = ['success'=>null,'error'=>null];

if ($_SERVER['REQUEST_METHOD']==='POST') {
    // Bulk Welcome toggle (if column exists)
    if ($hasWelcome && isset($_POST['bulk_action']) && $_POST['bulk_action']==='welcome' && !empty($_POST['selected'])) {
        $value = isset($_POST['value']) && $_POST['value']=='1' ? 1 : 0;
        $ids = array_filter(array_map('intval', (array)$_POST['selected']));
        if ($ids) {
            try {
                $in  = implode(',', array_fill(0,count($ids),'?'));
                $sql = "UPDATE users SET welcome_sent=? WHERE id IN ($in)";
                $stmt= $pdo->prepare($sql);
                $params = array_merge([$value], $ids);
                $stmt->execute($params);
                $flash['success'] = "Updated welcome status for ".count($ids)." user(s).";
            } catch (Throwable $e) {
                $flash['error'] = "Bulk update failed: ".$e->getMessage();
            }
        }
    }

    // Send a direct email from detail view
    if (isset($_POST['send_email_to']) && isset($_POST['email_subject']) && isset($_POST['email_body'])) {
        $to = trim($_POST['send_email_to']);
        $subject = trim($_POST['email_subject']);
        $body = trim($_POST['email_body']);
        if ($to && $subject && $body) {
            $headers = "From: Abundance Alchemy <no-reply@".$_SERVER['SERVER_NAME'].">\r\n";
            $headers .= "Reply-To: no-reply@".$_SERVER['SERVER_NAME']."\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $ok = @mail($to, $subject, $body, $headers);
            $flash[$ok?'success':'error'] = $ok ? "Email sent to $to" : "Email failed (server mail disabled?)";
        } else {
            $flash['error'] = "Please fill in recipient, subject and body.";
        }
    }

    // Trigger password reset email via API endpoint
    if (isset($_POST['password_reset_email'])) {
        $email = trim($_POST['password_reset_email']);
        if ($email) {
            $publicApi = "../api/request-password-reset.php";
            $payload = json_encode(['email'=>$email]);
            $opts = [
                'http'=>[
                    'method'=>'POST',
                    'header'=>"Content-Type: application/json\r\n",
                    'content'=>$payload,
                    'timeout'=>6,
                ]
            ];
            $ctx = stream_context_create($opts);
            $ok = @file_get_contents($publicApi,false,$ctx);
            if ($ok!==false) {
                $flash['success'] = "Password reset email requested for $email.";
            } else {
                $flash['error'] = "Password reset request failed (check API).";
            }
        }
    }

    // DELETE USER (with optional related)
    if (isset($_POST['delete_user_id'])) {
        $deleteId = (int)$_POST['delete_user_id'];
        $deleteRelated = !empty($_POST['delete_related']) ? true : false;

        // Lookup user email (needed for related tables)
        $userEmail = null;
        try {
            $emailColExists = hasCol($usersCols, 'email');
            if ($emailColExists) {
                $st = $pdo->prepare("SELECT email FROM users WHERE id = ?");
                $st->execute([$deleteId]);
                $userEmail = $st->fetchColumn() ?: null;
            }
        } catch (Throwable $e) {
            // Continue; we can still delete by id
        }

        try {
            $pdo->beginTransaction();

            if ($deleteRelated && $userEmail) {
                // Delete user uploads in soundscapes if user_email col exists
                if ($hasSSUserEmail) {
                    $st = $pdo->prepare("DELETE FROM soundscapes WHERE user_email = ?");
                    $st->execute([$userEmail]);
                }
                // Delete affirmations if table exists and we can match by email/user_email
                if (!empty($affirmCols)) {
                    if ($hasUAEmail) {
                        $st = $pdo->prepare("DELETE FROM user_affirmations WHERE email = ?");
                        $st->execute([$userEmail]);
                    } elseif ($hasUAUEmail) {
                        $st = $pdo->prepare("DELETE FROM user_affirmations WHERE user_email = ?");
                        $st->execute([$userEmail]);
                    }
                }
            }

            // Delete user by id
            $st = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $st->execute([$deleteId]);

            $pdo->commit();
            $flash['success'] = "User #$deleteId deleted".($deleteRelated && $userEmail ? " (with related content)" : "").".";
        } catch (Throwable $e) {
            $pdo->rollBack();
            $flash['error'] = "Delete failed: ".$e->getMessage();
        }
    }
}

// ---------- CSV Export (GET) ----------
if (isset($_GET['export']) && $_GET['export']==='csv') {
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';
    $welcome = isset($_GET['welcome']) ? $_GET['welcome'] : '';
    $role    = isset($_GET['role']) ? trim($_GET['role']) : '';
    $scope   = isset($_GET['scope']) ? $_GET['scope'] : 'page'; // 'page' | 'all'

    $selectCols = array_values(array_filter([
        'id',
        hasCol($usersCols,'name') ? 'name' : null,
        $hasPreferred ? 'preferred_name' : null,
        hasCol($usersCols,'email') ? 'email' : null,
        $hasRole ? 'role' : null,
        $hasStreak ? 'streak' : null,
        $hasLevel ? 'level' : null,
        $hasAffDone ? 'affirmations_completed' : null,
        $hasWelcome ? 'welcome_sent' : null,
        $hasCreatedAt ? 'created_at' : null,
    ]));

    $sql = "SELECT ".implode(',', array_map(fn($c)=>"`$c`", $selectCols))." FROM users WHERE 1=1";
    $params = [];

    if ($q !== '') {
        $sql .= " AND (";
        $pieces = [];
        if (hasCol($usersCols,'name'))  { $pieces[] = "name LIKE ?";  $params[] = "%$q%"; }
        if ($hasPreferred)              { $pieces[] = "preferred_name LIKE ?";  $params[] = "%$q%"; }
        if (hasCol($usersCols,'email')) { $pieces[] = "email LIKE ?"; $params[] = "%$q%"; }
        $sql .= $pieces ? implode(' OR ', $pieces) : '1=0';
        $sql .= ")";
    }
    if ($hasWelcome && ($welcome==='1' || $welcome==='0')) {
        $sql .= " AND welcome_sent = ?";
        $params[] = (int)$welcome;
    }
    if ($hasRole && $role!=='') {
        $sql .= " AND role = ?";
        $params[] = $role;
    }

    $sql .= $hasCreatedAt ? " ORDER BY created_at DESC" : " ORDER BY id DESC";

    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = 25;
    if ($scope === 'page') {
        $offset = ($page-1)*$perPage;
        $sql .= " LIMIT $perPage OFFSET $offset";
    }

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="users_export_'.date('Ymd_His').'.csv"');

        $out = fopen('php://output', 'w');
        fputcsv($out, $selectCols);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $line = [];
            foreach ($selectCols as $c) $line[] = $row[$c] ?? '';
            fputcsv($out, $line);
        }
        fclose($out);
        exit;
    } catch (Throwable $e) {
        $csvError = $e;
    }
}

// ---------- Routing: list vs detail ----------
$detailUserId = isset($_GET['user']) ? (int)$_GET['user'] : 0;

// ---------- Fetch: Detail ----------
$detailUser = null;
$detailErr  = null;
if ($detailUserId > 0) {
    $selectCols = array_values(array_filter([
        'id',
        hasCol($usersCols,'name') ? 'name' : null,
        $hasPreferred ? 'preferred_name' : null,
        hasCol($usersCols,'email') ? 'email' : null,
        $hasRole ? 'role' : null,
        $hasStreak ? 'streak' : null,
        $hasLevel ? 'level' : null,
        $hasAffDone ? 'affirmations_completed' : null,
        $hasWelcome ? 'welcome_sent' : null,
        $hasCreatedAt ? 'created_at' : null,
    ]));
    $sql = "SELECT ".implode(',', array_map(fn($c)=>"`$c`",$selectCols))." FROM users WHERE id = ?";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$detailUserId]);
        $detailUser = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$detailUser) $detailErr = "User not found.";
    } catch (Throwable $e) {
        $detailErr = $e->getMessage();
    }
}

// ---------- Fetch: List ----------
$listErr = null; $csvError = $csvError ?? null;
$rows = []; $total = 0;
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 25;
$offset = ($page-1)*$perPage;

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$welcome = isset($_GET['welcome']) ? $_GET['welcome'] : '';
$role    = isset($_GET['role']) ? trim($_GET['role']) : '';

if (!$detailUser) {
    // Count
    $countSql = "SELECT COUNT(*) FROM users WHERE 1=1";
    $countParams = [];
    if ($q !== '') {
        $countSql .= " AND (";
        $pieces = [];
        if (hasCol($usersCols,'name'))  { $pieces[] = "name LIKE ?";  $countParams[] = "%$q%"; }
        if ($hasPreferred)              { $pieces[] = "preferred_name LIKE ?"; $countParams[] = "%$q%"; }
        if (hasCol($usersCols,'email')) { $pieces[] = "email LIKE ?"; $countParams[] = "%$q%"; }
        $countSql .= $pieces ? implode(' OR ', $pieces) : '1=0';
        $countSql .= ")";
    }
    if ($hasWelcome && ($welcome==='1' || $welcome==='0')) {
        $countSql .= " AND welcome_sent = ?";
        $countParams[] = (int)$welcome;
    }
    if ($hasRole && $role!=='') {
        $countSql .= " AND role = ?";
        $countParams[] = $role;
    }

    try {
        $stmt = $pdo->prepare($countSql);
        $stmt->execute($countParams);
        $total = (int)$stmt->fetchColumn();
    } catch (Throwable $e) {
        $listErr = $e->getMessage();
    }

    // Data
    $selectCols = array_values(array_filter([
        'id',
        hasCol($usersCols,'name') ? 'name' : null,
        $hasPreferred ? 'preferred_name' : null,
        hasCol($usersCols,'email') ? 'email' : null,
        $hasRole ? 'role' : null,
        $hasStreak ? 'streak' : null,
        $hasLevel ? 'level' : null,
        $hasAffDone ? 'affirmations_completed' : null,
        $hasWelcome ? 'welcome_sent' : null,
        $hasCreatedAt ? 'created_at' : null,
    ]));
    $sql = "SELECT ".implode(',', array_map(fn($c)=>"`$c`", $selectCols))." FROM users WHERE 1=1";
    $params = [];

    if ($q !== '') {
        $sql .= " AND (";
        $pieces = [];
        if (hasCol($usersCols,'name'))  { $pieces[] = "name LIKE ?";  $params[] = "%$q%"; }
        if ($hasPreferred)              { $pieces[] = "preferred_name LIKE ?"; $params[] = "%$q%"; }
        if (hasCol($usersCols,'email')) { $pieces[] = "email LIKE ?"; $params[] = "%$q%"; }
        $sql .= $pieces ? implode(' OR ', $pieces) : '1=0';
        $sql .= ")";
    }
    if ($hasWelcome && ($welcome==='1' || $welcome==='0')) {
        $sql .= " AND welcome_sent = ?";
        $params[] = (int)$welcome;
    }
    if ($hasRole && $role!=='') {
        $sql .= " AND role = ?";
        $params[] = $role;
    }

    $sql .= $hasCreatedAt ? " ORDER BY created_at DESC" : " ORDER BY id DESC";
    $sql .= " LIMIT $perPage OFFSET $offset";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) $rows[] = $r;
    } catch (Throwable $e) {
        $listErr = $e->getMessage();
    }
}

// ---------- HTML ----------
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Users — Abundance Alchemy Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background:#f7f7fb; }
    .card-compact .card-body{ padding: 0.75rem 1rem; }
    .mini-label{ font-size:.7rem; letter-spacing:.05em; color:#6b7280; text-transform:uppercase; }
    .table-sm td, .table-sm th{ padding:.4rem .5rem; }
    .toolbar .form-control, .toolbar .form-select { height: 34px; padding:.2rem .5rem; font-size:.9rem; }
    .sticky-top-sm{ position: sticky; top: .5rem; z-index: 2; }
  </style>
</head>
<body>
<?php include 'header.php'; ?>
<div class="container py-4">

  <?php if ($flash['success']): ?>
    <div class="alert alert-success"><?= h($flash['success']) ?></div>
  <?php endif; ?>
  <?php if ($flash['error']): ?>
    <div class="alert alert-danger"><?= h($flash['error']) ?></div>
  <?php endif; ?>
  <?php if (isset($csvError)) dbWarn($csvError); ?>

  <?php if ($detailUser): ?>
    <!-- DETAIL VIEW -->
    <div class="d-flex align-items-center mb-3">
      <a href="users.php" class="btn btn-sm btn-outline-secondary me-2">← Back</a>
      <h4 class="mb-0">User</h4>
    </div>

    <?php if ($detailErr): ?>
      <div class="alert alert-danger"><?= h($detailErr) ?></div>
    <?php else: ?>
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card card-compact shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="mini-label">Name</div>
                  <div class="fw-bold">
                    <?= h($detailUser['name'] ?? '—') ?>
                    <?php if ($hasPreferred && !empty($detailUser['preferred_name'])): ?>
                      <span class="text-muted"> (<?= h($detailUser['preferred_name']) ?>)</span>
                    <?php endif; ?>
                  </div>
                </div>
                <?php if ($hasRole): ?>
                  <span class="badge text-bg-light border"><?= h($detailUser['role'] ?? 'user') ?></span>
                <?php endif; ?>
              </div>
              <div class="mt-2">
                <div class="mini-label">Email</div>
                <div><?= h($detailUser['email'] ?? '—') ?></div>
              </div>
              <div class="row g-2 mt-2">
                <?php if ($hasStreak): ?>
                  <div class="col-4">
                    <div class="mini-label">Streak</div>
                    <div class="fw-bold"><?= (int)($detailUser['streak'] ?? 0) ?></div>
                  </div>
                <?php endif; ?>
                <?php if ($hasLevel): ?>
                  <div class="col-4">
                    <div class="mini-label">Level</div>
                    <div class="fw-bold"><?= (int)($detailUser['level'] ?? 1) ?></div>
                  </div>
                <?php endif; ?>
                <?php if ($hasAffDone): ?>
                  <div class="col-4">
                    <div class="mini-label">Affirmations</div>
                    <div class="fw-bold"><?= (int)($detailUser['affirmations_completed'] ?? 0) ?></div>
                  </div>
                <?php endif; ?>
              </div>
              <div class="mt-2">
                <?php if ($hasWelcome): ?>
                  <span class="badge <?= !empty($detailUser['welcome_sent']) ? 'text-bg-success' : 'text-bg-secondary' ?>">
                    Welcome: <?= !empty($detailUser['welcome_sent']) ? 'Sent' : 'Not Sent' ?>
                  </span>
                <?php endif; ?>
                <?php if ($hasCreatedAt && !empty($detailUser['created_at'])): ?>
                  <span class="ms-2 text-muted small">Joined: <?= h($detailUser['created_at']) ?></span>
                <?php endif; ?>
              </div>
            </div>
          </div>

          <!-- Quick Email (compact) -->
          <div class="card card-compact shadow-sm mt-3">
            <div class="card-body">
              <div class="mini-label mb-2">Send Email</div>
              <form method="post" class="row g-2">
                <input type="hidden" name="send_email_to" value="<?= h($detailUser['email'] ?? '') ?>">
                <div class="col-12 col-md-12">
                  <input type="text" name="email_subject" class="form-control form-control-sm" placeholder="Subject">
                </div>
                <div class="col-12">
                  <textarea name="email_body" rows="3" class="form-control form-control-sm" placeholder="Write a short message..."></textarea>
                </div>
                <div class="col-12 d-flex gap-2">
                  <button class="btn btn-sm btn-primary">Send</button>
                  <?php if (!empty($detailUser['email'])): ?>
                    <button class="btn btn-sm btn-outline-warning" name="password_reset_email" value="<?= h($detailUser['email']) ?>">
                      Send Password Reset
                    </button>
                  <?php endif; ?>
                </div>
              </form>
            </div>
          </div>

          <!-- Danger Zone: Delete User -->
          <div class="card card-compact shadow-sm mt-3 border-danger">
            <div class="card-body">
              <div class="mini-label mb-2 text-danger">Danger Zone</div>
              <form method="post" onsubmit="return confirm('Permanently delete this user<?= !empty($detailUser['email']) ? ' (' . h($detailUser['email']) . ')' : '' ?>? This cannot be undone.');">
                <input type="hidden" name="delete_user_id" value="<?= (int)$detailUser['id'] ?>">
                <?php if (!empty($detailUser['email'])): ?>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" id="delete_related" name="delete_related" value="1">
                    <label class="form-check-label small" for="delete_related">
                      Also delete this user’s uploads and affirmations
                    </label>
                  </div>
                <?php endif; ?>
                <button class="btn btn-sm btn-danger">Delete User</button>
              </form>
            </div>
          </div>

        </div>

        <div class="col-md-6">
          <!-- User Uploads -->
          <div class="card card-compact shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="mini-label">User Uploads</div>
              </div>
              <?php
                $uploads = [];
                $upErr = null;
                if ($hasSSUserEmail && !empty($detailUser['email'])) {
                    $sql = "SELECT id,name,url,category,is_active".
                           ($hasSSCreatedAt ? ",created_at" : "").
                           " FROM soundscapes WHERE user_email = :email ORDER BY id DESC";
                    try {
                        $st = $pdo->prepare($sql);
                        $st->bindValue(':email', $detailUser['email']);
                        $st->execute();
                        $uploads = $st->fetchAll(PDO::FETCH_ASSOC);
                    } catch (Throwable $e) { $upErr = $e; }
                }
                if ($upErr) dbWarn($upErr);
              ?>
              <?php if (!$hasSSUserEmail): ?>
                <div class="text-muted small">No <code>user_email</code> column in <code>soundscapes</code>; cannot list per-user uploads.</div>
              <?php elseif (empty($uploads)): ?>
                <div class="text-muted small">No uploads found for this user.</div>
              <?php else: ?>
                <div class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Preview</th></tr></thead>
                    <tbody>
                      <?php foreach($uploads as $u): ?>
                        <tr>
                          <td><?= h($u['name']) ?></td>
                          <td><span class="badge text-bg-light border"><?= h($u['category']) ?></span></td>
                          <td><?= !empty($u['is_active']) ? '<span class="text-success small">Active</span>' : '<span class="text-muted small">Inactive</span>' ?></td>
                          <td style="min-width:180px"><audio controls src="<?= h($u['url']) ?>" style="height:28px;width:100%"></audio></td>
                        </tr>
                      <?php endforeach; ?>
                    </tbody>
                  </table>
                </div>
              <?php endif; ?>
            </div>
          </div>

          <!-- User Affirmations -->
          <div class="card card-compact shadow-sm mt-3">
            <div class="card-body">
              <div class="mini-label mb-2">User Affirmations</div>
              <?php
                $affs = []; $affErr = null;
                if (!empty($affirmCols) && !empty($detailUser['email'])) {
                    $col = $hasUAEmail ? 'email' : ($hasUAUEmail ? 'user_email' : null);
                    if ($col) {
                        $sql = "SELECT id,text,type".($hasUACreated?",created_at":"")." FROM user_affirmations WHERE $col = :email ORDER BY id DESC";
                        try {
                            $st = $pdo->prepare($sql);
                            $st->bindValue(':email', $detailUser['email']);
                            $st->execute();
                            $affs = $st->fetchAll(PDO::FETCH_ASSOC);
                        } catch (Throwable $e) { $affErr = $e; }
                    }
                }
                if ($affErr) dbWarn($affErr);
              ?>
              <?php if (empty($affirmCols)): ?>
                <div class="text-muted small">No <code>user_affirmations</code> table found.</div>
              <?php elseif (empty($detailUser['email'])): ?>
                <div class="text-muted small">User email not available.</div>
              <?php elseif (empty($affs)): ?>
                <div class="text-muted small">No affirmations found for this user.</div>
              <?php else: ?>
                <div class="table-responsive">
                  <table class="table table-sm align-middle mb-0">
                    <thead><tr><th>Text</th><th>Type</th><?php if($hasUACreated):?><th>Added</th><?php endif;?></tr></thead>
                    <tbody>
                      <?php foreach($affs as $a): ?>
                        <tr>
                          <td><?= h($a['text']) ?></td>
                          <td><span class="badge text-bg-light border"><?= h($a['type']) ?></span></td>
                          <?php if($hasUACreated):?><td class="text-muted small"><?= h($a['created_at']) ?></td><?php endif;?>
                        </tr>
                      <?php endforeach; ?>
                    </tbody>
                  </table>
                </div>
              <?php endif; ?>
            </div>
          </div>

        </div>
      </div>
    <?php endif; ?>

  <?php else: ?>
    <!-- LIST VIEW -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="mb-0">Users</h4>
      <div class="d-flex gap-2">
        <a class="btn btn-sm btn-outline-secondary" href="?export=csv&scope=page&q=<?= h($q) ?>&welcome=<?= h($welcome) ?>&role=<?= h($role) ?>">Export CSV (Page)</a>
        <a class="btn btn-sm btn-primary" href="?export=csv&scope=all&q=<?= h($q) ?>&welcome=<?= h($welcome) ?>&role=<?= h($role) ?>">Export CSV (All)</a>
      </div>
    </div>

    <form class="card card-compact shadow-sm mb-3 toolbar p-2" method="get">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-md">
          <input type="text" name="q" value="<?= h($q) ?>" class="form-control" placeholder="Search name/email...">
        </div>
        <?php if ($hasWelcome): ?>
        <div class="col-6 col-md-auto">
          <select name="welcome" class="form-select">
            <option value="">Welcome: Any</option>
            <option value="1" <?= $welcome==='1'?'selected':'' ?>>Sent</option>
            <option value="0" <?= $welcome==='0'?'selected':'' ?>>Not Sent</option>
          </select>
        </div>
        <?php endif; ?>
        <?php if ($hasRole): 
            $roles = [];
            try {
                $st = $pdo->query("SELECT DISTINCT role FROM users WHERE role IS NOT NULL AND role<>'' ORDER BY role ASC");
                while ($r = $st->fetch(PDO::FETCH_NUM)) $roles[] = $r[0];
            } catch (Throwable $e) {}
        ?>
        <div class="col-6 col-md-auto">
          <select name="role" class="form-select">
            <option value="">Role: Any</option>
            <?php foreach($roles as $r): ?>
              <option value="<?= h($r) ?>" <?= $role===$r?'selected':'' ?>><?= h($r) ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <?php endif; ?>
        <div class="col-12 col-md-auto">
          <button class="btn btn-sm btn-primary px-3">Filter</button>
          <a href="users.php" class="btn btn-sm btn-outline-secondary px-3">Reset</a>
        </div>
      </div>
    </form>

    <form method="post" class="card card-compact shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="mini-label">Results</div>
          <?php if ($hasWelcome): ?>
          <div class="d-flex gap-2">
            <input type="hidden" name="bulk_action" value="welcome">
            <input type="hidden" name="value" id="bulk_welcome_value" value="1">
            <div class="btn-group btn-group-sm" role="group" aria-label="Bulk welcome">
              <button type="submit" class="btn btn-outline-success" onclick="document.getElementById('bulk_welcome_value').value='1'">Mark Welcome Sent</button>
              <button type="submit" class="btn btn-outline-secondary" onclick="document.getElementById('bulk_welcome_value').value='0'">Mark Not Sent</button>
            </div>
          </div>
          <?php endif; ?>
        </div>

        <?php if ($listErr) dbWarn(new Exception($listErr)); ?>

        <div class="table-responsive">
          <table class="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <?php if ($hasWelcome): ?><th style="width:28px;"><input type="checkbox" onclick="toggleAll(this)"></th><?php endif; ?>
                <th>ID</th>
                <?php if (hasCol($usersCols,'name')): ?><th>Name</th><?php endif; ?>
                <?php if ($hasPreferred): ?><th>Preferred</th><?php endif; ?>
                <?php if (hasCol($usersCols,'email')): ?><th>Email</th><?php endif; ?>
                <?php if ($hasRole): ?><th>Role</th><?php endif; ?>
                <?php if ($hasStreak): ?><th>Streak</th><?php endif; ?>
                <?php if ($hasLevel): ?><th>Level</th><?php endif; ?>
                <?php if ($hasAffDone): ?><th>Affirmations</th><?php endif; ?>
                <?php if ($hasWelcome): ?><th>Welcome</th><?php endif; ?>
                <?php if ($hasCreatedAt): ?><th>Joined</th><?php endif; ?>
                <th style="width:120px;"></th>
              </tr>
            </thead>
            <tbody>
              <?php if (!$rows): ?>
                <tr><td colspan="99" class="text-muted">No users found.</td></tr>
              <?php else: foreach($rows as $r): ?>
                <tr>
                  <?php if ($hasWelcome): ?>
                    <td><input type="checkbox" name="selected[]" value="<?= (int)$r['id'] ?>"></td>
                  <?php endif; ?>
                  <td><?= (int)$r['id'] ?></td>
                  <?php if (isset($r['name'])): ?><td><?= h($r['name']) ?></td><?php endif; ?>
                  <?php if ($hasPreferred): ?><td><?= h($r['preferred_name'] ?? '') ?></td><?php endif; ?>
                  <?php if (isset($r['email'])): ?><td><?= h($r['email']) ?></td><?php endif; ?>
                  <?php if ($hasRole): ?><td><span class="badge text-bg-light border"><?= h($r['role'] ?? 'user') ?></span></td><?php endif; ?>
                  <?php if ($hasStreak): ?><td><?= (int)($r['streak'] ?? 0) ?></td><?php endif; ?>
                  <?php if ($hasLevel): ?><td><?= (int)($r['level'] ?? 1) ?></td><?php endif; ?>
                  <?php if ($hasAffDone): ?><td><?= (int)($r['affirmations_completed'] ?? 0) ?></td><?php endif; ?>
                  <?php if ($hasWelcome): ?>
                    <td><?= !empty($r['welcome_sent']) ? '<span class="text-success">Yes</span>' : '<span class="text-muted">No</span>' ?></td>
                  <?php endif; ?>
                  <?php if ($hasCreatedAt): ?><td class="text-muted small"><?= h($r['created_at']) ?></td><?php endif; ?>
                  <td class="d-flex gap-1">
                    <a class="btn btn-sm btn-outline-primary" href="users.php?user=<?= (int)$r['id'] ?>">View</a>
                    <form method="post" onsubmit="return confirm('Permanently delete user #<?= (int)$r['id'] ?>? This cannot be undone.');">
                      <input type="hidden" name="delete_user_id" value="<?= (int)$r['id'] ?>">
                      <button class="btn btn-sm btn-outline-danger">Delete</button>
                    </form>
                  </td>
                </tr>
              <?php endforeach; endif; ?>
            </tbody>
          </table>
        </div>

        <?php
          $pages = $perPage ? max(1, ceil($total / $perPage)) : 1;
          if ($pages > 1):
        ?>
          <nav class="mt-3">
            <ul class="pagination pagination-sm mb-0">
              <?php for ($i=1; $i<=$pages; $i++): 
                $qs = $_GET; $qs['page'] = $i; $url = 'users.php?'.http_build_query($qs);
              ?>
                <li class="page-item <?= $i===$page?'active':'' ?>">
                  <a class="page-link" href="<?= h($url) ?>"><?= $i ?></a>
                </li>
              <?php endfor; ?>
            </ul>
          </nav>
        <?php endif; ?>
      </div>
    </form>
  <?php endif; ?>

</div>

<script>
function toggleAll(master){
  document.querySelectorAll('input[name="selected[]"]').forEach(cb => cb.checked = master.checked);
}
</script>
</body>
</html>