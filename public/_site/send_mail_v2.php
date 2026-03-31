<?php
error_reporting(0);
ini_set('display_errors', '0');

mb_language('Japanese');
mb_internal_encoding('UTF-8');

$logFile = __DIR__ . '/mail_v2_debug.log';

function form_log($message) {
    global $logFile;
    @file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n", FILE_APPEND | LOCK_EX);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: contact_error.html');
    exit;
}

// === スパム対策 ===

// 1. ハニーポット
$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    form_log('blocked: honeypot');
    header('Location: contact_error.html');
    exit;
}

// 2. タイムスタンプ検証（3秒未満は拒否）
$ts = intval($_POST['form_timestamp'] ?? 0);
if ($ts > 0) {
    $diff = (time() * 1000 - $ts) / 1000;
    if ($diff >= 0 && $diff < 3) {
        form_log('blocked: too fast (' . round($diff, 1) . 's)');
        header('Location: contact_error.html');
        exit;
    }
}

$name = trim(strip_tags($_POST['name'] ?? ''));
$email = trim($_POST['email'] ?? '');
$phone = trim(strip_tags($_POST['phone'] ?? ''));
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    form_log('blocked: required fields missing');
    header('Location: contact_error.html');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    form_log('blocked: invalid email ' . $email);
    header('Location: contact_error.html');
    exit;
}

// 3. キリル文字・アラビア文字ブロック
$allText = $name . ' ' . $message;
if (preg_match('/[\x{0400}-\x{04FF}\x{0600}-\x{06FF}]/u', $allText)) {
    form_log('blocked: non-JP script in "' . mb_substr($name, 0, 30) . '"');
    header('Location: contact_error.html');
    exit;
}

// 4. URL/リンクブロック（名前・メッセージ内）
if (preg_match('/(https?:\/\/|www\.|\.com\/|\.ru\/|\.cn\/|tinyurl|bit\.ly)/i', $allText)) {
    form_log('blocked: URL in message from ' . $email);
    header('Location: contact_error.html');
    exit;
}

// 5. 禁止ワード
$banned = ['перевод', 'руб', 'забрать', 'casino', 'viagra', 'crypto', 'bitcoin', 'lottery', 'winner'];
$lowerAll = mb_strtolower($allText, 'UTF-8');
foreach ($banned as $word) {
    if (mb_strpos($lowerAll, $word) !== false) {
        form_log('blocked: banned word "' . $word . '" from ' . $email);
        header('Location: contact_error.html');
        exit;
    }
}

// 6. reCAPTCHA v3 検証
$recaptchaToken = trim($_POST['g-recaptcha-response'] ?? '');
if ($recaptchaToken !== '') {
    $recaptchaSecret = '6Lcq9ZEsAAAAACAvfQ8OxkTBqyWUD3aJBdwRwMUH';
    $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $verifyData = http_build_query([
        'secret' => $recaptchaSecret,
        'response' => $recaptchaToken,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => $verifyData,
            'timeout' => 5,
        ],
    ]);
    $verifyResult = @file_get_contents($verifyUrl, false, $context);
    if ($verifyResult !== false) {
        $recaptchaData = json_decode($verifyResult, true);
        $score = $recaptchaData['score'] ?? 0;
        $success = $recaptchaData['success'] ?? false;
        form_log('reCAPTCHA: success=' . ($success ? 'true' : 'false') . ' score=' . $score);
        if (!$success || $score < 0.3) {
            form_log('blocked: reCAPTCHA score too low (' . $score . ') from ' . $email);
            header('Location: contact_error.html');
            exit;
        }
    }
} else {
    form_log('warning: no reCAPTCHA token from ' . $email);
}

