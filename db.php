<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// InfinityFree Database Configuration
$dbUser = 'if0_43513565';
$dbPass = 'meowmeowmeow67';
$dbName = 'if0_43513565_peso_portal';
$dbHost = 'sql110.infinityfree.com'; // Specific host for this account
$dbPort = 3306;

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    // Log error for debugging but don't show sensitive info to users
    error_log('Database Connection Failed: ' . $e->getMessage());
    
    http_response_code(500);
    exit('<!doctype html><html><head><meta charset="utf-8"><title>Error</title></head><body style="font-family:sans-serif;padding:20px;background:#f4f6fa;color:#12203d;"><h2>System Error</h2><p>The database connection failed. Please try again later or contact support if the issue persists.</p></body></html>');
}
?>