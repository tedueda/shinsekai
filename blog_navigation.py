#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ブログナビゲーション機能付きテンプレート適用スクリプト
前後のブログページへのナビゲーションを自動生成
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
    """前後のブログナビゲーションHTMLを生成"""
    current_index = None
    
    # 現在の記事のインデックスを見つける
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
        prev_html = f'''
                <a href="{prev_post.get('url', '#')}" class="nav-link">
                    <div class="nav-direction">
                        <i class="fas fa-chevron-left"></i>前の記事
                    </div>
                    <img src="{prev_post.get('image', '../images/default.jpg')}" alt="{prev_post.get('title', '')}" class="nav-thumbnail">
                    <div class="nav-title">{prev_post.get('title', '')}</div>
                    <div class="nav-excerpt">{prev_post.get('excerpt', '')[:60]}...</div>
                </a>'''
    
    # 次の記事
    next_html = ""
    if current_index < len(posts) - 1:
        next_post = posts[current_index + 1]
        next_html = f'''
                <a href="{next_post.get('url', '#')}" class="nav-link">
                    <div class="nav-direction">
                        次の記事<i class="fas fa-chevron-right"></i>
                    </div>
                    <img src="{next_post.get('image', '../images/default.jpg')}" alt="{next_post.get('title', '')}" class="nav-thumbnail">
                    <div class="nav-title">{next_post.get('title', '')}</div>
                    <div class="nav-excerpt">{next_post.get('excerpt', '')[:60]}...</div>
                </a>'''
    
    return prev_html, next_html

def apply_template_with_navigation(post_data, posts):
    """ナビゲーション付きテンプレートを適用"""
    filename = post_data.get('url', '').replace('blog/', '')
    if not filename:
        return False
    
    file_path = BLOG_DIR / filename
    if not file_path.exists():
        print(f"❌ ファイルが見つかりません: {filename}")
        return False
    
    # テンプレートファイルを読み込み
    template_path = BLOG_DIR / "blog-template.html"
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    
    # 既存ファイルからコンテンツを抽出
    with open(file_path, 'r', encoding='utf-8') as f:
        current_content = f.read()
    
    # コンテンツ部分を抽出
    content_match = re.search(r'<div class="blog-post-content"[^>]*>(.*?)</div>\s*</section>', current_content, re.DOTALL)
    if content_match:
        content = content_match.group(1).strip()
    else:
        content = "<p>コンテンツを読み込み中...</p>"
    
    # ナビゲーションを生成
    prev_html, next_html = get_blog_navigation(post_data.get('id'), posts)
    
    # テンプレートデータを準備
    template_data = {
        'TITLE': post_data.get('title', 'ブログ記事'),
        'DESCRIPTION': post_data.get('excerpt', '大阪・スタジオQのブログ記事です。'),
        'KEYWORDS': 'スタジオQ, 大阪, 撮影スタジオ, 映像制作',
        'URL_SLUG': post_data.get('id', filename.replace('.html', '')),
        'IMAGE_OGP': f"{post_data.get('id', 'default')}.jpg",
        'DATE_PUBLISHED': post_data.get('date', '2025-08-28'),
        'DATE_MODIFIED': post_data.get('date', '2025-08-28'),
        'DATE_DISPLAY': format_date(post_data.get('date', '2025-08-28')),
        'IMAGE_PATH': post_data.get('image', '../images/default.jpg'),
        'IMAGE_ALT': f"{post_data.get('title', 'ブログ記事')}の画像",
        'CONTENT': content,
        'PREV_BLOG': prev_html,
        'NEXT_BLOG': next_html
    }
    
    # テンプレートに適用
    new_html = template
    for key, value in template_data.items():
        new_html = new_html.replace('{{' + key + '}}', str(value))
    
    # ファイルを保存
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"✅ ナビゲーション適用完了: {filename}")
        return True
    except Exception as e:
        print(f"❌ 適用失敗: {filename} - {e}")
        return False

def format_date(date_str):
    """日付をフォーマット"""
    if not date_str:
        return "2025.08.28"
    
    try:
        parts = date_str.split('-')
        if len(parts) == 3:
            return f"{parts[0]}.{parts[1].zfill(2)}.{parts[2].zfill(2)}"
    except:
        pass
    
    return date_str.replace('-', '.')

def main():
    """メイン処理"""
    print("🔄 ブログナビゲーション機能適用開始...")
    
    # blog-data.jsonを読み込み
    try:
        blog_data = load_blog_data()
        posts = blog_data.get('posts', [])
    except Exception as e:
        print(f"❌ blog-data.json読み込みエラー: {e}")
        return
    
    # 各ブログファイルにナビゲーション付きテンプレートを適用
    success_count = 0
    total_count = len(posts)
    
    for post in posts:
        if apply_template_with_navigation(post, posts):
            success_count += 1
    
    print(f"\n📊 適用結果: {success_count}/{total_count} 件成功")
    print("✅ ブログナビゲーション機能適用完了!")

if __name__ == "__main__":
    main()
