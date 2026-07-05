# Google reCAPTCHA v3 設定ガイド

reCAPTCHA v3を有効化することで、さらに強力なスパム対策が可能になります。

## 📋 設定手順

### Step 1: Google reCAPTCHAでサイトを登録

1. [Google reCAPTCHA管理画面](https://www.google.com/recaptcha/admin)にアクセス
2. Googleアカウントでログイン
3. 「+」ボタンをクリックして新しいサイトを登録

**登録情報:**
- **ラベル**: `StudioQ Website` (任意の名前)
- **reCAPTCHAタイプ**: `reCAPTCHA v3`
- **ドメイン**: 
  - `studioq.co.jp`
  - `localhost` (テスト用)
- **利用規約に同意**: チェック
- **送信**をクリック

### Step 2: キーを取得

登録完了後、以下の2つのキーが発行されます：

- **サイトキー（Site Key）**: クライアント側（HTML/JavaScript）で使用
- **シークレットキー（Secret Key）**: サーバー側（PHP）で使用

**⚠️ シークレットキーは絶対に公開しないでください！**

---

## 🔧 実装手順

### 1. HTMLファイルにreCAPTCHAスクリプトを追加

`public/index.html` の `<head>` セクションに以下を追加：

```html
<!-- Google reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

**YOUR_SITE_KEY** を実際のサイトキーに置き換えてください。

---

### 2. JavaScriptファイルを更新

`public/_site/script.js` の該当箇所（1006行目付近）のコメントを解除して、サイトキーを設定：

**変更前:**
```javascript
/* reCAPTCHA v3実装例（サイトキー取得後にコメント解除）
e.preventDefault();
const recaptchaToken = document.getElementById('recaptchaToken');

try {
    // 'YOUR_SITE_KEY'を実際のサイトキーに置き換えてください
    const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
    recaptchaToken.value = token;
    
    // トークン取得後、フォームを送信
    contactForm.submit();
} catch (error) {
    console.error('reCAPTCHAエラー:', error);
    alert('送信に失敗しました。もう一度お試しください。');
    return false;
}
*/
```

**変更後:**
```javascript
// reCAPTCHA v3実装
e.preventDefault();
const recaptchaToken = document.getElementById('recaptchaToken');

try {
    // 実際のサイトキーに置き換え
    const token = await grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'});
    recaptchaToken.value = token;
    
    // トークン取得後、フォームを送信
    contactForm.submit();
} catch (error) {
    console.error('reCAPTCHAエラー:', error);
    alert('送信に失敗しました。もう一度お試しください。');
    return false;
}
```

**YOUR_SITE_KEY** を実際のサイトキーに置き換えてください。

---

### 3. PHPファイルを更新

`public/_site/send_mail.php` の12-14行目を更新：

**変更前:**
```php
// reCAPTCHA v3の設定（実装する場合）
// Google reCAPTCHA v3のシークレットキーを設定してください
// $RECAPTCHA_SECRET_KEY = 'YOUR_SECRET_KEY'; // コメント解除して実際のキーを設定
$RECAPTCHA_ENABLED = false; // reCAPTCHAを有効にする場合は true に設定
```

**変更後:**
```php
// reCAPTCHA v3の設定
// Google reCAPTCHA v3のシークレットキーを設定してください
$RECAPTCHA_SECRET_KEY = 'YOUR_SECRET_KEY'; // 実際のシークレットキーに置き換え
$RECAPTCHA_ENABLED = true; // reCAPTCHAを有効化
```

**YOUR_SECRET_KEY** を実際のシークレットキーに置き換えてください。

---

## ✅ 動作確認

1. **ローカルでテスト**:
   ```bash
   # ローカルサーバーを起動
   cd public
   python3 -m http.server 8000
   ```
   
2. `http://localhost:8000` にアクセス
3. お問い合わせフォームを送信
4. ブラウザのコンソール（F12 → Console）でreCAPTCHAトークンが取得されているか確認

5. **本番環境でテスト**:
   - ファイルをXサーバーにアップロード
   - `https://studioq.co.jp` でフォーム送信テスト
   - スパムログ（`_site/spam/logs/spam_log.txt`）を確認

---

## 🔍 reCAPTCHAスコアの確認

reCAPTCHA v3は **0.0 ～ 1.0** のスコアを返します：
- **1.0**: 人間である可能性が非常に高い
- **0.5**: グレーゾーン
- **0.0**: ボットである可能性が非常に高い

現在の設定では、**スコア 0.5 以上**で送信を許可しています（`send_mail.php` 100行目）。

スコアの閾値を変更したい場合は、`send_mail.php` の以下の箇所を修正：

```php
// スコアが0.5以上で成功とみなす（0.0～1.0、1.0が最も人間らしい）
return isset($result['success']) && $result['success'] && 
       isset($result['score']) && $result['score'] >= 0.5; // ← この値を調整
```

**推奨値:**
- **0.3**: 緩い（スパムが多い場合は上げる）
- **0.5**: 標準（デフォルト）
- **0.7**: 厳しい（正当なユーザーもブロックされる可能性）

---

## 📊 reCAPTCHA管理画面で確認

[Google reCAPTCHA管理画面](https://www.google.com/recaptcha/admin)で以下を確認できます：

- **リクエスト数**: 1日あたりのreCAPTCHA実行回数
- **スコア分布**: ユーザーのスコア分布グラフ
- **疑わしいトラフィック**: ボットの検出状況

定期的にログを確認し、スコアの閾値を調整してください。

---

## 🛡️ セキュリティ注意事項

1. **シークレットキーは絶対に公開しない**
   - GitHubなどにコミットしない
   - クライアント側のJavaScriptに含めない
   
2. **サイトキーはHTMLに記載してOK**
   - サイトキーは公開されても問題ありません
   
3. **ドメイン制限を設定**
   - reCAPTCHA管理画面で許可するドメインを設定済み
   - 不正なドメインからの利用を防止

---

## 🔄 バックアップ

reCAPTCHAを有効化する前に、以下のファイルのバックアップを作成してください：

```bash
cp public/index.html public/index.html.bak
cp public/_site/script.js public/_site/script.js.bak
cp public/_site/send_mail.php public/_site/send_mail.php.bak
```

問題が発生した場合は、バックアップから復元できます。

---

## 📞 サポート

reCAPTCHAの設定でお困りの場合：

- [Google reCAPTCHA公式ドキュメント](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA FAQs](https://developers.google.com/recaptcha/docs/faq)

---

**設定が完了したら、必ずテストを実施してください！**
