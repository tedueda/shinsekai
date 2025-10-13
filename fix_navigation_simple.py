#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ナビゲーション修正スクリプト（シンプル版）
タイトルとサムネイルのみ、説明文削除、リンク修正
"""

import os
import json
import re
from pathlib import Path

# ベースディレクトリ
BASE_DIR = Path(__file__).parent
BLOG_DIR = BASE_DIR / "blog"
BLOG_DATA_FILE = BASE_DIR / "blog-data.json"

def load_blog_data():
    """blog-data.jsonを読み込み"""
    with open(BLOG_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_blog_navigation(current_post_id, posts):
    """前後のブログナビゲーションHTMLを生成（タイトルとサムネイルのみ）"""
    current_index = None
    
    for i, post in enumerate(posts):
        if post.get('id') == current_post_id:
            current_index = i
            break
    
    if current_index is None:
        return "", ""
    
    # 前の記事
    prev_html = ""
    if current_index > 0:
        prev_post = posts[current_index - 1]
        prev_url = prev_post.get('url', '#').replace('blog/', '')
        prev_image = prev_post.get('image', '../images/default.jpg')
        prev_title = prev_post.get('title', '')
        
        prev_html = f'''<a href="{prev_url}" class="nav-link">
                    <div class="nav-direction">
                        <i class="fas fa-chevron-left"></i>前の記事
                    </div>
                    <img src="{prev_image}" alt="{prev_title}" class="nav-thumbnail">
                    <div class="nav-title">{prev_title}</div>
                </a>'''
    
    # 次の記事
    next_html = ""
    if current_index < len(posts) - 1:
        next_post = posts[current_index + 1]
        next_url = next_post.get('url', '#').replace('blog/', '')
        next_image = next_post.get('image', '../images/default.jpg')
        next_title = next_post.get('title', '')
        
        next_html = f'''<a href="{next_url}" class="nav-link">
                    <div class="nav-direction">
                        次の記事<i class="fas fa-chevron-right"></i>
                    </div>
                    <img src="{next_image}" alt="{next_title}" class="nav-thumbnail">
                    <div class="nav-title">{next_title}</div>
                </a>'''
    
    return prev_html, next_html

def fix_navigation_simple(post_data, posts):
    """ナビゲーションをシンプルに修正"""
    filename = post_data.get('url', '').replace('blog/', '')
    if not filename:
        return False
    
    file_path = BLOG_DIR / filename
    if not file_path.exists():
        return False
    
    print(f"🔧 ナビゲーション修正中: {filename}")
    
    # 現在のファイルを読み込み
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # ナビゲーションを生成
    prev_html, next_html = get_blog_navigation(post_data.get('id'), posts)
    
    # ナビゲーション全体を置換
    nav_pattern = r'(<nav class="blog-navigation"[^>]*>.*?<div class="nav-container">.*?<div class="nav-item nav-prev">)(.*?)(</div>.*?<div class="nav-item nav-next">)(.*?)(</div>.*?</div>.*?</nav>)'
    
    replacement = f'\\1\n                {prev_html}\n            \\3\n                {next_html}\n            \\5'
    
    new_content = re.sub(nav_pattern, replacement, content, flags=re.DOTALL)
    
    # ファイルを保存
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ ナビゲーション修正完了: {filename}")
        return True
    except Exception as e:
        print(f"❌ ナビゲーション修正失敗: {filename} - {e}")
        return False

def main():
    """メイン処理"""
    print("🔄 ナビゲーション修正開始（シンプル版）...")
    
    # blog-data.jsonを読み込み
    try:
        blog_data = load_blog_data()
        posts = blog_data.get('posts', [])
    except Exception as e:
        print(f"❌ blog-data.json読み込みエラー: {e}")
        return
    
    # 各ブログファイルのナビゲーションを修正
    success_count = 0
    total_count = len(posts)
    
    for post in posts:
        if fix_navigation_simple(post, posts):
            success_count += 1
    
    print(f"\n📊 修正結果: {success_count}/{total_count} 件成功")
    print("✅ ナビゲーション修正完了!")

if __name__ == "__main__":
    main()
