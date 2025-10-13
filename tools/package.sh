#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
SRC="$ROOT_DIR/src"
PUBLIC="$ROOT_DIR/public"
RELEASES="$ROOT_DIR/releases"
DATE_TAG="${1:-$(date +%Y-%m-%d)}"

# Build public from src
rsync -a --delete "$SRC/" "$PUBLIC/"

# Create release snapshot
DEST="$RELEASES/$DATE_TAG"
mkdir -p "$DEST"
rsync -a --delete \
  --include '/index.html' \
  --include '/blog.html' \
  --include '/blog/***' \
  --exclude '*' \
  "$PUBLIC/" "$DEST/"

# Create/Update README in release
cat > "$DEST/README_UPLOAD.md" <<EOR
# $DATE_TAG アップロード用スナップショット

このフォルダーの中身を本番ドキュメントルートへ上書きアップロードしてください。

## 含まれるHTML
- index.html（トップ）
- blog.html（ブログ一覧）
- blog/（ブログ記事一式）

## 注意事項
- 画像・CSS/JS は共通パス（/images/, /_site/ 等）を使用しています。必要に応じて追加アップロードしてください。
- 反映確認はクエリ付与でキャッシュ回避（例: /index.html?t=$(date +%Y%m%d%H%M)）。
EOR

# Keep only latest 3 release folders
"$ROOT_DIR/tools/cleanup_releases.sh" 3
