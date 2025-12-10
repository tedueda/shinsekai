# Xサーバー 最終アップロードチェックリスト - 2025年11月27日

## 📦 今回のアップロード内容

### ✅ 修正内容まとめ
1. **10月のブログ記事10件を追加**
2. **11月25日の記事の日付を2024→2025に修正**
3. **記事の表示順序を日付順に修正**
4. **サムネイル画像を本文画像に一致させる（5件）**

---

## 📋 アップロードファイル一覧

### 1. メインHTMLファイル（3ファイル）
- [ ] `index.html` → `/public_html/index.html`
- [ ] `blog.html` → `/public_html/blog.html`
- [ ] `blog-data.json` → `/public_html/blog-data.json`

### 2. 11月の新規ブログ記事（2ファイル）
- [ ] `blog/ptz-multi-camera-small-crew-workflow.html` → `/public_html/blog/`
- [ ] `blog/pro-audio-quality-optimization.html` → `/public_html/blog/`

### 3. 10月のブログ記事（11ファイル）
- [ ] `blog/ai-video-sixth-generation-studioq.html`
- [ ] `blog/youtuber-streamer-pro-quality-studioq.html`
- [ ] `blog/studioq-deep-sound-recording-experience.html`
- [ ] `blog/studioq-dj-live-streaming.html`
- [ ] `blog/studioq-acoustics-pro-sound-immersion.html`
- [ ] `blog/unreal-engine-studioq-3d-composite.html`
- [ ] `blog/blackmagic-ultimatte-studioq.html`
- [ ] `blog/greenscreen-shooting-studioq.html`
- [ ] `blog/music-onboard-recording-studioq.html`
- [ ] `blog/multi-camera-shooting-studioq.html`
- [ ] `blog/cosplay-ai-background-worldview.html`

### 4. 画像ファイル（7ファイル）
- [ ] `images/st07.jpg` - 11月25日記事用
- [ ] `images/slide4.jpg` - 11月27日記事用
- [ ] `images/kurokiJPG.JPG` - 10月21日記事用
- [ ] `images/top_VR4-1.jpg` - 10月19日記事用
- [ ] `images/st10.jpg` - 10月17日記事用
- [ ] `images/dj02.jpg` - 10月15日記事用
- [ ] `images/st11.jpg` - 10月13日記事用

---

## 📊 アップロード統計

| カテゴリ | ファイル数 |
|---------|-----------|
| メインファイル | 3 |
| 11月ブログ記事 | 2 |
| 10月ブログ記事 | 11 |
| 画像ファイル | 7 |
| **合計** | **23** |

---

## 🎯 アップロード手順

### ステップ1: FTP接続
1. FileZillaまたはFTPクライアントを起動
2. Xサーバーに接続
3. `/public_html/` ディレクトリに移動

### ステップ2: メインファイルのアップロード（重要）
```
index.html          → /public_html/
blog.html           → /public_html/
blog-data.json      → /public_html/
```

### ステップ3: ブログ記事のアップロード
**11月の記事（2件）**
```
blog/ptz-multi-camera-small-crew-workflow.html
blog/pro-audio-quality-optimization.html
```

**10月の記事（11件）**
```
blog/ai-video-sixth-generation-studioq.html
blog/youtuber-streamer-pro-quality-studioq.html
blog/studioq-deep-sound-recording-experience.html
blog/studioq-dj-live-streaming.html
blog/studioq-acoustics-pro-sound-immersion.html
blog/unreal-engine-studioq-3d-composite.html
blog/blackmagic-ultimatte-studioq.html
blog/greenscreen-shooting-studioq.html
blog/music-onboard-recording-studioq.html
blog/multi-camera-shooting-studioq.html
blog/cosplay-ai-background-worldview.html
```

### ステップ4: 画像ファイルのアップロード
```
images/st07.jpg
images/slide4.jpg
images/kurokiJPG.JPG
images/top_VR4-1.jpg
images/st10.jpg
images/dj02.jpg
images/st11.jpg
```

### ステップ5: パーミッション確認
- ファイル: 644
- ディレクトリ: 755

---

## ✅ アップロード後の確認

### 1. トップページ確認
- [ ] https://studioq.co.jp/
- [ ] ブログセクションに最新3件が表示
  - 2025.11.27 - プロ現場で進む"少人数収録"の最適解
  - 2025.11.25 - プロ現場で"音声クオリティ"が最重要視される理由
  - 2025.11.15 - 音楽ライブ配信の品質を決めるのは"音"と"空間"

