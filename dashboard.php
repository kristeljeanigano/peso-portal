<?php
require_once __DIR__ . '/db.php';

// Security: Redirect if not logged in
if (empty($_SESSION['user_id'])) {
    header('Location: peso-portal.html');
    exit;
}

// Set page title and determine role
$pageTitle = 'Dashboard';
$isEm = ($_SESSION['role'] ?? '') === 'employer';
$name = htmlspecialchars($_SESSION['name'] ?? 'User', ENT_QUOTES, 'UTF-8');
$trackingId = htmlspecialchars($_SESSION['tracking_id'] ?? '', ENT_QUOTES, 'UTF-8');

// 1. Include the top HTML, CSS link, and Logged-in Navigation
require_once __DIR__ . '/header.php';
require_once __DIR__ . '/appbar.php'; 
?>

<!-- ================= TOP BANNER ================= -->
<section class="banner">
  <div class="container">
    <div class="bgrid">
      <div>
        <h1><?= $isEm ? 'Recruiter command center' : 'Your job dashboard' ?></h1>
        <p class="sub">Signed in as <?= $name ?>. 
          <?= ($_SESSION['status'] ?? '') === 'pending' 
              ? 'Your employer account is awaiting PESO verification.' 
              : 'Your account is active.' ?></p>
      </div>
      <div class="track">
        <h2>Tracking ID</h2>
        <p class="tid"><?= $trackingId ?></p>
        <div class="stats">
          <div><b>0</b><span><?= $isEm ? 'Active postings' : 'Saved jobs' ?></span></div>
          <div><b>0</b><span><?= $isEm ? 'Total applicants' : 'Active applications' ?></span></div>
          <div><b>0</b><span>Interviews</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= MAIN DASHBOARD CONTENT ================= -->
<?php if ($isEm): ?>
  <!-- ============ EMPLOYER VIEW ============ -->
  <main id="emMain">
    <div class="container">
      <div class="hd">
        <div>
          <h1>Manage your hiring</h1>
          <p>Post vacancies, review applicants, and request PESO hiring support.</p>
        </div>
        <button class="btn btn-gold" id="btnPost">+ Post a new vacancy</button>
      </div>

      <div class="estats">
        <div class="stat"><b>0</b><span>Active postings</span></div>
        <div class="stat"><b>0</b><span>Pending approval</span></div>
        <div class="stat"><b>0</b><span>Total applicants</span></div>
        <div class="stat"><b>0</b><span>Interviews scheduled</span></div>
      </div>

      <div class="card">
        <div class="mtabs tabs" role="tablist">
          <button role="tab" aria-selected="true">Job postings</button>
          <button role="tab" aria-selected="false">Applicants</button>
          <button role="tab" aria-selected="false">Hiring assistance</button>
        </div>

        <h2>Your job postings</h2>
        <div class="tw">
          <table>
            <thead>
              <tr><th>Position</th><th>Location</th><th>Pay</th><th>Slots</th><th>Applicants</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody id="postingsBody">
              <tr><td colspan="7" class="empty">You haven't posted any vacancies yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Applicants</h2>
        <div class="fbar">
          <div class="field">
            <label for="fPosting">Posting</label>
            <select id="fPosting"><option>All postings</option></select>
          </div>
          <div class="field">
            <label for="fStatus">Status</label>
            <select id="fStatus">
              <option>All statuses</option><option>New</option><option>Shortlisted</option><option>Interview</option><option>Rejected</option>
            </select>
          </div>
        </div>
        <div class="tw">
          <table>
            <thead>
              <tr><th>Applicant</th><th>Applied for</th><th>Resume</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody id="applicantsBody">
              <tr><td colspan="5" class="empty">No applicants yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h2>Upcoming PESO events</h2>
        <div class="egrid">
          <div class="efair">
            <time>Sat, Nov 14, 2026</time>
            <h3>Mega Job Fair</h3>
            <p>Booths for verified employers. On-the-spot interviews.</p>
            <button class="btn btn-line btn-sm">Reserve a booth</button>
          </div>
          <div class="efair">
            <time>Sat, Jan 16, 2027</time>
            <h3>Youth and Special Placements Fair</h3>
            <p>Inclusive hiring for students, PWDs and returning workers.</p>
            <button class="btn btn-line btn-sm">Join this fair</button>
          </div>
        </div>
      </div>
    </div>
  </main>

<?php else: ?>
  <!-- ============ JOBSEEKER VIEW ============ -->
  <main id="jsMain">
    <div class="container">
      <div class="jh">
        <h2>Job offers</h2>
        <p>Verified vacancies from employers in your area. Pay is in Philippine pesos (₱).</p>
      </div>
      
      <div class="jbar">
        <div class="field">
          <label for="jSearch">Search jobs</label>
          <input id="jSearch" type="search" placeholder="Title, skill or company">
        </div>
        <div class="field">
          <label for="jLoc">Location</label>
          <input id="jLoc" type="text" placeholder="City or barangay">
        </div>
      </div>

      <div class="fchips" role="group" aria-label="Filters">
        <button type="button" aria-pressed="true">All</button>
        <button type="button" aria-pressed="false">Full-time</button>
        <button type="button" aria-pressed="false">Part-time</button>
        <button type="button" aria-pressed="false">No experience</button>
        <button type="button" aria-pressed="false">Remote</button>
      </div>

      <p class="count"><span id="jCount">0</span> jobs found</p>
      
      <div class="jgrid" id="jGrid">
        <!-- Sample Job Card to demonstrate CSS styling -->
        <article class="card jc">
          <div class="tags"><span class="tag">Full-time</span><span class="tag r">Urgent</span></div>
          <h3>Customer Service Representative</h3>
          <p class="cname">Sample BPO Corp.</p>
          <div class="meta"><span>📍 Cagayan de Oro</span><span>💼 1-2 yrs exp</span></div>
          <p class="pay">₱18,000 - ₱22,000</p>
          <div class="row">
            <button class="btn btn-p">Apply</button>
            <button class="btn btn-line">Save</button>
          </div>
        </article>
        
        <article class="card jc">
          <div class="tags"><span class="tag">Part-time</span></div>
          <h3>Administrative Assistant</h3>
          <p class="cname">Local Government Unit</p>
          <div class="meta"><span>📍 Downtown</span><span>💼 Entry level</span></div>
          <p class="pay">₱12,000</p>
          <div class="row">
            <button class="btn btn-p">Apply</button>
            <button class="btn btn-line">Save</button>
          </div>
        </article>
      </div>
    </div>
  </main>
<?php endif; ?>

<?php 
// 2. Include the footer, login dialog, and JS files
require_once __DIR__ . '/footer.php'; 
?>