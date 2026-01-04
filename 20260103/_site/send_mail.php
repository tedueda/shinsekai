<?php
// エラー表示を有効化（デバッグ用）
error_reporting(E_ALL);
ini_set('display_errors', '1');

// 文字エンコーディングの設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// デバッグログ（検証時のみ true）
$DEBUG = true; // エラー調査のため一時的に有効化
$log_file = __DIR__ . '/spam/logs/mail_log.txt';
$spam_log_file = __DIR__ . '/spam/logs/spam_log.txt'; // スパム検出ログ

// reCAPTCHA v3の設定
$RECAPTCHA_SECRET_KEY = '6LcWv_srAAAAAErWOpHvNzLM-e_GdYV-HPPHXw5u';
$RECAPTCHA_ENABLED = true; // reCAPTCHA v3有効化
$RECAPTCHA_SCORE_THRESHOLD = 0.3; // 許可するスコアの閾値（少し緩めに設定して正当なユーザーが弾かれないようにする）

function log_debug($msg) {
    global $DEBUG, $log_file;
    if ($DEBUG) {
        @file_put_contents($log_file, '[' . date('Y-m-d H:i:s') . "] " . $msg . "\n", FILE_APPEND | LOCK_EX);
    }
}

// デバッグ: スクリプト開始
log_debug("===== スクリプト開始 =====");
log_debug("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
log_debug("REMOTE_ADDR: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'));

function log_spam($msg) {
    global $spam_log_file;
    @file_put_contents($spam_log_file, '[' . date('Y-m-d H:i:s') . "] " . $msg . "\n", FILE_APPEND | LOCK_EX);
}

// スパム対策: レート制限（同一IPからの連続送信を制限）
function check_rate_limit($ip) {
    $limit_file = __DIR__ . '/spam/data/rate_limit.json';
    $max_requests = 2; // 最大送信回数（強化：3→2）
    $time_window = 3600; // 1時間（秒）
    
    // ファイルが存在しない場合は作成
    if (!file_exists($limit_file)) {
        file_put_contents($limit_file, json_encode([]));
    }
    
    $data = json_decode(file_get_contents($limit_file), true) ?: [];
    $current_time = time();
    
    // 古いデータを削除
    $data = array_filter($data, function($entry) use ($current_time, $time_window) {
        return ($current_time - $entry['time']) < $time_window;
    });
    
    // このIPからのリクエスト数をカウント
    $ip_requests = array_filter($data, function($entry) use ($ip) {
        return $entry['ip'] === $ip;
    });
    
    if (count($ip_requests) >= $max_requests) {
        return false; // レート制限超過
    }
    
    // 新しいリクエストを記録
    $data[] = ['ip' => $ip, 'time' => $current_time];
    file_put_contents($limit_file, json_encode($data));
    
    return true; // OK
}

// reCAPTCHA v3の検証関数
// IPブロックリスト（スパム送信元を記録）
function is_ip_blocked($ip) {
    $blocklist_file = __DIR__ . '/spam/data/ip_blocklist.json';
    
    if (!file_exists($blocklist_file)) {
        return false;
    }
    
    $blocklist = json_decode(file_get_contents($blocklist_file), true) ?: [];
    return in_array($ip, $blocklist);
}

// スパムキーワードチェック
function contains_spam_keywords($text) {
    $spam_keywords = [
        // 英語スパムキーワード
        'viagra', 'cialis', 'casino', 'poker', 'lottery', 'prize',
        'investment', 'bitcoin', 'crypto', 'loan', 'mortgage',
        'replica', 'rolex', 'nike', 'pharmacy', 'pills',
        'sex', 'porn', 'adult', 'dating', 'singles',
        'click here', 'buy now', 'limited time', 'act now',
        'congratulations', 'winner', 'claim your',
        // 日本語スパムキーワード
        '出会い', '副業', '高収入', '在宅ワーク', '即金',
        'お金を稼ぐ', '簡単に稼げる', '月収', '年収アップ',
        'クリック', '今すぐ', '限定', '無料で', '当選',
        'アダルト', '18歳以上', 'ギャンブル', 'カジノ',
        '借金', 'ローン', '融資', '現金化', '借入',
        'バイアグラ', 'シアリス', '精力剤', 'ダイエット',
        'サプリ', '痩せる', '健康食品', 'コピー品',
        'ブランド品', 'レプリカ', '激安', '格安',
        'http://', 'https://', 'www.', '.com', '.net', '.org'
    ];
    
    $text_lower = mb_strtolower($text, 'UTF-8');
    
    foreach ($spam_keywords as $keyword) {
        if (mb_strpos($text_lower, mb_strtolower($keyword, 'UTF-8')) !== false) {
            return true;
        }
    }
    
    return false;
}

// URL数チェック（スパムメールは複数URLを含むことが多い）
function count_urls($text) {
    $url_pattern = '/(https?:\/\/|www\.)[^\s]+/i';
    preg_match_all($url_pattern, $text, $matches);
    return count($matches[0]);
}

function verify_recaptcha($token) {
    global $RECAPTCHA_SECRET_KEY, $RECAPTCHA_ENABLED, $RECAPTCHA_SCORE_THRESHOLD;
    
    if (!$RECAPTCHA_ENABLED) {
        return true; // reCAPTCHAが無効の場合はスキップ
    }
    
    if (empty($token)) {
        log_debug('reCAPTCHA: token empty');
        return false;
    }
    
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $post_fields = http_build_query([
        'secret' => $RECAPTCHA_SECRET_KEY,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ]);

    $response = false;
    $err = '';
    // cURL が使える場合は cURL を優先
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        $response = curl_exec($ch);
        if ($response === false) {
            $err = curl_error($ch);
        }
        curl_close($ch);
        log_debug('reCAPTCHA: verify via cURL' . ($err ? (' (error=' . $err . ')') : ''));
    } else {
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/x-www-form-urlencoded',
                'content' => $post_fields,
                'timeout' => 8,
            ]
        ];
        $context = stream_context_create($options);
        log_debug('reCAPTCHA: verify via file_get_contents');
        $response = @file_get_contents($url, false, $context);
    }

    if ($response === false) {
        // ネットワークエラー等でreCAPTCHAに到達できない場合は、
        // 正常なユーザーをブロックしないようにログだけ残して通過させる
        log_debug('reCAPTCHA: siteverify request failed' . ($err ? (', err=' . $err) : ''));
        return true;
    }

    $result = json_decode($response, true);
    log_debug('reCAPTCHA raw: ' . $response);
    $score = isset($result['score']) ? $result['score'] : 'n/a';
    $success = isset($result['success']) && $result['success'];
    log_debug('reCAPTCHA success=' . ($success ? 'true' : 'false') . ', score=' . $score);

    // Googleが明示的に success=false を返した場合のみブロック
    if (!$success) {
        log_debug('reCAPTCHA: explicit failure from Google, treat as spam');
        return false;
    }

    // success=true かつ score が設定されている場合のみスコア判定。
    // score が返ってこないケースでは success を優先して通過させる。
    if (isset($result['score'])) {
        return $result['score'] >= $RECAPTCHA_SCORE_THRESHOLD;
    }

    return true;
}

