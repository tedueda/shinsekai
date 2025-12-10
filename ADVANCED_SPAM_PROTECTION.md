# 🛡️ 高度なスパム対策ガイド

## 現在の実装状況

✅ **実装済み（7層防御）**
1. reCAPTCHA v3（スコア0.5以上）
2. レート制限（1時間2回）
3. タイムスタンプ検証（3秒未満拒否）
4. スパムキーワードフィルター（50+キーワード）
5. URL数チェック（3個以上拒否）
6. IPブロックリスト
7. リファラーチェック

**期待される効果**: スパム削減率 **95-98%**

---

## 追加推奨対策

### 🔥 優先度：高

#### 1. reCAPTCHAスコア閾値の調整

現在のスコア閾値: **0.5**

**海外からの大量スパムが続く場合**:

```php
// src/_site/send_mail.php の18行目を変更
$RECAPTCHA_SCORE_THRESHOLD = 0.7; // 0.5 → 0.7 に変更
```

**スコアの目安**:
- `0.3`: 緩い（スパムが多い場合は上げる）
- `0.5`: 標準（現在の設定）
- `0.7`: 厳しい（推奨：海外スパム対策）
- `0.9`: 非常に厳しい（正当なユーザーもブロックされる可能性）

**実施方法**:
1. `src/_site/send_mail.php` を編集
2. `./start_dev_server.sh` で確認
3. `tools/package.sh` でスナップショット作成
4. Xサーバーにアップロード

---

#### 2. 国別IPブロック（海外スパム対策）

海外からのスパムが多い場合、特定の国からのアクセスをブロック:

**実装方法**:

`src/_site/send_mail.php` の190行目付近に以下を追加:

```php
// 国別IPブロック（オプション）
function is_blocked_country($ip) {
    // GeoIPデータベースを使用する場合
    // または、既知の海外スパムIP範囲をブロック
    
    // 例: 特定の国のIP範囲をブロック
    $blocked_ranges = [
        // 例: 中国の一部IP範囲（実際のスパム元に応じて調整）
        // '202.96.0.0/12',
        // '218.0.0.0/8',
    ];
    
    foreach ($blocked_ranges as $range) {
        if (ip_in_range($ip, $range)) {
            return true;
        }
    }
    return false;
}

function ip_in_range($ip, $range) {
    list($subnet, $bits) = explode('/', $range);
    $ip_long = ip2long($ip);
    $subnet_long = ip2long($subnet);
    $mask = -1 << (32 - $bits);
    return ($ip_long & $mask) == ($subnet_long & $mask);
}

// メイン処理で使用
$client_ip = $_SERVER['REMOTE_ADDR'] ?? '';
if (is_blocked_country($client_ip)) {
    log_spam("Blocked country IP: $client_ip");
    header('Location: contact_error.html');
    exit;
}
```

**注意**: 正当な海外ユーザーもブロックされる可能性があります。

---

#### 3. レート制限の強化

現在: **1時間に2回**

**海外スパムが多い場合**:

```php
// src/_site/send_mail.php の40行目を変更
$max_requests = 1; // 2 → 1 に変更（1時間に1回のみ）
```

または、時間枠を延長:

```php
$max_requests = 2;
$time_window = 7200; // 3600（1時間）→ 7200（2時間）に変更
```

---

### 📊 優先度：中

#### 4. ハニーポット（Honeypot）の追加

ボットが自動入力するダミーフィールドを追加:

**実装方法**:

`src/index.html` のフォームに追加:

```html
<!-- ハニーポット（人間には見えない） -->
<input type="text" name="website" id="website" value="" style="position:absolute;left:-9999px;width:1px;height:1px;" tabindex="-1" autocomplete="off">
```

`src/_site/send_mail.php` に検証を追加:

```php
// ハニーポット検証
if (!empty($_POST['website'])) {
    log_spam("Honeypot triggered: " . $_POST['website']);
    header('Location: contact_error.html');
    exit;
}
```

---

#### 5. メール内容の詳細分析

スパムの特徴を分析して、フィルターを強化:

