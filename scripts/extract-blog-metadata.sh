#!/bin/bash

# ブログメタデータ抽出スクリプト
# 指定されたHTMLファイルからメタデータを抽出してJSON形式で出力

if [ $# -eq 0 ]; then
    echo "使用方法: $0 <HTMLファイルパス>"
    echo "例: $0 public/blog/example-blog.html"
    exit 1
fi

HTML_FILE="$1"

if [ ! -f "$HTML_FILE" ]; then
    echo "エラー: ファイルが見つかりません: $HTML_FILE"
    exit 1
fi

FILENAME=$(basename "$HTML_FILE")
ID="${FILENAME%.html}"

echo "=========================================="
echo "ブログメタデータ抽出: $FILENAME"
echo "=========================================="
echo ""

# タイトルを抽出
TITLE=$(grep -o '<meta property="og:title" content="[^"]*"' "$HTML_FILE" | sed 's/.*content="//;s/"$//' | head -1)

# 説明を抽出
EXCERPT=$(grep -o '<meta property="og:description" content="[^"]*"' "$HTML_FILE" | sed 's/.*content="//;s/"$//' | head -1)

# 画像を抽出
IMAGE=$(grep -o '<meta property="og:image" content="[^"]*"' "$HTML_FILE" | sed 's/.*content="//;s/"$//' | head -1)
# URLからドメイン部分を削除
IMAGE_PATH=$(echo "$IMAGE" | sed 's|https://studioq.co.jp||')

# 日付を抽出
DATE=$(grep -o '"datePublished": "[^"]*"' "$HTML_FILE" | sed 's/.*": "//;s/"$//' | head -1)

# カテゴリを推測（タイトルやコンテンツから）
CATEGORY="スタジオ活用術"  # デフォルト

# タイトルに基づいてカテゴリを推測
if echo "$TITLE" | grep -qi "AI\|Unreal\|CG\|バーチャル\|合成"; then
    CATEGORY="バーチャル撮影"
elif echo "$TITLE" | grep -qi "音響\|音質\|マイク\|録音\|音"; then
    CATEGORY="音響・録音"
elif echo "$TITLE" | grep -qi "配信\|ライブ\|DJ"; then
    CATEGORY="ライブ配信"
elif echo "$TITLE" | grep -qi "YouTuber\|配信者"; then
    CATEGORY="YouTuber・配信者"
elif echo "$TITLE" | grep -qi "同録"; then
    CATEGORY="同録スタジオガイド"
elif echo "$TITLE" | grep -qi "撮影\|カメラ\|グリーンバック"; then
    CATEGORY="撮影テクニック"
elif echo "$TITLE" | grep -qi "機材\|Blackmagic"; then
    CATEGORY="機材ガイド"
elif echo "$TITLE" | grep -qi "コスプレ"; then
    CATEGORY="コスプレ撮影"
fi

echo "抽出結果:"
echo "----------------------------------------"
echo "ID: $ID"
echo "タイトル: $TITLE"
echo "日付: $DATE"
echo "抜粋: $EXCERPT"
echo "画像: $IMAGE_PATH"
echo "カテゴリ: $CATEGORY"
echo ""

# JSON形式で出力
echo "JSON形式:"
echo "----------------------------------------"
cat << EOF
    {
      "id": "$ID",
      "title": "$TITLE",
      "date": "$DATE",
      "excerpt": "$EXCERPT",
      "image": "$IMAGE_PATH",
      "category": "$CATEGORY",
      "url": "blog/$FILENAME"
    }
EOF

echo ""
echo "=========================================="
echo "✅ メタデータ抽出完了"
echo "=========================================="
echo ""
echo "💡 このJSONをblog-data.jsonの適切な位置（日付順）に追加してください"
