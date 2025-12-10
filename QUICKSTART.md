# Studio Q 開発環境 クイックスタートガイド

## 🚀 開発サーバーの起動（毎回これを実行）

```bash
./start_dev_server.sh
```

ブラウザで **http://localhost:8000/** にアクセス

## 📝 編集作業の流れ

### 1. ファイルを編集する
- **HTML**: `src/index.html`, `src/blog.html` など
- **CSS**: `src/_site/style.css`
- **JavaScript**: `src/_site/script.js`
- **画像**: `src/images/` に追加

### 2. 変更を確認する
- ファイルを保存
- ブラウザをリフレッシュ（Cmd+R）
- 変更が反映されない場合は強制リロード（Cmd+Shift+R）

### 3. サーバーを停止する
- ターミナルで `Ctrl+C`

## ⚠️ 重要な注意事項

### 編集してはいけないフォルダ
- ❌ `public/` - 自動生成されるため編集しない
- ❌ `2025-11-30/` - Xサーバー用のため編集しない
- ❌ `xserver_upload/` - アップロード用のため編集しない

### 編集するフォルダ
- ✅ `src/` - すべての編集はここで行う

## 🖼️ 画像の追加方法

1. 画像を `src/images/` に保存
2. HTMLで参照: `<img src="images/your-image.jpg">`
3. 開発サーバーを再起動: `./start_dev_server.sh`

## 🐛 トラブルシューティング

### 画像が表示されない
- `src/images/` に画像があるか確認
- 開発サーバーを再起動: `./start_dev_server.sh`
- ブラウザを強制リロード: `Cmd+Shift+R`

### CSSが反映されない
- `src/_site/style.css` を編集しているか確認
- ブラウザを強制リロード: `Cmd+Shift+R`

### ポート8000が使用中
- `start_dev_server.sh` が自動的に停止します
- 手動で停止する場合: `lsof -ti:8000 | xargs kill -9`

## 📤 本番環境へのアップロード

```bash
# アップロード用スナップショットを作成
tools/package.sh

# releases/YYYY-MM-DD/ フォルダが作成される
# このフォルダの内容をXサーバーにアップロード
```

詳細は `UPLOAD_CHECKLIST.md` を参照してください。

## 📚 その他のドキュメント

- `README.md` - プロジェクト全体の説明
- `UPLOAD_CHECKLIST.md` - アップロード手順
- `BLOG_MANAGEMENT_GUIDE.md` - ブログ管理方法
