<?php
// デバッグ用テストスクリプト
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "<h1>PHP環境チェック</h1>";
echo "<pre>";

echo "PHP Version: " . phpversion() . "\n";
echo "mb_send_mail: " . (function_exists('mb_send_mail') ? '✅ OK' : '❌ NG') . "\n";
echo "mail: " . (function_exists('mail') ? '✅ OK' : '❌ NG') . "\n";
echo "curl: " . (function_exists('curl_init') ? '✅ OK' : '❌ NG') . "\n";
echo "json_decode: " . (function_exists('json_decode') ? '✅ OK' : '❌ NG') . "\n";
echo "file_put_contents: " . (function_exists('file_put_contents') ? '✅ OK' : '❌ NG') . "\n";

echo "\n<h2>ディレクトリ権限チェック</h2>";

$dirs = [
    'spam/' => __DIR__ . '/spam/',
    'spam/logs/' => __DIR__ . '/spam/logs/',
    'spam/data/' => __DIR__ . '/spam/data/',
];

foreach ($dirs as $name => $path) {
    $exists = is_dir($path);
    $writable = $exists && is_writable($path);
    echo "$name: ";
    echo "存在=" . ($exists ? '✅' : '❌') . ", ";
    echo "書込=" . ($writable ? '✅' : '❌') . "\n";
}

echo "\n<h2>ログ書き込みテスト</h2>";

$test_log = __DIR__ . '/spam/logs/test.txt';
$result = @file_put_contents($test_log, "Test at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
echo "Log write: " . ($result !== false ? '✅ OK (' . $result . ' bytes)' : '❌ NG') . "\n";

if ($result !== false) {
    echo "Log file: $test_log\n";
} else {
    echo "Error: ログファイルに書き込めません\n";
    echo "Directory: " . dirname($test_log) . "\n";
    echo "Writable: " . (is_writable(dirname($test_log)) ? 'Yes' : 'No') . "\n";
}

echo "\n<h2>reCAPTCHA接続テスト</h2>";

if (function_exists('curl_init')) {
    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $result = @curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "cURL test: " . ($result !== false ? '✅ OK' : '❌ NG') . "\n";
    if ($error) {
        echo "Error: $error\n";
    }
} else {
    echo "cURL: ❌ Not available\n";
}

echo "\n<h2>$_SERVER変数</h2>";
echo "REMOTE_ADDR: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'Unknown') . "\n";
echo "HTTP_REFERER: " . ($_SERVER['HTTP_REFERER'] ?? 'Unknown') . "\n";

echo "</pre>";

echo "<p><a href='/'>トップページに戻る</a></p>";
?>
