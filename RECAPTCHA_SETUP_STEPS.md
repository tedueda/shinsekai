# 🔑 reCAPTCHA v3 設定手順（実施ガイド）

reCAPTCHAの有効化に必要な手順を説明します。

---

## ✅ 準備完了

以下のファイルは既に更新済みです：
- ✅ `public/index.html` - reCAPTCHAスクリプト追加済み
- ✅ `public/_site/script.js` - reCAPTCHA有効化済み
- ✅ `public/_site/send_mail.php` - reCAPTCHA有効化済み

**あとはGoogleでキーを取得して、3箇所を置き換えるだけです。**

---

## 📝 Step 1: Googleでキーを取得

### 1-1. reCAPTCHA管理画面にアクセス

以下のURLにアクセス：
```
https://www.google.com/recaptcha/admin/create
```

Googleアカウントでログインしてください。

### 1-2. サイトを登録

以下の情報を入力：

| 項目 | 入力内容 |
|------|----------|
| **ラベル** | `StudioQ Website` |
| **reCAPTCHAタイプ** | **reCAPTCHA v3** を選択 |
| **ドメイン** | `studioq.co.jp` と `localhost` を追加 |
| **利用規約** | ✅ チェックを入れる |

「送信」ボタンをクリック。

### 1-3. キーをコピー

登録完了後、以下の2つのキーが表示されます：

```
サイトキー: 6Lc...（40文字程度）
シークレットキー: 6Lc...（40文字程度）
```

**⚠️ 重要**: 
- サイトキーはHTML/JavaScriptで使用（公開してOK）
- シークレットキーはPHPで使用（**絶対に公開しないこと**）

---

## 🔧 Step 2: キーを3箇所に設定

取得したキーを以下の3つのファイルに設定します。

### 2-1. `public/index.html` の175行目

**変更前:**
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

**変更後:**
```html
<script src="https://www.google.com/recaptcha/api.js?render=6Lc...あなたのサイトキー"></script>
```

### 2-2. `public/_site/script.js` の1008行目

**変更前:**
```javascript
const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
```

**変更後:**
```javascript
const token = await grecaptcha.execute('6Lc...あなたのサイトキー', {action: 'submit'});
```

### 2-3. `public/_site/send_mail.php` の13行目

**変更前:**
```php
$RECAPTCHA_SECRET_KEY = 'YOUR_SECRET_KEY';
```

**変更後:**
```php
$RECAPTCHA_SECRET_KEY = '6Lc...あなたのシークレットキー';
```

---

## 📤 Step 3: ファイルをアップロード

FTPでXサーバーにアップロード：

```
public/index.html               → public_html/index.html
public/_site/script.js          → public_html/_site/script.js
public/_site/send_mail.php      → public_html/_site/send_mail.php
```

---

## ✅ Step 4: 動作確認

### 4-1. ローカルでテスト

```bash
cd public
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` にアクセス：

1. お問い合わせフォームを開く
2. F12キーを押して「コンソール」タブを開く
3. フォームに入力して送信
4. コンソールに以下が表示されればOK：
   ```
   reCAPTCHAトークン取得成功
   ```

### 4-2. 本番環境でテスト

1. `https://studioq.co.jp` にアクセス
2. お問い合わせフォームを送信
3. 送信成功を確認

### 4-3. reCAPTCHA管理画面で確認

[reCAPTCHA管理画面](https://www.google.com/recaptcha/admin)で以下を確認：

- リクエスト数が増えているか
- スコア分布が表示されているか

---

## 🔍 スコアの調整（オプション）

現在の設定では、**スコア0.5以上**で送信を許可しています。

スコアを変更したい場合は、`send_mail.php` の149行目を編集：

```php
// 現在の設定（0.5以上で許可）
return isset($result['success']) && $result['success'] && 
       isset($result['score']) && $result['score'] >= 0.5;
```

**推奨値:**
- `0.3`: 緩い（スパムが多い場合は上げる）
- `0.5`: 標準（デフォルト）
- `0.7`: 厳しい（正当なユーザーもブロックされる可能性）

---

## 🛠️ トラブルシューティング

### エラー: "grecaptcha is not defined"

**原因**: reCAPTCHAスクリプトの読み込み失敗

**解決策**:
1. `index.html` の175行目のサイトキーを確認
2. ブラウザのキャッシュをクリア（Ctrl+Shift+R）

### エラー: "reCAPTCHA検証失敗"

**原因**: シークレットキーが間違っている

**解決策**:
1. `send_mail.php` の13行目のシークレットキーを確認
2. Google管理画面でキーを再確認

### 正当なユーザーがブロックされる

**原因**: スコアの閾値が厳しすぎる

**解決策**:
- `send_mail.php` の149行目を `>= 0.3` に変更

---

## 📊 効果測定

reCAPTCHA導入後、以下を確認：

### スパムログの確認
```bash
# 導入前後のスパム数を比較
grep "$(date +%Y-%m)" spam/logs/spam_log.txt | wc -l
```

### reCAPTCHA管理画面
- リクエスト数
- スコア分布
- 疑わしいトラフィック

**期待される効果**: スパム **95%以上削減**

---

## 🔒 セキュリティ注意事項

1. **シークレットキーは絶対に公開しない**
   - GitHubにコミットしない
   - クライアント側のJavaScriptに含めない

2. **サイトキーは公開してOK**
   - HTMLに記載しても問題ありません

3. **定期的にログを確認**
   - reCAPTCHA管理画面で異常なアクセスパターンを確認

---

## 📞 サポート

問題が発生した場合：

1. このドキュメントのトラブルシューティングを確認
2. `spam/RECAPTCHA_SETUP.md` を参照
3. [Google reCAPTCHA公式ドキュメント](https://developers.google.com/recaptcha/docs/v3)

---

**設定が完了したら、必ずテストを実施してください！**
