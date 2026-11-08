<?php // login.php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Location: peso-portal.html'); exit; }

$email = mb_strtolower(trim((string)($_POST['email'] ?? '')));
$pass  = (string)($_POST['password'] ?? '');

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$u = $stmt->fetch();

// Verify credentials only (role is no longer checked against a form input)
if (!$u || !password_verify($pass, $u['password_hash'])) {
    http_response_code(401);
    echo '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="css/styles.css">'
        . '<section class="block"><div class="container"><div class="shell"><div class="wpanel">'
        . '<h3>Log in failed</h3><p class="help">Wrong email or password.</p>'
        . '<div class="acts"><a class="btn btn-p" href="peso-portal.html">Back</a></div>'
        . '</div></div></div></section>';
    exit;
}

// Automatically use the role stored in the database
$role = $u['role'];

session_regenerate_id(true);
$_SESSION['user_id']     = (int)$u['id'];
$_SESSION['role']        = $role;
$_SESSION['name']        = $u['first_name'] . ' ' . $u['last_name'];
$_SESSION['tracking_id'] = $u['tracking_id'];
$_SESSION['status']      = $u['status'];

header('Location: dashboard.php');
exit;