# Studio Q Web 管理（src/public/releases 構成）

## ディレクトリ構成
- **src/**: 編集用ソース（唯一の正式な編集場所）
- **public/**: 本番にアップロードする完成物（src から自動生成）
- releases/: アップロード用スナップショット（最新3件保持）
- tools/: 自動化スクリプト（package/cleanup）
- **2025-11-30/**: Xサーバー用フォルダ（編集不可）

## 🚀 開発サーバーの起動（推奨）

```bash
# 開発サーバーを起動（自動的に src → public 同期）
./start_dev_server.sh
```

このスクリプトは以下を自動実行します：
1. src/ から public/ へ全ファイルを同期
2. 動画ファイルを movie/ フォルダにコピー
3. ポート8000の確認と既存プロセスの停止
4. public/ フォルダから開発サーバーを起動

**ブラウザで http://localhost:8000/ にアクセス**

## 運用ルール

### ⚠️ 重要：編集場所
- **変更は必ず src/ 配下のみで行う**
- public/ は自動生成されるため直接編集しない
- 2025-11-30/ はXサーバー用のため編集しない

### 画像ファイルの管理
- **正式な保存先**: `src/images/`
- public/images/ は src/images/ から自動コピーされる
- 新しい画像は必ず src/images/ に追加する

## 本番アップロード用スナップショット作成

```bash
# スナップショット作成（今日の日付）
tools/package.sh

# 任意日付で作成
TOOLS_DATE=2025-09-23 tools/package.sh 2025-09-23
```

## 注意点
- 画像・CSS/JS は /images/, /_site/ などの共通パスで一元管理
- Linux 本番環境では大文字小文字が厳密（例: CG03.png）
- 開発時は必ず start_dev_server.sh を使用してサーバーを起動する
