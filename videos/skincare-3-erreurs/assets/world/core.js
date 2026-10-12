// Renderer, studio lighting, physical materials, procedural textures, camera and post-processing
// for the premium skincare film. Everything here is deterministic (seeded noise, no clocks).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export { THREE };
export const W = 1080;
export const H = 1920;
export const V3 = THREE.Vector3;

// ---------------------------------------------------------------- renderer
export const FLAGS = window.__perfFlags || {};
export const canvas = document.getElementById("iso");
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = FLAGS.vsm ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
if (FLAGS.noshadow) renderer.shadowMap.enabled = false;
renderer.transmissionResolutionScale = 0.5;

export const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
// soft studio reflections, attached only to glossy materials (matte surfaces skip the costly env lookup)
export const ENV = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
const ENV_I = 0.5;

// ---------------------------------------------------------------- palette
export const PAL = {
  paper: 0xf6f1ea,
  cream: 0xf4efe9,
  sand: 0xe6d7c6,
  sandDeep: 0xd8c4ad,
  travertine: 0xe9ddce,
  bronze: 0xa37b4c,
  gold: 0xc9a46a,
  sage: 0x9db59a,
  coral: 0xe58c7a,
  lilac: 0x8c7cf0,
  amber: 0xc98a4b,
  nacre: 0xbfe3f2,
  ink: 0x2e231c,
  white: 0xfdfaf6,
  blush: 0xf0d3cb,
};

// ---------------------------------------------------------------- noise + procedural textures
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function valueNoise(seed, size = 64) {
  const rnd = mulberry32(seed);
  const g = new Float32Array(size * size).map(() => rnd());
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const s = (a) => a * a * (3 - 2 * a);
    const at = (i, j) => g[((j % size) + size) % size * size + (((i % size) + size) % size)];
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
  };
}
function fbm(n, x, y, oct = 4) {
  let v = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * n(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}
function texFromCanvas(c, srgb = true, repeat = null) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}
const texCache = new Map();
/** Travertine: warm beige stone with horizontal banding and small pores. Returns {map, rough}. */
export function travertine(seed = 3, tone = [233, 222, 206], repeat = [1, 1]) {
  const key = "tr" + seed + tone.join(",") + repeat.join(",");
  if (texCache.has(key)) return texCache.get(key);
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const r = document.createElement("canvas");
  r.width = r.height = S;
  const g = c.getContext("2d");
  const gr = r.getContext("2d");
  const img = g.createImageData(S, S);
  const rimg = gr.createImageData(S, S);
  const n = valueNoise(seed);
  const n2 = valueNoise(seed + 11);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const band = fbm(n, x / 140, y / 9, 4);
      const fine = fbm(n2, x / 18, y / 18, 3);
      const v = 0.82 + 0.12 * band + 0.06 * fine;
      const i = (y * S + x) * 4;
      img.data[i] = tone[0] * v;
      img.data[i + 1] = tone[1] * v;
      img.data[i + 2] = tone[2] * (v - 0.015);
      img.data[i + 3] = 255;
      const ro = 200 + 40 * fine;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = ro;
      rimg.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  gr.putImageData(rimg, 0, 0);
  // pores
  const rnd = mulberry32(seed + 5);
  for (let k = 0; k < 420; k++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const w = 1 + rnd() * 5;
    g.fillStyle = `rgba(150,120,90,${0.12 + rnd() * 0.2})`;
    g.beginPath();
    g.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2);
    g.fill();
    gr.fillStyle = "rgba(255,255,255,0.9)";
    gr.beginPath();
    gr.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2);
    gr.fill();
  }
  const out = { map: texFromCanvas(c, true, repeat), rough: texFromCanvas(r, false, repeat) };
  texCache.set(key, out);
  return out;
}
/** Fine plaster / limewash for walls. */
export function plaster(seed = 7, tone = [240, 231, 220], repeat = [1, 1]) {
  const key = "pl" + seed + tone.join(",") + repeat.join(",");
  if (texCache.has(key)) return texCache.get(key);
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const img = g.createImageData(S, S);
  const n = valueNoise(seed);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const v = 0.94 + 0.06 * fbm(n, x / 60, y / 60, 5);
      const i = (y * S + x) * 4;
      img.data[i] = tone[0] * v;
      img.data[i + 1] = tone[1] * v;
      img.data[i + 2] = tone[2] * v;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const out = { map: texFromCanvas(c, true, repeat) };
  texCache.set(key, out);
  return out;
}
/** Light oak with long grain. */
export function oak(seed = 9, repeat = [1, 1]) {
  const key = "oak" + seed + repeat.join(",");
  if (texCache.has(key)) return texCache.get(key);
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const img = g.createImageData(S, S);
  const n = valueNoise(seed);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const grain = Math.sin((y / S) * 90 + 6 * fbm(n, x / 200, y / 30, 4)) * 0.5 + 0.5;
      const v = 0.86 + 0.1 * grain + 0.04 * fbm(n, x / 20, y / 6, 2);
      const i = (y * S + x) * 4;
      img.data[i] = 214 * v;
      img.data[i + 1] = 182 * v;
      img.data[i + 2] = 142 * v;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const out = { map: texFromCanvas(c, true, repeat) };
  texCache.set(key, out);
  return out;
}
/** Vertical sky gradient (morning). */
export function skyTexture(top = "#9fc3e6", mid = "#d9e6f1", bottom = "#fbefe2") {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 512;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top);
  grd.addColorStop(0.55, mid);
  grd.addColorStop(1, bottom);
  g.fillStyle = grd;
  g.fillRect(0, 0, 8, 512);
  return texFromCanvas(c);
}

