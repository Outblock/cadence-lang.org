import "./global.css";
import { Composition } from "remotion";
import {
  CadenceIntro,
  CadenceIntroSchema,
} from "./compositions/CadenceIntro";

// 5 scenes: 3 + 3 + 4 + 3.5 + 2 = 15.5s
// minus 4 transitions × 0.4s = 1.6s
// total ≈ 13.9s → ~417 frames @ 30fps
// round up to 420 for safety
const DURATION_FRAMES = 420;

export const RemotionRoot = () => {
  return (
    <Composition
      id="CadenceIntro"
      component={CadenceIntro}
      durationInFrames={DURATION_FRAMES}
      fps={30}
      width={1920}
      height={1080}
      schema={CadenceIntroSchema}
      defaultProps={{
        theme: "dark",
      }}
    />
  );
};
