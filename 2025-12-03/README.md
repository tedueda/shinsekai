# 📦 2025年12月3日 アップロードパッケージ

## 📋 概要

このフォルダーには、2025年12月3日にXサーバーにアップロードするファイルが含まれています。

### 主な更新内容

1. **新規ブログ記事追加**
   - PTZカメラと遠隔スイッチングが変える"省人化撮影"の最新事例【2025年版】

2. **reCAPTCHA v3 スパム対策実装**
   - お問い合わせフォームにGoogle reCAPTCHA v3を実装
   - 7層のスパム対策を実装

3. **ブログ画像パス修正**
   - black-curtain-lighting の画像パスを修正

---

## 🎯 アップロード対象ファイル

### 必須ファイル

```
index.html                                    → public_html/index.html
blog.html                                     → public_html/blog.html
blog-data.json                                → public_html/blog-data.json
blog/ptz-remote-switching-省人化-2025.html    → public_html/blog/ptz-remote-switching-省人化-2025.html
images/SONY_PTZ.png                           → public_html/images/SONY_PTZ.png
images/shomei01.jpg                           → public_html/images/shomei01.jpg
_site/script.js                               → public_html/_site/script.js
_site/send_mail.php                           → public_html/_site/send_mail.php
_site/spam/                                   → public_html/_site/spam/ (フォルダごと)
```

---

## 📖 詳細ドキュメント

### UPLOAD_CHECKLIST.md
アップロード手順、トラブルシューティング、確認項目が記載されています。
**必ず読んでからアップロードしてください。**

---

## 🔧 パーミッション設定

アップロード後、以下のパーミッションを設定してください:

```
_site/spam/                → 755
_site/spam/logs/           → 755
_site/spam/data/           → 755
_site/spam/logs/*.txt      → 666
_site/spam/data/*.json     → 666
_site/send_mail.php        → 644
```

---

## ✅ アップロード後の確認

1. https://studioq.co.jp/ にアクセス
2. ブラウザのキャッシュをクリア（Cmd + Shift + R）
3. 新しいブログ記事が表示されることを確認
4. お問い合わせフォームが動作することを確認
5. 全ての画像が表示されることを確認

---

## 📞 問題が発生した場合

`UPLOAD_CHECKLIST.md` のトラブルシューティングセクションを参照してください。

---

**作成日**: 2025年12月3日
**バージョン**: 1.0