// ---------------------------------------------------------------- materials
const mcache = new Map();
const cached = (key, make) => {
  if (!mcache.has(key)) mcache.set(key, make());
  return mcache.get(key);
};
/** Matte/satin surface (stone, plaster, ceramic). rough >= 0.8 uses cheap Lambert shading. */
const satinMake = (color, rough, extra) =>
  rough >= 0.8 ? new THREE.MeshLambertMaterial({ color, ...extra }) : new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, envMap: ENV, envMapIntensity: ENV_I * 0.6, ...extra });
export const satin = (color, rough = 0.6, extra = {}) => cached("s" + color + "|" + rough + "|" + Object.keys(extra).join(","), () => satinMake(color, rough, extra));
export const satinU = (color, rough = 0.6, extra = {}) => satinMake(color, rough, extra);
export const matteMap = (map) => new THREE.MeshLambertMaterial({ map });
/** Lacquered/glossy plastic or ceramic with a clear coat. */
export const lacquer = (color, rough = 0.35, coat = 0.6) =>
  cached("l" + color + "|" + rough + "|" + coat, () => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, clearcoat: coat, clearcoatRoughness: 0.12, envMap: ENV, envMapIntensity: ENV_I }));
/** Brushed warm metal (caps, rims). */
export const METAL = new THREE.MeshStandardMaterial({ color: 0xcaa16c, metalness: 1, roughness: 0.3, envMap: ENV, envMapIntensity: 1.0 });
export const METAL_DARK = new THREE.MeshStandardMaterial({ color: 0x8a6a45, metalness: 1, roughness: 0.38, envMap: ENV, envMapIntensity: 1.0 });
/** Physically based glass. tint = attenuation colour, frost = roughness. */
export function glass({ tint = 0xffffff, dist = 0.4, frost = 0.04, thickness = 0.01, ior = 1.5 } = {}) {
  return cached("gl" + tint + "|" + dist + "|" + frost + "|" + thickness, () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: frost,
      transmission: 1,
      thickness,
      ior,
      attenuationColor: new THREE.Color(tint),
      attenuationDistance: dist,
      specularIntensity: 1,
      envMap: ENV,
      envMapIntensity: 1.1,
    }),
  );
}
/** Liquid or gel seen through glass. */
export function liquid(color, { op = 0.85, rough = 0.15 } = {}) {
  return cached("lq" + color + "|" + op + "|" + rough, () =>
    new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, transmission: 0.55, thickness: 0.02, ior: 1.36, attenuationColor: new THREE.Color(color), attenuationDistance: 0.05, transparent: op < 1, opacity: op, envMap: ENV, envMapIntensity: ENV_I }),
  );
}
export const emissive = (color, intensity = 1, op = 1) =>
  new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false, transparent: op < 1, opacity: op, depthWrite: op >= 1 });

