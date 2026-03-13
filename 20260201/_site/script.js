    // ローカル動画ディレクトリ（存在すればこちらを優先）
    const LOCAL_VIDEO_DIR = '/movie';
    function toLocalPathIfAvailable(url) {
        try {
            const name = (decodeURIComponent(url).split('/').pop() || '').split('?')[0];
            if (!name) return null;
            return `${LOCAL_VIDEO_DIR}/${name}`;
        } catch (_) {
            return null;
        }
    }
// ナビゲーションメニューのトグル機能
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// data-background属性を使用して背景画像を設定する関数
function setBackgroundImages() {
    // スライドの背景画像を設定
    const slidesWithBackground = document.querySelectorAll('.slide[data-background]');
    slidesWithBackground.forEach(slide => {
        const bgUrl = slide.getAttribute('data-background');
        if (bgUrl) {
            slide.style.backgroundImage = `url('${bgUrl}')`;
        }
    });
    
    // ギャラリーサムネイルの背景画像を設定
    const thumbnailsWithBackground = document.querySelectorAll('.gallery-video-thumbnail[data-background]');
    thumbnailsWithBackground.forEach(thumbnail => {
        const bgUrl = thumbnail.getAttribute('data-background');
        if (bgUrl) {
            thumbnail.style.backgroundImage = `url('${bgUrl}')`;
        }
    });
}

// DOM読み込み後に背景画像を設定
document.addEventListener('DOMContentLoaded', () => {
    setBackgroundImages();
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        heroVideo.addEventListener('error', function(e) {
            console.error('ヒーロー動画の読み込みエラー:', e);
        });

        // ユーザーインタラクションを検出して記録する
        const registerUserInteraction = () => {
            document.body.dataset.userInteracted = 'true';
            if (heroVideo.paused && !heroVideo.dataset.interactionRegistered) {
                heroVideo.load();
                heroVideo.dataset.interactionRegistered = 'true';
                console.log('ユーザーインタラクションを検出しました。動画の準備を開始します。');
            }
        };
        
        // クリック、タッチ、スクロールなどのユーザーアクションを検出
        ['click', 'touchstart', 'scroll', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, registerUserInteraction, { once: true });
        });
    }
});

