<?php
// 文字エンコーディングの設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// デバッグログ（検証時のみ true）
$DEBUG = false; // 本番運用のため false に設定
$log_file = __DIR__ . '/mail_log.txt';
function log_debug($msg) {
    global $DEBUG, $log_file;
    if ($DEBUG) {
        @file_put_contents($log_file, '[' . date('Y-m-d H:i:s') . "] " . $msg . "\n", FILE_APPEND | LOCK_EX);
    }
}

// リクエスト情報を記録
log_debug('Request method: ' . (isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '-'));
log_debug('POST keys: ' . implode(',', array_keys($_POST ?? [])));

// フォームから送信されたデータを取得（サニタイズ）
$name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email   = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$phone   = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$subject = isset($_POST['subject']) && $_POST['subject'] !== '' ? trim(strip_tags($_POST['subject'])) : 'StudioQウェブサイトからのお問い合わせ';

// 入力値のバリデーション
if ($name === '' || $email === '' || $message === '') {
    log_debug('Validation failed: missing required fields');
    header('Location: contact_error.html');
    exit;
}

// 送信先・送信元
$to        = 't.ueda@studioq.co.jp';
$from_mail = 't.ueda@studioq.co.jp'; // XサーバーはReturn-Path（-f）必須のことが多い
$from_name = 'StudioQ問い合わせフォーム';

// 文字コード設定（JISで送信）
$charset = 'ISO-2022-JP-MS';

// メールヘッダー（JISでエンコード）
$encoded_from_name = mb_encode_mimeheader(mb_convert_encoding($from_name, $charset, 'UTF-8'), $charset);
$headers  = 'From: ' . $encoded_from_name . ' <' . $from_mail . ">\r\n";
$headers .= 'Reply-To: ' . $email . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=ISO-2022-JP\r\n";
$headers .= "Content-Transfer-Encoding: 7bit\r\n";

// メール本文の作成
$mail_body  = "StudioQウェブサイトからのお問い合わせ\n\n";
$mail_body .= "【お名前】\n" . $name . "\n\n";
$mail_body .= "【メールアドレス】\n" . $email . "\n\n";
if ($phone !== '') {
    $mail_body .= "【電話番号】\n" . $phone . "\n\n";
}
$mail_body .= "【お問い合わせ内容】\n" . $message . "\n\n";
$mail_body .= "----------------------------------------\n";
$mail_body .= '送信日時: ' . date('Y/m/d H:i:s') . "\n";
$mail_body .= '送信元IPアドレス: ' . (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '-') . "\n";
$mail_body .= 'ブラウザ情報: ' . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '-') . "\n";

// Xサーバー対策: Return-Path を -f で明示
$additional_params = '-f ' . $from_mail;

// 本文・件名をJISに変換
$mail_body_jis = mb_convert_encoding($mail_body, $charset, 'UTF-8');
$subject_jis_encoded = mb_encode_mimeheader(mb_convert_encoding($subject, $charset, 'UTF-8'), $charset);

// メール送信
$result = @mb_send_mail($to, $subject_jis_encoded, $mail_body_jis, $headers, $additional_params);
log_debug('Send to admin: ' . ($result ? 'OK' : 'NG'));
if (!$result) {
    log_debug('sendmail_path: ' . ini_get('sendmail_path'));
    $last_error = error_get_last();
    if (!empty($last_error)) {
        log_debug('PHP error: ' . $last_error['message']);
    }
}

// 自動返信メールの送信
if ($result) {
    $auto_reply_subject = '【StudioQ】お問い合わせありがとうございます';
    $auto_reply_message  = $name . " 様\n\n";
    $auto_reply_message .= "この度はStudioQへお問い合わせいただき、誠にありがとうございます。\n";
    $auto_reply_message .= "以下の内容でお問い合わせを受け付けました。\n\n";
    $auto_reply_message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_reply_message .= "【お名前】\n" . $name . "\n\n";
    $auto_reply_message .= "【メールアドレス】\n" . $email . "\n\n";
    if ($phone !== '') {
        $auto_reply_message .= "【電話番号】\n" . $phone . "\n\n";
    }
    $auto_reply_message .= "【お問い合わせ内容】\n" . $message . "\n";
    $auto_reply_message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    $auto_reply_message .= "内容を確認次第、担当者より折り返しご連絡させていただきます。\n";
    $auto_reply_message .= "なお、お問い合わせの内容によっては、回答までにお時間をいただく場合がございます。\n";
    $auto_reply_message .= "あらかじめご了承くださいませ。\n\n";
    $auto_reply_message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_reply_message .= "Studio Q\n";
    $auto_reply_message .= "〒556-0003\n";
    $auto_reply_message .= "大阪府大阪市浪速区恵美須西３−２−４ ２F\n";
    $auto_reply_message .= "TEL: 06-6978-8122\n";
    $auto_reply_message .= "FAX: 06-6978-8123\n";
    $auto_reply_message .= "URL: https://studioq.co.jp\n";
    $auto_reply_message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

    $auto_reply_headers  = 'From: ' . mb_encode_mimeheader(mb_convert_encoding('StudioQ', $charset, 'UTF-8'), $charset) . ' <' . $from_mail . ">\r\n";
    $auto_reply_headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";
    $auto_reply_headers .= "MIME-Version: 1.0\r\n";
    $auto_reply_headers .= "Content-Type: text/plain; charset=ISO-2022-JP\r\n";
    $auto_reply_headers .= "Content-Transfer-Encoding: 7bit\r\n";

    $auto_reply_message_jis = mb_convert_encoding($auto_reply_message, $charset, 'UTF-8');
    $auto_reply_subject_jis = mb_encode_mimeheader(mb_convert_encoding($auto_reply_subject, $charset, 'UTF-8'), $charset);
    $ar = @mb_send_mail($email, $auto_reply_subject_jis, $auto_reply_message_jis, $auto_reply_headers, $additional_params);
    log_debug('Send auto-reply: ' . ($ar ? 'OK' : 'NG'));
}

// 送信完了ページへリダイレクト
if ($result) {
    header('Location: contact_thanks.html');
} else {
    header('Location: contact_error.html');
}
exit;
?>
