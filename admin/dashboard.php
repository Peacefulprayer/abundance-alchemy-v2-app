<?php
session_start();
require_once '../db.php';

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit;
}

// ---------------------------------------------------------------------
// Core stats
// ---------------------------------------------------------------------
$total_users = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

// signups today
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()");
$today_signups = (int)$stmt->fetchColumn();

// signups last 7 days
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
$week_signups = (int)$stmt->fetchColumn();

// high streak users (7+ days)
$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE streak >= 7");
$high_streak_users = (int)$stmt->fetchColumn();

// average streak
$stmt = $pdo->query("SELECT AVG(streak) FROM users");
$avg_streak_raw = $stmt->fetchColumn();
$avg_streak = $avg_streak_raw !== null ? round((float)$avg_streak_raw, 1) : 0.0;

// recent signups
$recent_stmt = $pdo->query("
    SELECT name, email, created_at, level, streak, focus_area
    FROM users
    ORDER BY created_at DESC
    LIMIT 5
");
$recent = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);

// level distribution
$level_stmt = $pdo->query("
    SELECT level, COUNT(*) AS cnt
    FROM users
    GROUP BY level
    ORDER BY level ASC
");
$levels = $level_stmt->fetchAll(PDO::FETCH_ASSOC);
$max_level_count = 0;
foreach ($levels as $row) {
    if ($row['cnt'] > $max_level_count) {
        $max_level_count = (int)$row['cnt'];
    }
}

// top focus areas
$focus_stmt = $pdo->query("
    SELECT focus_area, COUNT(*) AS cnt
    FROM users
    WHERE focus_area IS NOT NULL AND focus_area <> ''
    GROUP BY focus_area
    ORDER BY cnt DESC
    LIMIT 5
");
$focus_areas = $focus_stmt->fetchAll(PDO::FETCH_ASSOC);

$adminName = isset($_SESSION['admin_name']) ? $_SESSION['admin_name'] : 'Admin';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard - Abundance Alchemy</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <style>
        :root {
            --aa-primary: #ff6a1a;
            --aa-bg: #f5f6fa;
        }

        body {
            background: radial-gradient(circle at top left, #ffffff 0, #f5f6fa 45%, #eceff4 100%);
            font-family: "Trebuchet MS", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
            padding: .4rem .8rem;
            border-radius: 999px;
            background: #fff;
            border: 1px solid rgba(0,0,0,.04);
            box-shadow: 0 2px 4px rgba(15,23,42,.04);
            font-size: .8rem;
            display: inline-flex;
            align-items: center;
            gap: .4rem;
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

        .aa-card {
            border-radius: 1rem;
            border: 1px solid rgba(15,23,42,.05);
            box-shadow:
                0 18px 45px rgba(15,23,42,.08),
                0 1px 0 rgba(255,255,255,.8) inset;
            overflow: hidden;
            background: #ffffff;
        }

        .aa-card-header-soft {
            background: linear-gradient(90deg, #ffffff, #fff7f2);
            border-bottom: 1px solid rgba(0,0,0,.02);
        }

        .aa-stat-number {
            font-size: 2rem;
            font-weight: 700;
            line-height: 1.1;
        }

        .aa-stat-label {
            font-size: .8rem;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: #6c757d;
        }

        .aa-level-label {
            font-size: .8rem;
        }

        .aa-focus-pill {
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: .4rem .6rem;
            border-radius: .6rem;
            background: #f8fafc;
            font-size: .85rem;
        }

        .aa-focus-pill strong {
            font-weight: 600;
        }

        .aa-focus-pill span {
            color: #6c757d;
            font-size: .8rem;
        }

        .aa-recent-list {
            list-style: none;
            padding-left: 0;
            margin-bottom: 0;
        }

        .aa-recent-list li + li {
            border-top: 1px solid rgba(226,232,240,.8);
        }

        .aa-recent-item {
            padding: .5rem 0;
            display: flex;
            flex-direction: column;
            gap: .15rem;
        }

        .aa-recent-name {
            font-size: .9rem;
            font-weight: 600;
        }

        .aa-recent-email {
            font-size: .8rem;
            color: #6c757d;
        }

        .aa-recent-meta {
            font-size: .78rem;
            color: #6c757d;
        }

        .aa-quick-actions .btn {
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .aa-quick-actions .btn span:first-child {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
        }

        .aa-badge-soft {
            font-size: .72rem;
            padding: .2rem .45rem;
            border-radius: 999px;
        }

        @media (max-width: 992px) {
            .aa-page-header {
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
<?php include("header.php"); ?>

<div class="container py-4">
    <div class="aa-page-header">
        <div class="aa-page-title">
            <h4>Admin Dashboard</h4>
            <div class="aa-page-subtitle">
                Welcome back, <?= htmlspecialchars($adminName) ?>. Here’s a snapshot of your Abundance Alchemy community.
            </div>
        </div>
        <div class="aa-metrics">
            <span class="aa-metric-pill">
                <span class="aa-metric-dot"></span>
                <span><strong><?= (int)$total_users ?></strong> total users</span>
            </span>
            <span class="aa-metric-pill">
                Today:
                <strong><?= (int)$today_signups ?></strong> signup<?= $today_signups == 1 ? '' : 's' ?>
            </span>
            <span class="aa-metric-pill">
                Last 7 days:
                <strong><?= (int)$week_signups ?></strong> new users
            </span>
            <span class="aa-metric-pill">
                <span>Avg streak:</span>
                <strong><?= number_format($avg_streak, 1) ?></strong> days
            </span>
        </div>
    </div>

    <!-- Top stats row -->
    <div class="row g-3 mb-4">
        <div class="col-12 col-md-3">
            <div class="aa-card h-100">
                <div class="card-body">
                    <div class="aa-stat-label mb-1">Total Users</div>
                    <div class="aa-stat-number mb-1"><?= (int)$total_users ?></div>
                    <div class="text-muted small">
                        All users currently in the Abundance Alchemy app.
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="aa-card h-100">
                <div class="card-body">
                    <div class="aa-stat-label mb-1">Signups Today</div>
                    <div class="aa-stat-number mb-1"><?= (int)$today_signups ?></div>
                    <div class="text-muted small">
                        New members who joined since midnight.
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="aa-card h-100">
                <div class="card-body">
                    <div class="aa-stat-label mb-1">High-Streak Users (7+)</div>
                    <div class="aa-stat-number mb-1"><?= (int)$high_streak_users ?></div>
                    <div class="text-muted small">
                        Members with a 7-day or longer practice streak.
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-3">
            <div class="aa-card h-100">
                <div class="card-body">
                    <div class="aa-stat-label mb-1">Average Streak</div>
                    <div class="aa-stat-number mb-1">
                        <?= number_format($avg_streak, 1) ?> <span class="fs-6">days</span>
                    </div>
                    <div class="text-muted small">
                        Average active streak across all users.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Second row: recent, levels, focus, quick actions -->
    <div class="row g-3 mb-4">
        <!-- Recent signups -->
        <div class="col-12 col-lg-4">
            <div class="aa-card h-100">
                <div class="card-header aa-card-header-soft">
                    <strong>Recent Signups</strong>
                    <span class="text-muted small ms-1">(last 5)</span>
                </div>
                <div class="card-body">
                    <?php if (empty($recent)): ?>
                        <p class="text-muted small mb-0">No users yet. Once people start signing up, you’ll see them here.</p>
                    <?php else: ?>
                        <ul class="aa-recent-list">
                            <?php foreach ($recent as $u): ?>
                                <li>
                                    <div class="aa-recent-item">
                                        <div class="aa-recent-name">
                                            <?= htmlspecialchars($u['name'] ?: 'Unnamed User') ?>
                                        </div>
                                        <div class="aa-recent-email">
                                            <?= htmlspecialchars($u['email']) ?>
                                        </div>
                                        <div class="aa-recent-meta">
                                            Level <?= (int)$u['level'] ?>
                                            · Streak <?= (int)$u['streak'] ?> day(s)
                                            <?php if (!empty($u['focus_area'])): ?>
                                                · Focus: <?= htmlspecialchars($u['focus_area']) ?>
                                            <?php endif; ?>
                                            <br>
                                            Joined: <?= htmlspecialchars($u['created_at']) ?>
                                        </div>
                                    </div>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Level distribution -->
        <div class="col-12 col-lg-4">
            <div class="aa-card h-100">
                <div class="card-header aa-card-header-soft">
                    <strong>User Levels</strong>
                    <span class="text-muted small ms-1">(distribution)</span>
                </div>
                <div class="card-body">
                    <?php if (empty($levels)): ?>
                        <p class="text-muted small mb-0">No level data yet.</p>
                    <?php else: ?>
                        <?php foreach ($levels as $lvl): ?>
                            <?php
                            $level = (int)$lvl['level'];
                            $count = (int)$lvl['cnt'];
                            $percent = ($max_level_count > 0)
                                ? round(($count / $max_level_count) * 100)
                                : 0;
                            ?>
                            <div class="mb-2">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="aa-level-label">Level <?= $level ?></span>
                                    <span class="text-muted small"><?= $count ?> user<?= $count === 1 ? '' : 's' ?></span>
                                </div>
                                <div class="progress" style="height: 6px;">
                                    <div class="progress-bar" role="progressbar"
                                         style="width: <?= $percent ?>%; background-color: var(--aa-primary);"
                                         aria-valuenow="<?= $percent ?>" aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Focus areas -->
        <div class="col-12 col-lg-4">
            <div class="aa-card h-100">
                <div class="card-header aa-card-header-soft">
                    <strong>Top Focus Areas</strong>
                    <span class="text-muted small ms-1">(what people are working on)</span>
                </div>
                <div class="card-body">
                    <?php if (empty($focus_areas)): ?>
                        <p class="text-muted small mb-0">
                            No focus area data yet. As users choose their focus, you’ll see it here.
                        </p>
                    <?php else: ?>
                        <div class="d-flex flex-column gap-2">
                            <?php foreach ($focus_areas as $fa): ?>
                                <div class="aa-focus-pill">
                                    <strong><?= htmlspecialchars($fa['focus_area']) ?></strong>
                                    <span><?= (int)$fa['cnt'] ?> user<?= $fa['cnt'] == 1 ? '' : 's' ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="row g-3 mb-4">
        <div class="col-12 col-lg-6">
            <div class="aa-card h-100">
                <div class="card-header aa-card-header-soft">
                    <strong>Quick Actions</strong>
                    <span class="text-muted small ms-1">Frequently used admin tools</span>
                </div>
                <div class="card-body aa-quick-actions">
                    <div class="d-grid gap-2">
                        <a class="btn btn-primary btn-sm" href="users.php">
                            <span>
                                <span>👥</span>
                                <span>Manage Users</span>
                            </span>
                            <span class="aa-badge-soft bg-light text-dark">
                                View, edit & email
                            </span>
                        </a>
                        <a class="btn btn-outline-primary btn-sm" href="affirmations.php">
                            <span>
                                <span>💬</span>
                                <span>Manage Affirmations</span>
                            </span>
                            <span class="aa-badge-soft bg-light text-dark">
                                I Am / I Love library
                            </span>
                        </a>
                        <a class="btn btn-outline-primary btn-sm" href="wisdom.php">
                            <span>
                                <span>📜</span>
                                <span>Manage Wisdom</span>
                            </span>
                            <span class="aa-badge-soft bg-light text-dark">
                                Quotes & teachings
                            </span>
                        </a>
                        <a class="btn btn-outline-primary btn-sm" href="soundscapes.php">
                            <span>
                                <span>🎧</span>
                                <span>Soundscapes</span>
                            </span>
                            <span class="aa-badge-soft bg-light text-dark">
                                Background audio
                            </span>
                        </a>
                        <a class="btn btn-outline-primary btn-sm" href="push.php">
                            <span>
                                <span>📲</span>
                                <span>Push Notifications</span>
                            </span>
                            <span class="aa-badge-soft bg-light text-dark">
                                Send a new broadcast
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- System info / metadata -->
        <div class="col-12 col-lg-6">
            <div class="aa-card h-100">
                <div class="card-header aa-card-header-soft">
                    <strong>System Snapshot</strong>
                </div>
                <div class="card-body">
                    <p class="small text-muted">
                        High-level view of how the Abundance Alchemy app is doing right now.
                    </p>
                    <ul class="list-unstyled small mb-3">
                        <li class="mb-1">
                            <strong>Total users:</strong> <?= (int)$total_users ?>
                        </li>
                        <li class="mb-1">
                            <strong>New today:</strong> <?= (int)$today_signups ?> user<?= $today_signups == 1 ? '' : 's' ?>
                        </li>
                        <li class="mb-1">
                            <strong>New in last 7 days:</strong> <?= (int)$week_signups ?> user<?= $week_signups == 1 ? '' : 's' ?>
                        </li>
                        <li class="mb-1">
                            <strong>High-streak users (7+ days):</strong> <?= (int)$high_streak_users ?>
                        </li>
                        <li class="mb-1">
                            <strong>Average streak:</strong> <?= number_format($avg_streak, 1) ?> days
                        </li>
                    </ul>

                    <div class="d-flex flex-wrap gap-2">
                        <a href="users.php" class="btn btn-sm btn-outline-secondary">
                            Go to Users
                        </a>
                        <a href="push.php" class="btn btn-sm btn-outline-secondary">
                            New Push Notification
                        </a>
                        <a href="affirmations.php" class="btn btn-sm btn-outline-secondary">
                            Affirmations Library
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div> <!-- /.container -->

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>