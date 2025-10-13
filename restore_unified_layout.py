#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
統一レイアウト復元スクリプト
ナビゲーションなしで統一デザインを適用
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

# 統一テンプレート（ナビゲーションなし）
UNIFIED_TEMPLATE = '''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>{title}｜大阪の撮影スタジオ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="{description}" />
  <meta name="keywords" content="{keywords}" />
  <link rel="canonical" href="https://studioq.co.jp/blog/{url_slug}/" />

  <!-- OGP -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{title}｜大阪の撮影スタジオ" />
  <meta property="og:description" content="{description}" />
  <meta property="og:url" content="https://studioq.co.jp/blog/{url_slug}/" />
  <meta property="og:image" content="https://studioq.co.jp/assets/ogp/{image_ogp}" />
  <meta property="og:locale" content="ja_JP" />
  <meta name="twitter:card" content="summary_large_image" />

  <!-- 構造化データ（BlogPosting） -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "{title}",
    "description": "{description}",
    "image": "https://studioq.co.jp/assets/ogp/{image_ogp}",
    "datePublished": "{date_published}",
    "dateModified": "{date_modified}",
    "author": {{ "@type": "Organization", "name": "スタジオQ" }},
    "publisher": {{
      "@type": "Organization",
      "name": "スタジオQ",
      "logo": {{ "@type": "ImageObject", "url": "https://studioq.co.jp/assets/logo.png" }}
    }},
    "mainEntityOfPage": "https://studioq.co.jp/blog/{url_slug}/"
  }}
  </script>

  <!-- 共有スタイルとアイコン -->
  <link rel="stylesheet" href="/_site/style.css?v=20250821-1456">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <!-- ブログ記事ページのスタイル（black theme） -->
  <style>
        :root{{ --header-height: 72px; }}
        @media (max-width: 768px){{ :root{{ --header-height: 60px; }} }}
        html{{ scroll-padding-top: var(--header-height); }}
        body{{ margin:0; background:#0b0e14; color:#eee; padding-top: var(--header-height); }}
        .blog-post {{ max-width: 900px; margin: 0 auto; padding: 60px 20px; }}
        .blog-post-header {{ margin-bottom: 40px; text-align: center; }}
        .blog-post-title {{ font-size: 2.5rem; margin-bottom: 20px; color: white; }}
        .blog-post-meta {{ display: flex; justify-content: center; align-items: center; gap: 20px; color: #aaa; font-size: 0.9rem; }}
        .blog-post-meta span {{ display: flex; align-items: center; }}
        .blog-post-meta i {{ margin-right: 5px; color: var(--primary-color); }}
        .blog-post-image {{ width: 100%; height: 400px; overflow: hidden; border-radius: 8px; margin-bottom: 40px; }}
        .blog-post-image img {{ width: 100%; height: 100%; object-fit: cover; }}
        .blog-post-content {{ color: #eee; line-height: 1.8; font-size: 1.1rem; }}
        .blog-post-content p {{ margin-bottom: 20px; }}
        .blog-post-content h2 {{ font-size: 1.8rem; color: white; margin: 40px 0 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); scroll-margin-top: calc(var(--header-height) + 16px); }}
        .blog-post-content h3 {{ font-size: 1.4rem; color: white; margin: 30px 0 15px; scroll-margin-top: calc(var(--header-height) + 16px); }}
        .blog-post-content ul, .blog-post-content ol {{ margin-bottom: 20px; padding-left: 20px; }}
        .blog-post-content li {{ margin-bottom: 10px; }}
        .blog-post-content img {{ max-width: 100%; border-radius: 8px; margin: 20px 0; }}
        .blog-post-content blockquote {{ border-left: 4px solid var(--primary-color); padding-left: 20px; margin: 20px 0; font-style: italic; color: #bbb; }}
        .blog-post-content strong {{ color: var(--primary-color); }}
  </style>
</head>
  <body>
    <!-- ヘッダーとナビゲーション -->
    <header class="scrolled">
        <div class="logo">
            <a href="../index.html#home"><img src="../images/studioq_logo_white.png" alt="大阪 Studio Q プロフェッショナルバーチャルスタジオ" class="logo-image" loading="eager"></a>
        </div>
        <nav>
            <ul>
                <li><a href="../index.html#home">ホーム</a></li>
                <li><a href="../index.html#features">スタジオについて</a></li>
                <li><a href="../specs.html">スタジオ仕様・概要</a></li>
                <li><a href="../index.html#gallery">ギャラリー</a></li>
                <li><a href="../index.html#contact">お問い合わせ</a></li>
                <li><a href="../blog.html" class="active">ブログ</a></li>
            </ul>
        </nav>
        <div class="menu-toggle" aria-label="メニューを開く">
            <i class="fas fa-bars"></i>
        </div>
    </header>

    <!-- ブログ記事 -->
    <section class="blog-post" itemscope itemtype="https://schema.org/Article">
        <div class="blog-post-header">
            <h1 class="blog-post-title" itemprop="headline">{title}</h1>
            <div class="blog-post-meta">
                <span><i class="far fa-calendar"></i> <time itemprop="datePublished" datetime="{date_published}">{date_display}</time></span>
            </div>
        </div>

        <div class="blog-post-image">
            <img src="{image_path}" alt="{image_alt}" loading="lazy">
        </div>

        <div class="blog-post-content" itemprop="articleBody">
            {content}
        </div>
    </section>

    <!-- フッター -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <img src="../images/studioq_logo_white.png" alt="大阪 Studio Q プロフェッショナルバーチャルスタジオ" class="footer-logo-image" loading="lazy">
                </div>
                <div class="footer-links">
                    <h3>リンク</h3>
                    <ul>
                        <li><a href="../index.html#home">ホーム</a></li>
                        <li><a href="../index.html#features">スタジオについて</a></li>
                        <li><a href="../specs.html">スタジオ仕様・概要</a></li>
                        <li><a href="../index.html#gallery">ギャラリー</a></li>
                        <li><a href="../index.html#contact">お問い合わせ</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h3>お問い合わせ</h3>
                    <p><i class="fas fa-map-marker-alt"></i> 大阪市浪速区恵美須西3-2-4 2F</p>
                    <p><i class="fas fa-phone"></i> 06-6978-8122</p>
                    <p><i class="fas fa-envelope"></i> info@studioq.jp</p>
                </div>
                <div class="footer-social">
                    <h3>ソーシャルメディア</h3>
                    <div class="social-icons">
                        <a href="https://www.facebook.com/0804studioq" target="_blank" rel="noopener" title="Studio Q Facebook公式ページ"><i class="fab fa-facebook" aria-hidden="true"></i><span class="sr-only">Facebook</span></a>
                        <a href="https://twitter.com/StudioQ080" target="_blank" rel="noopener" title="Studio Q Twitter公式アカウント"><i class="fab fa-x-twitter" aria-hidden="true"></i><span class="sr-only">Twitter</span></a>
                        <a href="https://www.instagram.com/studioq0804" target="_blank" rel="noopener" title="Studio Q Instagram公式アカウント"><i class="fab fa-instagram" aria-hidden="true"></i><span class="sr-only">Instagram</span></a>
                        <a href="https://www.youtube.com/channel/UCxnEj084atnqvlbW29DsFKA" target="_blank" rel="noopener" title="Studio Q YouTube公式チャンネル"><i class="fab fa-youtube" aria-hidden="true"></i><span class="sr-only">YouTube</span></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <nav aria-label="パンくずリスト" class="breadcrumb">
                    <ol>
                        <li><a href="/">ホーム</a></li>
                        <li>ブログ記事</li>
                    </ol>
                </nav>
                <p>&copy; 2025 スタジオQ All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <!-- ヘッダー高さに応じて上余白を自動調整 -->
    <script>
      (function(){{
        function applyHeaderOffset(){{
          var header = document.querySelector('header');
          if(!header) return;
          var h = header.offsetHeight || 72;
          document.documentElement.style.setProperty('--header-height', h + 'px');
        }}
        window.addEventListener('load', applyHeaderOffset);
        window.addEventListener('resize', applyHeaderOffset);
      }})();
    </script>

    <!-- スクリプト -->
    <script src="/_site/script.js?v=20250821-1456"></script>
    <script src="/js/blog-manager.js?v=20250826-1247"></script>
</body>
</html>'''