// スクロール時のヘッダーの背景色変更
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ヒーローセクションのスライドショー機能
document.addEventListener('DOMContentLoaded', () => {
    // グローバル変数と要素の取得
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const videoSlide = document.querySelector('.video-slide');
    const heroVideo = document.getElementById('heroVideo');
    
    // 状態管理用の変数
    let currentSlide = 0;
    let slideInterval = null;
    let videoTimer = null;
    let pauseTimer = null;
    let isSlideShowRunning = false;
    let isVideoPlaying = false;
    
    // スライドショーを開始する関数
    function startSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        isSlideShowRunning = true;
        
        slideInterval = setInterval(() => {
            // 動画スライドがアクティブな場合はスキップ
            if (isVideoSlideActive()) {
                return;
            }
            goToNextSlide();
        }, 4000);
        
        console.log('スライドショー開始');
    }
    
    // スライドショーを停止する関数
    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        isSlideShowRunning = false;
        console.log('スライドショー停止');
    }
    
    // 動画スライドがアクティブかどうか確認する関数
    function isVideoSlideActive() {
        return videoSlide && videoSlide.classList.contains('active');
    }
    
    // 指定したスライドに移動する関数
    function goToSlide(index) {
        // 全てのスライドからactiveクラスを削除
        slides.forEach(slide => slide.classList.remove('active'));
        
        // 指定されたスライドをアクティブに
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        
        // 動画スライドがアクティブになった場合の処理
        if (isVideoSlideActive()) {
            handleVideoSlideActive();
        }
    }
    
    // 次のスライドに移動する関数
    function goToNextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        goToSlide(nextIndex);
    }
    
    // 前のスライドに移動する関数
    function goToPrevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    }
    
    // 動画スライドがアクティブになったときの処理
    function handleVideoSlideActive() {
        console.log('動画スライドがアクティブになりました');
        const wasRunning = isSlideShowRunning;
        stopSlideshow();
        clearAllTimers();
        
        if (heroVideo) {
            console.log('動画再生を準備します');
            // 動画の設定をリセット
            heroVideo.currentTime = 0;
            heroVideo.muted = true; // 必ずミュートにする（自動再生のため）
            heroVideo.setAttribute('playsinline', ''); // iOSでのインライン再生を強制
            heroVideo.setAttribute('webkit-playsinline', ''); // 古いiOSブラウザ用
            // 仕様: 8秒再生固定。その後2秒停止。ループ禁止。
            if (heroVideo.hasAttribute('loop')) {
                heroVideo.removeAttribute('loop');
            }
            
            // 低電力モードや自動再生制限があっても、まずは常に再生を試みる
            
            // ユーザーインタラクションがある場合のみ再生を試みる
            console.log('動画再生を開始します');
            const playPromise = heroVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('動画再生成功');
                    isVideoPlaying = true;
                    
                    // 仕様どおり: 8秒再生 -> 2秒停止 -> 1枚目に戻る
                    const PLAY_MS = 8000;
                    const PAUSE_MS = 2000;
                    // 早期終了（エンコードが短い/再生制限等）に対応
                    const onEnded = () => {
                        if (!isVideoSlideActive()) return;
                        clearAllTimers();
                        try { heroVideo.pause(); } catch (e) {}
                        pauseTimer = setTimeout(() => {
                            if (!isVideoSlideActive()) return;
                            try { heroVideo.currentTime = 0; } catch (e) {}
                            goToSlide(0);
                            if (wasRunning) startSlideshow();
                            isVideoPlaying = false;
                        }, PAUSE_MS);
                    };
                    heroVideo.addEventListener('ended', onEnded, { once: true });
                    // 8秒後に一時停止
                    videoTimer = setTimeout(() => {
                        if (!isVideoSlideActive()) return;
                        try { heroVideo.pause(); } catch (e) {}
                        // 2秒停止してから1枚目へ
                        pauseTimer = setTimeout(() => {
                            if (!isVideoSlideActive()) return;
                            // 次ループのために頭出し
                            try { heroVideo.currentTime = 0; } catch (e) {}
                            // 1枚目に戻る
                            goToSlide(0);
                            if (wasRunning) {
                                startSlideshow();
                            }
                            isVideoPlaying = false;
                        }, PAUSE_MS);
                    }, PLAY_MS);
                    
                }).catch(error => {
                    console.log('動画自動再生は制限されています。タイマーで擬似的に8秒+2秒のサイクルを実行します。');
                    const PLAY_MS = 8000;
                    const PAUSE_MS = 2000;
                    videoTimer = setTimeout(() => {
                        if (!isVideoSlideActive()) return;
                        // 再生できていない場合でも2秒待機してから先頭へ
                        pauseTimer = setTimeout(() => {
                            if (!isVideoSlideActive()) return;
                            goToSlide(0);
                            if (wasRunning) {
                                startSlideshow();
                            }
                            isVideoPlaying = false;
                        }, PAUSE_MS);
                    }, PLAY_MS);
                });
            } else {
                // 古いブラウザ対応
                try {
                    heroVideo.play();
                    isVideoPlaying = true;
                    const PLAY_MS = 8000;
                    const PAUSE_MS = 2000;
                    videoTimer = setTimeout(() => {
                        if (!isVideoSlideActive()) return;
                        try { heroVideo.pause(); } catch (e) {}
                        pauseTimer = setTimeout(() => {
                            if (!isVideoSlideActive()) return;
                            try { heroVideo.currentTime = 0; } catch (e) {}
                            goToSlide(0);
                            if (wasRunning) {
                                startSlideshow();
                            }
                            isVideoPlaying = false;
                        }, PAUSE_MS);
                    }, PLAY_MS);
                } catch (error) {
                    console.log('動画自動再生は制限されています。（古いブラウザ分岐）8秒+2秒サイクルを実行します。');
                    const PLAY_MS = 8000;
                    const PAUSE_MS = 2000;
                    videoTimer = setTimeout(() => {
                        if (!isVideoSlideActive()) return;
                        pauseTimer = setTimeout(() => {
                            if (!isVideoSlideActive()) return;
                            goToSlide(0);
                            if (wasRunning) {
                                startSlideshow();
                            }
                            isVideoPlaying = false;
                        }, PAUSE_MS);
                    }, PLAY_MS);
                }
            }
        }
    }
    
    // 全てのタイマーをクリアする関数
    function clearAllTimers() {
        if (videoTimer) {
            clearTimeout(videoTimer);
            videoTimer = null;
        }
        
        if (pauseTimer) {
            clearTimeout(pauseTimer);
            pauseTimer = null;
        }
    }
    
    // ナビゲーションボタンのイベントリスナーを設定
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            goToPrevSlide();
            if (!isVideoSlideActive()) {
                stopSlideshow();
                startSlideshow();
            }
        });
        
        nextButton.addEventListener('click', () => {
            goToNextSlide();
            if (!isVideoSlideActive()) {
                stopSlideshow();
                startSlideshow();
            }
        });
    }
    
    // 初期化処理
    if (slides.length > 0) {
        // 最初のスライドをアクティブに
        goToSlide(0);
        
        // スライドショーを開始
        startSlideshow();
    }
});

