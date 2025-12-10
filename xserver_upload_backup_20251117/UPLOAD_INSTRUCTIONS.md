# 📤 Xサーバー アップロード手順

このフォルダー内のファイルをXサーバーにアップロードしてください。

---

## 📁 ファイル構成

```
xserver_upload/
├── index.html                      → public_html/index.html
├── _site/
│   ├── script.js                   → public_html/_site/script.js
│   ├── send_mail.php              → public_html/_site/send_mail.php
│   └── spam/
│       ├── .htaccess              → public_html/_site/spam/.htaccess
│       ├── README.md              → public_html/_site/spam/README.md
│       ├── UPLOAD_GUIDE.md        → public_html/_site/spam/UPLOAD_GUIDE.md
│       ├── ANTI_SPAM_GUIDE.md     → public_html/_site/spam/ANTI_SPAM_GUIDE.md
│       ├── RECAPTCHA_SETUP.md     → public_html/_site/spam/RECAPTCHA_SETUP.md
│       ├── manage_blocklist.php   → public_html/_site/spam/manage_blocklist.php
│       ├── data/
│       │   ├── ip_blocklist.json  → public_html/_site/spam/data/ip_blocklist.json
│       │   └── rate_limit.json    → public_html/_site/spam/data/rate_limit.json
│       └── logs/
│           └── .gitkeep           → public_html/_site/spam/logs/.gitkeep
└── UPLOAD_INSTRUCTIONS.md (このファイル、アップロード不要)
```

---

## 🚀 アップロード手順

### Step 1: FTP接続

**FTPソフト**（FileZilla、Cyberduckなど）で接続：

```
ホスト: sv***.xserver.jp
ユーザー名: [XサーバーのサーバーID]
パスワード: [FTPパスワード]
```

### Step 2: ファイルをアップロード

#### 2-1. 更新ファイル（上書き）

以下のファイルを**上書きアップロード**：

```
index.html               → public_html/index.html
_site/script.js          → public_html/_site/script.js
_site/send_mail.php      → public_html/_site/send_mail.php
```

#### 2-2. 新規フォルダーとファイル

**`_site/spam/`** フォルダー全体を新規アップロード：

```
_site/spam/ → public_html/_site/spam/
```

フォルダーごとドラッグ&ドロップでアップロードできます。

---

## 🔧 Step 3: パーミッション設定

FTPソフトで以下のパーミッションを設定：

| パス | パーミッション |
|------|---------------|
| `_site/spam/` | 755 |
| `_site/spam/logs/` | 755 |
| `_site/spam/data/` | 755 |
| `_site/spam/.htaccess` | 644 |
| その他のファイル | 644 |

**注意**: 書き込みエラーが出る場合は、`spam/`, `spam/logs/`, `spam/data/` を **777** に変更してください。

---

## ✅ Step 4: 動作確認

### 4-1. .htaccessの確認

以下のURLにアクセスして、**403または404エラー**が表示されることを確認：

```
https://studioq.co.jp/_site/spam/logs/
https://studioq.co.jp/_site/spam/data/
```

→ エラーが表示されればOK（外部からアクセスできない）

### 4-2. reCAPTCHAバッジの確認

```
https://studioq.co.jp
```

にアクセスして、**右下にreCAPTCHAバッジ**が表示されることを確認。

### 4-3. フォーム送信テスト

1. お問い合わせフォームに入力
2. **3秒以上待ってから**送信ボタンをクリック
3. 送信成功メッセージが表示されることを確認

### 4-4. スパムログの確認

FTPで以下のファイルが作成されているか確認：

```
public_html/_site/spam/logs/spam_log.txt
```

→ スパム試行があった場合にのみ作成されます

---

## 🛡️ 実装済みスパム対策（8層）

- ✅ **ハニーポット**: ボット自動入力検出
- ✅ **タイムスタンプ検証**: 3秒未満の送信を拒否
- ✅ **リファラーチェック**: 外部サイトからの送信を拒否
- ✅ **IPブロックリスト**: 既知のスパムIPをブロック
- ✅ **レート制限**: 1時間に2回まで
- ✅ **スパムキーワードフィルター**: 50以上のキーワード検出
- ✅ **URL数チェック**: 3個以上のURLを拒否
- ✅ **reCAPTCHA v3**: Googleの機械学習による検出

**期待される効果**: スパム **95%以上削減**

---

## 🔧 トラブルシューティング

### エラーが発生した場合

1. **ブラウザのコンソール確認** (F12 → Console)
2. **Xサーバーのエラーログ確認** (サーバーパネル → ログファイル)
3. **パーミッション確認** (755 → 777に変更してテスト)
4. **スパムログ確認** (`_site/spam/logs/spam_log.txt`)

---

## 📅 定期メンテナンス

### 週次（毎週月曜日）

SSH接続で実行：

```bash
cd public_html/_site/spam

# スパムログを確認
tail -20 logs/spam_log.txt

# 頻繁なスパムIPを自動ブロック（5回以上の試行）
php manage_blocklist.php auto 5
```

### 月次（毎月1日）

```bash
# レート制限データをクリア
echo "[]" > data/rate_limit.json

# ログのバックアップ
cp logs/spam_log.txt logs/backup_$(date +%Y%m).txt

# ログをクリア（10MB以上の場合）
> logs/spam_log.txt
```

---

## 📞 サポート

詳細なガイドは以下を参照：

- `_site/spam/ANTI_SPAM_GUIDE.md` - スパム対策総合ガイド
- `_site/spam/RECAPTCHA_SETUP.md` - reCAPTCHA技術詳細
- `_site/spam/UPLOAD_GUIDE.md` - アップロード詳細手順

---

**すべてのファイルをアップロードして、動作確認を実施してください！** 🎉
