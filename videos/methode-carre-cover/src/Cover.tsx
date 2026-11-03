import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";

// RILI SUCCESS palette, in the dark "tuto" style of the client's reference
const C = { choco: "#3B2418", beige: "#D8C3AE", black: "#0F0F0F", gold: "#C9A96A", cream: "#F8F5EF" };

const fontFaces = `
@font-face { font-family: "ArchivoBlack"; src: url("${staticFile("fonts/archivo-black-latin-400-normal.woff2")}") format("woff2"); }
@font-face { font-family: "Sora"; src: url("${staticFile("fonts/sora-latin-800-normal.woff2")}") format("woff2"); font-weight: 800; }
@font-face { font-family: "Jakarta"; src: url("${staticFile("fonts/plus-jakarta-sans-latin-600-normal.woff2")}") format("woff2"); font-weight: 600; }
@font-face { font-family: "Jakarta"; src: url("${staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2")}") format("woff2"); font-weight: 800; }
`;

const Tile: React.FC<{ ch: string; i: number; size: number; settled: boolean }> = ({ ch, i, size, settled }) => {
  const live = useCurrentFrame();
  const frame = settled ? 120 : live;
  const { fps } = useVideoConfig();
  // Remotion spring: the letters drop in one by one (the still shows them landed)
  const k = spring({ frame: frame - i * 4, fps, config: { damping: 11, stiffness: 150, mass: 1 } });
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.12,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(145deg, #E6CC92 0%, #C9A96A 55%, #A8874E 100%)",
        boxShadow: "0 22px 50px rgba(0,0,0,0.6), inset 0 3px 0 rgba(255,240,210,0.65)",
        fontFamily: "ArchivoBlack", fontSize: size * 0.66, color: C.choco,
        transform: `translateY(${interpolate(k, [0, 1], [-160, 0])}px) rotate(${interpolate(k, [0, 1], [-14, 0])}deg)`,
        opacity: Math.min(1, k * 1.5),
      }}
    >
      {ch}
    </div>
  );
};

export const Cover: React.FC<{ settled?: boolean }> = ({ settled = false }) => {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 70% at 50% 30%, #1a1512 0%, #0f0f0f 60%, #090909 100%)" }}>
      <style>{fontFaces}</style>
      {/* the film's own 3D render (HyperFrames frame at 23.6 s): giant screen + the five lit cubes */}
      <div style={{ position: "absolute", left: 0, top: 860, width: 1080, height: 1060, overflow: "hidden" }}>
        <Img src={staticFile("hub-render.png")} style={{ position: "absolute", width: 1080, height: 1920, left: 0, top: -225 }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0F0F0F 0%, #0F0F0F 45%, rgba(15,15,15,0) 52%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, #0F0F0F 0%, #0F0F0F 6%, rgba(15,15,15,0) 16%)" }} />

      {/* title block, centred, inside the 3:4 grid crop (y 240-1680) */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 270, textAlign: "center" }}>
        <div style={{ fontFamily: "Jakarta", fontWeight: 800, fontSize: 32, letterSpacing: "0.3em", marginRight: "-0.3em", color: C.gold }}>
          TUTO IA POUR DÉBUTANTS
        </div>
        <div style={{ fontFamily: "ArchivoBlack", fontSize: 104, lineHeight: 1.0, letterSpacing: "-0.035em", color: C.cream, marginTop: 26 }}>
          La méthode
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 26 }}>
          {["C", "A", "R", "R", "É"].map((ch, i) => (
            <Tile key={i} ch={ch} i={i} size={170} settled={settled} />
          ))}
        </div>
        <div style={{ fontFamily: "ArchivoBlack", fontSize: 92, lineHeight: 1.0, letterSpacing: "-0.035em", color: C.cream, marginTop: 30 }}>
          en <span style={{ color: C.gold }}>30 secondes</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 1800, textAlign: "center", fontFamily: "Sora", fontWeight: 800, fontSize: 52, letterSpacing: "0.12em", color: C.gold }}>
        RILI SUCCESS
      </div>
    </AbsoluteFill>
  );
};