// Aboutセクションのスライドショー
document.addEventListener('DOMContentLoaded', () => {
    const aboutSlides = document.querySelectorAll('.about-slide');
    if (aboutSlides.length > 0) {
        let currentSlide = 0;
        
        // 5秒ごとにスライドを切り替える
        setInterval(() => {
            // 現在のスライドからactiveクラスを削除
            aboutSlides[currentSlide].classList.remove('active');
            
            // 次のスライドに移動（最後のスライドの場合は最初に戻る）
            currentSlide = (currentSlide + 1) % aboutSlides.length;
            
            // 新しいスライドにactiveクラスを追加
            aboutSlides[currentSlide].classList.add('active');
        }, 5000);
    }
});

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // モバイルメニューを閉じる
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        }
    });
});

// フォーム送信処理（デモ用）を無効化
// 以前は preventDefault() でサーバー送信を妨げていたため削除。
// ブラウザ標準のフォーム送信（action 先の PHP へ POST）を許可します。

// 紹介動画の再生機能
document.addEventListener('DOMContentLoaded', () => {
    const videoThumbnail = document.querySelector('.video-thumbnail');
    const latestVideoThumbnails = document.querySelectorAll('.latest-video-thumbnail');
    const galleryVideoThumbnails = document.querySelectorAll('.gallery-video-thumbnail');
    
    console.log('動画サムネイル初期化:', {
        intro: !!videoThumbnail,
        latestCount: latestVideoThumbnails.length,
        galleryCount: galleryVideoThumbnails.length
    });

    // 現在表示中のポップアップ（1つに制限）
    let activeOverlay = null;
    let activeVideoEl = null; // HTMLVideoElement または HTMLIFrameElement
    let escKeyHandler = null;
    
    // 動画プリロード用のキャッシュ
    const videoPreloadCache = new Map();
    // プリロード/取得時のキャッシュキーを正規化
    function normalizeUrlForCache(url) {
        if (!url) return url;
        try {
            const decoded = decodeURIComponent(url);
            if (decoded === url && url.match(/[^\x00-\x7F]/)) {
                return encodeURI(url);
            }
        } catch (e) {
            // ignore
        }
        return url;
    }
    
    // 動画の事前読み込み機能
    function preloadVideo(videoUrl, preloadType = 'metadata') {
        if (!videoUrl) return null;
        const cacheKey = normalizeUrlForCache(videoUrl);
        if (videoPreloadCache.has(cacheKey)) {
            return videoPreloadCache.get(cacheKey);
        }
        
        // YouTubeの場合はプリロードしない（iframe埋め込みのため）
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            return null;
        }
        
        console.log('動画をプリロード中:', videoUrl);
        
        const video = document.createElement('video');
        video.preload = preloadType; // 'metadata' or 'auto'
        video.muted = true; // プリロード時はミュート
        video.style.display = 'none'; // 非表示
        
        // 外部URLを先に、ローカル候補を後に追加（404待ちによる遅延を回避）
        const localCandidate = toLocalPathIfAvailable(videoUrl);
        const externalUrl = normalizeUrlForCache(videoUrl);

        const sExt = document.createElement('source');
        sExt.src = externalUrl;
        sExt.type = 'video/mp4';
        video.appendChild(sExt);

        if (localCandidate) {
            const sLocal = document.createElement('source');
            sLocal.src = localCandidate;
            sLocal.type = 'video/mp4';
            video.appendChild(sLocal);
        }
        
        // WebM形式も追加
        if (externalUrl.toLowerCase().endsWith('.mp4')) {
            const webmUrl = externalUrl.replace(/\.mp4$/i, '.webm');
            const webmSource = document.createElement('source');
            webmSource.src = webmUrl;
            webmSource.type = 'video/webm';
            video.appendChild(webmSource);
        }
        
        // プリロード完了時のログ
        video.addEventListener('loadedmetadata', () => {
            console.log('動画メタデータ読み込み完了:', videoUrl);
        });
        
        video.addEventListener('canplaythrough', () => {
            console.log('動画プリロード完了:', videoUrl);
        });
        
        // エラーハンドリング
        video.addEventListener('error', (e) => {
            console.warn('動画プリロードエラー:', videoUrl, e);
            videoPreloadCache.delete(videoUrl);
        });
        
        // DOMに一時的に追加してロード開始
        document.body.appendChild(video);
        video.load();
        
        // キャッシュに保存
        videoPreloadCache.set(cacheKey, video);
        
        return video;
    }
    
    // 全ての動画URLを収集してプリロード
    function initVideoPreloading() {
        const allThumbnails = [
            ...Array.from(document.querySelectorAll('.video-thumbnail')),
            ...Array.from(document.querySelectorAll('.latest-video-thumbnail')),
            ...Array.from(document.querySelectorAll('.gallery-video-thumbnail'))
        ];
        
        // eager指定は最優先で即時プリロード（auto）
        allThumbnails.filter(t => t.dataset.preload === 'eager').forEach(t => {
            const url = t.getAttribute('data-video-url');
            if (url) preloadVideo(url, 'auto');
        });

        // それ以外は従来どおり遅延（metadata）
        let delayIndex = 0;
        allThumbnails.filter(t => t.dataset.preload !== 'eager').forEach((thumbnail) => {
            const videoUrl = thumbnail.getAttribute('data-video-url');
            if (videoUrl) {
                setTimeout(() => {
                    preloadVideo(videoUrl, 'metadata');
                }, delayIndex++ * 500);
            }
        });

        // iOSで問題が出ているローカル動画を明示的にpreload（ブラウザヒント）
        const criticalLocal = [
            'movie/KUROKI.mp4',
            'movie/music.pv4.mp4',
            'movie/cosplay.mp4'
        ];
        criticalLocal.forEach((p) => {
            try {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'video';
                link.href = p;
                document.head.appendChild(link);
            } catch(_) {}
        });
    }
    
    // eagerはDOM読み込み後即時、それ以外はwindow load後
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // eagerのみ先に処理
            const eagerThumb = document.querySelectorAll('[data-preload="eager"][data-video-url]');
            eagerThumb.forEach(el => preloadVideo(el.getAttribute('data-video-url'), 'auto'));
        } catch(_) {}
    });
    if (document.readyState === 'complete') {
        initVideoPreloading();
    } else {
        window.addEventListener('load', initVideoPreloading);
    }

    // 既存ポップアップの完全クリーンアップ
    function cleanupExistingPopup() {
        try {
            // 再生中のメディアを停止
            if (activeVideoEl) {
                if (activeVideoEl.tagName === 'VIDEO') {
                    try {
                        activeVideoEl.pause();
                    } catch (e) {}
                    // ソースを外しロードし直してネットワークも停止
                    try {
                        activeVideoEl.removeAttribute('src');
                        // 子sourceも全て除去
                        Array.from(activeVideoEl.querySelectorAll('source')).forEach(s => s.remove());
                        activeVideoEl.load();
                    } catch (e) {}
                } else if (activeVideoEl.tagName === 'IFRAME') {
                    // YouTubeなどはsrcを空にして停止
                    try {
                        activeVideoEl.src = '';
                    } catch (e) {}
                }
            }
        } finally {
            // DOMからオーバーレイを削除
            if (activeOverlay && activeOverlay.parentNode) {
                activeOverlay.parentNode.removeChild(activeOverlay);
            }
            // Escリスナーを解除
            if (escKeyHandler) {
                document.removeEventListener('keydown', escKeyHandler);
            }
            activeOverlay = null;
            activeVideoEl = null;
            escKeyHandler = null;
        }
    }

    // クリック後に即時再生を試みるヘルパー（読み込み状態に依存しない）
    function tryPlay(videoEl) {
        if (!videoEl || typeof videoEl.play !== 'function') return;

        // 再生ロジック: 非ミュート→失敗時ミュートで再試行
        const attempt = (muted) => {
            try {
                if (videoEl.tagName === 'VIDEO') videoEl.muted = !!muted;
                const p = videoEl.play();
                if (p && typeof p.then === 'function') {
                    return p;
                }
            } catch (err) {
                return Promise.reject(err);
            }
            return Promise.resolve();
        };

        const doPlay = () => {
            attempt(false).then(() => {
                // 非ミュートで再生成功
            }).catch(() => {
                // 非ミュート失敗 → ミュートで再試行
                attempt(true).then(() => {
                    // 再生開始後に自動でミュート解除
                    const unmute = () => {
                        try { if (videoEl.tagName === 'VIDEO') videoEl.muted = false; } catch(_) {}
                        videoEl.removeEventListener('playing', unmute);
                    };
                    videoEl.addEventListener('playing', unmute);
                }).catch(err2 => {
                    console.warn('動画の再生に失敗しました:', err2);
                });
            });
        };

        if (videoEl.readyState >= 3) { // HAVE_FUTURE_DATA
            doPlay();
        } else {
            videoEl.addEventListener('canplay', doPlay, { once: true });
            videoEl.addEventListener('loadeddata', doPlay, { once: true });
            // 読み込みが遅い場合でも即試行しておく（多くの端末でユーザー操作起因のplayが許可される）
            doPlay();
        }
    }

    // 紹介動画セクションの動画サムネイル
    if (videoThumbnail) {
        videoThumbnail.addEventListener('click', () => {
            // data-video-url属性から動画URLを取得
            const videoUrl = videoThumbnail.getAttribute('data-video-url');
            
            console.log('紹介動画サムネイルをクリック:', videoUrl);
            createVideoPopup(videoUrl);
        });
    }
    
    // 最新映像セクションの動画サムネイル
    latestVideoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // data-video-url属性から動画URLを取得
            const videoUrl = thumbnail.getAttribute('data-video-url');
            
            console.log('最新映像サムネイルをクリック:', videoUrl);
            createVideoPopup(videoUrl);
        });
    });
    
    // ギャラリーセクションの動画サムネイル
    galleryVideoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            // data-video-url属性から動画URLを取得
            const videoUrl = thumbnail.getAttribute('data-video-url');
            
            createVideoPopup(videoUrl);
        });
    });
    
    // フォールバック: 委譲クリックハンドラ（内側の要素クリックや個別リスナー未登録時でも発火）
    document.addEventListener('click', (e) => {
        const thumb = e.target.closest('.video-thumbnail, .latest-video-thumbnail, .gallery-video-thumbnail');
        if (!thumb) return;
        const videoUrl = thumb.getAttribute('data-video-url');
        if (!videoUrl) return;
        console.log('委譲ハンドラでサムネイルクリック検出:', thumb.className, videoUrl);
        e.preventDefault();
        e.stopPropagation();
        createVideoPopup(videoUrl);
    });
    
    // 動画ポップアップを作成する関数
    function createVideoPopup(videoUrl) {
        console.log('動画ポップアップを作成します。URL:', videoUrl);
        
        // URLが空または無効な場合のエラーハンドリング
        if (!videoUrl) {
            console.error('動画URLが指定されていません');
            alert('動画URLが指定されていないため、再生できません。');
            return;
        }
        
        // URLの基本的な検証
        try {
            // URLが有効かチェック
            new URL(videoUrl);
        } catch (e) {
            console.error('無効なURL形式です:', videoUrl, e);
            alert('無効なURL形式のため、再生できません。');
            return;
        }
        
        // 既存ポップアップがあれば破棄（常に1つに制限）
        if (activeOverlay) {
            cleanupExistingPopup();
        }

        // ポップアップオーバーレイを作成
        const overlay = document.createElement('div');
        overlay.className = 'video-popup-overlay';
        
        let videoElement;
        
        // YouTubeリンクかどうかを確認
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            console.log('YouTube動画として処理します');
            // YouTubeの埋め込みリンクに変換
            let youtubeEmbedUrl = videoUrl;
            let videoId = '';
            
            // 通常のYouTubeリンクを埋め込み用に変換
            if (videoUrl.includes('youtube.com/watch')) {
                try {
                    const urlObj = new URL(videoUrl);
                    videoId = urlObj.searchParams.get('v');
                    console.log('YouTube動画ID:', videoId);
                } catch (e) {
                    // URLパースエラーの場合のフォールバック
                    console.warn('YouTube URLのパースに失敗しました。正規表現で抽出を試みます:', e);
                    const match = videoUrl.match(/[?&]v=([^&]+)/);
                    videoId = match ? match[1] : '';
                    console.log('正規表現で抽出したYouTube動画ID:', videoId);
                }
            } else if (videoUrl.includes('youtu.be')) {
                // 短縮URLの場合
                videoId = videoUrl.split('/').pop().split('?')[0];
                console.log('短縮URLから抽出したYouTube動画ID:', videoId);
            }
            
            // 有効なビデオIDがある場合は埋め込みURLを生成
            if (videoId) {
                youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                console.log('YouTube埋め込みURL:', youtubeEmbedUrl);
                
                // iframeを作成
                videoElement = document.createElement('iframe');
                videoElement.setAttribute('src', youtubeEmbedUrl);
                videoElement.setAttribute('width', '100%');
                videoElement.setAttribute('height', '100%');
                videoElement.setAttribute('frameborder', '0');
                videoElement.setAttribute('allowfullscreen', 'true');
                videoElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                videoElement.className = 'popup-video youtube-video';
                
                // スタイルを直接設定して大きく表示
                videoElement.style.width = '90vw';
                videoElement.style.height = '80vh';
                videoElement.style.minHeight = '600px';
                videoElement.style.maxWidth = '1600px';
            } else {
                // ビデオIDが取得できない場合はエラーメッセージを表示
                console.error('YouTube動画IDを取得できませんでした:', videoUrl);
                videoElement = document.createElement('div');
                videoElement.textContent = 'YouTube動画IDを取得できませんでした。URLを確認してください。';
                videoElement.className = 'popup-video-error';
            }
        } else {
            console.log('通常の動画ファイルとして処理します');
            // 動画URLの検証
            if (!videoUrl.match(/\.(mp4|webm|ogg)($|\?)/i)) {
                console.warn('URLが標準的な動画形式ではありません:', videoUrl);
            }
            
            // 日本語ファイル名の処理
            let processedUrl = videoUrl;
            try {
                // URLが既にエンコードされているか確認
                const decodedUrl = decodeURIComponent(videoUrl);
                if (decodedUrl === videoUrl && videoUrl.match(/[^\x00-\x7F]/)) {
                    // 非ASCII文字を含み、まだエンコードされていない場合はエンコード
                    processedUrl = encodeURI(videoUrl);
                    console.log('URLをエンコードしました:', processedUrl);
                }
            } catch (e) {
                console.error('URL処理エラー:', e);
            }
            // ローカル優先の候補
            const localCandidate = toLocalPathIfAvailable(processedUrl);
            
            // プリロード済みの動画があるかチェック
            const cacheKey = normalizeUrlForCache(videoUrl);
            const preloadedVideo = videoPreloadCache.get(cacheKey);
            
            if (preloadedVideo) {
                console.log('プリロード済み動画を使用:', videoUrl);
                // プリロード済み動画をクローンして使用
                videoElement = preloadedVideo.cloneNode(true);
                
                // ポップアップ用の設定を追加
                videoElement.setAttribute('controls', 'true');
                videoElement.setAttribute('autoplay', 'true');
                videoElement.setAttribute('playsinline', 'true');
                videoElement.setAttribute('webkit-playsinline', 'true');
                videoElement.setAttribute('preload', 'auto');
                videoElement.style.display = 'block'; // 表示状態に戻す
                // 再生互換性のため一旦ミュートで開始し、playing後に解除
                videoElement.muted = true;
                videoElement.className = 'popup-video';
                
                // プリロード済み動画をDOMから削除
                if (preloadedVideo.parentNode) {
                    preloadedVideo.parentNode.removeChild(preloadedVideo);
                }
            } else {
                console.log('新規動画要素を作成:', videoUrl);
                // 通常の動画ファイルの場合
                videoElement = document.createElement('video');
                
                // 外部URLを優先し、必要ならローカル候補をフォールバックとして追加
                const primaryUrl = processedUrl;
                console.log('処理後のURL:', primaryUrl);

                const sourceElementExt = document.createElement('source');
                sourceElementExt.setAttribute('src', primaryUrl);
                sourceElementExt.setAttribute('type', 'video/mp4');
                videoElement.appendChild(sourceElementExt);

                if (localCandidate) {
                    const sourceElementLocal = document.createElement('source');
                    sourceElementLocal.setAttribute('src', localCandidate);
                    sourceElementLocal.setAttribute('type', 'video/mp4');
                    videoElement.appendChild(sourceElementLocal);
                }
                // WebM形式のソースも追加（可能であれば）
                if (processedUrl.toLowerCase().endsWith('.mp4')) {
                    const webmUrl = processedUrl.replace(/\.mp4$/i, '.webm');
                    const webmSource = document.createElement('source');
                    webmSource.setAttribute('src', webmUrl);
                    webmSource.setAttribute('type', 'video/webm');
                    videoElement.appendChild(webmSource);
                    console.log('WebMソースも追加しました:', webmUrl);
                }
                
                videoElement.setAttribute('controls', 'true');
                videoElement.setAttribute('autoplay', 'true');
                videoElement.setAttribute('playsinline', 'true'); // iOSでの再生をサポート
                videoElement.setAttribute('webkit-playsinline', 'true');
                videoElement.setAttribute('preload', 'auto'); // 動画の事前読み込みを有効化
                videoElement.className = 'popup-video';
                // 事前に load() を明示して I/O を開始
                try { videoElement.load(); } catch (e) {}
                // 再生互換性のため一旦ミュートで開始
                videoElement.muted = true;
            }
            
            // エラーハンドリングを追加
            videoElement.onerror = function(e) {
                // エラーコードに基づいたメッセージを生成
                let errorMessage = '動画の読み込みに失敗しました。';
                // 一度だけローカル/外部のフォールバック順序を切り替える
                if (!videoElement.dataset.fallbackTried) {
                    videoElement.dataset.fallbackTried = '1';
                    try {
                        const original = processedUrl || videoUrl;
                        const filename = original.split('/').pop().split('?')[0];
                        if (filename) {
                            const localUrl = `${LOCAL_VIDEO_DIR}/${filename}`;
                            const isCurrentlyLocal = Array.from(videoElement.querySelectorAll('source')).some(s => s.getAttribute('src') === localUrl);
                            // もしローカル優先で失敗していたら外部へ、逆ならローカルへ
                            const fallbackUrl = isCurrentlyLocal ? processedUrl : localUrl;
                            console.warn('読み込みフォールバックを試行:', fallbackUrl);
                            // 既存sourceを差し替え
                            try { Array.from(videoElement.querySelectorAll('source')).forEach(s => s.remove()); } catch(_) {}
                            const srcMp4 = document.createElement('source');
                            srcMp4.setAttribute('src', fallbackUrl);
                            srcMp4.setAttribute('type', 'video/mp4');
                            videoElement.appendChild(srcMp4);
                            try { videoElement.load(); } catch(_) {}
                            tryPlay(videoElement);
                            return; // メッセージ表示は保留
                        }
                    } catch(_) {}
                }
                if (videoElement.error) {
                    const errorCode = videoElement.error.code;
                    switch(errorCode) {
                        case 1:
                            errorMessage += 'メディアの取得が中断されました。';
                            break;
                        case 2:
                            errorMessage += 'ネットワークエラーが発生しました。';
                            break;
                        case 3:
                            errorMessage += 'デコードエラーが発生しました。';
                            break;
                        case 4:
                            errorMessage += 'ファイル形式がサポートされていないか、見つかりません。';
                            break;
                    }
                    console.error('動画再生エラー:', errorMessage, videoElement.error);
                } else {
                    console.error('動画再生エラー: 詳細不明', e);
                }
                
                // エラーメッセージを表示
                const errorMsg = document.createElement('div');
                errorMsg.className = 'video-error-message';
                errorMsg.textContent = errorMessage;
                errorMsg.style.color = 'white';
                errorMsg.style.padding = '20px';
                errorMsg.style.textAlign = 'center';
                errorMsg.style.backgroundColor = 'rgba(0,0,0,0.7)';
                if (videoElement.parentNode) {
                    videoElement.parentNode.appendChild(errorMsg);
                }
            };
        }
        
        // 閉じるボタンを作成
        const closeButton = document.createElement('button');
        closeButton.className = 'close-popup';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        
        // 閉じるボタンのクリックイベント（確実に停止・破棄）
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            cleanupExistingPopup();
        });
        
        // オーバーレイのクリックイベント（動画の外側をクリックで閉じる）
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanupExistingPopup();
            }
        });
        
        // 要素を追加
        overlay.appendChild(videoElement);
        overlay.appendChild(closeButton);
        document.body.appendChild(overlay);

        // 参照を保存
        activeOverlay = overlay;
        activeVideoEl = videoElement;

        // Escキーで閉じる
        
        // クリック直後の即時再生を確実に試みる
        try {
            // 念のため load() を再度呼び、次に再生
            if (typeof videoElement.load === 'function') videoElement.load();
        } catch (_) {}
        tryPlay(videoElement);
        // 再生開始後にミュート解除（ユーザー操作に伴っているため許可されやすい）
        if (videoElement && videoElement.tagName === 'VIDEO') {
            const unmute = () => {
                try { videoElement.muted = false; } catch(_) {}
                videoElement.removeEventListener('playing', unmute);
            };
            videoElement.addEventListener('playing', unmute);
        }
        escKeyHandler = (ev) => {
            if (ev.key === 'Escape') {
                ev.preventDefault();
                cleanupExistingPopup();
            }
        };
        document.addEventListener('keydown', escKeyHandler);
    }
});

