# Xサーバーアップロード チェックリスト

## スパム対策強化版 - アップロード対象ファイル

### 📋 アップロードファイル一覧

#### 🔄 更新ファイル（上書き）

- [ ] `public/index.html` - **reCAPTCHA v3スクリプト追加（NEW）**
  - ⚠️ YOUR_SITE_KEY を実際のサイトキーに置き換えてください
- [ ] `public/_site/send_mail.php` - **スパム検証ロジック強化版 + reCAPTCHA有効化**
  - レート制限: 3回→2回/時間
  - スパムキーワードフィルター追加
  - URL数チェック追加
  - IPブロックリスト機能追加
  - **reCAPTCHA v3有効化（NEW）**
  - ⚠️ YOUR_SECRET_KEY を実際のシークレットキーに置き換えてください
- [ ] `public/_site/script.js` - **reCAPTCHA v3対応（NEW）**
  - ⚠️ YOUR_SITE_KEY を実際のサイトキーに置き換えてください

#### 📁 新規フォルダ・ファイル

- [ ] `public/_site/spam/` - スパム対策専用フォルダ
  - [ ] `spam/.htaccess` - アクセス制限
  - [ ] `spam/README.md` - フォルダ説明
  - [ ] `spam/UPLOAD_GUIDE.md` - アップロードガイド
  - [ ] `spam/ANTI_SPAM_GUIDE.md` - **スパム対策総合ガイド（NEW）**
  - [ ] `spam/RECAPTCHA_SETUP.md` - **reCAPTCHA設定ガイド（NEW）**
  - [ ] `spam/manage_blocklist.php` - **IP管理スクリプト（NEW）**
  - [ ] `spam/logs/` - ログ保存用フォルダ
    - [ ] `spam/logs/.gitkeep`
  - [ ] `spam/data/` - データ保存用フォルダ
    - [ ] `spam/data/.gitkeep`
    - [ ] `spam/data/rate_limit.json` - レート制限データ（初期ファイル）
    - [ ] `spam/data/ip_blocklist.json` - **IPブロックリスト（NEW）**

#### 📚 参考ドキュメント（アップロード不要）

- `public/_site/SPAM_PROTECTION_SETUP.md` - 設定ガイド（ローカル保管用）

---

## 📤 アップロード手順

### Step 1: FTP接続
```
ホスト: sv***.xserver.jp
ユーザー名: [XサーバーのサーバーID]
パスワード: [FTPパスワード]
```

### Step 2: ファイルアップロード

**アップロード先**: `public_html/`

1. **更新ファイル**を上書きアップロード：
   - `index.html`
   - `_site/send_mail.php`
   - `_site/script.js`

2. **spamフォルダ**を新規アップロード：
   - `_site/spam/` （フォルダごと）

### Step 3: パーミッション設定

| パス | パーミッション |
|------|---------------|
| `_site/spam/` | 755 |
| `_site/spam/logs/` | 755 |
| `_site/spam/data/` | 755 |
| `_site/spam/.htaccess` | 644 |
| その他ファイル | 644 |

**注意**: 書き込みエラーが出る場合は、`spam/`, `spam/logs/`, `spam/data/` を 777 に変更

---

## ✅ 動作確認

### 1. .htaccessの確認
以下のURLにアクセスして、403/404エラーが表示されることを確認：
```
https://studioq.co.jp/_site/spam/logs/
https://studioq.co.jp/_site/spam/data/
```

### 2. フォーム送信テスト
1. `https://studioq.co.jp` にアクセス
2. お問い合わせフォームに入力
3. **3秒以上待ってから**送信ボタンをクリック
4. 送信成功メッセージを確認

### 3. ログファイルの確認
FTPで以下のファイルが作成されているか確認：
- `_site/spam/data/rate_limit.json` にデータが追加されている

### 4. スパム対策の動作確認
- 連続して4回送信を試みる → レート制限エラーが表示される
- `_site/spam/logs/spam_log.txt` が作成され、ログが記録される

---

## 🔧 トラブルシューティング

### エラーが発生した場合

1. **ブラウザのコンソール確認** (F12 → Console)
2. **Xサーバーのエラーログ確認** (サーバーパネル → ログファイル)
3. **パーミッション確認** (755 → 777に変更してテスト)
4. **スパムログ確認** (`_site/spam/logs/spam_log.txt`)

詳細は `spam/UPLOAD_GUIDE.md` を参照してください。

---

## 🔑 reCAPTCHA v3 キー設定手順（必須）

reCAPTCHA v3が有効化されていますが、**キーの設定が必要**です。

### Step 1: Googleでキーを取得

1. https://www.google.com/recaptcha/admin/create にアクセス
2. 以下を入力して登録:
   - **ラベル**: `StudioQ Website`
   - **reCAPTCHAタイプ**: `v3` を選択
   - **ドメイン**: `studioq.co.jp` と `localhost` を追加
3. **サイトキー**と**シークレットキー**をコピー

### Step 2: 3箇所のキーを置き換え

- [ ] `public/index.html` 175行目: `YOUR_SITE_KEY` → あなたのサイトキー
- [ ] `public/_site/script.js` 1008行目: `YOUR_SITE_KEY` → あなたのサイトキー
- [ ] `public/_site/send_mail.php` 13行目: `YOUR_SECRET_KEY` → あなたのシークレットキー

### Step 3: ファイルをアップロード

詳細は `RECAPTCHA_SETUP_STEPS.md` を参照してください。

---

## 📊 実装済みスパム対策（強化版 + reCAPTCHA v3）

- ✅ **ハニーポット**: ボット自動入力検出
- ✅ **タイムスタンプ検証**: 送信速度チェック（3秒未満は拒否）
- ✅ **リファラーチェック**: 送信元確認
- ✅ **IPブロックリスト**: スパムIP自動ブロック（NEW）
- ✅ **レート制限**: 1時間に2回まで（強化: 3回→2回）
- ✅ **スパムキーワードフィルター**: 50以上のキーワード検出（NEW）
- ✅ **URL数チェック**: 3個以上のURLを拒否（NEW）
- ✅ **reCAPTCHA v3**: **導入済み（NEW）** ⚠️ キーの設定が必要

---

## 📅 メンテナンス

### 定期確認（週1回）
- [ ] `spam/logs/spam_log.txt` でスパム攻撃を確認
- [ ] ログファイルサイズを確認（10MB超えたら削除検討）
- [ ] **スパムIPを自動ブロック**: `php spam/manage_blocklist.php auto 5`

### 月次メンテナンス
- [ ] `spam/data/rate_limit.json` をクリア: `echo "[]" > spam/data/rate_limit.json`
- [ ] ログファイルのバックアップとクリア
- [ ] IPブロックリストを確認: `php spam/manage_blocklist.php list`

---

## 🎯 完了チェック

- [ ] すべてのファイルがアップロードされている
- [ ] パーミッションが設定されている
- [ ] .htaccessが動作している
- [ ] フォームが正常に送信できる
- [ ] ログファイルが作成される
- [ ] レート制限が機能している

**すべてチェックが完了したら、アップロード作業完了です！** 🎉