// ---------------------------------------------------------------- geometry helpers
export function mesh(geo, mat, x = 0, y = 0, z = 0, parent = null, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  if (parent) parent.add(m);
  return m;
}
export const group = (parent, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
};
export const rbox = (w, h, d, r = 0.01, seg = 3) =>
  new RoundedBoxGeometry(w, h, d, seg, Math.max(0.0005, Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005)));
export const cyl = (rt, rb, h, s = 48, open = false) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open);
export const sph = (r, ws = 32, hs = 20) => new THREE.SphereGeometry(r, ws, hs);
export const lathe = (pts, s = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), s);
export const torus = (r, t, rs = 12, ts = 64, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, rs, ts, arc);
/** Rounded-edge disc (plinth) via lathe: radius r, height h, edge radius e. */
export function plinthGeo(r, h, e = 0.01, s = 64) {
  const pts = [[0, 0], [r - e, 0]];
  for (let k = 0; k <= 6; k++) {
    const a = -Math.PI / 2 + (k / 6) * (Math.PI / 2);
    pts.push([r - e + Math.cos(a) * e, e + Math.sin(a) * e]);
  }
  for (let k = 0; k <= 6; k++) {
    const a = (k / 6) * (Math.PI / 2);
    pts.push([r - e + Math.cos(a) * e, h - e + Math.sin(a) * e]);
  }
  pts.push([0, h]);
  return lathe(pts, s);
}

// ---------------------------------------------------------------- timing helpers
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = {
  linear: (x) => x,
  inQ: (x) => x * x,
  outQ: (x) => 1 - (1 - x) * (1 - x),
  inC: (x) => x * x * x,
  outC: (x) => 1 - Math.pow(1 - x, 3),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  inOutC: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  inOutS: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  outBounce: (x) => {
    const n = 7.5625;
    const d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
  },
};
/** 0→1 over [a,b] with an ease. */
export const prog = (t, a, b, e = ease.inOutC) => e(clamp01((t - a) / (b - a)));
/** smooth 0→1→0 bump: rises over [a,a+r], falls over [b-r,b] */
export const bump = (t, a, b, r = 0.25) => prog(t, a, a + r, ease.inOutS) * (1 - prog(t, b - r, b, ease.inOutS));

