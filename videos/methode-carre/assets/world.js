// RILI SUCCESS — « La méthode CARRÉ en 30 secondes »
// One continuous isometric 3D world (Three.js), drawn only from HyperFrames time (`hf-seek`).
// Motion springs are Remotion's own spring() (assets/vendor/remotion-motion.js → window.Remotion).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";

const W = 1080, H = 1920;
const V3 = THREE.Vector3;
const R = window.Remotion;
const FPS = 30;

// ---------------------------------------------------------------- palette
const PAL = {
  choco: 0x3b2418, beige: 0xd8c3ae, black: 0x0f0f0f, gold: 0xc9a96a, cream: 0xf8f5ef,
  chocoDeep: 0x24150d, walnut: 0x4a2e1f, stone: 0xd8c3ae, stoneDark: 0xc4ab93, skin: 0xc8977a, hair: 0x2a1a12,
};
const CSS = { choco: "#3B2418", beige: "#D8C3AE", black: "#0F0F0F", gold: "#C9A96A", cream: "#F8F5EF", grey: "#9A918A", greyL: "#D9D3CC", goldL: "#E7D3A6" };
const FD = "Sora", FU = "Plus Jakarta Sans";

// every canvas texture draws text: hold the build until the faces are loaded
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let resolveReady;
window.__hf.buildReady.world = new Promise((r) => (resolveReady = r));
await Promise.all([
  document.fonts.load(`800 60px "${FD}"`), document.fonts.load(`700 60px "${FD}"`),
  document.fonts.load(`500 40px "${FU}"`), document.fonts.load(`600 40px "${FU}"`),
  document.fonts.load(`700 40px "${FU}"`), document.fonts.load(`800 40px "${FU}"`),
]);

// ---------------------------------------------------------------- renderer
const canvas = document.getElementById("iso");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;

// ---------------------------------------------------------------- helpers
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// Remotion spring: 0 → 1 (with a little overshoot) starting at t0
const SPR = { damping: 15, stiffness: 140, mass: 1 };
const spr = (t, t0, cfg = SPR) => (t <= t0 ? 0 : R.spring({ frame: (t - t0) * FPS, fps: FPS, config: cfg }));
const sprSoft = (t, t0) => spr(t, t0, { damping: 200, stiffness: 120, mass: 1 });

const matCache = {};
function mat(color, rough = 0.6, metal = 0, extra = {}) {
  const k = color + "|" + rough + "|" + metal + JSON.stringify(extra);
  if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  return matCache[k];
}
const GOLD = new THREE.MeshStandardMaterial({ color: 0xd2ad6a, metalness: 1, roughness: 0.32, envMapIntensity: 1.25 });
const GOLD_SOFT = new THREE.MeshStandardMaterial({ color: 0xcaa66c, metalness: 0.9, roughness: 0.42 });
const BLACK = mat(PAL.black, 0.5, 0.1);
const BLACK_GLASS = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.12, metalness: 0.3, envMapIntensity: 1.2 });
const WALNUT = mat(PAL.walnut, 0.55);
const CHOCO = mat(PAL.choco, 0.6);
const ALU = mat(0xb9b2aa, 0.35, 0.9);
const CREAM = mat(PAL.cream, 0.7);
const BEIGE = mat(PAL.beige, 0.8);

function shadowed(o, cast = true, receive = true) {
  o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = receive; } });
  return o;
}
function mesh(geo, material, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}
const rbox = (w, h, d, r = 0.04, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, s = 40) => new THREE.CylinderGeometry(rt, rb, h, s);
const sph = (r, ws = 32, hs = 24) => new THREE.SphereGeometry(r, ws, hs);
function limb(a, b, r, material, parent) {
  const A = new V3(...a), B = new V3(...b);
  const dir = new V3().subVectors(B, A);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len), 6, 14), material);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
  m.castShadow = true; m.receiveShadow = true;
  parent.add(m);
  return m;
}
// screen-aligned placement: s = along the frame's x, d = toward the camera (azimuth 45°)
const SQ = Math.SQRT1_2;
const sd = (s, d) => [(s + d) * SQ, (d - s) * SQ];
const FACE_YAW = Math.PI / 4; // a group rotated by this faces the default camera

