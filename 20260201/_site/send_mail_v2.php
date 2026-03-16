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

$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    form_log('blocked: honeypot');
    header('Location: contact_error.html');
    exit;
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
