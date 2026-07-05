# 🛡️ StudioQ スパム対策総合ガイド

このドキュメントでは、StudioQウェブサイトに実装されているすべてのスパム対策機能を説明します。

---

## 📊 実装済みスパム対策一覧

### ✅ 1. ハニーポット（Honeypot）

**仕組み**: ボットのみが入力する非表示フィールドを設置

**実装箇所**:
- HTML: `public/index.html` 534-537行目
- PHP検証: `send_mail.php` 107-114行目

**動作**:
- 人間には見えないが、ボットは自動的に入力してしまうフィールド
- 入力がある場合はスパムと判定し、エラーページへリダイレクト

---

### ✅ 2. タイムスタンプ検証（送信速度チェック）

**仕組み**: フォーム表示から送信までの時間を計測

**実装箇所**:
- JavaScript: `script.js` 973-976行目（タイムスタンプ記録）
- JavaScript: `script.js` 990-999行目（クライアント側検証）
- PHP検証: `send_mail.php` 116-126行目

**動作**:
- ページ読み込み時に現在時刻を記録
- 送信時に経過時間をチェック
- **3秒未満**: ボットの可能性が高いため拒否
- **1時間以上**: セッションタイムアウトとして拒否

---

### ✅ 3. リファラーチェック

**仕組み**: 送信元のURLを検証

**実装箇所**:
- PHP検証: `send_mail.php` 128-144行目

**動作**:
- 許可ドメイン: `studioq.co.jp`, `localhost`, `127.0.0.1`
- 外部サイトからの直接POST送信を拒否

---

### ✅ 4. IPブロックリスト

**仕組み**: 既知のスパム送信元IPをブロック

**実装箇所**:
- PHP検証: `send_mail.php` 64-73行目, 198-204行目
- データファイル: `spam/data/ip_blocklist.json`

**動作**:
- ブロックリストに登録されたIPからの送信を拒否
- 管理スクリプトで手動追加・削除が可能

**管理方法**:
```bash
# IPを追加
php spam/manage_blocklist.php add 123.45.67.89

# IPを削除
php spam/manage_blocklist.php remove 123.45.67.89

# リストを表示
php spam/manage_blocklist.php list

# ログから自動追加（5回以上スパム試行したIPを自動ブロック）
php spam/manage_blocklist.php auto 5
```

---

### ✅ 5. レート制限（Rate Limiting）

**仕組み**: 同一IPからの連続送信を制限

**実装箇所**:
- PHP検証: `send_mail.php` 27-60行目, 206-211行目
- データファイル: `spam/data/rate_limit.json`

**動作**:
- **制限**: 1時間に2回まで（強化済み、以前は3回）
- 同一IPから制限を超えた場合は拒否
- 古いデータは自動的にクリーンアップ

---

### ✅ 6. スパムキーワードフィルター

**仕組み**: スパムによく使われる単語を検出

**実装箇所**:
- PHP検証: `send_mail.php` 75-106行目, 221-231行目

**検出キーワード（一部）**:
- 英語: viagra, casino, poker, loan, bitcoin, dating, etc.
- 日本語: 出会い, 副業, 高収入, 即金, アダルト, 借金, etc.

**動作**:
- 名前、メールアドレス、メッセージ内容をすべてチェック
- スパムキーワードが含まれる場合は拒否

---

### ✅ 7. URL数チェック

**仕組み**: メッセージ内のURL数を制限

**実装箇所**:
- PHP検証: `send_mail.php` 108-113行目, 233-238行目

**動作**:
- メッセージ内に**3個以上のURL**がある場合はスパムと判定
- 正当なお問い合わせでは通常1-2個程度のURL

---

### 🔲 8. reCAPTCHA v3（オプション）

**仕組み**: Googleの機械学習を使ったボット検出

**実装箇所**:
- PHP検証: `send_mail.php` 115-161行目, 213-219行目
- 現在の状態: **無効** (`$RECAPTCHA_ENABLED = false`)

**有効化手順**:
- 詳細は `spam/RECAPTCHA_SETUP.md` を参照
- Googleアカウントでサイトキーとシークレットキーを取得
- HTMLとPHPファイルを更新

**推奨**: スパムが減らない場合は有効化を検討

---

## 📁 ファイル構成

```
public/
├── index.html              # お問い合わせフォーム
└── _site/
    ├── send_mail.php      # メール送信＆スパム検証
    ├── script.js          # クライアント側検証
    ├── contact_error.html # エラーページ
    ├── contact_thanks.html # 完了ページ
    └── spam/
        ├── .htaccess                    # アクセス制限
        ├── ANTI_SPAM_GUIDE.md           # このファイル
        ├── RECAPTCHA_SETUP.md           # reCAPTCHA設定ガイド
        ├── manage_blocklist.php         # IP管理スクリプト
        ├── data/
        │   ├── ip_blocklist.json       # ブロックIP一覧
        │   └── rate_limit.json         # レート制限データ
        └── logs/
            └── spam_log.txt            # スパム検出ログ
```

