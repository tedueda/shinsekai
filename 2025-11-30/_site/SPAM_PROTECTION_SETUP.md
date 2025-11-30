# スパム対策設定ガイド

お問い合わせフォームに実装されたスパム対策機能の説明と設定方法です。

## 実装済みのスパム対策

### 1. ハニーポット（Honeypot）
- **説明**: 人間には見えないフィールドを追加し、ボットが自動入力した場合に送信を拒否
- **設定**: 不要（既に実装済み）
- **効果**: 簡単なボットの大半をブロック

### 2. タイムスタンプ検証
- **説明**: フォーム表示から送信までの時間を計測し、異常に早い/遅い送信をブロック
- **基準**: 
  - 3秒未満: ボットの可能性が高い
  - 1時間以上: セッションタイムアウトの可能性
- **設定**: 不要（既に実装済み）

### 3. リファラーチェック
- **説明**: フォーム送信が自サイトから行われているかを確認
- **許可ドメイン**: 
  - studioq.co.jp
  - localhost（開発環境用）
  - 127.0.0.1（開発環境用）
- **設定**: `send_mail.php` の `$allowed_domains` 配列に追加ドメインを設定可能

### 4. レート制限
- **説明**: 同一IPアドレスからの連続送信を制限
- **基準**: 1時間に3回まで
- **設定**: `send_mail.php` の以下の変数で調整可能
  ```php
  $max_requests = 3;      // 最大送信回数
  $time_window = 3600;    // 時間枠（秒）
  ```

### 5. Google reCAPTCHA v3（オプション）
- **説明**: Googleの高度なボット検出システム
- **状態**: 準備済み（有効化には設定が必要）
- **設定方法**: 下記参照

---

## Google reCAPTCHA v3 の設定方法（推奨）

より強力なスパム対策として、Google reCAPTCHA v3の導入を推奨します。

### 手順1: reCAPTCHA v3キーの取得

1. [Google reCAPTCHA管理画面](https://www.google.com/recaptcha/admin)にアクセス
2. 「新しいサイトを登録」をクリック
3. 以下の情報を入力:
   - **ラベル**: Studio Q（任意の名前）
   - **reCAPTCHAタイプ**: reCAPTCHA v3 を選択
   - **ドメイン**: studioq.co.jp（本番環境のドメイン）
   - localhost（開発環境用）も追加可能
4. 「送信」をクリック
5. **サイトキー**と**シークレットキー**が表示されるのでコピー

### 手順2: HTMLに reCAPTCHA スクリプトを追加

`index.html` の `<head>` セクションに以下を追加:

```html
<!-- Google reCAPTCHA v3 -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

**注意**: `YOUR_SITE_KEY` を手順1で取得した**サイトキー**に置き換えてください。

### 手順3: JavaScriptのreCAPTCHA検証を有効化

`/_site/script.js` の1006行目付近にあるコメントアウトされたreCAPTCHA検証コードを有効化します:

1. 1006行目の `/*` を削除
2. 1022行目の `*/` を削除
3. 1012行目の `'YOUR_SITE_KEY'` を実際の**サイトキー**に置き換え

修正後の例:
```javascript
e.preventDefault();
const recaptchaToken = document.getElementById('recaptchaToken');

try {
    const token = await grecaptcha.execute('6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', {action: 'submit'});
    recaptchaToken.value = token;
    contactForm.submit();
} catch (error) {
    console.error('reCAPTCHAエラー:', error);
    alert('送信に失敗しました。もう一度お試しください。');
    return false;
}
```

### 手順4: PHPでreCAPTCHA検証を有効化

`/_site/send_mail.php` の設定を変更:

```php
// 13行目: シークレットキーを設定（コメント解除して実際のキーに置き換え）
$RECAPTCHA_SECRET_KEY = 'YOUR_SECRET_KEY';

// 14行目: reCAPTCHAを有効化
$RECAPTCHA_ENABLED = true;
```

**注意**: `YOUR_SECRET_KEY` を手順1で取得した**シークレットキー**に置き換えてください。

---

## スパム検出ログの確認

スパム攻撃の状況を確認するには、以下のファイルを確認してください:

- **スパムログ**: `/_site/spam_log.txt`
  - 検出されたスパム送信の記録
  
- **レート制限データ**: `/_site/rate_limit.json`
  - IPアドレスごとの送信履歴

### ログの見方

```
[2025-10-27 11:30:45] スパム検出: ハニーポット入力あり (IP: 192.168.1.100)
[2025-10-27 11:31:12] スパム検出: レート制限超過 (IP: 192.168.1.101)
[2025-10-27 11:32:05] スパム検出: 異常な送信タイミング (0.5秒, IP: 192.168.1.102)
```

---

## トラブルシューティング

### 正規のユーザーが送信できない場合

1. **タイムスタンプ検証が厳しすぎる**
   - `send_mail.php` の122行目で時間制限を調整:
   ```php
   if ($time_diff < 2 || $time_diff > 7200) { // 2秒～2時間に緩和
   ```

2. **レート制限が厳しすぎる**
   - `send_mail.php` の30-31行目で制限を緩和:
   ```php
   $max_requests = 5;      // 5回に増加
   $time_window = 7200;    // 2時間に延長
   ```

3. **リファラーチェックの問題**
   - `send_mail.php` の130行目で許可ドメインを追加:
   ```php
   $allowed_domains = ['studioq.co.jp', 'localhost', '127.0.0.1', 'test.studioq.co.jp'];
   ```

### reCAPTCHAが動作しない場合

- ブラウザのコンソールでエラーを確認
- サイトキーとシークレットキーが正しいか確認
- ドメインがreCAPTCHA管理画面に登録されているか確認

---

## セキュリティのベストプラクティス

1. **定期的なログ確認**: 週1回程度、スパムログを確認して攻撃パターンを把握
2. **バックアップ**: `send_mail.php` の変更前にバックアップを取る
3. **シークレットキーの管理**: reCAPTCHAのシークレットキーは絶対に公開しない
4. **監視**: 異常な送信量が発生した場合は、レート制限を一時的に強化

---

## サポート

問題が解決しない場合は、以下を確認してください:
- PHPエラーログ
- ブラウザのコンソールログ
- spam_log.txt の内容

それでも解決しない場合は、開発者にお問い合わせください。