// リクエスト情報を記録
log_debug('Request method: ' . (isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : '-'));
log_debug('POST keys: ' . implode(',', array_keys($_POST ?? [])));

// ===== スパム対策 1: ハニーポット検証 =====
$honeypot = isset($_POST['website']) ? trim($_POST['website']) : '';
if ($honeypot !== '') {
    log_spam('スパム検出: ハニーポット入力あり (IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '-') . ')');
    // スパムと判断し、何も表示せずエラーページへ（ボットに気づかせない）
    header('Location: contact_error.html');
    exit;
}

// ===== スパム対策 2: タイムスタンプ検証 =====
$form_timestamp = isset($_POST['form_timestamp']) ? intval($_POST['form_timestamp']) : 0;
$current_time = round(microtime(true) * 1000); // ミリ秒
$time_diff = ($current_time - $form_timestamp) / 1000; // 秒単位
log_debug('Timing check: diff=' . $time_diff . 's');

// 3秒未満または1時間以上の場合はスパムの可能性
if ($time_diff < 3 || $time_diff > 3600) {
    log_spam('スパム検出: 異常な送信タイミング (' . $time_diff . '秒, IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '-') . ')');
    header('Location: contact_error.html');
    exit;
}

// ===== スパム対策 3: リファラーチェック =====
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
$allowed_domains = ['studioq.co.jp', 'localhost', '127.0.0.1'];
$referer_valid = false;

foreach ($allowed_domains as $domain) {
    if (strpos($referer, $domain) !== false) {
        $referer_valid = true;
        break;
    }
}

log_debug('Referer: ' . ($referer !== '' ? $referer : '(empty)') . ', valid=' . ($referer_valid ? 'true' : 'false'));

if (!$referer_valid && !empty($referer)) {
    log_spam('スパム検出: 不正なリファラー (' . $referer . ', IP: ' . ($_SERVER['REMOTE_ADDR'] ?? '-') . ')');
    header('Location: contact_error.html');
    exit;
}

// ===== スパム対策 4: IPブロックリストチェック =====
$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// if (is_ip_blocked($client_ip)) {
//     log_spam('スパム検出: ブロックリストIP (IP: ' . $client_ip . ')');
//     header('Location: contact_error.html');
//     exit;
// }

// ===== スパム対策 5: レート制限 =====
// if (!check_rate_limit($client_ip)) {
//     log_spam('スパム検出: レート制限超過 (IP: ' . $client_ip . ')');
//     header('Location: contact_error.html');
//     exit;
// }

// ===== スパム対策 6: reCAPTCHA v3検証（有効な場合） =====
$recaptcha_token = isset($_POST['recaptcha_token']) ? trim($_POST['recaptcha_token']) : '';
if ($RECAPTCHA_ENABLED && !verify_recaptcha($recaptcha_token)) {
    log_spam('スパム検出: reCAPTCHA検証失敗 (IP: ' . $client_ip . ')');
    header('Location: contact_error.html');
    exit;
}

// ===== スパム対策 7: スパムキーワードチェック =====
// まだフォームデータを取得していないので、ここでは取得のみ
$temp_name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$temp_email   = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$temp_message = isset($_POST['message']) ? trim($_POST['message']) : '';

if (contains_spam_keywords($temp_name) || contains_spam_keywords($temp_email) || contains_spam_keywords($temp_message)) {
    log_spam('スパム検出: スパムキーワード検出 (IP: ' . $client_ip . ', Name: ' . $temp_name . ', Email: ' . $temp_email . ')');
    header('Location: contact_error.html');
    exit;
}

// ===== スパム対策 8: URL数チェック（3個以上はスパム） =====
if (count_urls($temp_message) >= 3) {
    log_spam('スパム検出: 複数URL検出 (IP: ' . $client_ip . ')');
    header('Location: contact_error.html');
    exit;
}

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
