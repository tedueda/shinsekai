# 🔧 エラーデバッグガイド

送信エラーが発生した場合の対処方法です。

---

## 📋 現在の状況

- ✅ デバッグモードを有効化済み
- ✅ エラー表示を有効化済み
- ✅ 詳細ログ出力を有効化済み

---

## 🔍 Step 1: ログファイルを確認

### FTPでログファイルをダウンロード

以下のファイルをダウンロードして内容を確認：

```
public_html/_site/spam/logs/mail_log.txt
public_html/_site/spam/logs/spam_log.txt
```

### ログの見方

#### mail_log.txt（デバッグログ）
```
[2025-10-30 12:00:00] ===== スクリプト開始 =====
[2025-10-30 12:00:00] REQUEST_METHOD: POST
[2025-10-30 12:00:00] REMOTE_ADDR: 123.45.67.89
[2025-10-30 12:00:01] reCAPTCHA検証開始
[2025-10-30 12:00:01] reCAPTCHA検証成功: スコア 0.9
```

#### spam_log.txt（スパム検出ログ）
```
[2025-10-30 12:00:00] スパム検出: ハニーポット入力あり, IP: 123.45.67.89
```

---

## 🛠️ Step 2: よくあるエラーと対処法

### エラー1: ログファイルが作成されない

**原因**: ディレクトリの書き込み権限がない

**対処法**:
```bash
# FTPでパーミッションを変更
_site/spam/logs/ → 777
_site/spam/data/ → 777
```

### エラー2: reCAPTCHA検証エラー

**ログ例**:
```
[2025-10-30 12:00:01] reCAPTCHA検証失敗
```

**原因**:
- シークレットキーが間違っている
- ドメイン設定が間違っている
- Googleのサーバーに接続できない

**対処法**:
1. `send_mail.php` 16行目のシークレットキーを確認
2. Google管理画面で `studioq.co.jp` が登録されているか確認
3. Xサーバーでcurl拡張が有効か確認

### エラー3: スパム対策でブロックされている

**ログ例**:
```
[2025-10-30 12:00:00] スパム検出: レート制限超過, IP: 123.45.67.89
```

**原因**: 1時間に2回以上送信している

**対処法**:
```bash
# FTPで rate_limit.json を編集
echo "[]" > public_html/_site/spam/data/rate_limit.json
```

### エラー4: PHPのエラー

**ブラウザに表示される例**:
```
Fatal error: Call to undefined function mb_send_mail() in send_mail.php on line 250
```

**原因**: Xサーバーのmb_send_mail関数が使えない

**対処法**: 後述の「mb_send_mail対策」を参照

---

## 🔧 Step 3: 一時的な対処（デバッグ用）

### reCAPTCHAを一時的に無効化

`send_mail.php` の17行目を変更：

```php
$RECAPTCHA_ENABLED = false; // 一時的に無効化
```

これでreCAPTCHAなしでフォームが送信できます。

### レート制限を緩和

`send_mail.php` の39行目を変更：

```php
$max_requests = 10; // 一時的に緩和
```

---

## 📧 Step 4: Xサーバー特有の問題

### mb_send_mail が使えない場合

Xサーバーでは `mb_send_mail()` の代わりに `mail()` を使用する必要がある場合があります。

**エラー例**:
```
Fatal error: Call to undefined function mb_send_mail()
```

**対処法**: `send_mail.php` の250行目付近を確認し、必要に応じて `mail()` に変更。

---

## 🧪 Step 5: 簡易テスト用PHPファイル

以下のファイルを作成してアップロード：

### test_mail.php

```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "PHP Version: " . phpversion() . "<br>";
echo "mb_send_mail: " . (function_exists('mb_send_mail') ? 'OK' : 'NG') . "<br>";
echo "curl: " . (function_exists('curl_init') ? 'OK' : 'NG') . "<br>";
echo "file_put_contents: " . (is_writable(__DIR__ . '/spam/logs/') ? 'OK' : 'NG') . "<br>";

// ログテスト
$test_log = __DIR__ . '/spam/logs/test.txt';
$result = file_put_contents($test_log, "Test\n");
echo "Log write: " . ($result !== false ? 'OK' : 'NG') . "<br>";
?>
```

アップロード先：
```
public_html/_site/test_mail.php
```

アクセス：
```
https://studioq.co.jp/_site/test_mail.php
```

---

## ✅ Step 6: 問題解決後

### デバッグモードを無効化

`send_mail.php` を編集：

```php
// 2-4行目
error_reporting(0);
ini_set('display_errors', '0');

// 11行目
$DEBUG = false; // 本番運用のため無効化
```

### ログファイルを削除

```bash
# FTPで削除
public_html/_site/spam/logs/mail_log.txt
public_html/_site/spam/logs/test.txt
```

---

## 📞 サポート

上記の手順で解決しない場合：

1. **ログファイルの内容を確認**
2. **ブラウザのコンソールエラーを確認**
3. **Xサーバーのエラーログを確認**（サーバーパネル → ログファイル）

---

**まずはログファイルをダウンロードして、エラーの詳細を確認してください！**