### 2. ブログ一覧ページ確認（最重要）
- [ ] https://studioq.co.jp/blog.html
- [ ] **10月の記事が表示されているか**
- [ ] 日付順に正しくソート（新しい順）
- [ ] サムネイル画像が正しく表示

### 3. 日付確認
- [ ] https://studioq.co.jp/blog/pro-audio-quality-optimization.html
- [ ] 日付が「2025.11.25」と表示されているか

### 4. サムネイル画像確認
- [ ] 10月21日 - kurokiJPG.JPG が表示
- [ ] 10月19日 - top_VR4-1.jpg が表示
- [ ] 10月17日 - st10.jpg が表示
- [ ] 10月15日 - dj02.jpg が表示
- [ ] 10月13日 - st11.jpg が表示

### 5. ブラウザキャッシュクリア
- [ ] Ctrl+Shift+R（Windows）または Cmd+Shift+R（Mac）
- [ ] プライベートブラウジングモードで確認

---

## 📈 期待される結果

### ブログ一覧ページ (blog.html)
```
2025.11.27 - プロ現場で進む"少人数収録"の最適解
2025.11.25 - プロ現場で"音声クオリティ"が最重要視される理由 ★日付修正
2025.11.15 - 音楽ライブ配信の品質を決めるのは"音"と"空間"
2025.11.13 - 5メートル天井×大型照明で変わる映像表現
2025.10.21 - AIと映像制作の融合 ★新規追加
2025.10.19 - YouTuber・配信者必見！ ★新規追加
2025.10.17 - プロが語る"音の深み"とは？ ★新規追加
2025.10.15 - スタジオQで実現する「DJ配信」 ★新規追加
2025.10.13 - スタジオQの音響 ★新規追加
2025.10.11 - Unreal Engine × Studio Q ★新規追加
2025.10.09 - Blackmagic Design Ultimatte ★新規追加
2025.10.07 - グリーンバック撮影で生まれる新しい映像表現 ★新規追加
2025.10.05 - 完全防音スタジオで実現する「音楽の同録」 ★新規追加
2025.10.03 - スタジオQの「マルチカメラ撮影」 ★新規追加
2025.10.01 - コスプレ撮影をもっと自由に ★新規追加
2025.09.25 - スタジオQの優れたマイクがもたらす
...
```

---

## 🚨 重要な修正内容

### 1. 日付修正
- **pro-audio-quality-optimization.html**: 2024-11-25 → **2025-11-25**

### 2. 表示順序修正
- 日付順（新しい順）に並べ替え
- 2025-11-25の記事が2番目に表示

### 3. サムネイル画像修正（5件）
- ai-video-sixth-generation-studioq: slide1.jpg → **kurokiJPG.JPG**
- youtuber-streamer-pro-quality-studioq: top3-1.jpg → **top_VR4-1.jpg**
- studioq-deep-sound-recording-experience: st09.jpg → **st10.jpg**
- studioq-dj-live-streaming: bl03.png → **dj02.jpg**
- studioq-acoustics-pro-sound-immersion: st09.jpg → **st11.jpg**

---

## 🔍 トラブルシューティング

### 問題: 10月の記事が表示されない
**対処法**:
1. ブラウザのキャッシュを完全にクリア
2. blog-data.jsonが正しくアップロードされているか確認
3. blog.htmlが最新版か確認

### 問題: 日付が2024のまま
**対処法**:
1. pro-audio-quality-optimization.htmlが最新版か確認
2. ブラウザのキャッシュをクリア
3. ファイルが正しく上書きされているか確認

### 問題: サムネイル画像が表示されない
**対処法**:
1. 画像ファイルが正しくアップロードされているか確認
2. パーミッションを確認（644）
3. ファイル名の大文字小文字を確認

---

## 📝 アップロード完了後のメモ

- アップロード日時: _______________
- 確認者: _______________
- 確認結果:
  - [ ] トップページ OK
  - [ ] ブログ一覧 OK（10月記事表示確認）
  - [ ] 日付表示 OK（2025.11.25）
  - [ ] サムネイル画像 OK
  - [ ] 個別記事 OK

---

## 🎉 完了！

全てのファイルをアップロードし、確認が完了したら完了です。

**今回のアップロードで**:
- ✅ 9月、10月、11月のブログが全て正しく表示
- ✅ 日付が正しく表示（2025年）
- ✅ サムネイルと本文画像が一致
- ✅ 日付順に正しくソート

お疲れ様でした！
