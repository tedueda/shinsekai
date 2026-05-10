import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// スライドデータ（PC用）
const pcSlides = [
  {
    image: "hero_mucis02.png",
    subtitle: "4K・AI・3D バーチャル合成",
    specs: "天井高5M × 防音設備",
  },
  {
    image: "hero_kabuki02.png",
    subtitle: "マルチアングル撮影",
    specs: "SONY PTZ × PXW-Z190",
  },
  {
    image: "hero_anime06.png",
    subtitle: "完全防音による同録撮影",
    specs: "プロ仕様のPA・マイク設備を完備",
  },
  {
    image: "hero_cosplay03.PNG",
    subtitle: "高速配信設備",
    specs: "高速回線 × Web Presenter",
  },
];

// スライドデータ（モバイル用）
const mobileSlides = [
  {
    image: "hero_mb1.png",
    subtitle: "4K・AI・3D\nバーチャル合成",
    specs: "天井高5M × 防音設備",
  },
  {
    image: "hero_mb2.png",
    subtitle: "マルチアングル撮影",
    specs: "SONY PTZ × PXW-Z190",
  },
  {
    image: "hero03-3mb.png",
    subtitle: "完全防音による\n同録撮影",
    specs: "プロ仕様のPA・マイク設備を完備",
  },
  {
    image: "hero_mb4.png",
    subtitle: "高速配信設備",
    specs: "高速回線 × Web Presenter",
  },
];

const INTRO_DURATION = 120; // 4秒のイントロ @ 30fps
const SLIDE_DURATION = 150; // 5秒 @ 30fps
const TRANSITION_DURATION = 30; // 1秒のトランジション

