#!/usr/bin/env bash
# Studio Q 開発サーバー起動スクリプト
# 使い方: ./start_dev_server.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$ROOT_DIR/src"
PUBLIC_DIR="$ROOT_DIR/public"

echo "=========================================="
echo "Studio Q 開発サーバー起動"
echo "=========================================="

# Step 1: src から public へ同期
echo ""
echo "📦 Step 1: src/ から public/ へファイルを同期中..."
rsync -a --delete "$SRC_DIR/" "$PUBLIC_DIR/"

# Step 2: 動画ファイルを movie フォルダにコピー
echo ""
echo "🎬 Step 2: 動画ファイルを movie/ にコピー中..."
mkdir -p "$PUBLIC_DIR/movie"
if [ -f "$SRC_DIR/images/greem1-2.mp4" ]; then
    cp "$SRC_DIR/images/greem1-2.mp4" "$PUBLIC_DIR/movie/"
    echo "  ✓ greem1-2.mp4 をコピーしました"
fi
if [ -f "$SRC_DIR/images/back1.mp4" ]; then
    cp "$SRC_DIR/images/back1.mp4" "$PUBLIC_DIR/movie/"
    echo "  ✓ back1.mp4 をコピーしました"
fi

# Step 3: 既存のポート8000を使用しているプロセスを停止
echo ""
echo "🔍 Step 3: ポート8000の確認..."
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "  ⚠️  ポート8000が使用中です。プロセスを停止します..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "  ✓ プロセスを停止しました"
else
    echo "  ✓ ポート8000は使用可能です"
fi

# Step 4: PHPサーバーの確認
echo ""
echo "🔍 Step 4: PHP環境の確認..."
if command -v php > /dev/null 2>&1; then
    PHP_VERSION=$(php -v | head -n 1)
    echo "  ✓ PHP が利用可能です: $PHP_VERSION"
    USE_PHP=true
else
    echo "  ⚠️  PHPが見つかりません。Python http.serverを使用します（メール送信不可）"
    USE_PHP=false
fi

# Step 5: 開発サーバーを起動
echo ""
echo "🚀 Step 5: 開発サーバーを起動中..."
echo ""
echo "=========================================="
echo "✅ サーバーが起動しました！"
echo "=========================================="
echo ""

cd "$PUBLIC_DIR"

if [ "$USE_PHP" = true ]; then
    echo "📍 URL: http://localhost:8000/"
    echo ""
    echo "💡 ヒント:"
    echo "  - ブラウザで http://localhost:8000/ にアクセス"
    echo "  - PHPサーバーを使用（メール送信可能）"
    echo "  - 停止するには Ctrl+C を押してください"
    echo ""
    echo "=========================================="
    echo ""
    php -S localhost:8000
else
    echo "📍 URL: http://localhost:8000/"
    echo ""
    echo "💡 ヒント:"
    echo "  - ブラウザで http://localhost:8000/ にアクセス"
    echo "  - Python http.serverを使用（メール送信不可）"
    echo "  - 停止するには Ctrl+C を押してください"
    echo ""
    echo "⚠️  注意: メール送信機能をテストするにはPHPが必要です"
    echo ""
    echo "=========================================="
    echo ""
    python3 -m http.server 8000
fi