---

## 🔍 スパムログの確認

スパム試行はすべて記録されます：

```bash
# ログファイルの場所
public/_site/spam/logs/spam_log.txt

# ログの確認（最新10件）
tail -10 public/_site/spam/logs/spam_log.txt

# スパム試行の多いIPを抽出
grep -oP 'IP: \K[0-9.]+' spam_log.txt | sort | uniq -c | sort -nr

# 特定のIPのログを検索
grep "123.45.67.89" spam_log.txt
```

---

## 🛠️ トラブルシューティング

### 正当なユーザーがブロックされる場合

**症状**: お客様から「送信できない」との報告

**対処法**:

1. **レート制限を確認**
   ```bash
   # rate_limit.jsonを確認
   cat spam/data/rate_limit.json
   
   # 必要に応じてクリア
   echo "[]" > spam/data/rate_limit.json
   ```

2. **IPブロックリストを確認**
   ```bash
   # ブロックリストを確認
   php spam/manage_blocklist.php list
   
   # 誤ってブロックしたIPを削除
   php spam/manage_blocklist.php remove 123.45.67.89
   ```

3. **スパムログを確認**
   ```bash
   # 最近のスパム検出を確認
   tail -20 spam/logs/spam_log.txt
   ```

4. **タイムスタンプ検証を緩和**
   - `send_mail.php` 122行目を変更:
   ```php
   // 3秒 → 1秒に変更（緩和）
   if ($time_diff < 1 || $time_diff > 3600) {
   ```

---

### スパムが止まらない場合

**対処法**:

1. **reCAPTCHA v3を有効化**
   - `spam/RECAPTCHA_SETUP.md` を参照
   - 最も効果的なスパム対策

2. **レート制限を強化**
   - `send_mail.php` 30行目を変更:
   ```php
   $max_requests = 1; // 2回 → 1回に変更
   ```

3. **スパムキーワードを追加**
   - `send_mail.php` 77-95行目に新しいキーワードを追加
   - 実際のスパムメッセージから抽出

4. **自動IPブロックを実行**
   ```bash
   # 3回以上スパム試行したIPを自動ブロック
   php spam/manage_blocklist.php auto 3
   ```

---

## 📅 定期メンテナンス

### 週次（毎週月曜日）

```bash
# スパムログを確認
tail -50 spam/logs/spam_log.txt

# 頻繁なスパムIPを自動ブロック
php spam/manage_blocklist.php auto 5
```

### 月次（毎月1日）

```bash
# レート制限データをクリア
echo "[]" > spam/data/rate_limit.json

# スパムログのバックアップ
cp spam/logs/spam_log.txt spam/logs/spam_log_$(date +%Y%m).txt

# ログファイルをクリア（10MB以上の場合）
> spam/logs/spam_log.txt
```

---

## 📈 効果測定

以下の指標でスパム対策の効果を確認：

1. **スパム検出数**
   ```bash
   # 今月のスパム検出数
   grep "$(date +%Y-%m)" spam/logs/spam_log.txt | wc -l
   ```

2. **ブロックされたIP数**
   ```bash
   php spam/manage_blocklist.php list | grep -c "^-"
   ```

3. **検出理由別の統計**
   ```bash
   # ハニーポット
   grep "ハニーポット" spam/logs/spam_log.txt | wc -l
   
   # レート制限
   grep "レート制限" spam/logs/spam_log.txt | wc -l
   
   # スパムキーワード
   grep "スパムキーワード" spam/logs/spam_log.txt | wc -l
   ```

---

## 🔒 セキュリティベストプラクティス

1. **ログファイルへのアクセス制限**
   - `.htaccess` で外部からのアクセスを禁止済み

2. **シークレットキーの管理**
   - reCAPTCHAのシークレットキーはGitにコミットしない
   - 環境変数や設定ファイルで管理

3. **定期的なログ確認**
   - 異常なアクセスパターンを早期発見

4. **バックアップの保持**
   - 設定変更前に必ずバックアップを作成

---

## 📞 サポート

スパム対策に関する質問や問題がある場合：

1. このドキュメントで該当する箇所を確認
2. ログファイルを確認（`spam/logs/spam_log.txt`）
3. 必要に応じてreCAPTCHA v3を有効化

---

**最終更新**: 2025年10月30日  
**バージョン**: 2.0 - 強化版
