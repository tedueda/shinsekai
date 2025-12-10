# 📦 Xサーバーアップロードチェックリスト - 2025年12月3日

## 🎯 今回のアップロード内容

### 1. 新規ブログ記事
✅ **PTZカメラと遠隔スイッチングが変える"省人化撮影"の最新事例【2025年版】**
- ファイル: `blog/ptz-remote-switching-省人化-2025.html`
- 公開日: 2025年12月3日
- 画像: `images/SONY_PTZ.png`

### 2. reCAPTCHA v3 スパム対策実装
✅ **お問い合わせフォームのスパム対策強化**
- `index.html` - reCAPTCHAスクリプト追加
- `_site/script.js` - reCAPTCHAトークン取得処理
- `_site/send_mail.php` - reCAPTCHA検証処理
- `_site/spam/` - スパム対策関連ファイル

### 3. ブログ画像パス修正
✅ **black-curtain-lighting の画像パス修正**
- `blog-data.json` - 画像パスを `/images/shomei01.jpg` に修正

---

## 📋 アップロード手順

### ステップ1: FTPソフトでXサーバーに接続

**接続情報**:
- ホスト: studioq.co.jp
- ユーザー名: （Xサーバーのユーザー名）
- パスワード: （Xサーバーのパスワード）
- ポート: 21 (FTP) または 22 (SFTP)

### ステップ2: アップロード対象ファイル

#### 🔴 必須ファイル（必ずアップロード）

```
2025-12-03/index.html
  → public_html/index.html

2025-12-03/blog.html
  → public_html/blog.html

2025-12-03/blog-data.json
  → public_html/blog-data.json

2025-12-03/blog/ptz-remote-switching-省人化-2025.html
  → public_html/blog/ptz-remote-switching-省人化-2025.html

2025-12-03/images/SONY_PTZ.png
  → public_html/images/SONY_PTZ.png

2025-12-03/images/shomei01.jpg
  → public_html/images/shomei01.jpg

2025-12-03/_site/script.js
  → public_html/_site/script.js

2025-12-03/_site/send_mail.php
  → public_html/_site/send_mail.php

2025-12-03/_site/spam/
  → public_html/_site/spam/ （フォルダごと）
```

#### 🟡 推奨ファイル（できればアップロード）

```
2025-12-03/_site/contact_error.html
  → public_html/_site/contact_error.html

2025-12-03/_site/contact_thanks.html
  → public_html/_site/contact_thanks.html
```

### ステップ3: パーミッション設定

FTPソフトで以下のパーミッションを設定:

```
_site/spam/                → 755
_site/spam/logs/           → 755
_site/spam/data/           → 755
_site/spam/logs/*.txt      → 666
_site/spam/data/*.json     → 666
_site/send_mail.php        → 644
```

### ステップ4: 動作確認

#### 1. ブログ記事の表示確認
- https://studioq.co.jp/
- 「スタジオQブログ」セクションに新しい記事が表示されるか確認
- https://studioq.co.jp/blog.html
- ブログ一覧に新しい記事が表示されるか確認
- https://studioq.co.jp/blog/ptz-remote-switching-省人化-2025.html
- 記事ページが正しく表示されるか確認
- 画像（SONY_PTZ.png）が表示されるか確認

#### 2. お問い合わせフォームの確認
- https://studioq.co.jp/#contact
- フォームが正常に表示されるか確認
- F12キーを押して「コンソール」タブを開く
- フォームに入力して送信
- コンソールに「reCAPTCHAトークン取得成功」と表示されるか確認
- メール送信が成功するか確認

#### 3. 画像表示の確認
- ブラウザのキャッシュをクリア（Cmd + Shift + R）
- 全てのブログカードに画像が表示されるか確認
- 特に「黒幕と照明」の記事の画像を確認

---

## 🔧 トラブルシューティング

### 問題1: ブログ記事が表示されない

**原因**: blog-data.json が更新されていない