// ===== イントロ: サイバーパンク走査線 =====
const IntroScanlines: React.FC = () => {
  const frame = useCurrentFrame();

  // 走査線の出現（暗闇から徐々に）
  const scanlineOpacity = interpolate(frame, [15, 40], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 複数の走査線
  const lines = Array.from({ length: 8 }, (_, i) => {
    const speed = 0.8 + (i * 0.3);
    const offset = (i * 137) % 100;
    const lineY = ((frame * speed + offset) % 130) - 15;
    const thickness = i % 3 === 0 ? 3 : 1.5;
    const brightness = i % 2 === 0 ? 0.7 : 0.4;

    // 走査線がイントロ後にフェードアウト
    const lineFade = interpolate(frame, [85, 110], [1, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          top: `${lineY}%`,
          left: 0,
          width: "100%",
          height: thickness,
          background: `linear-gradient(90deg, transparent 0%, rgba(0,194,168,${brightness * 0.5}) 20%, rgba(0,194,168,${brightness}) 50%, rgba(0,194,168,${brightness * 0.5}) 80%, transparent 100%)`,
          filter: `blur(${thickness > 2 ? 1 : 0}px)`,
          opacity: scanlineOpacity * lineFade,
          boxShadow: `0 0 ${thickness * 4}px rgba(0,194,168,${brightness * 0.3})`,
        }}
      />
    );
  });

  // 画面全体のグリッチノイズ（微妙）
  const glitchOpacity = interpolate(
    frame,
    [20, 30, 32, 45, 47, 60],
    [0, 0.05, 0.15, 0.05, 0.12, 0.03],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 水平グリッチバー
  const glitchY = (frame * 7.3) % 100;

  return (
    <AbsoluteFill>
      {lines}
      {/* グリッチバー */}
      <div
        style={{
          position: "absolute",
          top: `${glitchY}%`,
          left: 0,
          width: "100%",
          height: 8,
          background: `rgba(0,194,168,${glitchOpacity})`,
          filter: "blur(2px)",
        }}
      />
      {/* CRTグリッド */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,194,168,0.03) 2px, rgba(0,194,168,0.03) 4px)",
          opacity: scanlineOpacity * 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// ===== イントロ: ロゴ浮上→その場でフェードアウト =====
const IntroLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const isMobile = width < 1200;
  const logoHeight = isMobile ? 360 : 280;

  // ロゴの出現（走査線の中から浮かび上がる）
  const appearOpacity = interpolate(frame, [35, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // その場でフェードアウト（上に移動しない）
  const fadeOutOpacity = interpolate(frame, [90, INTRO_DURATION], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoOpacity = appearOpacity * fadeOutOpacity;

  // 下から浮かび上がる（中央まで）
  const logoY = interpolate(frame, [35, 75], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // スケール（小さいところから通常サイズへ、フェードアウト時に少し拡大）
  const logoScale = interpolate(frame, [35, 75, 90, INTRO_DURATION], [isMobile ? 0.4 : 0.6, isMobile ? 1.3 : 1.1, isMobile ? 1.3 : 1.1, isMobile ? 1.5 : 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ネオングロー（走査線の中で光る）
  const glowPulse = interpolate(
    frame,
    [40, 55, 60, 70, 75, 85, INTRO_DURATION],
    [0, 0.8, 0.4, 1.0, 0.6, 0.5, 0.2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const glowSize = 20 + glowPulse * 30;

  return (
    <div
      style={{
        position: "absolute",
        top: `${50 + logoY * 0.3}%`,
        left: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        opacity: logoOpacity,
      }}
    >
      <Img
        src={staticFile("SHINSEKAI_logo2.png")}
        style={{
          height: logoHeight,
          filter: `drop-shadow(0 0 ${glowSize}px rgba(0,194,168,${glowPulse})) drop-shadow(0 0 ${glowSize * 2}px rgba(0,194,168,${glowPulse * 0.4}))`,
        }}
      />
    </div>
  );
};

// ===== イントロ: フラッシュエフェクト =====
const IntroFlash: React.FC = () => {
  const frame = useCurrentFrame();

  // ロゴ出現時のフラッシュ
  const flash1 = interpolate(frame, [50, 53, 58], [0, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // スライド移行前のフラッシュ
  const flash2 = interpolate(frame, [100, 103, 110], [0, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(0,194,168,${flash1 + flash2})`,
        pointerEvents: "none",
      }}
    />
  );
};

// ===== Ken Burns エフェクト（ズーム＆パン）=====
const KenBurnsSlide: React.FC<{
  image: string;
  direction: number;
}> = ({ image, direction }) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, SLIDE_DURATION], [1, 1.15], {
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(
    frame,
    [0, SLIDE_DURATION],
    [0, direction * 3],
    { extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    frame,
    [0, SLIDE_DURATION],
    [0, direction * -2],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ===== テキストアニメーション（1文字ずつ出現 + ネオンライン + グリッチ退場）=====
const AnimatedText: React.FC<{
  subtitle: string;
  specs: string;
}> = ({ subtitle, specs }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const isMobile = width < 1200;
  const titleSize = isMobile ? 64 : 48;
  const specsSize = isMobile ? 38 : 26;
  const specsSpacing = isMobile ? 4 : 6;
  const textAlign = "center" as const;
  const textWidth = isMobile ? "70%" : "85%";
  // PC: 画面中央配置、モバイル: 中央配置
  const positionStyle = isMobile
    ? { top: "45%", bottom: "auto" as const }
    : { top: "50%", bottom: "auto" as const };
  const chars = subtitle.split("");

  // 電源OFF演出のタイミング（スライド切替直前に素早く消える）
  const EXIT_START = SLIDE_DURATION - 18;

  // フェーズ1: 一瞬明るくなる（電源が切れる直前のフラッシュ）
  const flashBright = interpolate(
    frame,
    [EXIT_START, EXIT_START + 2, EXIT_START + 4],
    [1, 1.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // フェーズ2: 縦方向に潰れる（横線に収縮）
  const scaleY = interpolate(
    frame,
    [EXIT_START + 4, EXIT_START + 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // フェーズ3: 横方向も縮んで消滅
  const scaleX = interpolate(
    frame,
    [EXIT_START + 8, EXIT_START + 14],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 全体の透明度（最後に完全に消える）
  const fadeOut = interpolate(
    frame,
    [EXIT_START + 12, EXIT_START + 15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ネオンアンダーライン（左から右へスワイプ）
  const lineWidth = interpolate(frame, [28, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineGlow = interpolate(frame, [40, 50, 60], [0, 1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // specs タイプライター表示
  const specsChars = specs.split("");
  const specsVisibleCount = interpolate(
    frame,
    [35, 55],
    [0, specsChars.length],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // specs カーソル点滅
  const cursorOpacity = Math.floor(frame / 4) % 2 === 0 ? 1 : 0;
  const showCursor = frame >= 35 && frame < 65;

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle,
        left: "50%",
        transform: isMobile
          ? `translateX(-50%) scaleX(${scaleX}) scaleY(${scaleY})`
          : `translate(-50%, -50%) scaleX(${scaleX}) scaleY(${scaleY})`,
        textAlign: textAlign,
        width: textWidth,
        opacity: fadeOut,
        filter: `brightness(${flashBright})`,
      }}
    >
      {/* メインタイトル: 1文字ずつ出現 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
          transform: "none",
        }}
      >
        {chars.map((char, i) => {
          if (char === "\n") {
            return <div key={i} style={{ flexBasis: "100%", height: 8 }} />;
          }
          const charDelay = 10 + i * 1.2;
          const charOpacity = interpolate(frame, [charDelay, charDelay + 3], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const charY = interpolate(frame, [charDelay, charDelay + 4], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // 出現時の微妙なグリッチ（左右にブレ）
          const glitchX =
            frame >= charDelay && frame < charDelay + 3
              ? Math.sin(frame * 17 + i * 5) * 4
              : 0;

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontSize: titleSize,
                fontWeight: 800,
                color: "#fff",
                textShadow:
                  charOpacity > 0.5
                    ? `0 0 20px rgba(0,194,168,0.5), 0 0 40px rgba(0,194,168,0.2), 0 2px 10px rgba(0,0,0,0.8)`
                    : "none",
                opacity: charOpacity,
                transform: `translateY(${charY}px) translateX(${glitchX}px)`,
                fontFamily: "'Noto Sans JP', sans-serif",
                letterSpacing: 3,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* ネオンアンダーライン */}
      <div
        style={{
          margin: "12px auto 0",
          width: `${lineWidth}%`,
          maxWidth: 500,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, rgba(0,194,168,0.8) 20%, rgba(0,255,200,1) 50%, rgba(0,194,168,0.8) 80%, transparent 100%)`,
          boxShadow: `0 0 ${8 + lineGlow * 15}px rgba(0,194,168,${0.4 + lineGlow * 0.4}), 0 0 ${30 * lineGlow}px rgba(0,194,168,${lineGlow * 0.3})`,
          opacity: lineWidth > 0 ? 1 : 0,
          transition: "none",
        }}
      />

      {/* specs: タイプライター風 */}
      <div
        style={{
          marginTop: 18,
          fontSize: specsSize,
          fontWeight: 300,
          color: "rgba(0,220,190,0.9)",
          letterSpacing: specsSpacing,
          fontFamily: "'Noto Sans JP', sans-serif",
          textShadow: "0 0 15px rgba(0,194,168,0.4)",
          transform: "none",
        }}
      >
        {specsChars.map((char, i) => (
          <span
            key={i}
            style={{
              opacity: i < Math.floor(specsVisibleCount) ? 1 : 0,
            }}
          >
            {char}
          </span>
        ))}
        {showCursor && (
          <span
            style={{
              opacity: cursorOpacity,
              color: "rgba(0,194,168,1)",
              fontWeight: 100,
              marginLeft: 2,
            }}
          >
            |
          </span>
        )}
      </div>
    </div>
  );
};

// ===== グラデーションオーバーレイ =====
const GradientOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.8) 100%)",
      }}
    />
  );
};

// ===== スライド中のロゴ（イントロ後に表示）=====
const SlideLogoOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // パルスエフェクト（微妙な光り）
  const glowIntensity = interpolate(
    frame % 60,
    [0, 30, 60],
    [0.3, 0.6, 0.3],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <Img
        src={staticFile("SHINSEKAI_logo2.png")}
        style={{
          height: 240,
          filter: `drop-shadow(0 0 ${20 * glowIntensity}px rgba(0,194,168,${glowIntensity}))`,
        }}
      />
    </div>
  );
};

// ===== スキャンラインエフェクト（スライド中、軽め）=====
const SlideScanline: React.FC = () => {
  const frame = useCurrentFrame();

  const lineY = interpolate(frame % 120, [0, 120], [-10, 110], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: `${lineY}%`,
        left: 0,
        width: "100%",
        height: 2,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(0,194,168,0.3) 30%, rgba(0,194,168,0.5) 50%, rgba(0,194,168,0.3) 70%, transparent 100%)",
        filter: "blur(1px)",
        opacity: 0.3,
      }}
    />
  );
};

