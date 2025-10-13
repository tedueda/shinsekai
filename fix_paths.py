#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
絶対パス（/始まり）の典型的な参照を相対パスへ一括修正するツール。

方針:
- blog/ 配下の HTML/PHP を対象に、以下を置換
  - href/src="/_site/"  →  href/src="../_site/"
  - href/src="/images/" →  href/src="../images/"
  - href="/"            →  href="../index.html#home"
  - /js/blog-manager.js  は記事では未使用 → 該当スクリプトタグを削除
- 既存の相対参照（../images など）は変更しない。
- デフォルトはドライラン（確認のみ）。--apply 指定時に上書き、.bak を作成。
- バックアップ/過去スナップショット（YYYY-MM-DD-* や blog_backup/）はスキップ。

使い方:
  ドライラン:  python3 fix_paths.py
  反映する:    python3 fix_paths.py --apply
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INCLUDE_EXTS = {'.html', '.htm', '.php'}

# 除外ディレクトリ: .git 等 + スナップショットやバックアップ
EXCLUDE_DIR_NAMES = {'.git', 'node_modules', 'venv', '__pycache__', 'blog_backup'}
DATE_DIR_RE = re.compile(r'^\d{4}-\d{2}-\d{2}-')

# 置換パターン（blog/配下向け）
REPLACERS = [
    # href/src の /_site/ → ../_site/
    (re.compile(r'(?i)(\b(?:href|src)\s*=\s*")/_site/'), r'\1../_site/'),
    # href/src の /images/ → ../images/
    (re.compile(r'(?i)(\b(?:href|src)\s*=\s*")/images/'), r'\1../images/'),
    # パンくずやホームリンクの href="/" → ../index.html#home
    (re.compile(r'(?i)href\s*=\s*"/"'), 'href="../index.html#home"'),
]

# blog-manager.js を削除（行単位で安全に削除）
BLOG_MANAGER_RE = re.compile(r'(?im)^\s*<script[^>]*src\s*=\s*"/js/blog-manager\.js[^\"]*"[^>]*>\s*</script>\s*$')


def is_excluded(path: Path) -> bool:
    parts = path.relative_to(ROOT).parts
    for p in parts:
        if p in EXCLUDE_DIR_NAMES:
            return True
        if DATE_DIR_RE.match(p):
            return True
    return False


def iter_blog_files():
    blog_dir = ROOT / 'blog'
    if not blog_dir.exists():
        return []
    for p in blog_dir.rglob('*'):
        if p.is_dir():
            if is_excluded(p):
                continue
            continue
        if p.suffix.lower() in INCLUDE_EXTS and not is_excluded(p):
            yield p


def fix_text(text: str):
    original = text
    # blog-manager.js の行削除
    text = BLOG_MANAGER_RE.sub('', text)
    # 置換群
    for pat, repl in REPLACERS:
        text = pat.sub(repl, text)
    return original, text


def main():
    apply = '--apply' in sys.argv
    targets = list(iter_blog_files())
    if not targets:
        print('対象なし（blog/ 配下に対象拡張子のファイルが見つかりませんでした）。')
        return 0

    changed = 0
    for f in targets:
        old, new = fix_text(f.read_text(encoding='utf-8', errors='ignore'))
        if old == new:
            continue
        changed += 1
        rel = f.relative_to(ROOT)
        print(f"変更候補: {rel}")
        if apply:
            bak = f.with_suffix(f.suffix + '.bak')
            try:
                if not bak.exists():
                    bak.write_text(old, encoding='utf-8')
                f.write_text(new, encoding='utf-8')
                print(f"  → 修正を反映しました（バックアップ: {bak.name}）")
            except Exception as e:
                print(f"  !! 書き込み失敗: {e}")
        else:
            # 差分のヒント（最初の差分っぽい箇所を抜粋）
            for pat, _ in REPLACERS:
                m = pat.search(old)
                if m:
                    snippet = old[max(0, m.start()-40):m.end()+40]
                    print('  * 該当箇所例:', snippet.replace('\n', ' '))
                    break
            if BLOG_MANAGER_RE.search(old):
                print('  * blog-manager.js の削除対象行があります')

    if changed == 0:
        print('OK: 変更は必要ありませんでした。')
    else:
        if apply:
            print(f'完了: {changed} ファイルを修正しました。')
        else:
            print(f'ドライラン: {changed} ファイルで修正候補があります。--apply で反映します。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
