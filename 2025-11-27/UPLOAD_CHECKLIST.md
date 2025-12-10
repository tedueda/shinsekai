# Xサーバーアップロード チェックリスト

## ✅ アップロード前の確認

- [ ] ローカル環境でプレビュー確認済み
- [ ] 新規ブログ記事のリンクが正しく動作することを確認
- [ ] 画像ファイルが正しく表示されることを確認
- [ ] blog-data.jsonの内容が正しいことを確認

## 📤 アップロードファイルリスト

### メインHTMLファイル（必須）
- [ ] `index.html` → `/public_html/index.html`
- [ ] `blog.html` → `/public_html/blog.html`
- [ ] `blog-data.json` → `/public_html/blog-data.json`

### 新規ブログ記事（必須）
- [ ] `blog/ptz-multi-camera-small-crew-workflow.html` → `/public_html/blog/ptz-multi-camera-small-crew-workflow.html`
- [ ] `blog/pro-audio-quality-optimization.html` → `/public_html/blog/pro-audio-quality-optimization.html`
- [ ] `blog/cosplay-ai-background-worldview.html` → `/public_html/blog/cosplay-ai-background-worldview.html` ★10月記事追加

### 画像ファイル（必須）
- [ ] `images/st07.jpg` → `/public_html/images/st07.jpg`
- [ ] `images/slide4.jpg` → `/public_html/images/slide4.jpg`

### サポートファイル（既存の場合はスキップ可）
- [ ] `_site/style.css` → `/public_html/_site/style.css`
- [ ] `_site/script.js` → `/public_html/_site/script.js`

## 🔧 アップロード後の確認

### 1. トップページ確認
- [ ] https://studioq.co.jp/ にアクセス
- [ ] ブログセクションに最新記事が表示されているか
- [ ] 記事のサムネイル画像が表示されているか
- [ ] 記事へのリンクが動作するか

### 2. ブログ一覧ページ確認
- [ ] https://studioq.co.jp/blog.html にアクセス
- [ ] 最新記事が一覧の先頭に表示されているか
- [ ] ページネーションが正しく動作するか

### 3. 新規記事ページ確認
- [ ] https://studioq.co.jp/blog/ptz-multi-camera-small-crew-workflow.html にアクセス
- [ ] ページが正しく表示されるか
- [ ] 画像（slide4.jpg）が表示されるか
- [ ] メタデータ（OGP）が正しく設定されているか

- [ ] https://studioq.co.jp/blog/pro-audio-quality-optimization.html にアクセス
- [ ] ページが正しく表示されるか
- [ ] 画像（st07.jpg）が表示されるか
- [ ] メタデータ（OGP）が正しく設定されているか

- [ ] https://studioq.co.jp/blog/cosplay-ai-background-worldview.html にアクセス ★10月記事
- [ ] ページが正しく表示されるか
- [ ] 画像（cosplay03_3.4.1.png）が表示されるか
- [ ] メタデータ（OGP）が正しく設定されているか

### 4. SEO確認
- [ ] Google Search Consoleで新規URLをインデックス登録リクエスト
- [ ] OGPデバッガーでメタデータを確認
  - Facebook: https://developers.facebook.com/tools/debug/
  - Twitter: https://cards-dev.twitter.com/validator

### 5. モバイル表示確認
- [ ] スマートフォンで表示確認
- [ ] タブレットで表示確認
- [ ] レスポンシブデザインが正しく動作しているか

## 🚨 トラブルシューティング

### 画像が表示されない場合
1. 画像ファイルのパスが正しいか確認
2. パーミッション設定を確認（644）
3. ブラウザのキャッシュをクリア

### ブログ一覧が更新されない場合
1. blog-data.jsonが正しくアップロードされているか確認
2. ブラウザのキャッシュをクリア
3. サーバーのキャッシュ設定を確認

### リンクが404エラーになる場合
1. ファイル名が正しいか確認
2. ディレクトリ構造が正しいか確認
3. .htaccessの設定を確認

## 📊 完了報告

アップロード完了日時: _______________
確認者: _______________
備考: _______________
