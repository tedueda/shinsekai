/**
 * ブログ自動管理システム
 * 最新3件のブログ記事を日付順に自動表示
 */

class BlogManager {
    constructor() {
        // キャッシュバスター（毎回の読み込み時にタイムスタンプを使用して最新データを取得）
        this.version = Date.now();
        // 相対パスに戻して確実に読み込めるようにする
        this.blogDataUrl = `blog-data.json?${this.version}`;
        this.previewContainer = null;
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.allPosts = [];
    }

    /**
     * ブログデータを取得
     */
    async fetchBlogData() {
        // 1) 先に window.BLOG_DATA があればそれを使用（JSONブロック環境でも動作）
        if (typeof window !== 'undefined' && window.BLOG_DATA && Array.isArray(window.BLOG_DATA.posts)) {
            return window.BLOG_DATA.posts;
        }

        // 2) JSON を通常取得（キャッシュ無効化 + キャッシュバスター）
        try {
            // READMEの配置ルールに従い、blog.html と同階層の相対パスを使用
            const response = await fetch(`blog-data.json?${this.version}`, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                return data.posts || [];
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (jsonErr) {
            console.warn('JSON取得に失敗。JSフォールバックを試みます:', jsonErr);
        }

        // 3) フォールバック: blog-data.js を動的ロードし、window.BLOG_DATA を読む
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                // 同階層の相対パスを使用
                s.src = `blog-data.js?${this.version}`;
                s.async = true;
                s.onload = resolve;
                s.onerror = () => reject(new Error('blog-data.js の読み込みに失敗'));
                document.head.appendChild(s);
            });
            if (window.BLOG_DATA && Array.isArray(window.BLOG_DATA.posts)) {
                return window.BLOG_DATA.posts;
            }
        } catch (jsErr) {
            console.error('ブログデータのJSフォールバックも失敗:', jsErr);
        }

        return [];
    }

    /**
     * 日付順にソートして最新3件を取得
     */
    getLatestPosts(posts, limit = 3) {
        return posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    /**
     * 日付をフォーマット
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    /**
     * ブログカードHTMLを生成
     */
    createBlogCardHTML(post) {
        // 画像/URLはルート絶対パスを優先（サブディレクトリ配信でも破綻しないように）
        const rawImage = post.image || '';
        const rawUrl = post.url || '';
        const imagePath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
        const urlPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
        const safeImage = imagePath ? `${encodeURI(imagePath)}?${this.version}` : '';
        return `
            <article class="blog-card">
                <div class="blog-image">
                    <img src="${safeImage}" alt="${post.title}" loading="lazy">
                    <div class="blog-date">${this.formatDate(post.date)}</div>
                </div>
                <div class="blog-content">
                    <h3 class="blog-title">${post.title}</h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-footer">
                        <span class="blog-category">${post.category}</span>
                        <a href="${urlPath}" class="blog-link">続きを読む <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * ブログプレビューセクションを更新
     */
    async updateBlogPreview() {
        // プレビューコンテナを取得
        this.previewContainer = document.querySelector('.blog-preview-grid');
        
        if (!this.previewContainer) {
            // このページにはプレビュー領域がないため、処理を行いません
            return;
        }

        try {
            // ローディング表示
            this.previewContainer.innerHTML = '<div class="loading">ブログを読み込み中...</div>';

            // ブログデータを取得
            const posts = await this.fetchBlogData();
            
            if (posts.length === 0) {
                this.previewContainer.innerHTML = '<div class="error">ブログデータが見つかりません</div>';
                return;
            }

            // 最新3件を取得
            const latestPosts = this.getLatestPosts(posts, 3);

            // HTMLを生成
            const blogCardsHTML = latestPosts
                .map(post => this.createBlogCardHTML(post))
                .join('');

            // DOMを更新
            this.previewContainer.innerHTML = blogCardsHTML;

            console.log(`✅ ブログプレビューを更新しました (${latestPosts.length}件)`);

        } catch (error) {
            console.error('ブログプレビューの更新に失敗しました:', error);
            this.previewContainer.innerHTML = '<div class="error">ブログの読み込みに失敗しました</div>';
        }
    }

    /**
     * ページネーション用のブログ表示
     */
    async updateBlogList() {
        const blogGrid = document.querySelector('.blog-grid');
        const paginationContainer = document.querySelector('.pagination');
        
        if (!blogGrid) return;

        try {
            // 全ブログデータを取得
            if (this.allPosts.length === 0) {
                this.allPosts = await this.fetchBlogData();
                this.allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            // 現在のページの記事を計算
            const startIndex = (this.currentPage - 1) * this.postsPerPage;
            const endIndex = startIndex + this.postsPerPage;
            const currentPosts = this.allPosts.slice(startIndex, endIndex);

            // ブログカードを生成
            const blogCardsHTML = currentPosts
                .map(post => this.createBlogCardHTML(post))
                .join('');

            blogGrid.innerHTML = blogCardsHTML;

            // ページネーションを更新
            this.updatePagination();

        } catch (error) {
            console.error('ブログリストの更新に失敗しました:', error);
            blogGrid.innerHTML = '<div class="error">ブログの読み込みに失敗しました</div>';
        }
    }

    /**
     * ページネーションを更新
     */
    updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.allPosts.length / this.postsPerPage);
        let paginationHTML = '';

        // 前のページボタン
        if (this.currentPage > 1) {
            paginationHTML += `<a href="#" data-page="${this.currentPage - 1}"><i class="fas fa-chevron-left"></i></a>`;
        }

        // ページ番号
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            paginationHTML += `<a href="#" data-page="${i}" class="${activeClass}">${i}</a>`;
        }

        // 次のページボタン
        if (this.currentPage < totalPages) {
            paginationHTML += `<a href="#" data-page="${this.currentPage + 1}"><i class="fas fa-chevron-right"></i></a>`;
        }

        paginationContainer.innerHTML = paginationHTML;

        // ページネーションのクリックイベントを設定
        this.setupPaginationEvents();
    }

    /**
     * ページネーションのクリックイベントを設定
     */
    setupPaginationEvents() {
        const paginationLinks = document.querySelectorAll('.pagination a');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.updateBlogList();
                    // ページトップにスクロール
                    document.querySelector('.blog-container').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * 初期化
     */
    init() {
        // DOMが読み込まれたら実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateBlogPreview();
                this.updateBlogList();
            });
        } else {
            this.updateBlogPreview();
            this.updateBlogList();
        }
    }

    /**
     * 手動更新（管理者用）
     */
    async refresh() {
        console.log('🔄 ブログプレビューを手動更新中...');
        await this.updateBlogPreview();
    }
}

// グローバルインスタンスを作成
const blogManager = new BlogManager();

// 自動初期化
blogManager.init();

// 管理者用：コンソールからアクセス可能
window.blogManager = blogManager;

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogManager;
}