// ---------------------------------------------------------------- text → canvas
export const SANS = '"Plus Jakarta Sans"';
export const SERIF = '"Cormorant Garamond"';
export function canvasTexture(c, srgb = true) {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
/** Printed label artwork for bottles: small, elegant typography on a transparent or tinted band. */
export function labelCanvas({ name = "", sub = "", bg = null, ink = "#2e231c", w = 512, h = 256, serif = true } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (bg) {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
  }
  g.fillStyle = ink;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = serif ? `600 ${h * 0.3}px ${SERIF}` : `600 ${h * 0.2}px ${SANS}`;
  g.fillText(name, w / 2, h * (sub ? 0.42 : 0.5));
  if (sub) {
    g.font = `500 ${h * 0.11}px ${SANS}`;
    g.globalAlpha = 0.75;
    g.fillText(sub.split("").join(String.fromCharCode(8202)), w / 2, h * 0.7);
  }
  return c;
}

// ---------------------------------------------------------------- soft sprites
let glowTex = null;
export function glowSprite(color = 0xffffff, size = 1, op = 1) {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.42)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(color), transparent: true, opacity: op, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}
let starTex = null;
export function starSprite(size = 0.05, color = 0xfff4dd) {
  if (!starTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 18);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#fff";
    g.beginPath();
    const r = 60;
    const a = 7;
    g.moveTo(64, 64 - r);
    g.quadraticCurveTo(64 + a, 64 - a, 64 + r, 64);
    g.quadraticCurveTo(64 + a, 64 + a, 64, 64 + r);
    g.quadraticCurveTo(64 - a, 64 + a, 64 - r, 64);
    g.quadraticCurveTo(64 - a, 64 - a, 64, 64 - r);
    g.fill();
    starTex = new THREE.CanvasTexture(c);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size);
  return s;
}
/** Soft contact shadow lying on a surface (for moving products). */
let blobTex = null;
export function contactShadow(radius, opacity = 0.45) {
  if (!blobTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(70,50,35,1)");
    grd.addColorStop(0.45, "rgba(70,50,35,0.5)");
    grd.addColorStop(1, "rgba(70,50,35,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    blobTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false, toneMapped: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 2;
  m.baseOpacity = opacity;
  return m;
}

// ---------------------------------------------------------------- camera
export const camera = new THREE.PerspectiveCamera(24, W / H, 0.02, 400);
const _dir = new V3();
const _right = new V3();
const _up = new V3();
/**
 * Place the camera: shot = {P:[x,y,z] world target, h: frame height at target (m), az, el (deg), fov, roll, sx, sy}.
 * az = 0 looks from +Z toward -Z.
 */
export function placeCamera(s) {
  const fov = s.fov || 24;
  camera.fov = fov;
  const d = s.h / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2));
  const az = THREE.MathUtils.degToRad(s.az || 0);
  const el = THREE.MathUtils.degToRad(s.el ?? 30);
  _dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  _right.crossVectors(_dir.clone().negate(), new V3(0, 1, 0)).normalize();
  _up.crossVectors(_right, _dir.clone().negate()).normalize();
  const ww = (s.h * W) / H;
  const target = new V3(s.P[0], s.P[1], s.P[2]).addScaledVector(_right, -(s.sx || 0) * ww).addScaledVector(_up, -(s.sy || 0) * s.h);
  camera.position.copy(target).addScaledVector(_dir, d);
  camera.up.set(0, 1, 0);
  camera.lookAt(target);
  if (s.roll) camera.rotateZ(THREE.MathUtils.degToRad(s.roll));
  camera.near = Math.max(0.005, d * 0.04);
  camera.far = d * 30 + 50;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return { target, distance: d };
}
/** World → screen pixels (for the 2D UI layer). Returns null when behind the camera. */
const _p = new V3();
export function project(v) {
  _p.copy(v).project(camera);
  if (_p.z > 1) return null;
  return { x: (_p.x * 0.5 + 0.5) * W, y: (-_p.y * 0.5 + 0.5) * H };
}

// ---------------------------------------------------------------- post-processing
const rt = new THREE.WebGLRenderTarget(W, H, { type: FLAGS.ubyte ? THREE.UnsignedByteType : THREE.HalfFloatType, samples: FLAGS.samples ?? 2 });
export const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
export const bokeh = new BokehPass(scene, camera, { focus: 3, aperture: 0.0006, maxblur: 0.006 });
bokeh.enabled = false;
composer.addPass(bokeh);
export const bloom = new UnrealBloomPass(new THREE.Vector2(W / 3, H / 3), 0.16, 0.5, 1.05);
composer.addPass(bloom);
if (FLAGS.nobloom) bloom.enabled = false;
// film finish: soft vignette and fine deterministic grain (seeded by the frame time)
export const finish = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uVig: { value: 0.3 }, uGrain: { value: 0.028 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uVig; uniform float uGrain; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.x *= 0.5625;
      float v = smoothstep(0.75, 0.18, length(q));
      c.rgb *= mix(1.0 - uVig, 1.0, v);
      float n = hash(vUv * vec2(1080.0, 1920.0) + floor(uTime * 30.0) * 17.0) - 0.5;
      c.rgb += n * uGrain * (0.6 + 0.4 * (1.0 - dot(c.rgb, vec3(0.333))));
      gl_FragColor = c;
    }`,
});
composer.addPass(finish);
composer.addPass(new OutputPass());

export function renderFrame(t) {
  finish.uniforms.uTime.value = t;
  if (FLAGS.nopost) renderer.render(scene, camera);
  else composer.render();
}
