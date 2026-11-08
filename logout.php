<?php // logout.php
require_once __DIR__ . '/db.php';
$_SESSION = [];
session_destroy();
header('Location: peso-portal.html');
exit;