**解決策**:
1. `blog-data.json` を再アップロード
2. `index.html` と `blog.html` を再アップロード
3. ブラウザのキャッシュをクリア

### 問題2: 画像が表示されない

**原因**: 画像ファイルがアップロードされていない、またはブラウザキャッシュ

**解決策**:
1. `images/SONY_PTZ.png` と `images/shomei01.jpg` を再アップロード
2. ブラウザのキャッシュをクリア（Cmd + Shift + R）
3. FTPソフトで画像ファイルが正しくアップロードされているか確認

### 問題3: お問い合わせフォームが送信できない

**原因**: reCAPTCHAの設定ミス、またはPHPファイルのパーミッション

**解決策**:
1. `_site/send_mail.php` のパーミッションを 644 に設定
2. `_site/spam/` フォルダのパーミッションを 755 に設定
3. `_site/spam/logs/` と `_site/spam/data/` のパーミッションを 755 に設定
4. ブラウザのコンソールでエラーメッセージを確認

### 問題4: reCAPTCHAエラー

**原因**: reCAPTCHAキーの設定ミス

**確認事項**:
- `index.html` のサイトキー: `6LcWv_srAAAAAOC4p5xFd2tQRMZRnRW_AbHoHVTV`
- `_site/script.js` のサイトキー: `6LcWv_srAAAAAOC4p5xFd2tQRMZRnRW_AbHoHVTV`
- `_site/send_mail.php` のシークレットキー: `6LcWv_srAAAAAErWOpHvNzLM-e_GdYV-HPPHXw5u`

---

## 📊 アップロード後の確認項目

### ✅ チェックリスト

- [ ] トップページ（https://studioq.co.jp/）が正常に表示される
- [ ] 新しいブログ記事がトップページの「スタジオQブログ」に表示される
- [ ] ブログ一覧ページ（https://studioq.co.jp/blog.html）に新しい記事が表示される
- [ ] 新しい記事ページ（https://studioq.co.jp/blog/ptz-remote-switching-省人化-2025.html）が表示される
- [ ] 記事の画像（SONY_PTZ.png）が表示される
- [ ] 全てのブログカードに画像が表示される（特に「黒幕と照明」）
- [ ] お問い合わせフォームが表示される
- [ ] お問い合わせフォームから送信できる
- [ ] reCAPTCHAが動作している（コンソールで確認）
- [ ] メール送信が成功する

---

## 🔐 reCAPTCHA設定情報

### サイトキー（公開用）
```
6LcWv_srAAAAAOC4p5xFd2tQRMZRnRW_AbHoHVTV
```

### シークレットキー（サーバー用）
```
6LcWv_srAAAAAErWOpHvNzLM-e_GdYV-HPPHXw5u
```

### 使用箇所
1. `index.html` - reCAPTCHAスクリプト読み込み
2. `_site/script.js` - トークン取得
3. `_site/send_mail.php` - トークン検証

---

## 📝 アップロード記録

### アップロード日時
2025年12月3日

### アップロード内容
1. 新規ブログ記事（PTZカメラと遠隔スイッチング）
2. reCAPTCHA v3 スパム対策実装
3. ブログ画像パス修正

### アップロード担当者
（記入してください）

### 動作確認者
（記入してください）

### 備考
（問題があれば記入してください）

---

## 🚨 重要な注意事項

### 1. バックアップ
アップロード前に、現在のサーバーファイルをバックアップしてください。

### 2. reCAPTCHAキーの管理
- シークレットキーは絶対に公開しないでください
- GitHubにコミットしないでください

### 3. スパムログの確認
アップロード後、1週間程度でスパムログを確認してください:
```
public_html/_site/spam/logs/spam_log.txt
public_html/_site/spam/logs/mail_log.txt
```

### 4. 定期メンテナンス
月次でレート制限データをクリアしてください:
```
public_html/_site/spam/data/rate_limit.json
```

---

**作成日**: 2025年12月3日
**作成者**: Cascade AI
**バージョン**: 1.0