// ---------------------------------------------------------------- canvas textures
function canvasTex(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return { c, g, tex, key: null };
}
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}
function font(g, weight, size, fam = FU) { g.font = `${weight} ${size}px "${fam}"`; }
function wrap(g, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const tryL = cur ? cur + " " + w : w;
    if (g.measureText(tryL).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  return lines;
}
// AI chat window chrome shared by every screen in the film
function chrome(g, w, h, title, dark = true) {
  g.fillStyle = dark ? "#14110F" : CSS.cream;
  g.fillRect(0, 0, w, h);
  const bar = Math.round(h * 0.085);
  g.fillStyle = dark ? "#1E1915" : "#EFE8DE";
  g.fillRect(0, 0, w, bar);
  // brand mark: a small gold square (the CARRÉ cube)
  const m = bar * 0.42;
  g.fillStyle = CSS.gold;
  rr(g, bar * 0.42, (bar - m) / 2, m, m, m * 0.18); g.fill();
  font(g, 700, Math.round(bar * 0.38));
  g.fillStyle = dark ? CSS.cream : CSS.choco;
  g.textBaseline = "middle";
  g.fillText(title, bar * 0.42 + m + bar * 0.3, bar / 2 + 1);
  g.textBaseline = "alphabetic";
  return bar;
}

// ---------------------------------------------------------------- lights
scene.add(new THREE.HemisphereLight(0xfff6ea, 0x3b2418, 0.7));
const sun = new THREE.DirectionalLight(0xfff1de, 2.4);
sun.position.set(-9, 16, 7);
sun.target.position.set(0, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 50 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
sun.shadow.radius = 5;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xffe6d0, 0.5);
fill.position.set(10, 6, 4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffe2b8, 0.9);
rim.position.set(-6, 8, -12);
scene.add(rim);

// ---------------------------------------------------------------- the world group (hidden for the end card)
const world = new THREE.Group();
scene.add(world);

// platform: beige stone slab, gold fillet, inlaid grid
function stoneTexture() {
  const { c, g, tex } = canvasTex(1024, 1024);
  g.fillStyle = "#1B1612"; g.fillRect(0, 0, 1024, 1024);
  const rnd = mulberry32(7);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(${rnd() < 0.5 ? "255,240,220" : "0,0,0"},${0.02 + rnd() * 0.03})`;
    g.fillRect(rnd() * 1024, rnd() * 1024, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  g.strokeStyle = "rgba(201,169,106,0.32)"; g.lineWidth = 2.5;
  for (let i = 0; i <= 8; i++) {
    g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i * 128); g.lineTo(1024, i * 128); g.stroke();
  }
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}
const PS = 19;
mesh(rbox(PS, 0.7, PS, 0.12), mat(0x2a1a12, 0.7), 0, -0.35, 0, world);
mesh(rbox(PS + 0.08, 0.06, PS + 0.08, 0.02), GOLD, 0, -0.1, 0, world);
const floor = mesh(new THREE.PlaneGeometry(PS - 0.12, PS - 0.12), new THREE.MeshStandardMaterial({ map: stoneTexture(), roughness: 0.55, metalness: 0.1 }), 0, 0.003, 0, world);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

// ================================================================ DESK (scenes 1)
const DESK = sd(-3.0, 4.6);
const desk = new THREE.Group();
desk.position.set(DESK[0], 0, DESK[1]);
desk.rotation.y = FACE_YAW - 0.3; // seen over the consultant's right shoulder
world.add(desk);
// rug-like dark pad under the desk
mesh(rbox(3.2, 0.03, 2.6, 0.015), mat(0x3b2418, 0.95), 0, 0.015, 0.25, desk);
// table: walnut top, black legs
mesh(rbox(2.3, 0.07, 1.05, 0.03), WALNUT, 0, 0.76, 0, desk);
for (const [x, z] of [[-1.05, -0.42], [1.05, -0.42], [-1.05, 0.42], [1.05, 0.42]]) mesh(box(0.05, 0.74, 0.05), BLACK, x, 0.37, z, desk);
mesh(box(2.1, 0.04, 0.04), BLACK, 0, 0.2, -0.42, desk);
// monitor
const MON = { w: 1.62, h: 0.94 };
const monitor = new THREE.Group();
monitor.position.set(0.12, 0.8, -0.28);
desk.add(monitor);
mesh(box(0.34, 0.015, 0.22), ALU, 0, 0.008, 0, monitor);
mesh(box(0.05, 0.36, 0.03), ALU, 0, 0.19, -0.03, monitor);
mesh(rbox(MON.w + 0.05, MON.h + 0.05, 0.04, 0.015), BLACK, 0, 0.62, 0, monitor);
const deskTex = canvasTex(1340, 780);
const deskScreen = new THREE.Mesh(new THREE.PlaneGeometry(MON.w, MON.h), new THREE.MeshBasicMaterial({ map: deskTex.tex, toneMapped: false }));
deskScreen.position.set(0, 0.62, 0.022);
monitor.add(deskScreen);
// keyboard, mouse, mug, notebook, lamp
mesh(rbox(0.62, 0.025, 0.2, 0.01), mat(0x1c1a19, 0.5), -0.05, 0.81, 0.18, desk);
mesh(rbox(0.07, 0.03, 0.11, 0.03), mat(0x1c1a19, 0.5), 0.42, 0.81, 0.2, desk);
mesh(cyl(0.055, 0.05, 0.12), CREAM, 0.85, 0.86, 0.05, desk);
mesh(rbox(0.32, 0.03, 0.42, 0.01), CHOCO, -0.78, 0.81, 0.08, desk).rotation.y = 0.2;
mesh(cyl(0.09, 0.1, 0.02), BLACK, -0.95, 0.81, -0.3, desk);
limb([-0.95, 0.82, -0.3], [-0.85, 1.25, -0.38], 0.012, BLACK, desk);
limb([-0.85, 1.25, -0.38], [-0.62, 1.32, -0.2], 0.012, BLACK, desk);
const lampHead = mesh(new THREE.ConeGeometry(0.07, 0.12, 24, 1, true), GOLD, -0.6, 1.3, -0.18, desk);
lampHead.rotation.z = 2.4; lampHead.material = GOLD;
// chair
const chair = new THREE.Group();
chair.position.set(-0.28, 0, 0.78);
desk.add(chair);
mesh(cyl(0.3, 0.3, 0.03, 5), BLACK, 0, 0.06, 0, chair);
mesh(cyl(0.03, 0.03, 0.4), ALU, 0, 0.27, 0, chair);
mesh(rbox(0.56, 0.08, 0.52, 0.04), mat(0x1a1716, 0.7), 0, 0.5, 0, chair);
mesh(rbox(0.54, 0.6, 0.07, 0.04), mat(0x1a1716, 0.7), 0, 0.86, 0.25, chair).rotation.x = -0.1;

// the consultant (adult proportions, dark suit) — seated, typing
function seatedPerson({ suit = PAL.black, shirt = PAL.beige, skin = PAL.skin, hair = PAL.hair }) {
  const p = new THREE.Group();
  const SUIT = mat(suit, 0.62), SHIRT = mat(shirt, 0.75), SKIN = mat(skin, 0.55), HAIR = mat(hair, 0.7);
  // legs (thighs forward, shins down), shoes
  for (const sx of [-0.1, 0.1]) {
    limb([sx, 0.55, 0.05], [sx, 0.57, -0.38], 0.075, SUIT, p);
    limb([sx, 0.55, -0.4], [sx, 0.12, -0.44], 0.065, SUIT, p);
    mesh(rbox(0.1, 0.07, 0.24, 0.03), BLACK, sx, 0.04, -0.5, p);
  }
  // torso: jacket with a beige shirt V
  const torso = new THREE.Group();
  torso.position.set(0, 0.56, 0.05);
  p.add(torso);
  mesh(rbox(0.42, 0.56, 0.24, 0.1), SUIT, 0, 0.3, 0, torso);
  const v = mesh(new THREE.ConeGeometry(0.075, 0.24, 3), SHIRT, 0, 0.47, -0.105, torso);
  v.rotation.z = Math.PI; v.scale.z = 0.25;
  mesh(cyl(0.055, 0.06, 0.08), SKIN, 0, 0.62, 0, torso);
  const head = new THREE.Group();
  head.position.set(0, 0.77, -0.01);
  torso.add(head);
  const skull = mesh(sph(0.115), SKIN, 0, 0, 0, head); skull.scale.set(0.92, 1.08, 1);
  const hairM = mesh(new THREE.SphereGeometry(0.122, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), HAIR, 0, 0.012, 0.012, head);
  hairM.scale.set(0.95, 1.08, 1.04);
  mesh(sph(0.025), SKIN, -0.108, -0.005, 0.01, head); mesh(sph(0.025), SKIN, 0.108, -0.005, 0.01, head);
  // arms to the keyboard
  const arms = new THREE.Group();
  torso.add(arms);
  for (const sx of [-1, 1]) {
    limb([sx * 0.2, 0.5, 0], [sx * 0.24, 0.22, -0.12], 0.055, SUIT, arms);
    limb([sx * 0.24, 0.22, -0.12], [sx * 0.12, 0.25, -0.42], 0.045, SUIT, arms);
    mesh(sph(0.04), SKIN, sx * 0.1, 0.25, -0.47, arms);
  }
  p.userData = { torso, head, arms };
  return p;
}
const consultant = seatedPerson({});
consultant.position.set(-0.28, 0, 0.82);
desk.add(consultant);
shadowed(desk);

function drawDesk(t) {
  // state changes at 30 fps only inside 0..4.6 s
  const key = t < 4.8 ? Math.round(t * 30) : "end";
  if (deskTex.key === key) return;
  deskTex.key = key;
  const { g, c } = deskTex;
  const w = c.width, h = c.height;
  const bar = chrome(g, w, h, "Assistant IA");
  const q = "Écris un post sur l'IA.";
  const n = Math.floor(clamp01((t - 0.45) / 0.9) * q.length);
  const sent = t > 1.55;
  // question bubble (right aligned once sent) or input field
  font(g, 700, 62);
  if (!sent) {
    g.fillStyle = "#211B17"; rr(g, 50, h - 170, w - 100, 116, 22); g.fill();
    g.strokeStyle = "rgba(201,169,106,0.6)"; g.lineWidth = 3; g.stroke();
    g.fillStyle = CSS.cream;
    g.fillText(q.slice(0, n), 90, h - 90);
    if (Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = CSS.gold; g.fillRect(90 + g.measureText(q.slice(0, n)).width + 6, h - 140, 5, 64); }
  } else {
    const qw = g.measureText(q).width + 70;
    g.fillStyle = "#3A2A1F"; rr(g, w - 50 - qw, bar + 36, qw, 108, 22); g.fill();
    g.fillStyle = CSS.cream; g.fillText(q, w - 50 - qw + 35, bar + 112);
    // generic answer, typed in
    const ans = "L'intelligence artificielle est un sujet important. Elle change le monde et offre de nombreuses possibilités dans de nombreux domaines…";
    const k = clamp01((t - 1.9) / 1.0);
    font(g, 600, 54);
    const lines = wrap(g, ans, w - 140);
    let left = Math.floor(ans.length * k);
    g.fillStyle = "#8F877F";
    lines.forEach((ln, i) => {
      if (left <= 0) return;
      g.fillText(ln.slice(0, left), 70, bar + 240 + i * 72);
      left -= ln.length + 1;
    });
    // verdict: generic
    if (t > 2.95) {
      const a = clamp01((t - 2.95) / 0.25);
      g.globalAlpha = a;
      font(g, 800, 40);
      const lab = "RÉPONSE GÉNÉRIQUE";
      const lw = g.measureText(lab).width + 60;
      g.strokeStyle = "#B4593E"; g.lineWidth = 5;
      rr(g, 70, h - 140, lw, 80, 10); g.stroke();
      g.fillStyle = "#B4593E"; g.fillText(lab, 100, h - 86);
      g.globalAlpha = 1;
    }
  }
  deskTex.tex.needsUpdate = true;
}

// ================================================================ AI HUB (scenes 2, 4, 5)
const HUB = sd(0, 0);
const hub = new THREE.Group();
hub.position.set(HUB[0], 0, HUB[1]);
hub.rotation.y = FACE_YAW;
world.add(hub);
mesh(cyl(2.05, 2.15, 0.3, 80), BLACK, 0, 0.15, 0, hub);
mesh(new THREE.TorusGeometry(2.08, 0.025, 12, 120), GOLD, 0, 0.3, 0, hub).rotation.x = Math.PI / 2;
mesh(cyl(1.7, 1.7, 0.02, 80), mat(0x1b1714, 0.35, 0.2), 0, 0.31, 0, hub);
// the giant screen: tilted back by the camera elevation so it faces the lens squarely
const EL = THREE.MathUtils.degToRad(32);
const SCR = { w: 3.4, h: 2.5, y: 2.5, z: -0.65 };
const screenRig = new THREE.Group();
screenRig.position.set(0, SCR.y, SCR.z);
screenRig.rotation.x = -EL;
hub.add(screenRig);
const screenBody = new THREE.Group();
screenRig.add(screenBody);
mesh(rbox(SCR.w + 0.12, SCR.h + 0.12, 0.08, 0.04), BLACK, 0, 0, -0.045, screenBody);
const goldEdge = mesh(rbox(SCR.w + 0.16, SCR.h + 0.16, 0.03, 0.05), GOLD, 0, 0, -0.08, screenBody);
const hubTex = canvasTex(1700, 1250);
const hubScreen = new THREE.Mesh(new THREE.PlaneGeometry(SCR.w, SCR.h), new THREE.MeshBasicMaterial({ map: hubTex.tex, toneMapped: false }));
hubScreen.position.z = 0.001;
screenBody.add(hubScreen);
// two posts holding the screen
const posts = [];
for (const sx of [-1.2, 1.2]) posts.push(mesh(box(0.06, 1.3, 0.06), ALU, sx, 0.95, SCR.z - 0.1, hub));

// five gold cubes C A R R É, engraved letters
function letterTex(ch, sub = null) {
  const { g, tex } = canvasTex(512, 512);
  const grd = g.createLinearGradient(0, 0, 512, 512);
  grd.addColorStop(0, "#E6CC92"); grd.addColorStop(0.5, "#C9A96A"); grd.addColorStop(1, "#A8874E");
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(255,240,210,0.55)"; g.lineWidth = 10; g.strokeRect(22, 22, 468, 468);
  font(g, 800, sub ? 230 : 330, FD);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "rgba(255,236,200,0.6)"; g.fillText(ch, 259, 279);
  g.fillStyle = CSS.choco; g.fillText(ch, 256, 274);
  if (sub) { font(g, 700, 44, FD); g.fillText(sub, 256, 440); }
  return tex;
}
const goldFaceMat = (tex) => new THREE.MeshStandardMaterial({ map: tex, metalness: 0.85, roughness: 0.34, envMapIntensity: 1.2 });
const LETTERS = ["C", "A", "R", "R", "É"];
const cubeGeo = rbox(0.56, 0.56, 0.56, 0.05, 4);
function letterCube(ch, size = 1) {
  const front = goldFaceMat(letterTex(ch));
  // RoundedBox groups: +x, -x, +y, -y, +z, -z
  const m = new THREE.Mesh(cubeGeo, [GOLD, GOLD, GOLD, GOLD, front, GOLD]);
  m.scale.setScalar(size);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
const hubCubes = LETTERS.map((ch, i) => {
  const c = letterCube(ch);
  c.userData.x = (i - 2) * 0.66;
  hub.add(c);
  return c;
});

// holographic AI brain on its projector (left of the hub)
const BRAIN = sd(2.95, 0.9);
const brainRig = new THREE.Group();
brainRig.position.set(BRAIN[0], 0, BRAIN[1]);
world.add(brainRig);
mesh(cyl(0.42, 0.48, 0.16, 48), BLACK, 0, 0.08, 0, brainRig);
mesh(new THREE.TorusGeometry(0.4, 0.02, 10, 60), GOLD, 0, 0.165, 0, brainRig).rotation.x = Math.PI / 2;
const lens = mesh(cyl(0.16, 0.16, 0.02, 32), new THREE.MeshBasicMaterial({ color: 0xf3dfb4, toneMapped: false }), 0, 0.175, 0, brainRig);
lens.castShadow = false;
const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.16, 1.05, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xe8cf9c, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
beam.position.y = 0.7;
brainRig.add(beam);
function brainGeometry(seed) {
  const g = new THREE.SphereGeometry(0.5, 64, 44);
  const p = g.attributes.position;
  const v = new V3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const fold = Math.sin(n.x * 9 + seed) * Math.sin(n.y * 11 + n.z * 7) * 0.5 + Math.sin(n.z * 13 + n.y * 5 + seed * 2) * 0.5;
    const r = 1 + 0.055 * fold;
    v.copy(n).multiplyScalar(0.5 * r);
    v.x *= 0.52; v.y *= 0.78; v.z *= 1.08;
    if (v.y < -0.18) v.y = -0.18 + (v.y + 0.18) * 0.4; // flatter base
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}
const brain = new THREE.Group();
brain.position.y = 1.55;
brainRig.add(brain);
const holoLine = new THREE.MeshBasicMaterial({ color: 0xd8b874, wireframe: true, transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false });
const holoFill = new THREE.MeshBasicMaterial({ color: 0xe9d3a3, transparent: true, opacity: 0.16, toneMapped: false, depthWrite: false });
for (const [sx, seed] of [[-0.145, 1], [0.145, 2.3]]) {
  const geo = brainGeometry(seed);
  const a = new THREE.Mesh(geo, holoFill); a.position.x = sx; brain.add(a);
  const b = new THREE.Mesh(geo, holoLine); b.position.x = sx; brain.add(b);
}
// orbiting data ring around the brain
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.008, 6, 120), new THREE.MeshBasicMaterial({ color: 0xd8b874, transparent: true, opacity: 0.6, toneMapped: false }));
ring.rotation.x = Math.PI / 2.3;
brain.add(ring);

// ================================================================ STATIONS (scene 3)
const STATION_T = [7.0, 9.0, 11.0, 13.0, 15.0];
const STATION_S = [-6, -3, 0, 3, 6];
const STATION_D = -4.4;
const stations = STATION_S.map((s, i) => {
  const [x, z] = sd(s, STATION_D);
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = FACE_YAW;
  world.add(g);
  // base plinth with a gold edge + letter cube floating above
  const base = new THREE.Group();
  g.add(base);
  mesh(rbox(2.7, 0.16, 2.3, 0.05), mat(0x231a15, 0.5), 0, 0.08, 0, base);
  mesh(rbox(2.78, 0.03, 2.38, 0.012), GOLD, 0, 0.115, 0, base);
  const content = new THREE.Group();
  content.position.y = 0.17;
  g.add(content);
  const cube = letterCube(LETTERS[i], 0.82);
  cube.position.set(1.12, 1.5, 0.62);
  g.add(cube);
  g.userData = { t0: STATION_T[i], base, content, cube };
  return g;
});
const stationLabel = (i) => stations[i].userData;

// --- C · CONTEXTE: a miniature open-space office + dashboard wall
const ctx = stationLabel(0).content;
const ctxItems = [];
{
  const floorM = mesh(rbox(2.3, 0.04, 1.9, 0.01), mat(0xe9dccd, 0.8), 0, 0.02, 0, ctx);
  ctxItems.push(floorM);
  // back + side glass walls of the mini office
  const wallB = mesh(box(2.3, 0.9, 0.04), mat(0xf2ebe2, 0.8), 0, 0.47, -0.93, ctx); ctxItems.push(wallB);
  const wallL = mesh(box(0.04, 0.9, 1.9), mat(0xeee5da, 0.8), -1.13, 0.47, 0, ctx); ctxItems.push(wallL);
  // dashboard on the back wall
  const dashTex = canvasTex(900, 420);
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.7), new THREE.MeshBasicMaterial({ map: dashTex.tex, toneMapped: false }));
  dash.position.set(0.15, 0.55, -0.9);
  ctx.add(dash);
  ctxItems.push(dash);
  ctx.userData.dash = dashTex;
  // four mini desks with screens and seated mini figures
  const rnd = mulberry32(5);
  const deskPos = [[-0.55, -0.25], [0.35, -0.25], [-0.55, 0.45], [0.35, 0.45]];
  deskPos.forEach(([x, z], k) => {
    const d = new THREE.Group();
    d.position.set(x, 0.04, z);
    ctx.add(d);
    mesh(box(0.56, 0.03, 0.3), WALNUT, 0, 0.26, 0, d);
    mesh(box(0.03, 0.25, 0.28), BLACK, -0.25, 0.13, 0, d);
    mesh(box(0.03, 0.25, 0.28), BLACK, 0.25, 0.13, 0, d);
    mesh(box(0.26, 0.15, 0.015), BLACK, 0, 0.36, -0.08, d);
    const glow = mesh(new THREE.PlaneGeometry(0.24, 0.13), new THREE.MeshBasicMaterial({ color: k % 2 ? 0xe7d3a6 : 0xf1e6d2, toneMapped: false }), 0, 0.36, -0.071, d);
    glow.castShadow = false;
    // mini person
    const body = mat([PAL.black, PAL.choco, 0x5a4a3e, PAL.black][k], 0.6);
    mesh(new THREE.CapsuleGeometry(0.055, 0.12, 4, 10), body, 0, 0.27, 0.2, d);
    mesh(sph(0.045, 16, 12), mat([0xc8977a, 0x8d5f45, 0xe2b99a, 0xa8775a][k], 0.55), 0, 0.42, 0.2, d);
    ctxItems.push(d);
  });
  // meeting pod: round table + 3 stools
  const pod = new THREE.Group();
  pod.position.set(0.8, 0.04, 0.12);
  ctx.add(pod);
  mesh(cyl(0.2, 0.2, 0.025, 32), CREAM, 0, 0.24, 0, pod);
  mesh(cyl(0.025, 0.025, 0.24), BLACK, 0, 0.12, 0, pod);
  for (let k = 0; k < 3; k++) mesh(cyl(0.06, 0.06, 0.12, 16), CHOCO, Math.cos(k * 2.1) * 0.3, 0.06, Math.sin(k * 2.1) * 0.3, pod);
  ctxItems.push(pod);
  // shelf block with binders
  const shelf = new THREE.Group();
  shelf.position.set(-0.95, 0.04, 0.55);
  ctx.add(shelf);
  mesh(box(0.22, 0.5, 0.5), mat(0x2a201a, 0.6), 0, 0.25, 0, shelf);
  for (let k = 0; k < 5; k++) mesh(box(0.16, 0.18, 0.06), [CHOCO, BEIGE, GOLD_SOFT, BLACK, CREAM][k], 0.02, 0.36, -0.19 + k * 0.095, shelf);
  ctxItems.push(shelf);
  ctxItems.forEach((o, k) => (o.userData.k = k));
}
function drawDash(t) {
  const d = ctx.userData.dash;
  const k = clamp01((t - 7.25) / 1.1);
  const key = Math.round(k * 40);
  if (d.key === key) return;
  d.key = key;
  const { g, c } = d;
  g.fillStyle = "#16120F"; g.fillRect(0, 0, c.width, c.height);
  font(g, 700, 40); g.fillStyle = CSS.cream; g.fillText("Mon activité", 40, 66);
  font(g, 500, 28); g.fillStyle = "#A99E92"; g.fillText("Compte Instagram · IA", 40, 106);
  const vals = [0.35, 0.5, 0.42, 0.66, 0.58, 0.8, 0.92];
  vals.forEach((v, i) => {
    const hh = 230 * v * easeIO(clamp01(k * 1.4 - i * 0.06));
    g.fillStyle = i === vals.length - 1 ? CSS.gold : "#5A4636";
    rr(g, 60 + i * 115, 380 - hh, 70, hh, 8); g.fill();
  });
  g.strokeStyle = CSS.gold; g.lineWidth = 5; g.beginPath();
  vals.forEach((v, i) => { const x = 95 + i * 115, y = 360 - 230 * v * k; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.stroke();
  d.tex.needsUpdate = true;
}

// --- A · ACTION: task screen + a gold 3D arrow
const act = stationLabel(1).content;
const taskTex = canvasTex(1300, 820);
const taskScreenG = new THREE.Group();
taskScreenG.position.set(-0.1, 1.0, -0.35);
taskScreenG.rotation.x = -EL * 0.55;
act.add(taskScreenG);
mesh(rbox(2.05, 1.32, 0.06, 0.03), BLACK, 0, 0, -0.035, taskScreenG);
const taskScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.23), new THREE.MeshBasicMaterial({ map: taskTex.tex, toneMapped: false }));
taskScreen.position.z = 0.001;
taskScreenG.add(taskScreen);
mesh(box(0.08, 0.45, 0.08), ALU, -0.1, 0.23, -0.42, act);
mesh(rbox(0.7, 0.04, 0.4, 0.02), ALU, -0.1, 0.02, -0.42, act);
const TASKS = ["Répondre aux e-mails", "Créer un calendrier de contenu", "Analyser les statistiques", "Préparer la réunion client"];
function drawTasks(t) {
  const k = clamp01((t - 9.75) / 0.3);
  const key = t < 9 ? "pre" : Math.round(k * 10) + (t > 10.2 ? "x" : "");
  if (taskTex.key === key) return;
  taskTex.key = key;
  const { g, c } = taskTex;
  const bar = chrome(g, c.width, c.height, "Mes tâches");
  TASKS.forEach((txt, i) => {
    const y = bar + 50 + i * 160;
    const hot = i === 1;
    g.fillStyle = hot ? `rgba(201,169,106,${0.12 + 0.6 * k})` : "#1F1A16";
    rr(g, 40, y, c.width - 80, 128, 16); g.fill();
    if (hot && k > 0) { g.strokeStyle = CSS.gold; g.lineWidth = 5; rr(g, 40, y, c.width - 80, 128, 16); g.stroke(); }
    g.strokeStyle = hot && k > 0.5 ? CSS.choco : "#8E8378"; g.lineWidth = 5;
    rr(g, 80, y + 39, 50, 50, 10); g.stroke();
    if (hot && t > 10.2) { g.strokeStyle = CSS.choco; g.lineWidth = 9; g.beginPath(); g.moveTo(90, y + 64); g.lineTo(103, y + 78); g.lineTo(124, y + 48); g.stroke(); }
    font(g, hot ? 800 : 600, 54);
    g.fillStyle = hot && k > 0.5 ? CSS.black : "#CFC6BC";
    g.fillText(txt, 165, y + 83);
  });
  taskTex.tex.needsUpdate = true;
}
// extruded arrow
const arrowShape = new THREE.Shape();
arrowShape.moveTo(0, 0); arrowShape.lineTo(-0.34, 0.26); arrowShape.lineTo(-0.34, 0.11); arrowShape.lineTo(-0.82, 0.11);
arrowShape.lineTo(-0.82, -0.11); arrowShape.lineTo(-0.34, -0.11); arrowShape.lineTo(-0.34, -0.26); arrowShape.closePath();
const arrowGeo = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3 });
arrowGeo.translate(0, 0, -0.06);
const arrow = new THREE.Mesh(arrowGeo, GOLD);
arrow.castShadow = true;
act.add(arrow);

// --- R · RÔLE: a professional AI assistant materialises on a pad
const role = stationLabel(2).content;
const clipPlane = new THREE.Plane(new V3(0, -1, 0), 0); // keeps y < constant
const ROBO_SUIT = new THREE.MeshStandardMaterial({ color: PAL.choco, roughness: 0.55, clippingPlanes: [clipPlane] });
const ROBO_SHELL = new THREE.MeshStandardMaterial({ color: 0xf1ebe3, roughness: 0.28, metalness: 0.15, clippingPlanes: [clipPlane] });
const ROBO_VISOR = new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 0.08, metalness: 0.6, envMapIntensity: 1.5, clippingPlanes: [clipPlane] });
const ROBO_GOLD = new THREE.MeshStandardMaterial({ color: 0xd2ad6a, metalness: 1, roughness: 0.3, clippingPlanes: [clipPlane] });
const ROBO_SHIRT = new THREE.MeshStandardMaterial({ color: PAL.beige, roughness: 0.7, clippingPlanes: [clipPlane] });
const pad = new THREE.Group();
role.add(pad);
mesh(cyl(0.62, 0.66, 0.06, 64), BLACK, 0, 0.03, 0.05, pad);
const padRing = mesh(new THREE.TorusGeometry(0.6, 0.018, 10, 80), new THREE.MeshBasicMaterial({ color: 0xe6c98d, toneMapped: false }), 0, 0.065, 0.05, pad);
padRing.rotation.x = Math.PI / 2;
const robot = new THREE.Group();
robot.position.set(0, 0.06, 0.05);
role.add(robot);
{
  // legs
  for (const sx of [-0.09, 0.09]) {
    limb([sx, 0.08, 0], [sx, 0.78, 0], 0.07, ROBO_SUIT, robot);
    mesh(rbox(0.12, 0.07, 0.24, 0.03), ROBO_VISOR, sx, 0.035, 0.04, robot);
  }
  // torso: chocolate suit jacket, beige shirt, gold collar ring
  mesh(rbox(0.44, 0.6, 0.26, 0.11), ROBO_SUIT, 0, 1.1, 0, robot);
  const v = mesh(new THREE.ConeGeometry(0.08, 0.26, 3), ROBO_SHIRT, 0, 1.28, 0.115, robot); v.rotation.z = Math.PI; v.scale.z = 0.25;
  mesh(new THREE.TorusGeometry(0.065, 0.016, 10, 30), ROBO_GOLD, 0, 1.43, 0, robot).rotation.x = Math.PI / 2;
  mesh(cyl(0.05, 0.055, 0.08), ROBO_SHELL, 0, 1.46, 0, robot);
  // head: ivory shell, black visor band
  const head = new THREE.Group();
  head.position.set(0, 1.63, 0);
  robot.add(head);
  const shell = mesh(sph(0.135, 40, 30), ROBO_SHELL, 0, 0, 0, head); shell.scale.set(0.9, 1.1, 1);
  const visor = mesh(new THREE.SphereGeometry(0.138, 40, 16, -Math.PI * 0.42, Math.PI * 0.84, Math.PI * 0.36, Math.PI * 0.22), ROBO_VISOR, 0, 0.0, 0, head);
  visor.scale.set(0.92, 1.12, 1.02);
  // arms: one relaxed, one presenting
  limb([-0.25, 1.32, 0], [-0.29, 0.98, 0.02], 0.055, ROBO_SUIT, robot);
  limb([-0.29, 0.98, 0.02], [-0.27, 0.72, 0.06], 0.047, ROBO_SUIT, robot);
  mesh(sph(0.045), ROBO_SHELL, -0.27, 0.68, 0.07, robot);
  const armR = new THREE.Group();
  armR.position.set(0.25, 1.32, 0);
  robot.add(armR);
  limb([0, 0, 0], [0.06, -0.32, 0.08], 0.055, ROBO_SUIT, armR);
  limb([0.06, -0.32, 0.08], [0.2, -0.38, 0.34], 0.047, ROBO_SUIT, armR);
  mesh(sph(0.045), ROBO_SHELL, 0.22, -0.38, 0.38, armR);
  robot.userData = { head, armR };
}
// holographic badge
const badgeTex = canvasTex(820, 230);
{
  const { g, c } = badgeTex;
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = "rgba(20,16,13,0.92)"; rr(g, 6, 6, c.width - 12, c.height - 12, 26); g.fill();
  g.strokeStyle = CSS.gold; g.lineWidth = 6; rr(g, 6, 6, c.width - 12, c.height - 12, 26); g.stroke();
  font(g, 600, 40); g.fillStyle = "#BFB3A6"; g.fillText("Rôle", 46, 82);
  font(g, 800, 66, FD); g.fillStyle = CSS.gold; g.fillText("Expert marketing", 44, 172);
  badgeTex.tex.needsUpdate = true;
}
const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.32), new THREE.MeshBasicMaterial({ map: badgeTex.tex, transparent: true, toneMapped: false, depthWrite: false }));
badge.position.set(-0.55, 1.95, 0.35);
badge.rotation.x = -EL;
role.add(badge);
// scan ring that rises while the assistant materialises
const scan = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 8, 80), new THREE.MeshBasicMaterial({ color: 0xf0d79f, toneMapped: false, transparent: true }));
scan.rotation.x = Math.PI / 2;
role.add(scan);

// --- R · RÉSULTAT: a console that prints a structured document
const res = stationLabel(3).content;
const consoleG = new THREE.Group();
consoleG.position.set(0, 0, -0.35);
res.add(consoleG);
mesh(rbox(1.7, 0.75, 0.9, 0.08), BLACK, 0, 0.375, 0, consoleG);
const consoleTop = mesh(rbox(1.6, 0.04, 0.8, 0.02), BLACK_GLASS, 0, 0.77, 0, consoleG);
mesh(box(1.25, 0.02, 0.05), GOLD, 0, 0.6, 0.45, consoleG); // output slot
const slotGlow = mesh(box(1.2, 0.012, 0.02), new THREE.MeshBasicMaterial({ color: 0xf4dfae, toneMapped: false }), 0, 0.6, 0.47, consoleG);
const docTex = canvasTex(900, 1240);
const docMat = new THREE.MeshStandardMaterial({ map: docTex.tex, roughness: 0.75 });
const doc = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.42, 0.012), [CREAM, CREAM, CREAM, CREAM, docMat, CREAM]);
doc.castShadow = true;
res.add(doc);
const DAYS = [["Lun", "Qu'est-ce qu'un prompt ?"], ["Mar", "La méthode CARRÉ"], ["Mer", "3 outils IA utiles"], ["Jeu", "Avant / après un prompt"], ["Ven", "Automatiser ses e-mails"], ["Sam", "Quiz : vrai ou faux IA"], ["Dim", "Récap de la semaine"]];
function drawDoc(g, w, h, k, title = "Calendrier de contenu — 7 jours") {
  g.fillStyle = CSS.cream; g.fillRect(0, 0, w, h);
  g.fillStyle = CSS.gold; g.fillRect(0, 0, w, 16);
  font(g, 800, 52, FD); g.fillStyle = CSS.black;
  wrap(g, title, w - 120).forEach((ln, i) => g.fillText(ln, 60, 110 + i * 64));
  font(g, 600, 30); g.fillStyle = "#7B6A5C"; g.fillText("Format : tableau · Ton : pédagogique et pro", 60, 260);
  const top = 310, rowH = (h - top - 70) / 7;
  for (let i = 0; i < 7; i++) {
    const a = clamp01(k * 8 - i);
    if (a <= 0) break;
    g.globalAlpha = a;
    const y = top + i * rowH;
    g.fillStyle = i % 2 ? "#F1EADF" : "#E8DCCB";
    g.fillRect(60, y, w - 120, rowH - 10);
    g.fillStyle = CSS.choco; font(g, 800, 36, FD); g.fillText(DAYS[i][0], 84, y + rowH * 0.62);
    g.fillStyle = "#2A221D"; font(g, 600, 36); g.fillText(DAYS[i][1], 210, y + rowH * 0.62);
    g.globalAlpha = 1;
  }
}
function drawDocTex(t) {
  const k = clamp01((t - 13.55) / 1.0);
  const key = t < 13 ? "pre" : Math.round(k * 40);
  if (docTex.key === key) return;
  docTex.key = key;
  drawDoc(docTex.g, docTex.c.width, docTex.c.height, k);
  docTex.tex.needsUpdate = true;
}

// --- É · EXEMPLE: a wide screen with two document templates that step out of it
const ex = stationLabel(4).content;
const exScreenG = new THREE.Group();
exScreenG.position.set(-0.05, 0.98, -0.5);
exScreenG.rotation.x = -EL * 0.55;
ex.add(exScreenG);
mesh(rbox(2.25, 1.35, 0.06, 0.03), BLACK, 0, 0, -0.035, exScreenG);
const exTex = canvasTex(1400, 840);
{
  const { g, c } = exTex;
  const bar = chrome(g, c.width, c.height, "Exemples");
  font(g, 600, 40); g.fillStyle = "#A99E92"; g.fillText("Voici le ton souhaité :", 50, bar + 70);
  exTex.tex.needsUpdate = true;
}
const exScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.15, 1.27), new THREE.MeshBasicMaterial({ map: exTex.tex, toneMapped: false }));
exScreen.position.z = 0.001;
exScreenG.add(exScreen);
mesh(box(0.08, 0.4, 0.08), ALU, -0.05, 0.2, -0.58, ex);
mesh(rbox(0.7, 0.04, 0.4, 0.02), ALU, -0.05, 0.02, -0.58, ex);
function templateTex(name, accent) {
  const { g, c, tex } = canvasTex(600, 800);
  g.fillStyle = CSS.cream; g.fillRect(0, 0, 600, 800);
  g.fillStyle = accent; g.fillRect(0, 0, 600, 14);
  font(g, 800, 46, FD); g.fillStyle = CSS.black; g.fillText(name, 44, 92);
  g.fillStyle = "#D9CCBC"; rr(g, 44, 130, 512, 210, 14); g.fill();
  g.fillStyle = accent; rr(g, 72, 160, 140, 140, 10); g.fill();
  for (let i = 0; i < 7; i++) { g.fillStyle = i === 0 ? "#3B2418" : "#BDB0A2"; rr(g, 44, 380 + i * 52, i === 0 ? 380 : 512 - (i % 3) * 90, 22, 11); g.fill(); }
  return tex;
}
const templates = [templateTex("Modèle A", CSS.gold), templateTex("Modèle B", CSS.choco)].map((tx, i) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.96, 0.012), [CREAM, CREAM, CREAM, CREAM, new THREE.MeshStandardMaterial({ map: tx, roughness: 0.7 }), CREAM]);
  m.castShadow = true;
  exScreenG.add(m);
  return m;
});
const check = new THREE.Group();
{
  const s = new THREE.Shape();
  s.moveTo(-0.16, 0.0); s.lineTo(-0.06, -0.1); s.lineTo(0.17, 0.13); s.lineTo(0.13, 0.17); s.lineTo(-0.06, -0.02); s.lineTo(-0.12, 0.04); s.closePath();
  const disc = new THREE.Mesh(cyl(0.2, 0.2, 0.05, 40), GOLD); disc.rotation.x = Math.PI / 2; check.add(disc);
  const tick = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: PAL.choco, roughness: 0.4 }));
  tick.position.z = 0.02; check.add(tick);
}
exScreenG.add(check);

stations.forEach((s) => shadowed(s));
shadowed(hub); shadowed(brainRig, true, true);
beam.castShadow = false; beam.receiveShadow = false;
brain.traverse((o) => { o.castShadow = false; o.receiveShadow = false; });
badge.castShadow = false; scan.castShadow = false; padRing.castShadow = false;

// ================================================================ DATA FLOWS (hub ↔ desk, brain, stations)
const flows = [];
const flowMat = new THREE.MeshStandardMaterial({ color: 0xc9a96a, metalness: 0.8, roughness: 0.35 });
const pulseMat = new THREE.MeshBasicMaterial({ color: 0xf6e2b0, toneMapped: false });
function flow(a, b, lift = 0.02, seed = 1) {
  const A = new V3(a[0], lift, a[1]), B = new V3(b[0], lift, b[1]);
  const mid = A.clone().lerp(B, 0.5);
  const side = new V3(B.z - A.z, 0, A.x - B.x).normalize().multiplyScalar(0.6 * (seed % 2 ? 1 : -1));
  const curve = new THREE.CatmullRomCurve3([A, A.clone().lerp(mid, 0.5).add(side.clone().multiplyScalar(0.5)), mid.clone().add(side), B.clone().lerp(mid, 0.5).add(side.clone().multiplyScalar(0.5)), B]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.018, 8, false), flowMat);
  tube.receiveShadow = true;
  world.add(tube);
  const pulses = [];
  for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(sph(0.045, 12, 10), pulseMat); world.add(p); pulses.push(p); }
  flows.push({ curve, pulses, seed, tube });
}
const hubEdge = (s, d) => { const len = Math.hypot(s, d); return sd((s / len) * 2.2, (d / len) * 2.2); };
flow(hubEdge(-3.0, 4.6), sd(-2.4, 3.6), 0.02, 1);
flow(hubEdge(2.95, 0.9), sd(2.5, 0.75), 0.02, 2);
STATION_S.forEach((s, i) => flow(hubEdge(s, STATION_D), sd(s * 0.92, STATION_D + 1.15), 0.02, i + 3));

// ================================================================ END CARD (scene 6): logo cube in its own space
const endCard = new THREE.Group();
endCard.position.set(60, 0, 60);
scene.add(endCard);
endCard.visible = false;
const endCubes = LETTERS.map((ch) => { const c = letterCube(ch, 1); endCard.add(c); return c; });
const logoTex = (() => {
  const { g, tex } = canvasTex(512, 512);
  const grd = g.createLinearGradient(0, 0, 512, 512);
  grd.addColorStop(0, "#EBD39C"); grd.addColorStop(0.5, "#C9A96A"); grd.addColorStop(1, "#A07E46");
  g.fillStyle = grd; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(59,36,24,0.85)"; g.lineWidth = 14; g.strokeRect(60, 60, 392, 392);
  font(g, 800, 210, FD); g.textAlign = "center"; g.textBaseline = "middle";
  g.fillStyle = "rgba(255,236,200,0.55)"; g.fillText("RS", 260, 266);
  g.fillStyle = CSS.choco; g.fillText("RS", 256, 262);
  return tex;
})();
const logoFace = goldFaceMat(logoTex);
const logoCube = new THREE.Mesh(rbox(1.25, 1.25, 1.25, 0.1, 5), [GOLD, GOLD, GOLD, GOLD, logoFace, GOLD]);
endCard.add(logoCube);
const endLight = new THREE.PointLight(0xffe2b0, 3, 8, 2);
endLight.position.set(1.5, 2, 2.5);
endCard.add(endLight);

// ================================================================ HUB SCREEN CONTENT
const PROMPT = [
  { id: "R", tag: "Rôle", text: "Tu es un expert en marketing digital." },
  { id: "C", tag: "Contexte", text: "Je lance un compte Instagram sur l'IA." },
  { id: "A", tag: "Action", text: "Crée un calendrier de contenu de 7 jours" },
  { id: "R2", tag: "Résultat", text: "sous forme de tableau, avec des exemples de publications dans un style pédagogique et professionnel." },
  { id: "E", tag: "Exemple", text: "Voici un exemple du ton souhaité…" },
];
// highlight order follows C · A · R · R · É
const LIGHT_ORDER = [1, 2, 0, 3, 4];
const LIGHT_T = [20.85, 21.45, 22.05, 22.65, 23.25];
const CHIP = ["C", "A", "R", "R", "É"];
const TYPE_T0 = 17.75, TYPE_T1 = 20.45;
let promptLayout = null;
const CHIP_W = 74;
function layoutPrompt(g, x0, y0, maxW, lh) {
  font(g, 600, 62);
  const toks = [];
  PROMPT.forEach((seg, si) => {
    toks.push({ chip: true, w: "", si });
    seg.text.split(" ").forEach((w) => toks.push({ w, si }));
  });
  let x = x0, y = y0;
  const space = g.measureText(" ").width;
  let ci = 0;
  toks.forEach((tk, i) => {
    const ww = tk.chip ? CHIP_W : g.measureText(tk.w).width;
    // a chip never ends a line: keep it with the word after it
    const need = tk.chip ? ww + 12 + g.measureText(toks[i + 1].w).width : ww;
    if (x + need > x0 + maxW) { x = x0; y += lh; }
    tk.x = x; tk.y = y; tk.ww = ww; tk.c0 = ci; ci += tk.chip ? 1 : tk.w.length + 1;
    x += ww + (tk.chip ? 12 : space);
  });
  return { toks, total: ci, space };
}
function drawHub(t) {
  const { g, c } = hubTex;
  const w = c.width, h = c.height;
  // scene 2 state (opening) vs scene 4 state (prompt)
  const mode = t < 16.5 ? "open" : "prompt";
  const key = mode === "open" ? "o" + Math.round(clamp01((t - 4.6) / 1.6) * 30) + (Math.floor(t * 2.4) % 2) : "p" + Math.round(t * 30);
  if (hubTex.key === key) return;
  hubTex.key = key;
  const bar = chrome(g, w, h, "Assistant IA · RILI SUCCESS");
  if (mode === "open") {
    const k = clamp01((t - 4.6) / 1.6);
    font(g, 600, 50); g.fillStyle = "#A99E92";
    g.fillText("Comment obtenir une meilleure réponse ?", 80, bar + 130);
    // the five blocks of a good prompt, as empty slots that fill in with the cubes
    const sw = 250, gap = 36, total = 5 * sw + 4 * gap, x0 = (w - total) / 2, y0 = bar + 200;
    for (let i = 0; i < 5; i++) {
      const a = clamp01(k * 5.5 - i * 0.9);
      g.strokeStyle = "rgba(201,169,106,0.55)"; g.lineWidth = 5;
      rr(g, x0 + i * (sw + gap), y0, sw, sw, 22); g.stroke();
      if (a > 0) {
        g.globalAlpha = a;
        g.fillStyle = CSS.gold; rr(g, x0 + i * (sw + gap), y0, sw, sw, 22); g.fill();
        font(g, 800, 170, FD); g.fillStyle = CSS.choco; g.textAlign = "center";
        g.fillText(CHIP[i], x0 + i * (sw + gap) + sw / 2, y0 + sw / 2 + 62);
        g.textAlign = "left"; g.globalAlpha = 1;
      }
    }
    font(g, 800, 92, FD); g.fillStyle = CSS.cream;
    const tA = clamp01((t - 5.6) / 0.4);
    g.globalAlpha = tA;
    g.textAlign = "center"; g.fillText("La méthode CARRÉ", w / 2, y0 + sw + 150);
    font(g, 600, 50); g.fillStyle = "#A99E92";
    g.fillText("5 blocs pour un prompt efficace", w / 2, y0 + sw + 228);
    g.textAlign = "left"; g.globalAlpha = 1;
    // input field with blinking cursor
    g.fillStyle = "#211B17"; rr(g, 60, h - 170, w - 120, 110, 26); g.fill();
    g.strokeStyle = "rgba(201,169,106,0.5)"; g.lineWidth = 4; g.stroke();
    if (Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = CSS.gold; g.fillRect(110, h - 145, 5, 60); }
  } else {
    // prompt typed into a big input card, then the five parts light up
    font(g, 700, 44); g.fillStyle = "#A99E92"; g.fillText("Ton prompt", 80, bar + 92);
    const card = { x: 50, y: bar + 120, w: w - 100, h: h - bar - 120 - 50 };
    g.fillStyle = "#1D1814"; rr(g, card.x, card.y, card.w, card.h, 30); g.fill();
    g.strokeStyle = "rgba(201,169,106,0.6)"; g.lineWidth = 4; g.stroke();
    if (!promptLayout) promptLayout = layoutPrompt(g, card.x + 60, card.y + 110, card.w - 120, 94);
    const { toks, total, space } = promptLayout;
    const nChars = Math.floor(clamp01((t - TYPE_T0) / (TYPE_T1 - TYPE_T0)) * total);
    // highlight boxes under lit segments
    const lit = LIGHT_T.map((lt) => clamp01((t - lt) / 0.22));
    LIGHT_ORDER.forEach((si, k) => {
      if (lit[k] <= 0) return;
      const current = t >= LIGHT_T[k] && (k === 4 || t < LIGHT_T[k + 1]);
      const segToks = toks.filter((tk) => tk.si === si && !tk.chip);
      g.fillStyle = `rgba(201,169,106,${(current ? 0.5 : 0.24) * lit[k]})`;
      // one rounded band per line of the segment
      const byLine = {};
      segToks.forEach((tk) => { (byLine[tk.y] = byLine[tk.y] || []).push(tk); });
      Object.values(byLine).forEach((ln) => {
        const x1 = ln[0].x - 10, x2 = ln[ln.length - 1].x + ln[ln.length - 1].ww + 10;
        rr(g, x1, ln[0].y - 64, x2 - x1, 84, 14); g.fill();
      });
    });
    font(g, 600, 62);
    let lastX = card.x + 60, lastY = card.y + 110;
    for (const tk of toks) {
      if (tk.c0 >= nChars) break;
      if (tk.chip) {
        const k = LIGHT_ORDER.indexOf(tk.si);
        const on = lit[k];
        g.fillStyle = on > 0 ? CSS.gold : "#3A302A";
        rr(g, tk.x, tk.y - 58, CHIP_W, 72, 12); g.fill();
        font(g, 800, 48, FD); g.textAlign = "center";
        g.fillStyle = on > 0 ? CSS.choco : "#8C7F73";
        g.fillText(CHIP[k], tk.x + CHIP_W / 2, tk.y - 4);
        g.textAlign = "left"; font(g, 600, 62);
        lastX = tk.x + CHIP_W; lastY = tk.y;
        continue;
      }
      const vis = tk.w.slice(0, nChars - tk.c0);
      const litK = LIGHT_ORDER.indexOf(tk.si);
      g.fillStyle = lit[litK] > 0 ? CSS.cream : "#E9E1D6";
      g.fillText(vis, tk.x, tk.y);
      lastX = tk.x + g.measureText(vis).width; lastY = tk.y;
    }
    if (t < TYPE_T1 + 0.3 || Math.floor(t * 2.4) % 2 === 0) { g.fillStyle = CSS.gold; g.fillRect(lastX + 8, lastY - 52, 5, 66); }
  }
  hubTex.tex.needsUpdate = true;
}

// ================================================================ COMPARISON SCREENS (scene 5)
const CMP = { w: 1.72, h: 2.5 };
const cmpTexL = canvasTex(860, 1250), cmpTexR = canvasTex(860, 1250);
function cmpScreen(tex) {
  const g = new THREE.Group();
  mesh(rbox(CMP.w + 0.1, CMP.h + 0.1, 0.07, 0.04), BLACK, 0, 0, -0.04, g);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(CMP.w, CMP.h), new THREE.MeshBasicMaterial({ map: tex.tex, toneMapped: false }));
  s.position.z = 0.001; g.add(s);
  screenRig.add(g);
  return g;
}
const cmpL = cmpScreen(cmpTexL), cmpR = cmpScreen(cmpTexR);
const cmpGold = mesh(rbox(CMP.w + 0.15, CMP.h + 0.15, 0.03, 0.05), GOLD, 0, 0, -0.08, cmpR);
function drawCmp(t) {
  const k = clamp01((t - 24.45) / 0.9);
  const key = t < 23.5 ? "pre" : Math.round(k * 30);
  if (cmpTexL.key === key) return;
  cmpTexL.key = cmpTexR.key = key;
  // left: vague
  {
    const { g, c } = cmpTexL; const w = c.width, h = c.height;
    g.fillStyle = "#2B2826"; g.fillRect(0, 0, w, h);
    font(g, 800, 50, FD); g.fillStyle = "#B9B1A9"; g.fillText("Demande vague", 44, 92);
    g.fillStyle = "#3D3936"; rr(g, 44, 140, w - 88, 110, 20); g.fill();
    font(g, 600, 38); g.fillStyle = "#D7D0C9"; g.fillText("« Écris un post sur l'IA. »", 72, 208);
    for (let i = 0; i < 6; i++) { const a = clamp01(k * 7 - i); g.fillStyle = `rgba(150,142,135,${0.65 * a})`; rr(g, 44, 320 + i * 64, w - 88 - (i % 3) * 120, 26, 13); g.fill(); }
    font(g, 800, 40); g.fillStyle = "#C46A4E";
    g.globalAlpha = clamp01(k * 2 - 1);
    g.fillText("✕  Générique, peu utile", 44, h - 70);
    g.globalAlpha = 1;
  }
  // right: CARRÉ, structured table
  {
    const { g, c } = cmpTexR; const w = c.width, h = c.height;
    g.fillStyle = "#14110F"; g.fillRect(0, 0, w, h);
    font(g, 800, 50, FD); g.fillStyle = CSS.gold; g.fillText("Méthode CARRÉ", 44, 92);
    CHIP.forEach((ch, i) => { g.fillStyle = CSS.gold; rr(g, 44 + i * 92, 132, 76, 76, 12); g.fill(); font(g, 800, 50, FD); g.fillStyle = CSS.choco; g.textAlign = "center"; g.fillText(ch, 44 + i * 92 + 38, 188); g.textAlign = "left"; });
    const top = 250, rowH = 110;
    for (let i = 0; i < 7; i++) {
      const a = clamp01(k * 9 - i);
      if (a <= 0) break;
      g.globalAlpha = a;
      g.fillStyle = i % 2 ? "#221C17" : "#2C241D"; g.fillRect(44, top + i * rowH, w - 88, rowH - 10);
      font(g, 800, 36, FD); g.fillStyle = CSS.gold; g.fillText(DAYS[i][0], 64, top + i * rowH + 64);
      font(g, 600, 34); g.fillStyle = CSS.cream; g.fillText(DAYS[i][1], 160, top + i * rowH + 64);
      g.globalAlpha = 1;
    }
    font(g, 800, 40); g.fillStyle = CSS.gold;
    g.globalAlpha = clamp01(k * 2 - 1);
    g.fillText("✓  Précis, prêt à publier", 44, h - 70);
    g.globalAlpha = 1;
  }
  cmpTexL.tex.needsUpdate = true; cmpTexR.tex.needsUpdate = true;
}

// ================================================================ CAMERA
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
scene.add(cam);
// world positions of the shots
const deskFocus = () => { const v = new V3(0.05, 1.05, -0.1); desk.localToWorld(v); return v; };
const DESK_P = (() => { desk.updateMatrixWorld(true); return deskFocus().toArray(); })();
const HUB_SCREEN_P = (() => { hub.updateMatrixWorld(true); const v = new V3(0, 0, 0); screenRig.localToWorld(v); return v.toArray(); })();
const stP = (i, y = 1.15) => { const p = stations[i].position; return [p.x, y, p.z]; };
const BR = brainRig.position;
const K = [
  // t, focus, sx, sy, frustum height, azimuth offset (deg), ease into this key
  { t: 0.0, P: DESK_P, sx: 0.0, sy: -0.03, h: 5.1, az: -6 },
  { t: 3.45, P: DESK_P, sx: 0.0, sy: -0.03, h: 4.8, az: -2, e: "sine" },
  { t: 4.45, P: [HUB_SCREEN_P[0] - 0.6, 1.6, HUB_SCREEN_P[2] + 0.6], sx: 0, sy: -0.06, h: 11.6, az: -6, e: "cubic" },
  { t: 6.7, P: [HUB_SCREEN_P[0] - 0.45, 1.5, HUB_SCREEN_P[2] + 0.45], sx: 0, sy: -0.05, h: 10.4, az: 0, e: "sine" },
];
STATION_T.forEach((t0, i) => {
  K.push({ t: t0 + 0.42, P: stP(i), sx: 0, sy: 0.05, h: 6.9, az: -5, e: "cubic" });
  K.push({ t: t0 + 1.92, P: stP(i), sx: 0, sy: 0.05, h: 6.5, az: 1, e: "sine" });
});
K.push({ t: 17.55, P: HUB_SCREEN_P, sx: 0, sy: 0.205, h: 7.3, az: 0, e: "cubic" });
K.push({ t: 23.85, P: HUB_SCREEN_P, sx: 0, sy: 0.205, h: 7.05, az: 0, e: "sine" });
K.push({ t: 24.35, P: HUB_SCREEN_P, sx: 0, sy: 0.07, h: 7.6, az: 0, e: "cubic" });
K.push({ t: 27.0, P: HUB_SCREEN_P, sx: 0, sy: 0.07, h: 7.4, az: 0, e: "sine" });
const EASE = { sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2, cubic: easeIO };
function shotAt(t) {
  let i = 1;
  while (i < K.length - 1 && t > K[i].t) i++;
  const a = K[i - 1], b = K[i];
  const u = clamp01((t - a.t) / (b.t - a.t));
  const e = EASE[b.e || "sine"](u);
  const L = (x, y) => x + (y - x) * e;
  return { P: new V3(L(a.P[0], b.P[0]), L(a.P[1], b.P[1]), L(a.P[2], b.P[2])), sx: L(a.sx, b.sx), sy: L(a.sy, b.sy), h: Math.exp(L(Math.log(a.h), Math.log(b.h))), az: L(a.az, b.az) };
}
function placeCamera(s) {
  const az = THREE.MathUtils.degToRad(45 + s.az);
  const dir = new V3(Math.sin(az) * Math.cos(EL), Math.sin(EL), Math.cos(az) * Math.cos(EL));
  const ww = (s.h * W) / H;
  cam.left = -ww / 2; cam.right = ww / 2; cam.top = s.h / 2; cam.bottom = -s.h / 2;
  const fwd = dir.clone().negate();
  const right = new V3().crossVectors(fwd, new V3(0, 1, 0)).normalize();
  const up = new V3().crossVectors(right, fwd).normalize();
  const target = s.P.clone().addScaledVector(right, -s.sx * ww).addScaledVector(up, -s.sy * s.h);
  cam.position.copy(target).addScaledVector(dir, 60);
  cam.lookAt(target);
  cam.updateProjectionMatrix();
}

// ================================================================ RENDER (pure function of t)
const tmpV = new V3();
function renderAt(t) {
  const endMode = t >= 27.62;
  world.visible = !endMode;
  endCard.visible = endMode;

  if (endMode) {
    // ---- logo: five cubes converge and fuse into the RILI SUCCESS cube
    const ecam = { P: new V3(60, 0.55, 60), sx: 0, sy: 0.115, h: 6.4 + (1 - smooth(27.62, 30, t)) * 0.4, az: 0 };
    placeCamera(ecam);
    const m = smooth(28.15, 28.75, t);
    endCubes.forEach((c, i) => {
      const k = spr(t, 27.62 + i * 0.07);
      const x = (i - 2) * 0.7 * (1 - m);
      c.position.set(x * SQ, 0.55 + (1 - k) * 2.2, -x * SQ);
      c.rotation.set(0, FACE_YAW, 0);
      c.scale.setScalar(Math.max(0.0001, (1 - m) * 0.95));
    });
    const lk = spr(t, 28.55, { damping: 12, stiffness: 120, mass: 1 });
    logoCube.position.set(0, 0.55, 0);
    logoCube.scale.setScalar(Math.max(0.0001, lk));
    logoCube.rotation.set(0.0, FACE_YAW + (1 - smooth(28.55, 29.3, t)) * -Math.PI * 0.5 + Math.sin(t * 0.9) * 0.04, 0);
    endLight.intensity = 2 + 2 * smooth(28.6, 29.2, t);
    renderer.render(scene, cam);
    return;
  }

  placeCamera(shotAt(t));

  // ---- scene 1: the consultant types; the screen gives a generic answer
  drawDesk(t);
  const typing = t > 0.45 && t < 1.5;
  const { arms, head, torso } = consultant.userData;
  arms.position.y = typing ? Math.abs(Math.sin(t * 22)) * 0.012 : 0;
  head.rotation.y = -0.15 + smooth(2.9, 3.4, t) * 0.12;
  head.rotation.x = smooth(2.9, 3.4, t) * -0.08;
  torso.rotation.x = smooth(2.95, 3.5, t) * 0.08; // leans back, unconvinced

  // ---- brain hologram
  brain.rotation.y = t * 0.55;
  ring.rotation.z = t * 0.8;
  const holo = 0.75 + 0.25 * Math.sin(t * 3.1);
  holoLine.opacity = 0.42 * holo + 0.18;
  beam.material.opacity = 0.07 + 0.04 * holo;

  // ---- scene 2: the interface opens, five cubes drop into a row
  const open = sprSoft(t, 4.35) * (1 - smooth(6.55, 6.95, t)) + smooth(16.85, 17.35, t);
  const openK = Math.min(1, open);
  screenBody.scale.set(Math.max(0.001, openK), Math.max(0.004, easeIO(clamp01(openK * 1.6 - 0.6))), 1);
  screenRig.visible = openK > 0.002;
  posts.forEach((p) => (p.scale.y = Math.max(0.001, openK)));
  drawHub(t);
  hubCubes.forEach((c, i) => {
    const t0 = 4.85 + i * 0.16;
    const k = spr(t, t0, { damping: 11, stiffness: 150, mass: 1 });
    // in scene 4 each cube lifts as its part of the prompt lights up
    const lift = t > 20 ? 0.16 * spr(t, LIGHT_T[i], { damping: 9, stiffness: 160, mass: 0.8 }) * (1 - smooth(23.9, 24.3, t)) : 0;
    // scene 4: the row docks right under the giant screen; scene 5: it sinks into the pedestal
    const dock = 0.6 * easeIO(smooth(17.0, 17.6, t));
    const sink = smooth(23.95, 24.35, t);
    c.position.set(c.userData.x, 0.31 + 0.28 + (1 - k) * 2.6 + lift + dock * (1 - sink) - sink * 0.62, 0.75);
    c.visible = t > t0 && sink < 0.999;
    c.rotation.set(0, (1 - k) * 1.2, (1 - k) * 0.5);
  });

  // ---- scene 3: stations rise one by one (they stay: the method builds a world)
  stations.forEach((s, i) => {
    const u = s.userData;
    const k = spr(t, u.t0 - 0.15);
    // behind the giant screen (scenes 4-5) the stations would only peek at the edges
    s.visible = t > u.t0 - 0.15 && t < 17.35;
    u.base.scale.set(Math.max(0.001, k), 1, Math.max(0.001, k));
    u.content.scale.setScalar(Math.max(0.001, spr(t, u.t0 + 0.05)));
    const ck = spr(t, u.t0 + 0.35, { damping: 10, stiffness: 140, mass: 1 });
    u.cube.scale.setScalar(Math.max(0.001, ck * 0.82));
    u.cube.position.y = 1.5 + Math.sin(t * 1.7 + i) * 0.04;
    u.cube.rotation.y = (1 - ck) * Math.PI;
  });
  // C: mini office items pop in sequence, dashboard draws
  ctxItems.forEach((o) => { const k = spr(t, 7.1 + o.userData.k * 0.07); o.scale.setScalar(Math.max(0.001, k)); });
  drawDash(t);
  // A: arrow flies in on an arc and taps the task
  drawTasks(t);
  {
    const k = clamp01((t - 9.25) / 0.55);
    const e = easeIO(k);
    const p0 = new V3(-1.9, 2.0, 0.9), p1 = new V3(1.12, 1.03, -0.1);
    tmpV.copy(p0).lerp(p1, e);
    tmpV.y += Math.sin(e * Math.PI) * 0.35;
    const tap = t > 9.8 ? Math.sin(clamp01((t - 9.8) / 0.35) * Math.PI) * 0.08 : 0;
    arrow.position.set(tmpV.x - tap, tmpV.y, tmpV.z);
    arrow.rotation.set(-0.3, 0.25 * (1 - e), -0.05 + (1 - e) * 0.7);
    arrow.scale.setScalar(Math.max(0.001, clamp01((t - 9.2) / 0.15)));
    arrow.visible = t > 9.2;
  }
  // R: the assistant materialises bottom-up, then gestures; badge snaps in
  {
    const k = smooth(11.15, 11.95, t);
    const roleWorldY = role.getWorldPosition(tmpV).y;
    clipPlane.constant = roleWorldY + 0.06 + k * 1.9;
    robot.visible = t > 11.1;
    scan.visible = t > 11.1 && t < 12.05;
    scan.position.set(0, 0.07 + k * 1.86, 0.05);
    scan.material.opacity = 1 - smooth(11.8, 12.05, t);
    robot.userData.armR.rotation.x = -0.15 * smooth(12.0, 12.5, t);
    robot.userData.armR.rotation.z = 0.35 * smooth(12.0, 12.5, t);
    robot.userData.head.rotation.y = -0.25 + 0.25 * smooth(11.9, 12.4, t);
    const bk = spr(t, 12.05);
    badge.scale.setScalar(Math.max(0.001, bk));
    badge.visible = t > 12.05;
    padRing.material.color.setHex(t > 11.1 && t < 12.2 ? 0xffe9b8 : 0xd9bb7f);
  }
  // R: the document slides out of the console and stands up
  drawDocTex(t);
  {
    const out = smooth(13.3, 13.9, t);
    const up = spr(t, 13.85, { damping: 14, stiffness: 120, mass: 1 });
    doc.position.set(0, 0.6 + up * 0.85, -0.35 + 0.45 + out * 0.45 - up * 0.25);
    doc.rotation.set(-Math.PI / 2 * (1 - up) - EL * 0.45 * up, 0, 0);
    doc.scale.set(1, Math.max(0.001, 0.25 + 0.75 * out), 1);
    doc.visible = t > 13.25;
    slotGlow.material.color.setHex(t > 13.25 && t < 14.0 ? 0xfff0c8 : 0xd8bd86);
  }
  // É: two templates step out of the screen, the gold check lands on one
  templates.forEach((m, i) => {
    const k = spr(t, 15.3 + i * 0.18);
    m.position.set(-0.48 + i * 0.96, -0.08 + (1 - k) * -0.1, 0.02 + k * 0.32);
    m.rotation.set(0, (i ? -1 : 1) * 0.12 * k, 0);
    m.scale.setScalar(Math.max(0.001, k));
    m.visible = t > 15.3 + i * 0.18;
  });
  {
    const k = spr(t, 16.05, { damping: 10, stiffness: 170, mass: 1 });
    check.position.set(-0.13, 0.36, 0.42);
    check.scale.setScalar(Math.max(0.001, k));
    check.visible = t > 16.05;
  }

  // ---- data flows: pulses travel from the hub outwards
  flows.forEach((f, fi) => {
    f.pulses.forEach((p, k) => {
      const u = (t * 0.32 + k / 3 + fi * 0.137) % 1;
      f.curve.getPointAt(u, tmpV);
      p.position.set(tmpV.x, 0.05, tmpV.z);
    });
  });

  // ---- scene 5: the giant screen splits into two comparison screens
  const split = sprSoft(t, 23.95);
  const sp = spr(t, 24.0);
  hubScreen.visible = split < 0.98;
  screenBody.visible = split < 0.98 && t < 24.3;
  goldEdge.visible = screenBody.visible;
  cmpL.visible = cmpR.visible = t > 23.95;
  const gapX = 0.98;
  cmpL.position.set(-gapX * sp, 0, 0.02);
  cmpR.position.set(gapX * sp, 0, 0.02);
  cmpL.scale.setScalar(Math.max(0.001, sp));
  cmpR.scale.setScalar(Math.max(0.001, sp));
  drawCmp(t);

  renderer.render(scene, cam);
}

// authoring aid: where does a world point land on the frame at time t?
window.__isoProject = (x, y, z, t) => {
  placeCamera(shotAt(t));
  cam.updateMatrixWorld();
  const v = new V3(x, y, z).project(cam);
  return [Math.round((v.x * 0.5 + 0.5) * W), Math.round((-v.y * 0.5 + 0.5) * H)];
};

window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
renderAt(window.__hfThreeTime || 0);
resolveReady();