// ===== パーティクルエフェクト =====
const Particles: React.FC = () => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: 20 }, (_, i) => {
    const seed = i * 137.508;
    const x = (seed * 7) % 100;
    const startY = 100 + ((seed * 3) % 30);
    const speed = 0.3 + ((seed * 11) % 0.5);
    const size = 2 + ((seed * 13) % 4);
    const delay = (seed * 17) % 60;

    const y = startY - (frame - delay) * speed;
    const opacity =
      y < 0 || y > 100 || frame < delay ? 0 : 0.3 + ((seed * 19) % 0.4);

    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y % 100}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `rgba(0, 194, 168, ${opacity})`,
          filter: `blur(${size > 4 ? 1 : 0}px)`,
          boxShadow: `0 0 ${size * 2}px rgba(0, 194, 168, ${opacity * 0.5})`,
        }}
      />
    );
  });

  return <AbsoluteFill>{particles}</AbsoluteFill>;
};

// ===== メインコンポジション =====
export const HeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  const slides = width < 1200 ? mobileSlides : pcSlides;

  // イントロフェーズかスライドフェーズかを判定
  const isIntro = frame < INTRO_DURATION;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>

      {/* ===== イントロシーケンス ===== */}
      {frame < INTRO_DURATION + 10 && (
        <Sequence from={0} durationInFrames={INTRO_DURATION + 10}>
          <IntroScanlines />
          <IntroLogo />
          <IntroFlash />
        </Sequence>
      )}

      {/* ===== スライドショー（イントロ後から開始）===== */}
      {slides.map((slide: typeof pcSlides[number], index: number) => {
        const isLast = index === slides.length - 1;
        const startFrame = INTRO_DURATION + index * SLIDE_DURATION;
        const endFrame = startFrame + SLIDE_DURATION + TRANSITION_DURATION;

        if (frame < startFrame - TRANSITION_DURATION || frame > endFrame) {
          return null;
        }

        // フェードイン/アウト（最後のスライドはフェードアウトしない）
        const opacity = isLast
          ? interpolate(
              frame,
              [startFrame, startFrame + TRANSITION_DURATION],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          : interpolate(
              frame,
              [
                startFrame,
                startFrame + TRANSITION_DURATION,
                startFrame + SLIDE_DURATION - TRANSITION_DURATION,
                startFrame + SLIDE_DURATION,
              ],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

        return (
          <Sequence
            key={index}
            from={Math.max(0, startFrame - TRANSITION_DURATION)}
            durationInFrames={SLIDE_DURATION + TRANSITION_DURATION * 2}
          >
            <AbsoluteFill style={{ opacity }}>
              <KenBurnsSlide
                image={slide.image}
                direction={index % 2 === 0 ? 1 : -1}
              />
              <GradientOverlay />
              <AnimatedText subtitle={slide.subtitle} specs={slide.specs} />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* スライド中のエフェクト（イントロ後） */}
      {!isIntro && (
        <Sequence from={INTRO_DURATION} durationInFrames={durationInFrames - INTRO_DURATION}>
          <SlideScanline />
          <Particles />
        </Sequence>
      )}

      {/* ビネット（常時） */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 最後のフェードアウト（画像とロゴを同時に消す）*/}
      {(() => {
        const lastSlideEnd = INTRO_DURATION + slides.length * SLIDE_DURATION;
        return (
          <AbsoluteFill
            style={{
              backgroundColor: "#000",
              opacity: interpolate(
                frame,
                [lastSlideEnd - TRANSITION_DURATION, lastSlideEnd],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          />
        );
      })()}
    </AbsoluteFill>
  );
};
