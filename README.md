# Studio Q Web 管理（src/public/releases 構成）

## ディレクトリ構成
- src/: 編集用ソース（唯一の正）
- public/: 本番にアップロードする完成物（src から生成）
- releases/: アップロード用スナップショット（最新3件保持）
- tools/: 自動化スクリプト（package/cleanup）

## 運用ルール
- 変更は src/ 配下のみ編集
- 反映は tools/package.sh を実行 → public/ 生成 → releases/YYYY-MM-DD 作成
- releases/ は cleanup により最新3件のみ保持

## 使い方
```bash
# スナップショット作成（今日の日付）
tools/package.sh

# 任意日付で作成
TOOLS_DATE=2025-09-23 tools/package.sh 2025-09-23
```

## 注意点
- 画像・CSS/JS は /images/, /_site/ などの共通パスで一元管理
- Linux 本番環境では大文字小文字が厳密（例: CG03.png）
