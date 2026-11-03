import React from "react";
import { Composition, Still } from "remotion";
import { Cover } from "./Cover";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram cover (still) — npx remotion still CoverStill out/couverture.png */}
      <Still id="CoverStill" component={Cover} width={1080} height={1920} defaultProps={{ settled: true }} />
      {/* same cover, animated (1 s) — the letters drop in with Remotion springs */}
      <Composition id="CoverAnimated" component={Cover} durationInFrames={45} fps={30} width={1080} height={1920} />
    </>
  );
};
