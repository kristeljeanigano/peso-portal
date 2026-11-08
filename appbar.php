<?php
// Security check: Redirect to home if not logged in
if (empty($_SESSION['user_id'])) {
    header('Location: peso-portal.html');
    exit;
}
$isEm = ($_SESSION['role'] ?? '') === 'employer';
$name = htmlspecialchars($_SESSION['name'] ?? 'User', ENT_QUOTES, 'UTF-8');
?>
<header class="appbar">
  <div class="container">
    <a href="dashboard.php" class="brand">
      <span class="mark">PESO</span>
      <span>
        <strong>PESO Online</strong>
        <small>Member area</small>
      </span>
    </a>
    <div class="tools">
      <span class="pill"><?= $isEm ? 'Employer' : 'Jobseeker' ?></span>
      <button class="btn btn-glass bell" type="button" aria-label="Notifications">
        🔔<span class="badge">0</span>
      </button>
      <div class="me">
        <div class="av"><?= strtoupper(substr($name, 0, 1)) ?></div>
        <div>
          <small>Signed in as</small>
          <b><?= $name ?></b>
        </div>
      </div>
      <a href="logout.php" class="btn btn-glass">Log out</a>
    </div>
  </div>
</header>
<main id="main">