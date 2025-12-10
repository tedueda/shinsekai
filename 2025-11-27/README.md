# Xサーバーアップロード用ファイル - 2025年11月27日

## 📦 アップロード内容

### 新規追加ブログ記事
1. **2025年11月27日**: プロ現場で進む"少人数収録"の最適解｜マルチカメラ×PTZがもたらす新しい制作ワークフロー
   - ファイル: `blog/ptz-multi-camera-small-crew-workflow.html`
   - 画像: `images/slide4.jpg`

2. **2024年11月25日**: プロ現場で"音声クオリティ"が最重要視される理由｜配信・収録を成功させる最新スタジオ活用術
   - ファイル: `blog/pro-audio-quality-optimization.html`
   - 画像: `images/st07.jpg`

### 更新ファイル
- `index.html` - トップページのブログセクションを最新データに更新
- `blog.html` - ブログ一覧ページを最新データに更新
- `blog-data.json` - ブログデータベースに新規記事を追加

## 📋 アップロード手順

### 1. 必須ファイルのアップロード

#### HTMLファイル
```
/public_html/index.html
/public_html/blog.html
/public_html/blog-data.json
```

#### 新規ブログ記事
```
/public_html/blog/ptz-multi-camera-small-crew-workflow.html
/public_html/blog/pro-audio-quality-optimization.html
```

#### 画像ファイル
```
/public_html/images/st07.jpg
/public_html/images/slide4.jpg
```

### 2. アップロード後の確認事項

✅ トップページ（index.html）のブログセクションに最新記事が表示されているか
✅ ブログ一覧ページ（blog.html）に最新記事が表示されているか
✅ 新規ブログ記事のリンクが正しく動作するか
✅ 画像が正しく表示されるか

### 3. キャッシュクリア

ブラウザのキャッシュをクリアして、最新の内容が表示されることを確認してください。

## 🔍 変更内容の詳細

### blog-data.json
- 最新の2記事を配列の先頭に追加
- 日付順にソート済み

### index.html
- `window.BLOG_DATA` セクションを最新のblog-data.jsonと同期
- トップページのブログプレビューが最新3件を表示

### blog.html
- `window.BLOG_DATA` セクションを最新のblog-data.jsonと同期
- ブログ一覧ページが全記事を日付順に表示

## 📝 注意事項

- すべてのファイルはUTF-8エンコーディングです
- パーミッション設定: ファイル 644、ディレクトリ 755
- 既存のファイルを上書きする際は、念のためバックアップを取ってください

## 🎯 SEO対策

両記事とも以下のSEO対策を実施済み：
- メタディスクリプション
- OGPタグ（Facebook、Twitter）
- 構造化データ（BlogPosting）
- 適切なキーワード設定
- 内部リンク最適化
