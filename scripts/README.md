# スクリプト使用ガイド

## 📋 利用可能なスクリプト

### 1. check-blog-data-sync.sh
**用途**: ブログデータの同期状態をチェック

**使い方**:
```bash
./scripts/check-blog-data-sync.sh
```

**機能**:
- public/blog/内の全HTMLファイルを検出
- blog-data.jsonに登録されているか確認
- 未登録ファイルをリスト表示

**実行タイミング**:
- 新しいブログ記事を作成した後
- アップロード前の最終チェック
- 定期メンテナンス時

---

### 2. extract-blog-metadata.sh
**用途**: HTMLファイルからメタデータを抽出

**使い方**:
```bash
./scripts/extract-blog-metadata.sh public/blog/記事名.html
```

**機能**:
- タイトル、日付、抜粋、画像、カテゴリを自動抽出
- JSON形式で出力
- blog-data.jsonへのコピペ用

**実行タイミング**:
- 既存のHTMLファイルをblog-data.jsonに追加する時
- メタデータを確認したい時

---

## 🚀 クイックスタート

### 新しいブログ記事を作成した場合

1. **同期チェック**
```bash
./scripts/check-blog-data-sync.sh
```

2. **エラーがあれば、メタデータ抽出**
```bash
./scripts/extract-blog-metadata.sh public/blog/新しい記事.html
```

3. **出力されたJSONをblog-data.jsonに追加**

4. **再度同期チェック**
```bash
./scripts/check-blog-data-sync.sh
```

5. **エラーがなければ完了！**

---

## 💡 ヒント

- スクリプトは必ずプロジェクトルートから実行してください
- 実行権限がない場合: `chmod +x scripts/*.sh`
- 詳細なガイドは `BLOG_MANAGEMENT_GUIDE.md` を参照