// 画像の遅延読み込み
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.removeAttribute('data-src');
                    imageObserver.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
        });
    }
});

// ヒーロービデオの制御は新しいスライドショー制御に統合されました

// スパム対策: フォーム送信時のタイムスタンプと検証
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const timestampField = document.getElementById('formTimestamp');
    
    // ページ読み込み時のタイムスタンプを記録（スパム対策）
    if (timestampField) {
        timestampField.value = Date.now();
    }
    
    // フォーム送信時の処理
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            // ハニーポット検証（ボットがwebsiteフィールドに入力していないか確認）
            const honeypot = document.getElementById('website');
            if (honeypot && honeypot.value !== '') {
                // スパムと判断（画面には何も表示せず、送信を中止）
                e.preventDefault();
                console.log('スパム検出: ハニーポット');
                return false;
            }
            
            // タイムスタンプ検証（送信が速すぎないか確認 - 3秒未満はボットの可能性）
            const currentTime = Date.now();
            const formLoadTime = parseInt(timestampField.value);
            const timeDiff = (currentTime - formLoadTime) / 1000; // 秒単位
            
            if (timeDiff < 3) {
                e.preventDefault();
                alert('送信が早すぎます。もう一度お試しください。');
                return false;
            }
            
            // reCAPTCHA v3トークンの取得
            e.preventDefault();
            const recaptchaToken = document.getElementById('recaptchaToken');
            
            try {
                const token = await grecaptcha.execute('6LcWv_srAAAAAOC4p5xFd2tQRMZRnRW_AbHoHVTV', {action: 'submit'});
                recaptchaToken.value = token;
                
                // トークン取得後、フォームを送信
                contactForm.submit();
            } catch (error) {
                console.error('reCAPTCHAエラー:', error);
                alert('送信に失敗しました。もう一度お試しください。');
                return false;
            }
        });
    }
});

// 特長セクションのトグル機能
document.addEventListener('DOMContentLoaded', () => {
    const featureTitles = document.querySelectorAll('.feature-title');
    console.log('特長タイトル数:', featureTitles.length);
    
    featureTitles.forEach((title, index) => {
        title.addEventListener('click', function(e) {
            console.log('特長' + (index + 1) + 'がクリックされました');
            const featureItem = this.closest('.feature-item');
            if (featureItem) {
                featureItem.classList.toggle('active');
                console.log('activeクラス:', featureItem.classList.contains('active'));
            } else {
                console.error('feature-itemが見つかりません');
            }
        });
    });
});