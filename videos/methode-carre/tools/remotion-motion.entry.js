const { spring, measureSpring } = require("./node_modules/remotion/dist/cjs/spring/index.js");
const { interpolate } = require("./node_modules/remotion/dist/cjs/interpolate.js");
const { Easing } = require("./node_modules/remotion/dist/cjs/easing.js");
const FPS = 30;
// GSAP ease built from a Remotion spring: progress(u) over the spring's settle time.
function springEase(config = {}) {
  const frames = measureSpring({ fps: FPS, config, threshold: 0.001 });
  return (u) => (u >= 1 ? 1 : u <= 0 ? 0 : spring({ frame: u * frames, fps: FPS, config }));
}
function springDuration(config = {}) {
  return measureSpring({ fps: FPS, config, threshold: 0.001 }) / FPS;
}
window.Remotion = { spring, measureSpring, interpolate, Easing, springEase, springDuration, FPS };