def load_blog_data():
    """blog-data.jsonを読み込み"""
    with open(BLOG_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def extract_content_from_backup(filename):
    """バックアップファイルからコンテンツを抽出"""
    backup_file = BACKUP_DIR / filename
    
    if not backup_file.exists():
        return "<p>コンテンツを読み込み中...</p>"
    
    with open(backup_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # メインコンテンツを探す
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
            # 不要な属性を削除
            for tag in element.find_all():
                if tag.name not in ['img', 'a']:
                    tag.attrs = {}
            return str(element)
    
    # フォールバック
    body = soup.find('body')
    if body:
        for unwanted in body.find_all(['header', 'footer', 'nav', 'script', 'style']):
            unwanted.decompose()
        return str(body)
    
    return "<p>コンテンツを読み込み中...</p>"

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

def restore_unified_layout(post_data):
    """統一レイアウトを復元"""
    filename = post_data.get('url', '').replace('blog/', '')
    if not filename:
        return False
    
    file_path = BLOG_DIR / filename
    
    print(f"🔧 統一レイアウト復元中: {filename}")
    
    # バックアップからコンテンツを抽出
    content = extract_content_from_backup(filename)
    
    # テンプレートデータを準備
    template_data = {
        'title': post_data.get('title', 'ブログ記事'),
        'description': post_data.get('excerpt', '大阪・スタジオQのブログ記事です。'),
        'keywords': 'スタジオQ, 大阪, 撮影スタジオ, 映像制作',
        'url_slug': post_data.get('id', filename.replace('.html', '')),
        'image_ogp': f"{post_data.get('id', 'default')}.jpg",
        'date_published': post_data.get('date', '2025-08-28'),
        'date_modified': post_data.get('date', '2025-08-28'),
        'date_display': format_date(post_data.get('date', '2025-08-28')),
        'image_path': post_data.get('image', '../images/default.jpg'),
        'image_alt': f"{post_data.get('title', 'ブログ記事')}の画像",
        'content': content
    }
    
    # テンプレートに適用
    new_html = UNIFIED_TEMPLATE.format(**template_data)
    
    # ファイルを保存
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"✅ 統一レイアウト復元完了: {filename}")
        return True
    except Exception as e:
        print(f"❌ 統一レイアウト復元失敗: {filename} - {e}")
        return False

def main():
    """メイン処理"""
    print("🔄 統一レイアウト復元開始...")
    
    # blog-data.jsonを読み込み
    try:
        blog_data = load_blog_data()
        posts = blog_data.get('posts', [])
    except Exception as e:
        print(f"❌ blog-data.json読み込みエラー: {e}")
        return
    
    # 各ブログファイルに統一レイアウトを適用
    success_count = 0
    total_count = len(posts)
    
    for post in posts:
        if restore_unified_layout(post):
            success_count += 1
    
    print(f"\n📊 復元結果: {success_count}/{total_count} 件成功")
    print("✅ 統一レイアウト復元完了!")

if __name__ == "__main__":
    main()
