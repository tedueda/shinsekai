# 画像パス修正 - 2025年11月27日

## 🔍 問題の原因

10月のブログ記事5件で、存在しない画像パス `/assets/ogp/` を参照していたため、サムネイル画像が表示されませんでした。

## 📋 修正した記事（5件）

| 記事ID | タイトル | 修正前 | 修正後 |
|--------|---------|--------|--------|
| ai-video-sixth-generation-studioq | AIと映像制作の融合 | /assets/ogp/ai-video-sixth-generation-studioq.jpg | /images/slide1.jpg |
| youtuber-streamer-pro-quality-studioq | YouTuber・配信者必見！ | /assets/ogp/youtuber-streamer-pro-quality-studioq.jpg | /images/top3-1.jpg |
| studioq-deep-sound-recording-experience | プロが語る"音の深み"とは？ | /assets/ogp/studioq-deep-sound-recording-experience.jpg | /images/st09.jpg |
| studioq-dj-live-streaming | DJ配信 | /assets/ogp/studioq-dj-live-streaming.jpg | /images/bl03.png |
| studioq-acoustics-pro-sound-immersion | スタジオQの音響 | /assets/ogp/studioq-acoustics-pro-sound-immersion.jpg | /images/st09.jpg |

## ✅ 修正したファイル

1. **blog-data.json** - 画像パスを既存の画像に変更
2. **src/index.html** - BLOG_DATAの画像パスを修正
3. **src/blog.html** - BLOG_DATAの画像パスを修正

## 🎯 再アップロードが必要なファイル

以下の3ファイルを再度Xサーバーにアップロードしてください：

```
index.html          → /public_html/index.html
blog.html           → /public_html/blog.html
blog-data.json      → /public_html/blog-data.json
```

## 📊 使用した画像の説明

| 画像ファイル | 用途 |
|-------------|------|
| /images/slide1.jpg | AI映像制作関連 |
| /images/top3-1.jpg | YouTuber・配信者向け |
| /images/st09.jpg | 音響・録音関連（2記事で使用） |
| /images/bl03.png | ライブ配信関連 |

## ✅ 確認方法

再アップロード後、以下のURLで画像が表示されることを確認：

1. https://studioq.co.jp/blog.html
   - 10月21日の記事（AI映像制作）
   - 10月19日の記事（YouTuber）
   - 10月17日の記事（音の深み）
   - 10月15日の記事（DJ配信）
   - 10月13日の記事（音響）

2. ブラウザのキャッシュをクリア（Ctrl+Shift+R または Cmd+Shift+R）

## 🚨 今後の注意事項

新しいブログ記事を作成する際は、以下を確認してください：

1. **画像ファイルが実際に存在するか確認**
2. **画像パスは `/images/` から始まる既存の画像を使用**
3. **`/assets/ogp/` のような存在しないパスは使用しない**
4. **アップロード前にローカルプレビューで画像表示を確認**

## 📝 メモ

- 今回は既存の画像を使用して修正しました
- 将来的に専用のOGP画像を作成する場合は、`/images/` フォルダーに配置してください
- `/assets/ogp/` フォルダーは現在存在しないため、使用しないでください
