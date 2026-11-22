<?php
declare(strict_types=1);
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.html#join');
    exit;
}

function val(string $key): string {
    return trim((string)($_POST[$key] ?? ''));
}

function fail(array $errors): void {
    http_response_code(422);
    $items = '';
    foreach ($errors as $e) {
        $items .= '<li>' . htmlspecialchars($e, ENT_QUOTES, 'UTF-8') . '</li>';
    }
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width,initial-scale=1">'
       . '<title>Registration problem — PESO</title>'
       . '<link rel="stylesheet" href="styles.css"></head><body>'
       . '<section class="block"><div class="container"><div class="shell"><div class="wpanel">'
       . '<h3>We could not create your account</h3>'
       . '<p class="help">Please go back and fix the following:</p>'
       . '<div class="alert show"><ul>' . $items . '</ul></div>'
       . '<div class="acts"><a class="btn btn-p" href="index.html#join">Back to registration</a>'
       . '<button class="btn btn-line" type="button" onclick="history.back()">Keep my entries</button>'
       . '</div></div></div></div></section></body></html>';
    exit;
}

function upload_doc(string $field, string $folder, bool $required, array &$errors): array {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        if ($required) $errors[] = 'Please attach your resume (PDF, DOC or DOCX).';
        return [null, null];
    }
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK) { $errors[] = 'The upload failed. Please try again.'; return [null, null]; }
    if ($f['size'] > 5 * 1024 * 1024)  { $errors[] = 'The file must be 5 MB or smaller.';   return [null, null]; }

    $allowed = [
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
    ];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
    if (!isset($allowed[$mime])) { $errors[] = 'Only PDF, DOC or DOCX files are accepted.'; return [null, null]; }

    $dir = __DIR__ . '/uploads/' . $folder;
    if (!is_dir($dir)) mkdir($dir, 0775, true);

    $stored = bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $stored)) {
        $errors[] = 'The file could not be saved on the server.';
        return [null, null];
    }
    return [$stored, substr(basename($f['name']), 0, 255)];
}

/* ---------- shared fields ---------- */
$role    = val('role');
$first   = val('first_name');
$last    = val('last_name');
$email   = mb_strtolower(val('email'));
$mobile  = val('mobile');
$pass    = (string)($_POST['password'] ?? '');
$confirm = (string)($_POST['confirm_password'] ?? '');
$consent = val('consent') === '1';
$errors  = [];

if (!in_array($role, ['jobseeker', 'employer'], true)) $errors[] = 'Please choose an account type.';
if ($first === '')  $errors[] = 'First name is required.';
if ($last === '')   $errors[] = 'Last name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (!preg_match('/^[0-9+\s()\-]{7,20}$/', $mobile)) $errors[] = 'A valid mobile number is required.';
if (strlen($pass) < 8)   $errors[] = 'Password must be at least 8 characters.';
if ($pass !== $confirm)  $errors[] = 'Passwords do not match.';
if (!$consent)           $errors[] = 'You must agree to the data privacy statement.';

/* ---------- role-specific fields ---------- */
if ($role === 'jobseeker') {
    $birthdate = val('birthdate');
    $d = DateTime::createFromFormat('Y-m-d', $birthdate);
    if (!$d || $d->format('Y-m-d') !== $birthdate) $errors[] = 'A valid date of birth is required.';

    $sex      = val('sex');
    $barangay = val('barangay');
    $city     = val('city');
    $educ     = val('highest_education');
    $course   = val('course');
    $skills   = val('skills');
    $years    = max(0, min(60, (int)val('experience_years')));
    $jobType  = val('preferred_job_type');
    $location = val('preferred_location');
    $salary   = val('expected_salary') === '' ? null : (float)val('expected_salary');
    $avail    = val('availability');

    if ($sex === '')       $errors[] = 'Please select your sex.';
    if ($barangay === '')  $errors[] = 'Barangay is required.';
    if ($city === '')      $errors[] = 'City or municipality is required.';
    if ($educ === '')      $errors[] = 'Highest education is required.';
    if ($skills === '')    $errors[] = 'Please list at least one skill.';
    if ($jobType === '')   $errors[] = 'Work arrangement is required.';
    if ($location === '')  $errors[] = 'Preferred location is required.';
    if ($avail === '')     $errors[] = 'Availability is required.';

    [$resumeFile, $resumeOrig] = upload_doc('resume', 'resumes', true, $errors);
} else {
    $company  = val('company_name');
    $industry = val('industry');
    $position = val('position_title');
    $size     = val('company_size');
    $permitNo = val('business_permit_no');
    $address  = val('company_address');
    $website  = val('website');
    $hiring   = max(0, min(9999, (int)val('hiring_count')));

    if ($company === '')  $errors[] = 'Company name is required.';
    if ($industry === '') $errors[] = 'Industry is required.';
    if ($position === '') $errors[] = 'Your position is required.';
    if ($permitNo === '') $errors[] = 'Business permit / DTI / SEC number is required.';
    if ($address === '')  $errors[] = 'Company address is required.';
    if ($website !== '' && !filter_var($website, FILTER_VALIDATE_URL)) $errors[] = 'Website must be a valid URL.';

    [$permitFile, $permitOrig] = upload_doc('business_permit', 'permits', false, $errors);
}

/* ---------- duplicate email ---------- */
if (!$errors) {
    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $check->execute([$email]);
    if ($check->fetch()) $errors[] = 'That email address is already registered. Please log in instead.';
}

if ($errors) fail($errors);

/* ---------- save ---------- */
$trackingId = 'PESO-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
$hash       = password_hash($pass, PASSWORD_DEFAULT);
$status     = $role === 'employer' ? 'pending' : 'active';

try {
    $pdo->beginTransaction();

    $pdo->prepare(
        'INSERT INTO users (tracking_id, role, email, password_hash, first_name, last_name, mobile, status)
         VALUES (?,?,?,?,?,?,?,?)'
    )->execute([$trackingId, $role, $email, $hash, $first, $last, $mobile, $status]);

    $userId = (int)$pdo->lastInsertId();

    if ($role === 'jobseeker') {
        $pdo->prepare(
            'INSERT INTO jobseeker_profiles
             (user_id, birthdate, sex, barangay, city, highest_education, course, skills,
              experience_years, resume_filename, resume_original, preferred_job_type,
              preferred_location, expected_salary, availability, consent)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)'
        )->execute([
            $userId, $birthdate, $sex, $barangay, $city, $educ, $course, $skills,
            $years, $resumeFile, $resumeOrig, $jobType, $location, $salary, $avail
        ]);
    } else {
        $pdo->prepare(
            'INSERT INTO employer_profiles
             (user_id, company_name, industry, position_title, company_size, business_permit_no,
              company_address, website, hiring_count, permit_filename, permit_original, consent)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,1)'
        )->execute([
            $userId, $company, $industry, $position, $size, $permitNo,
            $address, $website, $hiring, $permitFile, $permitOrig
        ]);
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('PESO registration: ' . $e->getMessage());
    fail(['Something went wrong while saving your account. Please try again.']);
}

/* ---------- log in + show ticket ---------- */
session_regenerate_id(true);
$_SESSION['user_id']     = $userId;
$_SESSION['role']        = $role;
$_SESSION['name']        = $first . ' ' . $last;
$_SESSION['tracking_id'] = $trackingId;
$_SESSION['status']      = $status;
$_SESSION['just_registered'] = true;

header('Location: register_success.php');
exit;