# 🛡️ スパムメール対策 - クイックスタートガイド

StudioQウェブサイトのスパム対策が強化されました。

---

## ✅ 実装済みの対策（8段階）

1. **ハニーポット**: ボット自動検出
2. **タイムスタンプ検証**: 3秒未満の送信を拒否
3. **リファラーチェック**: 外部サイトからの送信を拒否
4. **IPブロックリスト**: 既知のスパムIPをブロック ⭐NEW
5. **レート制限**: 1時間に2回まで（強化: 3→2回）⭐強化
6. **スパムキーワードフィルター**: 50以上のキーワード検出 ⭐NEW
7. **URL数チェック**: 3個以上のURLを拒否 ⭐NEW
8. **reCAPTCHA v3**: オプション（推奨）

---

## 🚀 すぐにできること

### 1. 更新したファイルをアップロード

```
public/_site/send_mail.php           # 強化版
public/_site/spam/ANTI_SPAM_GUIDE.md # 総合ガイド
public/_site/spam/RECAPTCHA_SETUP.md # reCAPTCHA設定
public/_site/spam/manage_blocklist.php # IP管理
public/_site/spam/data/ip_blocklist.json # ブロックリスト
```

詳細は `UPLOAD_CHECKLIST.md` を参照。

### 2. スパムIPを自動ブロック

Xサーバーにログイン後、SSH接続で実行：

```bash
cd public_html/_site/spam
php manage_blocklist.php auto 5
```

5回以上スパム試行したIPを自動的にブロックリストに追加します。

### 3. スパムログを確認

```bash
tail -20 spam/logs/spam_log.txt
```

どのような攻撃が来ているか確認できます。

---

## 📊 効果的な運用

### 週次（毎週月曜日）

```bash
# 1. スパムログを確認
tail -50 spam/logs/spam_log.txt

# 2. 頻繁なスパムIPを自動ブロック
php spam/manage_blocklist.php auto 5
```

### 月次（毎月1日）

```bash
# 1. レート制限データをクリア
echo "[]" > spam/data/rate_limit.json

# 2. ログのバックアップ
cp spam/logs/spam_log.txt spam/logs/backup_$(date +%Y%m).txt

# 3. ログをクリア（10MB以上の場合）
> spam/logs/spam_log.txt
```

---

## 🔧 それでもスパムが止まらない場合

### オプション1: reCAPTCHA v3を有効化（推奨）

最も効果的な対策です。

```bash
# 設定ガイドを参照
cat spam/RECAPTCHA_SETUP.md
```

**手順**:
1. Googleアカウントでサイトキーを取得
2. `index.html` にスクリプトを追加
3. `send_mail.php` でreCAPTCHAを有効化

### オプション2: レート制限をさらに強化

`send_mail.php` の30行目を変更:

```php
$max_requests = 1; // 1時間に1回まで
```

### オプション3: 手動でIPをブロック

```bash
# 特定のIPをブロック
php spam/manage_blocklist.php add 123.45.67.89

# ブロックリストを確認
php spam/manage_blocklist.php list
```

---

## 📁 ドキュメント

- `UPLOAD_CHECKLIST.md` - アップロード手順
- `spam/ANTI_SPAM_GUIDE.md` - 総合ガイド（詳細）
- `spam/RECAPTCHA_SETUP.md` - reCAPTCHA設定
- `spam/UPLOAD_GUIDE.md` - サーバーアップロード詳細

---

## 🆘 トラブルシューティング

### 正当なユーザーが送信できない

```bash
# レート制限をクリア
echo "[]" > spam/data/rate_limit.json

# ブロックリストを確認
php spam/manage_blocklist.php list

# 誤ってブロックしたIPを削除
php spam/manage_blocklist.php remove 123.45.67.89
```

### スパムログを分析

```bash
# スパム試行の多いIPランキング
grep -oP 'IP: \K[0-9.]+' spam/logs/spam_log.txt | sort | uniq -c | sort -nr | head -10

# 今日のスパム数
grep "$(date +%Y-%m-%d)" spam/logs/spam_log.txt | wc -l

# 検出理由別の統計
grep "ハニーポット" spam/logs/spam_log.txt | wc -l
grep "レート制限" spam/logs/spam_log.txt | wc -l
grep "スパムキーワード" spam/logs/spam_log.txt | wc -l
```

---

## 📈 期待される効果

- **ボット攻撃**: 99%以上削減（ハニーポット + タイムスタンプ）
- **手動スパム**: 80-90%削減（キーワードフィルター + レート制限）
- **reCAPTCHA有効時**: 95%以上削減

---

## 🎯 次のステップ

1. ✅ **今すぐ**: 更新したファイルをアップロード
2. ✅ **週次**: スパムログを確認、IPを自動ブロック
3. 🔲 **推奨**: reCAPTCHA v3を有効化

**質問や問題があれば、`spam/ANTI_SPAM_GUIDE.md` を参照してください。**
