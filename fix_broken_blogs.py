#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
破損したブログページの修復スクリプト
バックアップから元のコンテンツを復元し、新しいテンプレートに適用
"""

import os
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

# ベースディレクトリ
BASE_DIR = Path(__file__).parent
BLOG_DIR = BASE_DIR / "blog"
BACKUP_DIR = BASE_DIR / "blog_backup"
BLOG_DATA_FILE = BASE_DIR / "blog-data.json"

def load_blog_data():
    """blog-data.jsonを読み込み"""
    with open(BLOG_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_clean_content(backup_file):
    """バックアップファイルから綺麗なコンテンツを抽出"""
    with open(backup_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # メインコンテンツを探す
    main_content = None
    
    # 複数のセレクターを試行
    selectors = [
        '.blog-content',
        '.post-content', 
        '.article-content',
        'main',
        '.content'
    ]
    
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            main_content = element
            break
    
    # セレクターで見つからない場合、body内のコンテンツを取得
    if not main_content:
        body = soup.find('body')
        if body:
            # ヘッダー、フッター、ナビゲーションを除去
            for unwanted in body.find_all(['header', 'footer', 'nav', 'script', 'style']):
                unwanted.decompose()
            main_content = body
    
    if main_content:
        # 不要な属性を削除
        for tag in main_content.find_all():
            # クラスとIDを除去（スタイルの競合を避けるため）
            if tag.name not in ['img', 'a']:  # 画像とリンクは属性を保持
                tag.attrs = {}
        
        return str(main_content)
    
    return None

def get_blog_navigation(current_post_id, posts):
    """前後のブログナビゲーションHTMLを生成"""
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

def fix_broken_blog(post_data, posts):
    """破損したブログページを修復"""
    filename = post_data.get('url', '').replace('blog/', '')
    if not filename:
        return False
    
    file_path = BLOG_DIR / filename
    backup_file = BACKUP_DIR / filename
    
    print(f"🔧 修復中: {filename}")
    
    # バックアップファイルが存在するかチェック
    if not backup_file.exists():
        print(f"⚠️  バックアップファイルが見つかりません: {filename}")
        return False
    
    # バックアップからコンテンツを抽出
    content = extract_clean_content(backup_file)
    if not content:
        print(f"⚠️  コンテンツを抽出できませんでした: {filename}")
        return False
    
    # テンプレートファイルを読み込み
    template_path = BLOG_DIR / "blog-template.html"
    with open(template_path, 'r', encoding='utf-8') as f:
        template = f.read()
    
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
        print(f"✅ 修復完了: {filename}")
        return True
    except Exception as e:
        print(f"❌ 修復失敗: {filename} - {e}")
        return False

def main():
    """メイン処理"""
    print("🔄 破損ブログページ修復開始...")
    
    # blog-data.jsonを読み込み
    try:
        blog_data = load_blog_data()
        posts = blog_data.get('posts', [])
    except Exception as e:
        print(f"❌ blog-data.json読み込みエラー: {e}")
        return
    
    # 修復対象ファイル（問題があるもの）
    target_files = [
        "ライブ配信のためのプロフェッショナルな防音スタジオと同時録音スタジオの選び方.html",
        "大阪で同録スタジオをお探しなら完全防音・同時録画収音のスタジオQ.html",
        "完全防音の同録スタジオで効率的な映像制作.html",
        "aiによるバ-チャル合成撮影-スタジオqでの取り組みと成功例.html"
    ]
    
    success_count = 0
    
    for post in posts:
        url = post.get('url', '')
        filename = url.replace('blog/', '')
        
        if filename in target_files:
            if fix_broken_blog(post, posts):
                success_count += 1
    
    print(f"\n📊 修復結果: {success_count}/{len(target_files)} 件成功")
    print("✅ 破損ブログページ修復完了!")

if __name__ == "__main__":
    main()
