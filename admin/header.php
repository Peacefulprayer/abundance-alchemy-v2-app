<?php
$current_page = basename($_SERVER['PHP_SELF'], '.php');
$adminName = isset($_SESSION['admin_name']) ? $_SESSION['admin_name'] : 'Admin';
$adminBasePath = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/admin')), '/');
if ($adminBasePath === '') {
    $adminBasePath = '/admin';
}
$adminHref = static function (string $page) use ($adminBasePath): string {
    return htmlspecialchars($adminBasePath . '/' . ltrim($page, '/'), ENT_QUOTES, 'UTF-8');
};
$adminAsset = static function (string $path) use ($adminBasePath): string {
    return htmlspecialchars($adminBasePath . '/' . ltrim($path, '/'), ENT_QUOTES, 'UTF-8');
};
?>
<style>
.admin-nav {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-bottom: 1px solid rgba(255,255,255,.08);
    padding: .75rem 0;
    margin-bottom: 0;
}

.admin-nav .navbar-brand {
    display: flex;
    align-items: center;
    gap: .75rem;
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    text-decoration: none;
}

.admin-nav .navbar-brand img {
    border-radius: .5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.3);
}

.admin-nav .nav-link {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .5rem .85rem;
    border-radius: .5rem;
    color: rgba(255,255,255,.7);
    font-size: .88rem;
    font-weight: 500;
    text-decoration: none;
    transition: all .2s ease;
    border: 1px solid transparent;
}

.admin-nav .nav-link:hover {
    color: #fff;
    background: rgba(255,255,255,.08);
}

.admin-nav .nav-link.active {
    color: #ff6a1a;
    background: rgba(255,106,26,.12);
    border-color: rgba(255,106,26,.2);
}

.admin-nav .nav-link i {
    font-size: 1rem;
}

.admin-nav .admin-user {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 1px solid rgba(255,255,255,.1);
}

.admin-nav .admin-name {
    color: rgba(255,255,255,.9);
    font-size: .9rem;
    font-weight: 500;
}

.admin-nav .logout-btn {
    background: none;
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.6);
    padding: .35rem .75rem;
    border-radius: .4rem;
    font-size: .8rem;
    cursor: pointer;
    transition: all .2s ease;
    text-decoration: none;
}

.admin-nav .logout-btn:hover {
    background: rgba(255,255,255,.08);
    color: #fff;
    border-color: rgba(255,255,255,.25);
}

.admin-nav .mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    padding: .25rem;
}

@media (max-width: 992px) {
    .admin-nav .mobile-toggle {
        display: block;
    }
    
    .admin-nav .nav-collapse {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a1a2e;
        padding: 1rem;
        border-top: 1px solid rgba(255,255,255,.08);
        box-shadow: 0 8px 24px rgba(0,0,0,.3);
    }
    
    .admin-nav .nav-collapse.show {
        display: block;
    }
    
    .admin-nav .nav-links {
        flex-direction: column;
        gap: .25rem;
    }
    
    .admin-nav .nav-link {
        padding: .6rem .75rem;
    }
    
    .admin-nav .admin-user {
        margin-left: 0;
        padding-left: 0;
        border-left: none;
        margin-top: .75rem;
        padding-top: .75rem;
        border-top: 1px solid rgba(255,255,255,.1);
    }
}

@media (min-width: 993px) {
    .admin-nav .nav-collapse {
        display: flex !important;
    }
}
</style>

<nav class="admin-nav navbar-expand-lg">
    <div class="container">
        <a class="navbar-brand" href="<?= $adminHref('dashboard.php') ?>">
            <img src="<?= $adminAsset('assets/images/logo.png') ?>" width="36" alt="Logo">
            <span>Abundance Alchemy</span>
        </a>
        
        <button class="mobile-toggle" type="button" onclick="document.querySelector('.nav-collapse').classList.toggle('show')">
            <i class="bi bi-list"></i>
        </button>
        
        <div class="nav-collapse">
            <div class="nav-links d-flex flex-wrap align-items-center gap-1 mb-0">
                <a class="nav-link <?= $current_page === 'dashboard' ? 'active' : '' ?>" href="<?= $adminHref('dashboard.php') ?>">
                    <i class="bi bi-speedometer2"></i>
                    Dashboard
                </a>
                <a class="nav-link <?= $current_page === 'users' ? 'active' : '' ?>" href="<?= $adminHref('users.php') ?>">
                    <i class="bi bi-people"></i>
                    Users
                </a>
                <a class="nav-link <?= $current_page === 'affirmations' ? 'active' : '' ?>" href="<?= $adminHref('affirmations.php') ?>">
                    <i class="bi bi-chat-quote"></i>
                    Affirmations
                </a>
                <a class="nav-link <?= $current_page === 'wisdom' ? 'active' : '' ?>" href="<?= $adminHref('wisdom.php') ?>">
                    <i class="bi bi-journal-text"></i>
                    Wisdom
                </a>
                <a class="nav-link <?= $current_page === 'prayers' ? 'active' : '' ?>" href="<?= $adminHref('prayers.php') ?>">
                    <i class="bi bi-prayer"></i>
                    Prayers
                </a>
                <a class="nav-link <?= $current_page === 'soundscapes' ? 'active' : '' ?>" href="<?= $adminHref('soundscapes.php') ?>">
                    <i class="bi bi-music-note-list"></i>
                    Soundscapes
                </a>
                <a class="nav-link <?= $current_page === 'backgrounds' ? 'active' : '' ?>" href="<?= $adminHref('backgrounds.php') ?>">
                    <i class="bi bi-image"></i>
                    Backgrounds
                </a>
                <a class="nav-link <?= $current_page === 'admin-security' ? 'active' : '' ?>" href="<?= $adminHref('admin-security.php') ?>">
                    <i class="bi bi-shield-lock"></i>
                    Security
                </a>
                <a class="nav-link <?= $current_page === 'push' ? 'active' : '' ?>" href="<?= $adminHref('push.php') ?>">
                    <i class="bi bi-bell"></i>
                    Push
                </a>
            </div>
            
            <div class="admin-user">
                <span class="admin-name">
                    <i class="bi bi-person-circle me-1"></i>
                    <?= htmlspecialchars($adminName) ?>
                </span>
                <form method="post" action="<?= $adminHref('logout.php') ?>" style="display:inline">
                    <?php 
                    if (function_exists('aa_csrf_field')) {
                        aa_csrf_field();
                    }
                    ?>
                    <button type="submit" class="logout-btn">
                        <i class="bi bi-box-arrow-right me-1"></i>
                        Logout
                    </button>
                </form>
            </div>
        </div>
    </div>
</nav>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
