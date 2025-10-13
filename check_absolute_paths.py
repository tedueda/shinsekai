#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
絶対パス（/始まり）の参照が紛れ込んでいないか検出するチェックツール。

対象:
- .html, .htm, .php を再帰的にスキャン
- href/src の "/" 始まり（プロトコル相対 // は除外）を検出
- 代表的な NG: /_site, /js, /images, href="/"

使い方:
    python3 check_absolute_paths.py

終了コード:
- 問題なし: 0
- 問題あり: 1（CI等で失敗にできます）
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

INCLUDE_EXTS = {".html", ".htm", ".php"}
EXCLUDE_DIRS = {".git", "node_modules", "venv", "__pycache__"}

# href/src の属性で 1 スラッシュ始まりを検出（ただしプロトコル相対 // は除外）
ATTR_ABS_RE = re.compile(r"\b(?:href|src)\s*=\s*\"/(?!/)\S*\"", re.IGNORECASE)
SUSPECT_PATTERNS = (
    "/_site/",  # 代表的に残りやすい
    "/js/",
    # "/images/" は相対でも行に含まれ得るため誤検知になる。除外。
    "href=\"/\"",
)

COLOR_RED = "\033[31m"
COLOR_YELLOW = "\033[33m"
COLOR_RESET = "\033[0m"


def iter_target_files(base: Path):
    for p in base.rglob("*"):
        if p.is_dir():
            # スキップ対象ディレクトリ
            if p.name in EXCLUDE_DIRS:
                # このディレクトリ配下は降りない
                for _ in p.rglob("*"):
                    pass
                continue
            continue
        if p.suffix.lower() in INCLUDE_EXTS:
            yield p


def scan_file(path: Path):
    issues = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"{COLOR_YELLOW}WARN{COLOR_RESET}: 読み込み失敗 {path}: {e}")
        return issues

    lines = text.splitlines()
    for idx, line in enumerate(lines, 1):
        # 属性としての絶対パス
        if ATTR_ABS_RE.search(line):
            issues.append((idx, line.strip(), "href/src 絶対パス"))
            continue
        # 代表的な NG パターン（ただし href/src の絶対検出が優先）
        for pat in SUSPECT_PATTERNS:
            if pat in line and 'href' not in line and 'src' not in line:
                issues.append((idx, line.strip(), f"NG候補: {pat}"))
                break
    return issues


def main():
    base = ROOT
    all_issues = []
    for f in iter_target_files(base):
        iss = scan_file(f)
        if iss:
            all_issues.append((f, iss))

    if not all_issues:
        print("OK: 絶対パス参照は見つかりませんでした。")
        return 0

    print(f"{COLOR_RED}NG: 絶対パス参照が見つかりました{COLOR_RESET}")
    for f, iss in all_issues:
        print(f"\n{COLOR_YELLOW}{f.relative_to(ROOT)}{COLOR_RESET}")
        for ln, snippet, kind in iss:
            print(f"  L{ln}: {kind}\n      {snippet}")

    print("\n対処例（記事: blog/xxxx.html の場合）:\n"
          "  /_site/style.css  →  ../_site/style.css\n"
          "  /_site/script.js  →  ../_site/script.js\n"
          "  /images/...       →  ../images/...\n"
          "  href=\"/\"        →  href=\"../index.html#home\"\n")

    return 1


if __name__ == "__main__":
    sys.exit(main())
