#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
タイトル重複問題修正スクリプト
全ブログページの重複したHTMLヘッダー構造を除去
"""

import os
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

# ベースディレクトリ
BASE_DIR = Path(__file__).parent
BLOG_DIR = BASE_DIR / "blog"
BLOG_DATA_FILE = BASE_DIR / "blog-data.json"

def fix_duplicate_content(file_path):
    """重複したコンテンツを修正"""
    print(f"🔧 修正中: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # blog-post-content内の重複したHTMLヘッダー構造を除去
    pattern = r'(<div class="blog-post-content" itemprop="articleBody">)\s*<body>.*?<!-- ブログ記事 -->\s*<section class="blog-post"[^>]*>.*?<div class="blog-post-header">.*?</div>\s*<div class="blog-post-image">.*?</div>\s*<div class="blog-post-content"[^>]*>'
    
    replacement = r'\1'
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # 余分な</section>や</body>タグも除去
    new_content = re.sub(r'</section>\s*</body>\s*</div>\s*</section>', '</div></section>', new_content)
    new_content = re.sub(r'</body>\s*</div>\s*</section>', '</div></section>', new_content)
    
    # ファイルを保存
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ 修正完了: {file_path.name}")
        return True
    except Exception as e:
        print(f"❌ 修正失敗: {file_path.name} - {e}")
        return False

def main():
    """メイン処理"""
    print("🔄 タイトル重複問題修正開始...")
    
    # 重複問題があるファイルを特定
    problem_files = [
        'greenscreen-basics.html',
        'greenscreen-youtube-cm-osaka.html',
        'camera-selection.html'
    ]
    
    success_count = 0
    total_count = len(problem_files)
    
    for filename in problem_files:
        file_path = BLOG_DIR / filename
        if file_path.exists():
            if fix_duplicate_content(file_path):
                success_count += 1
        else:
            print(f"⚠️ ファイルが見つかりません: {filename}")
    
    print(f"\n📊 修正結果: {success_count}/{total_count} 件成功")
    print("✅ タイトル重複問題修正完了!")

if __name__ == "__main__":
    main()