// 7. IPレート制限（同一IPから5分に2回まで）
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateLimitFile = __DIR__ . '/rate_limit.json';
$rateData = [];
if (file_exists($rateLimitFile)) {
    $rateData = json_decode(@file_get_contents($rateLimitFile), true) ?: [];
}
$now = time();
// 古いエントリを削除（5分以上前）
$rateData = array_filter($rateData, function($entry) use ($now) {
    return ($now - $entry['time']) < 300;
});
// 現在のIPのカウント
$ipCount = 0;
foreach ($rateData as $entry) {
    if ($entry['ip'] === $ip) $ipCount++;
}
if ($ipCount >= 2) {
    form_log('blocked: rate limit for IP ' . $ip);
    header('Location: contact_error.html');
    exit;
}
$rateData[] = ['ip' => $ip, 'time' => $now];
@file_put_contents($rateLimitFile, json_encode(array_values($rateData)), LOCK_EX);

$to = 't.ueda@studioq.co.jp';
$from = 't.ueda@studioq.co.jp';
$charset = 'ISO-2022-JP-MS';
$adminSubject = 'SHINSEKAIウェブサイトからのお問い合わせ';
$adminBody = "SHINSEKAIウェブサイトからのお問い合わせ\n\n"
    . "お名前: {$name}\n"
    . "メールアドレス: {$email}\n"
    . "電話番号: {$phone}\n\n"
    . "お問い合わせ内容:\n{$message}\n\n"
    . "送信日時: " . date('Y/m/d H:i:s') . "\n"
    . "送信元IP: " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n";

$adminHeaders = [];
$adminHeaders[] = 'From: ' . mb_encode_mimeheader(mb_convert_encoding('SHINSEKAI', $charset, 'UTF-8'), $charset) . ' <' . $from . '>';
$adminHeaders[] = 'Reply-To: ' . $email;
$adminHeaders[] = 'MIME-Version: 1.0';
$adminHeaders[] = 'Content-Type: text/plain; charset=ISO-2022-JP';
$adminHeaders[] = 'Content-Transfer-Encoding: 7bit';

$adminSubjectEncoded = mb_encode_mimeheader(mb_convert_encoding($adminSubject, $charset, 'UTF-8'), $charset);
$adminBodyEncoded = mb_convert_encoding($adminBody, $charset, 'UTF-8');
$sentAdmin = @mb_send_mail($to, $adminSubjectEncoded, $adminBodyEncoded, implode("\r\n", $adminHeaders));
form_log('admin mail: ' . ($sentAdmin ? 'OK' : 'NG'));

if (!$sentAdmin) {
    header('Location: contact_error.html');
    exit;
}

$replySubject = '【SHINSEKAI】お問い合わせありがとうございます';
$replyBody = $name . " 様\n\n"
    . "お問い合わせありがとうございます。以下の内容で受け付けました。\n\n"
    . "お名前: {$name}\n"
    . "メールアドレス: {$email}\n"
    . ($phone !== '' ? "電話番号: {$phone}\n" : '')
    . "\nお問い合わせ内容:\n{$message}\n\n"
    . "内容を確認後、ご連絡いたします。\n\n"
    . "SHINSEKAI\n"
    . "〒556-0003\n"
    . "大阪府大阪市浪速区恵美須西３−２−４ ２F\n"
    . "TEL: 06-6978-8122\n";

$replyHeaders = [];
$replyHeaders[] = 'From: ' . mb_encode_mimeheader(mb_convert_encoding('SHINSEKAI', $charset, 'UTF-8'), $charset) . ' <' . $from . '>';
$replyHeaders[] = 'MIME-Version: 1.0';
$replyHeaders[] = 'Content-Type: text/plain; charset=ISO-2022-JP';
$replyHeaders[] = 'Content-Transfer-Encoding: 7bit';

$replySubjectEncoded = mb_encode_mimeheader(mb_convert_encoding($replySubject, $charset, 'UTF-8'), $charset);
$replyBodyEncoded = mb_convert_encoding($replyBody, $charset, 'UTF-8');
$sentReply = @mb_send_mail($email, $replySubjectEncoded, $replyBodyEncoded, implode("\r\n", $replyHeaders));
form_log('auto reply: ' . ($sentReply ? 'OK' : 'NG'));

header('Location: contact_thanks.html');
exit;
