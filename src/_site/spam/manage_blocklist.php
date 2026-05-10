<?php
/**
 * スパムIP管理スクリプト
 * 
 * 使用方法:
 * 1. IPをブロックリストに追加: 
 *    php manage_blocklist.php add 123.45.67.89
 * 
 * 2. IPをブロックリストから削除:
 *    php manage_blocklist.php remove 123.45.67.89
 * 
 * 3. ブロックリストを表示:
 *    php manage_blocklist.php list
 * 
 * 4. スパムログから頻繁なIPを自動追加:
 *    php manage_blocklist.php auto
 */

$blocklist_file = __DIR__ . '/data/ip_blocklist.json';
$spam_log_file = __DIR__ . '/logs/spam_log.txt';

// ブロックリストを読み込む
function load_blocklist() {
    global $blocklist_file;
    
    if (!file_exists($blocklist_file)) {
        return [];
    }
    
    $data = file_get_contents($blocklist_file);
    return json_decode($data, true) ?: [];
}

// ブロックリストを保存する
function save_blocklist($blocklist) {
    global $blocklist_file;
    
    $json = json_encode(array_values(array_unique($blocklist)), JSON_PRETTY_PRINT);
    file_put_contents($blocklist_file, $json);
}

// IPをブロックリストに追加
function add_ip($ip) {
    if (!filter_var($ip, FILTER_VALIDATE_IP)) {
        echo "エラー: 無効なIPアドレスです: {$ip}\n";
        return false;
    }
    
    $blocklist = load_blocklist();
    
    if (in_array($ip, $blocklist)) {
        echo "このIPは既にブロックリストに登録されています: {$ip}\n";
        return false;
    }
    
    $blocklist[] = $ip;
    save_blocklist($blocklist);
    
    echo "IPをブロックリストに追加しました: {$ip}\n";
    return true;
}

// IPをブロックリストから削除
function remove_ip($ip) {
    $blocklist = load_blocklist();
    
    if (!in_array($ip, $blocklist)) {
        echo "このIPはブロックリストに登録されていません: {$ip}\n";
        return false;
    }
    
    $blocklist = array_diff($blocklist, [$ip]);
    save_blocklist($blocklist);
    
    echo "IPをブロックリストから削除しました: {$ip}\n";
    return true;
}

// ブロックリストを表示
function list_blocklist() {
    $blocklist = load_blocklist();
    
    if (empty($blocklist)) {
        echo "ブロックリストは空です。\n";
        return;
    }
    
    echo "=== ブロックリスト（" . count($blocklist) . "件）===\n";
    foreach ($blocklist as $ip) {
        echo "- {$ip}\n";
    }
}

// スパムログから頻繁なIPを自動抽出してブロックリストに追加
function auto_block_from_log($threshold = 5) {
    global $spam_log_file;
    
    if (!file_exists($spam_log_file)) {
        echo "スパムログファイルが見つかりません: {$spam_log_file}\n";
        return;
    }
    
    // ログからIPアドレスを抽出
    $log_content = file_get_contents($spam_log_file);
    preg_match_all('/IP:\s*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/', $log_content, $matches);
    
    if (empty($matches[1])) {
        echo "ログにIPアドレスが見つかりませんでした。\n";
        return;
    }
    
    // IPの出現回数をカウント
    $ip_counts = array_count_values($matches[1]);
    
    // 閾値以上のIPをブロックリストに追加
    $added = 0;
    foreach ($ip_counts as $ip => $count) {
        if ($count >= $threshold) {
            echo "検出: {$ip} ({$count}回のスパム試行)\n";
            if (add_ip($ip)) {
                $added++;
            }
        }
    }
    
    echo "\n自動ブロック完了: {$added}件のIPを追加しました。\n";
}

// コマンドライン引数を処理
if ($argc < 2) {
    echo "使用方法:\n";
    echo "  php manage_blocklist.php add <IPアドレス>     - IPを追加\n";
    echo "  php manage_blocklist.php remove <IPアドレス>  - IPを削除\n";
    echo "  php manage_blocklist.php list                - リストを表示\n";
    echo "  php manage_blocklist.php auto [閾値]         - ログから自動追加（デフォルト閾値: 5回）\n";
    exit(1);
}

$command = $argv[1];

switch ($command) {
    case 'add':
        if ($argc < 3) {
            echo "エラー: IPアドレスを指定してください。\n";
            exit(1);
        }
        add_ip($argv[2]);
        break;
        
    case 'remove':
        if ($argc < 3) {
            echo "エラー: IPアドレスを指定してください。\n";
            exit(1);
        }
        remove_ip($argv[2]);
        break;
        
    case 'list':
        list_blocklist();
        break;
        
    case 'auto':
        $threshold = isset($argv[2]) ? intval($argv[2]) : 5;
        auto_block_from_log($threshold);
        break;
        
    default:
        echo "エラー: 無効なコマンドです: {$command}\n";
        exit(1);
}
?>