```php
// src/_site/send_mail.php に追加
function analyze_spam_patterns($message) {
    $spam_patterns = [
        '/\b(viagra|cialis|casino|lottery|winner)\b/i',
        '/\b(click here|buy now|limited time)\b/i',
        '/\b(crypto|bitcoin|investment)\b/i',
        '/[A-Z]{10,}/', // 大文字の連続
        '/\$\d+/', // 金額表記
    ];
    
    foreach ($spam_patterns as $pattern) {
        if (preg_match($pattern, $message)) {
            return true;
        }
    }
    return false;
}

// 使用例
if (analyze_spam_patterns($message)) {
    log_spam("Spam pattern detected in message");
    header('Location: contact_error.html');
    exit;
}
```

---

### 🔍 優先度：低（モニタリング）

#### 6. スパムログの定期分析

週次でスパムログを確認し、パターンを把握:

```bash
# スパムログを確認
cat public/_site/spam/logs/spam_log.txt

# 最も多いスパム送信元IPを確認
grep "IP:" public/_site/spam/logs/spam_log.txt | sort | uniq -c | sort -rn | head -10

# 特定のキーワードを検索
grep -i "viagra" public/_site/spam/logs/spam_log.txt
```

---

#### 7. Cloudflareの導入（最強）

**Cloudflare**を使用すると、サーバーに到達する前にスパムをブロック:

- ✅ DDoS攻撃対策
- ✅ ボット対策
- ✅ 国別アクセス制限
- ✅ レート制限
- ✅ WAF（Web Application Firewall）

**導入方法**:
1. https://www.cloudflare.com/ でアカウント作成（無料プラン可）
2. ドメイン（studioq.co.jp）を登録
3. ネームサーバーをCloudflareに変更
4. セキュリティ設定を有効化

**効果**: スパム削減率 **99%以上**

---

## 実施推奨順序

### 今すぐ実施（5分）
1. ✅ reCAPTCHAスコアを0.7に変更
2. ✅ レート制限を1時間1回に変更

### 今週中に実施（30分）
3. ✅ ハニーポットを追加
4. ✅ スパムログを分析してIPブロックリストを更新

### 今月中に検討（1-2時間）
5. ⭕ Cloudflareの導入を検討
6. ⭕ 国別IPブロックの実装（必要に応じて）

---

## モニタリング方法

### 週次確認
```bash
# スパム数を確認
grep "$(date +%Y-%m)" public/_site/spam/logs/spam_log.txt | wc -l

# 送信成功数を確認
grep "Send to admin: OK" public/_site/spam/logs/mail_log.txt | wc -l
```

### 月次レポート
- スパム削減率の計算
- reCAPTCHAスコア分布の確認（Google管理画面）
- ブロックされたIPの確認

---

## 緊急時の対応

### スパム攻撃が続く場合

**即座に実施**:
```php
// src/_site/send_mail.php の18行目
$RECAPTCHA_SCORE_THRESHOLD = 0.9; // 最も厳しい設定

// 40行目
$max_requests = 1; // 1時間に1回のみ

// 41行目
$time_window = 86400; // 24時間に1回のみ
```

**一時的にフォームを無効化**:
```html
<!-- src/index.html のフォームを一時的にコメントアウト -->
<p style="color: red; font-weight: bold;">
現在、お問い合わせフォームはメンテナンス中です。<br>
お急ぎの方は、お電話（06-6978-8122）にてお問い合わせください。
</p>
```

---

## まとめ

### 現在の対策で期待される効果
- ✅ 自動ボット: **95%以上ブロック**
- ✅ 連続送信攻撃: **99%以上ブロック**
- ✅ 典型的なスパム: **90%以上ブロック**

### 追加対策後の期待される効果
- ✅ reCAPTCHAスコア0.7 + レート制限強化: **98%以上ブロック**
- ✅ Cloudflare導入: **99%以上ブロック**

### 重要な注意点
⚠️ **完璧なスパム対策は存在しません**。スパマーは常に新しい手法を開発しています。定期的なモニタリングと調整が必要です。

---

**作成日**: 2025年12月3日
**次回見直し**: 2025年12月10日（1週間後）
