#!/bin/bash

# ブログデータ同期チェックスクリプト
# このスクリプトは、public/blog/とblog-data.jsonの同期状態を確認します

echo "=========================================="
echo "ブログデータ同期チェック"
echo "=========================================="
echo ""

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# エラーカウンター
ERROR_COUNT=0
WARNING_COUNT=0

# 1. public/blog/内の全HTMLファイルを取得
echo "📁 ブログHTMLファイルをスキャン中..."
BLOG_FILES=$(find public/blog -name "*.html" -type f ! -name "index.html" ! -name "blog-template.html" 2>/dev/null)

if [ -z "$BLOG_FILES" ]; then
    echo -e "${RED}❌ エラー: public/blog/にHTMLファイルが見つかりません${NC}"
    exit 1
fi

TOTAL_HTML_FILES=$(echo "$BLOG_FILES" | wc -l | tr -d ' ')
echo -e "${GREEN}✓ ${TOTAL_HTML_FILES}件のブログHTMLファイルを検出${NC}"
echo ""

# 2. blog-data.jsonの存在確認
if [ ! -f "blog-data.json" ]; then
    echo -e "${RED}❌ エラー: blog-data.jsonが見つかりません${NC}"
    exit 1
fi

# 3. blog-data.jsonに登録されている記事数を確認
JSON_POSTS_COUNT=$(grep -o '"id":' blog-data.json | wc -l | tr -d ' ')
echo -e "${GREEN}✓ blog-data.jsonに${JSON_POSTS_COUNT}件の記事が登録されています${NC}"
echo ""

# 4. 各HTMLファイルがblog-data.jsonに登録されているかチェック
echo "🔍 同期状態をチェック中..."
echo ""

MISSING_FILES=()

for file in $BLOG_FILES; do
    filename=$(basename "$file")
    
    # blog-data.jsonに該当ファイルのURLが存在するかチェック
    if ! grep -q "\"url\": \"blog/$filename\"" blog-data.json; then
        MISSING_FILES+=("$filename")
        echo -e "${RED}❌ 未登録: $filename${NC}"
        ((ERROR_COUNT++))
    fi
done

echo ""

# 5. 結果サマリー
echo "=========================================="
echo "チェック結果サマリー"
echo "=========================================="
echo "HTMLファイル総数: $TOTAL_HTML_FILES"
echo "blog-data.json登録数: $JSON_POSTS_COUNT"
echo -e "${RED}未登録ファイル数: $ERROR_COUNT${NC}"
echo ""

if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ すべてのブログ記事がblog-data.jsonに登録されています！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  以下のファイルがblog-data.jsonに登録されていません:${NC}"
    echo ""
    for missing in "${MISSING_FILES[@]}"; do
        echo "  - $missing"
    done
    echo ""
    echo -e "${YELLOW}💡 対処方法:${NC}"
    echo "  1. 各HTMLファイルからメタデータ（タイトル、日付、抜粋など）を抽出"
    echo "  2. blog-data.jsonに新しいエントリを追加"
    echo "  3. src/index.htmlとsrc/blog.htmlのBLOG_DATAも同期"
    echo ""
    exit 1
fi
