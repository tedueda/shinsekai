<?php
error_reporting(0);
ini_set('display_errors', '0');

mb_language('Japanese');
mb_internal_encoding('UTF-8');

$log_file = __DIR__ . '/mail_debug.log';

function write_log($message) {
    global $log_file;
    @file_put_contents($log_file, '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n", FILE_APPEND | LOCK_EX);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: contact_error.html');
    exit;
}

$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    write_log('blocked by honeypot');
    header('Location: contact_error.html');
    exit;
}

$name = trim(strip_tags($_POST['name'] ?? ''));
$email = trim($_POST['email'] ?? '');
$phone = trim(strip_tags($_POST['phone'] ?? ''));
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    write_log('validation failed');
    header('Location: contact_error.html');
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    write_log('invalid email: ' . $email);
    header('Location: contact_error.html');
    exit;
}

$to = 't.ueda@studioq.co.jp';
$from_mail = 't.ueda@studioq.co.jp';
$subject = 'SHINSEKAIウェブサイトからのお問い合わせ';

$admin_body  = "SHINSEKAIウェブサイトからのお問い合わせ\n\n";
$admin_body .= "お名前: " . $name . "\n";
$admin_body .= "メールアドレス: " . $email . "\n";
$admin_body .= "電話番号: " . $phone . "\n";
$admin_body .= "お問い合わせ内容:\n" . $message . "\n\n";
$admin_body .= "送信日時: " . date('Y/m/d H:i:s') . "\n";
$admin_body .= "送信元IP: " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n";

$headers = [];
$headers[] = 'From: SHINSEKAI <' . $from_mail . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'MIME-Version: 1.0';

$result = @mb_send_mail($to, $subject, $admin_body, implode("\r\n", $headers));
write_log('admin mail result=' . ($result ? 'OK' : 'NG'));

if ($result) {
    $reply_subject = '【SHINSEKAI】お問い合わせありがとうございます';
    $reply_body  = $name . " 様\n\n";
    $reply_body .= "お問い合わせありがとうございます。\n";
    $reply_body .= "以下の内容で受け付けました。\n\n";
    $reply_body .= "お名前: " . $name . "\n";
    $reply_body .= "メールアドレス: " . $email . "\n";
    if ($phone !== '') {
        $reply_body .= "電話番号: " . $phone . "\n";
    }
    $reply_body .= "お問い合わせ内容:\n" . $message . "\n\n";
    $reply_body .= "内容を確認後、ご連絡いたします。\n\n";
    $reply_body .= "SHINSEKAI\n";
    $reply_body .= "〒556-0003\n";
    $reply_body .= "大阪府大阪市浪速区恵美須西３−２−４ ２F\n";
    $reply_body .= "TEL: 06-6978-8122\n";

    $reply_headers = [];
    $reply_headers[] = 'From: SHINSEKAI <' . $from_mail . '>';
    $reply_headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $reply_headers[] = 'MIME-Version: 1.0';

    $auto_reply = @mb_send_mail($email, $reply_subject, $reply_body, implode("\r\n", $reply_headers));
    write_log('auto reply result=' . ($auto_reply ? 'OK' : 'NG'));
    header('Location: contact_thanks.html');
    exit;
}

header('Location: contact_error.html');
exit;
?>
