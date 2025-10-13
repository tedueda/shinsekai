#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ブログページの画像とコンテンツ修正スクリプト
元のHTMLファイルから実際のコンテンツを抽出して適用
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

# 元のファイルからコンテンツを抽出する関数
def extract_original_content(file_path):
    """元のHTMLファイルから実際のコンテンツを抽出"""
    backup_file = BACKUP_DIR / file_path.name
    
    if backup_file.exists():
        with open(backup_file, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        # バックアップがない場合は現在のファイルから抽出を試行
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # コンテンツ抽出のパターン
    content_selectors = [
        '.blog-post-content',
        'main',
        'article',
        '.content',
        '.post-content'
    ]
    
    for selector in content_selectors:
        content_div = soup.select_one(selector)
        if content_div:
            return str(content_div)
    
    # フォールバック: body内のコンテンツを取得
    body = soup.find('body')
    if body:
        # ヘッダー、フッター、ナビゲーションを除外
        for tag in body.find_all(['header', 'footer', 'nav']):
            tag.decompose()
        return str(body)
    
    return None

def extract_image_path(content):
    """コンテンツから画像パスを抽出"""
    if not content:
        return "../images/default.jpg"
    
    soup = BeautifulSoup(content, 'html.parser')
    img = soup.find('img')
    if img and img.get('src'):
        src = img.get('src')
        # 相対パスを調整
        if not src.startswith('../'):
            if src.startswith('images/'):
                src = '../' + src
            elif not src.startswith('http'):
                src = '../images/' + src
        return src
    
    return "../images/default.jpg"

def fix_blog_file(file_path):
    """個別のブログファイルを修正"""
    print(f"🔧 修正中: {file_path.name}")
    
    # 現在のファイルを読み込み
    with open(file_path, 'r', encoding='utf-8') as f:
        current_content = f.read()
    
    # 元のコンテンツを抽出
    original_content = extract_original_content(file_path)
    
    if not original_content:
        print(f"⚠️  コンテンツが見つかりません: {file_path.name}")
        return False
    
    # 画像パスを抽出
    image_path = extract_image_path(original_content)
    
    # コンテンツ部分のみを抽出（div.blog-post-content内）
    soup = BeautifulSoup(original_content, 'html.parser')
    content_div = soup.find(class_='blog-post-content') or soup.find('div')
    
    if content_div:
        # 不要なタグを削除
        for tag in content_div.find_all(['script', 'style']):
            tag.decompose()
        clean_content = content_div.decode_contents()
    else:
        clean_content = original_content
    
    # 現在のHTMLの画像パスとコンテンツを置換
    # 画像パス修正
    current_content = re.sub(
        r'<img src="[^"]*" alt="([^"]*)" loading="lazy">',
        f'<img src="{image_path}" alt="\\1" loading="lazy">',
        current_content
    )
    
    # コンテンツ部分を置換
    content_pattern = r'(<div class="blog-post-content" itemprop="articleBody">)(.*?)(</div>)'
    replacement = f'\\1\n            {clean_content}\n        \\3'
    
    new_content = re.sub(content_pattern, replacement, current_content, flags=re.DOTALL)
    
    # ファイルを保存
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ 修正完了: {file_path.name}")
    return True

def backup_original_files():
    """元のファイルをバックアップ"""
    if not BACKUP_DIR.exists():
        BACKUP_DIR.mkdir()
        print(f"📁 バックアップディレクトリ作成: {BACKUP_DIR}")
    
    # 2025-08-26-2フォルダーから元のファイルをコピー
    source_dirs = [
        BASE_DIR / "2025-08-26-2" / "blog",
        BASE_DIR / "2025-08-27" / "blog",
        BASE_DIR / "2025-08-28-1" / "blog"
    ]
    
    for source_dir in source_dirs:
        if source_dir.exists():
            for file_path in source_dir.glob("*.html"):
                backup_path = BACKUP_DIR / file_path.name
                if not backup_path.exists():
                    import shutil
                    shutil.copy2(file_path, backup_path)
                    print(f"📋 バックアップ: {file_path.name}")

def main():
    """メイン処理"""
    print("🔄 ブログコンテンツ修正開始...")
    
    # バックアップ作成
    backup_original_files()
    
    # 修正対象ファイル
    target_files = [
        "large-space-studioq.html",
        "lounge.html",
        "music-performance-video-osaka.html",
        "virtual-production.html",
        "完全防音の同録スタジオで効率的な映像制作.html",
        "大阪で同録スタジオをお探しなら完全防音・同時録画収音のスタジオQ.html",
        "ライブ配信のためのプロフェッショナルな防音スタジオと同時録音スタジオの選び方.html"
    ]
    
    success_count = 0
    
    for filename in target_files:
        file_path = BLOG_DIR / filename
        if file_path.exists():
            if fix_blog_file(file_path):
                success_count += 1
        else:
            print(f"❌ ファイルが見つかりません: {filename}")
    
    print(f"\n📊 修正結果: {success_count}/{len(target_files)} 件成功")
    print("✅ ブログコンテンツ修正完了!")

if __name__ == "__main__":
    main()
