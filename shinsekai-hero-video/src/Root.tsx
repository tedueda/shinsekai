import { Composition } from "remotion";
import { HeroVideo } from "./components/HeroVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroVideo"
        component={HeroVideo}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeroVideoMobile"
        component={HeroVideo}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
