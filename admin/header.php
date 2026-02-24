<nav class="navbar navbar-light bg-light mb-4">
    <div class="container-fluid">
      <a class="navbar-brand" href="dashboard.php">
        <img src="assets/images/logo.png" width="100" alt="Logo">
        <span class="ms-2">Abundance Alchemy</span>
      </a>
      <div>
        <a class="btn btn-outline-primary btn-sm me-2" href="dashboard.php">Dashboard</a>
        <a class="btn btn-outline-secondary btn-sm me-2" href="users.php">Users</a>
        <a class="btn btn-outline-secondary btn-sm me-2" href="affirmations.php">Affirmations</a>
        <a class="btn btn-outline-secondary btn-sm me-2" href="wisdom.php">Wisdom</a>
        <a class="btn btn-outline-secondary btn-sm" href="push.php">Push Notif.</a>
        <a class="btn btn-outline-secondary btn-sm me-2" href="soundscapes.php">Soundscapes</a>
        <a class="btn btn-outline-secondary btn-sm me-2" href="backgrounds.php">Backgrounds</a>
        <span class="fw-bold ms-3"><?=htmlspecialchars($_SESSION['admin_name'])?></span>
        <form method="post" action="logout.php" style="display:inline">
          <?php aa_csrf_field(); ?>
          (<button type="submit" style="border:0;background:none;padding:0;text-decoration:underline;color:#0d6efd;cursor:pointer;">Logout</button>)
        </form>
      </div>
    </div>
</nav>
