<?php
require_once __DIR__ . '/db.php';
if (empty($_SESSION['just_registered'])) { header('Location: index.html#join'); exit; }
unset($_SESSION['just_registered']);

// Set the page title for the browser tab
$pageTitle = 'Account created';

// Include the top HTML and the Logged-in Navigation
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/appbar.php'; 
?>

<section class="block">
  <div class="container">
    <div class="shell">
      <div class="confirm">
        <div class="ticket">
          <div>
            <p class="tag"><?= $isEm ? 'Employer account' : 'Application tracking ID' ?></p>
            <p class="id"><?= htmlspecialchars($_SESSION['tracking_id'], ENT_QUOTES, 'UTF-8') ?></p>
            <p>Thank you, <?= htmlspecialchars($_SESSION['name'], ENT_QUOTES, 'UTF-8') ?>. We will contact you at your registered email. Keep this ID to follow your application.</p>
            <div class="acts">
              <a class="btn btn-gold" href="dashboard.php">
                <?= $isEm ? 'Open recruiter command center' : 'Open my dashboard and job offers' ?>
              </a>
              <button class="btn btn-glass" type="button" data-copy="<?= htmlspecialchars($_SESSION['tracking_id'], ENT_QUOTES, 'UTF-8') ?>">Copy ID</button>
            </div>
          </div>
          <div>
            <h2>Status</h2>
            <ol class="timeline">
              <li class="done">Account created <span>Today</span></li>
              <?php if ($isEm): ?>
                <li class="cur">PESO verification <span>Within 3 working days</span></li>
                <li>Post vacancies <span>After verification</span></li>
              <?php else: ?>
                <li class="cur">Profile matching <span>Ongoing</span></li>
                <li>Employer review <span>When you apply</span></li>
              <?php endif; ?>
            </ol>
          </div>
        </div>
        <p class="note">All PESO services are free. Never pay a fee to anyone claiming to process your application.</p>
      </div>
    </div>
  </div>
</section>

<?php 
// Include the footer, login dialog, and JS files
require_once __DIR__ . '/footer.php'; 
?>