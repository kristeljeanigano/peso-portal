<?php
// Set default page title if not provided by the including file
if (!isset($pageTitle)) $pageTitle = 'PESO Online';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title><?= htmlspecialchars($pageTitle) ?> — PESO</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>