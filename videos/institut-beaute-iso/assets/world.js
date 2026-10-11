// Isometric beauty institute — the 3D world of the ad (Three.js).
// Rendered from HyperFrames time only: the runtime dispatches `hf-seek` for every frame.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/RoomEnvironment.js";

const W = 1080, H = 1920;
const V3 = THREE.Vector3;
const canvas = document.getElementById("iso");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// the set is static: draw the shadow map once (movers below don't cast)
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

// ---------- deterministic PRNG
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- palette & materials
const C = {
  ivory: 0xf8f1ea, cream: 0xfbf6f0, nude: 0xe6d2c3, beige: 0xd9c3b0, champagne: 0xeadbc2,
  blush: 0xefd5ce, blushDeep: 0xe3bdb3, wall: 0xf2e5dd, molding: 0xfaf4ef,
  hair1: 0x4a3128, hair2: 0x7a5640, hair3: 0x2e211c, skin1: 0xedc8ae, skin2: 0xc28d6c, skin3: 0xdcae8e,
  sage: 0xb3bba3,
};
const mats = {};
function mat(color, rough = 0.65, metal = 0, extra = {}) {
  const key = color + "|" + rough + "|" + metal + JSON.stringify(extra);
  // matte fabrics, walls and lacquer use cheap Lambert shading; satin/gloss/metal stay PBR
  if (!mats[key]) mats[key] = rough >= 0.5 && !metal ? new THREE.MeshLambertMaterial({ color, ...extra }) : new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  return mats[key];
}
const GOLD = new THREE.MeshStandardMaterial({ color: 0xd8b47a, metalness: 1, roughness: 0.3, envMapIntensity: 1.4 });
const GOLD_SOFT = new THREE.MeshStandardMaterial({ color: 0xd9ba86, metalness: 0.85, roughness: 0.42 });
const GLASS = (tint) => new THREE.MeshStandardMaterial({ color: tint, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.62, envMapIntensity: 1.8 });
const MIRROR = new THREE.MeshStandardMaterial({ color: 0xeef0f0, metalness: 1, roughness: 0.06, envMapIntensity: 1.2 });
const GLOW = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });

function shadowed(m, cast = true, receive = true) {
  m.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return m;
}
function mesh(geo, material, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  shadowed(m);
  parent.add(m);
  return m;
}
const rbox = (w, h, d, r = 0.06, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const cyl = (rt, rb, h, s = 40) => new THREE.CylinderGeometry(rt, rb, h, s);
const sph = (r, ws = 40, hs = 28) => new THREE.SphereGeometry(r, ws, hs);
const lathe = (pts, s = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), s);
function limb(a, b, r, material, parent = scene) {
  const A = new V3(...a), B = new V3(...b);
  const dir = new V3().subVectors(B, A);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len), 8, 16), material);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
  shadowed(m);
  parent.add(m);
  return m;
}
function archShape(w, h, y0 = 0, asPath = false) {
  const s = asPath ? new THREE.Path() : new THREE.Shape();
  const r = w / 2;
  s.moveTo(-r, y0);
  s.lineTo(-r, y0 + h - r);
  s.absarc(0, y0 + h - r, r, Math.PI, 0, true);
  s.lineTo(r, y0);
  s.lineTo(-r, y0);
  return s;
}
function archFrame(w, h, t = 0.09, depth = 0.05) {
  const outer = archShape(w + 2 * t, h + t, -t * 0.5);
  outer.holes.push(archShape(w, h, 0, true));
  return new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 40 });
}

// ---------- floor (marble) & platform
function marbleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 1024, 1024);
  grd.addColorStop(0, "#f3ebe2");
  grd.addColorStop(1, "#ece1d5");
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 1024);
  const rnd = mulberry32(11);
  for (let i = 0; i < 22; i++) {
    g.beginPath();
    let x = rnd() * 1024, y = rnd() * 1024;
    g.moveTo(x, y);
    for (let k = 0; k < 9; k++) {
      x += (rnd() - 0.35) * 170;
      y += (rnd() - 0.5) * 150;
      g.lineTo(x, y);
    }
    g.strokeStyle = `rgba(186,160,136,${0.06 + rnd() * 0.12})`;
    g.lineWidth = 0.6 + rnd() * 2.0;
    g.stroke();
  }
  g.strokeStyle = "rgba(255,255,255,0.7)";
  g.lineWidth = 2.5;
  for (let i = 0; i <= 6; i++) {
    g.beginPath(); g.moveTo(i * 170.67, 0); g.lineTo(i * 170.67, 1024); g.stroke();
    g.beginPath(); g.moveTo(0, i * 170.67); g.lineTo(1024, i * 170.67); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
const S = 13; // platform size
mesh(rbox(S, 0.6, S, 0.14), mat(0xe4cfc0, 0.8), 0, -0.3, 0);
mesh(rbox(S + 0.06, 0.05, S + 0.06, 0.02), GOLD, 0, -0.09, 0);
const floor = mesh(new THREE.PlaneGeometry(S - 0.1, S - 0.1), new THREE.MeshLambertMaterial({ map: marbleTexture() }), 0, 0.002, 0);
floor.rotation.x = -Math.PI / 2;
floor.castShadow = false;

// ---------- walls (back: z = -6.35, left: x = -6.35)
const WALL_H = 4.6, WT = 0.3;
const wallMat = mat(C.wall, 0.92);
mesh(rbox(S, WALL_H, WT, 0.04), wallMat, 0, WALL_H / 2, -S / 2 + WT / 2);
mesh(rbox(WT, WALL_H, S, 0.04), wallMat, -S / 2 + WT / 2, WALL_H / 2, 0);
// gold caps & baseboards
mesh(rbox(S + 0.02, 0.05, WT + 0.04, 0.02), GOLD, 0, WALL_H + 0.01, -S / 2 + WT / 2);
mesh(rbox(WT + 0.04, 0.05, S + 0.02, 0.02), GOLD, -S / 2 + WT / 2, WALL_H + 0.01, 0);
mesh(rbox(S - WT, 0.14, 0.06, 0.02), mat(C.molding, 0.7), WT / 2, 0.07, -S / 2 + WT + 0.03);
mesh(rbox(0.06, 0.14, S - WT, 0.02), mat(C.molding, 0.7), -S / 2 + WT + 0.03, 0.07, WT / 2);
const BACK_Z = -S / 2 + WT, LEFT_X = -S / 2 + WT;

function moldingBack(cx, cy, w, h) {
  const m = mat(C.molding, 0.75), t = 0.045, d = 0.04;
  mesh(rbox(w, t, d, 0.015), m, cx, cy + h / 2, BACK_Z + d / 2);
  mesh(rbox(w, t, d, 0.015), m, cx, cy - h / 2, BACK_Z + d / 2);
  mesh(rbox(t, h, d, 0.015), m, cx - w / 2, cy, BACK_Z + d / 2);
  mesh(rbox(t, h, d, 0.015), m, cx + w / 2, cy, BACK_Z + d / 2);
}
function moldingLeft(cz, cy, w, h) {
  const m = mat(C.molding, 0.75), t = 0.045, d = 0.04;
  mesh(rbox(d, t, w, 0.015), m, LEFT_X + d / 2, cy + h / 2, cz);
  mesh(rbox(d, t, w, 0.015), m, LEFT_X + d / 2, cy - h / 2, cz);
  mesh(rbox(d, h, t, 0.015), m, LEFT_X + d / 2, cy, cz - w / 2);
  mesh(rbox(d, h, t, 0.015), m, LEFT_X + d / 2, cy, cz + w / 2);
}
moldingBack(-3.6, 2.7, 2.6, 2.4);
moldingBack(-0.6, 2.7, 1.6, 2.4);
moldingBack(5.2, 2.7, 1.5, 2.4);
moldingLeft(-4.4, 2.7, 2.6, 2.4);
moldingLeft(4.3, 2.7, 2.2, 2.4);

// ---------- arched window on the back wall (facial zone)
{
  const g = new THREE.Group();
  g.position.set(2.6, 0.75, BACK_Z + 0.005);
  scene.add(g);
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(archShape(1.6, 3.1), 40), GLOW(0xfff7ee));
  g.add(glass);
  const fr = new THREE.Mesh(archFrame(1.6, 3.1, 0.1, 0.07), GOLD_SOFT);
  shadowed(fr);
  g.add(fr);
  mesh(rbox(0.04, 3.0, 0.05, 0.01), GOLD_SOFT, 0, 1.5, 0.03, g);
  mesh(rbox(1.6, 0.04, 0.05, 0.01), GOLD_SOFT, 0, 1.55, 0.03, g);
  mesh(rbox(1.9, 0.07, 0.24, 0.02), mat(C.molding, 0.6), 0, -0.04, 0.1, g);
}

// ---------- arched mirror on the left wall + vanity console (lash zone)
{
  const g = new THREE.Group();
  g.position.set(LEFT_X + 0.005, 1.35, -1.25);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  const mirror = new THREE.Mesh(new THREE.ShapeGeometry(archShape(1.15, 2.0), 40), MIRROR);
  mirror.position.z = 0.02;
  g.add(mirror);
  const fr = new THREE.Mesh(archFrame(1.15, 2.0, 0.08, 0.07), GOLD);
  shadowed(fr);
  g.add(fr);
  // console
  const top = mesh(rbox(0.55, 0.06, 1.5, 0.02), mat(0xf7f2ed, 0.25), LEFT_X + 0.32, 0.95, -1.25);
  for (const dz of [-0.65, 0.65]) {
    limb([LEFT_X + 0.42, 0.0, -1.25 + dz], [LEFT_X + 0.42, 0.92, -1.25 + dz], 0.022, GOLD);
    limb([LEFT_X + 0.1, 0.0, -1.25 + dz], [LEFT_X + 0.1, 0.92, -1.25 + dz], 0.022, GOLD);
  }
  mesh(rbox(0.5, 0.03, 1.42, 0.01), GOLD, LEFT_X + 0.32, 0.88, -1.25);
  // brush cup + brushes
  mesh(cyl(0.08, 0.07, 0.2), mat(C.blush, 0.5), LEFT_X + 0.3, 1.08, -0.75);
  const brushCols = [0x2b1f1a, 0xe9d3c0, 0x3a2a22, 0xd7b9a2, 0x2b1f1a];
  brushCols.forEach((bc, i) => {
    const a = (i - 2) * 0.16;
    const base = [LEFT_X + 0.3 + Math.sin(a) * 0.02, 1.05, -0.75 + Math.sin(a) * 0.03];
    const tip = [base[0] + Math.sin(a) * 0.1, 1.42 + (i % 2) * 0.05, base[2] + Math.sin(a) * 0.12];
    limb(base, tip, 0.012, mat(i % 2 ? 0xf3e8de : 0x1e1714, 0.4));
    const tuft = limb(tip, [tip[0] + Math.sin(a) * 0.02, tip[1] + 0.09, tip[2] + Math.sin(a) * 0.03], 0.026, mat(bc, 0.9));
  });
  // perfume bottles & compact
  mesh(rbox(0.14, 0.2, 0.14, 0.03), GLASS(0xf3d6cc), LEFT_X + 0.3, 1.08, -1.45);
  mesh(cyl(0.03, 0.03, 0.08), GOLD, LEFT_X + 0.3, 1.22, -1.45);
  mesh(rbox(0.1, 0.26, 0.1, 0.03), GLASS(0xf7ead8), LEFT_X + 0.34, 1.11, -1.68);
  mesh(sph(0.045), GOLD, LEFT_X + 0.34, 1.29, -1.68);
  mesh(cyl(0.1, 0.1, 0.03), GOLD, LEFT_X + 0.26, 0.995, -1.1);
}

// ---------- characters
function seatedWoman({ outfit, pants, skin, hair, hairStyle = "bun", hands, elbows, lean = 0 }) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  body.rotation.x = lean;
  g.add(body);
  const torso = new THREE.Mesh(
    lathe([[0, 0.46], [0.19, 0.48], [0.215, 0.6], [0.165, 0.82], [0.15, 0.9], [0.185, 1.06], [0.205, 1.15], [0.15, 1.235], [0.05, 1.27], [0, 1.27]]),
    mat(outfit, 0.75),
  );
  torso.scale.z = 0.78;
  shadowed(torso);
  body.add(torso);
  // collar detail
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 10, 32), GOLD_SOFT);
  collar.position.set(0, 1.25, 0.01);
  collar.rotation.x = Math.PI / 2;
  body.add(collar);
  limb([0, 1.22, 0], [0, 1.36, 0.01], 0.047, mat(skin, 0.55), body);
  const head = mesh(sph(0.135), mat(skin, 0.55), 0, 1.475, 0.02, body);
  head.scale.set(0.92, 1.1, 0.98);
  const hairM = mat(hair, 0.55);
  const cap = mesh(sph(0.143), hairM, 0, 1.5, -0.022, body);
  cap.scale.set(0.98, 1.06, 1.0);
  if (hairStyle === "bun") {
    mesh(sph(0.078), hairM, 0, 1.6, -0.13, body);
  } else {
    // low sleek ponytail
    limb([0, 1.47, -0.13], [0, 1.18, -0.2], 0.05, hairM, body);
  }
  // thighs, shins, shoes
  for (const sx of [-0.1, 0.1]) {
    limb([sx, 0.52, 0.02], [sx * 0.9, 0.52, 0.42], 0.085, mat(pants, 0.8), g);
    limb([sx * 0.9, 0.5, 0.45], [sx * 0.9, 0.09, 0.5], 0.066, mat(pants, 0.8), g);
    mesh(rbox(0.1, 0.07, 0.2, 0.03), mat(0xe9d6c6, 0.5), sx * 0.9, 0.035, 0.55, g);
  }
  const arms = new THREE.Group();
  body.add(arms);
  for (const s of [-1, 1]) {
    const sh = [0.2 * s, 1.17, 0];
    const el = [elbows[0] * s, elbows[1], elbows[2]];
    const ha = [hands[0] * s, hands[1], hands[2]];
    limb(sh, el, 0.055, mat(outfit, 0.75), arms);
    limb(el, ha, 0.042, mat(skin, 0.55), arms);
    mesh(sph(0.045), mat(skin, 0.55), ha[0], ha[1], ha[2], arms);
  }
  g.userData.arms = arms;
  g.userData.head = head;
  return g;
}
function stool(x, z) {
  mesh(cyl(0.2, 0.2, 0.09), mat(C.ivory, 0.95), x, 0.46, z);
  mesh(cyl(0.21, 0.21, 0.02), GOLD, x, 0.41, z);
  limb([x, 0.02, z], [x, 0.41, z], 0.025, GOLD);
  mesh(cyl(0.16, 0.18, 0.02), GOLD, x, 0.01, z);
}

// ---------- LASH ZONE (regard) ----------
const LASH = { x: -3.3, z: -2.9 };
mesh(cyl(1, 1, 0.02, 64), mat(0xeed8cf, 0.95), -3.4, 0.01, -2.85).scale.set(2.1, 1, 1.35);
// lash bed (head at -x)
mesh(rbox(2.2, 0.42, 0.75, 0.08), mat(C.champagne, 0.6), -3.15, 0.21, LASH.z);
mesh(rbox(2.3, 0.04, 0.84, 0.02), GOLD, -3.15, 0.02, LASH.z);
mesh(rbox(2.6, 0.24, 0.95, 0.11), mat(0xf0d9d1, 0.88), -3.15, 0.54, LASH.z);
const pillow = mesh(rbox(0.62, 0.17, 0.9, 0.08), mat(0xf6e6e0, 0.9), -4.12, 0.72, LASH.z);
pillow.rotation.z = -0.16;
// client lying (lash)
{
  const skin = mat(C.skin2, 0.55);
  const head = mesh(sph(0.185), skin, -4.2, 0.95, LASH.z);
  head.scale.set(1.05, 0.95, 0.92);
  const hair = mesh(sph(0.2), mat(C.hair3, 0.5), -4.29, 0.93, LASH.z);
  hair.scale.set(1.0, 0.95, 1.0);
  mesh(sph(0.2), mat(C.hair3, 0.5), -4.45, 0.84, LASH.z).scale.set(1.2, 0.4, 1.3);
  const band = mesh(new THREE.TorusGeometry(0.19, 0.03, 12, 40), mat(C.blush, 0.8), -4.25, 0.97, LASH.z);
  band.rotation.y = Math.PI / 2;
  band.rotation.x = 0.0;
  band.rotation.z = -0.35;
  limb([-4.02, 0.86, LASH.z], [-3.9, 0.82, LASH.z], 0.06, skin);
  limb([-3.86, 0.8, LASH.z - 0.2], [-3.86, 0.8, LASH.z + 0.2], 0.11, mat(C.blushDeep, 0.8));
  mesh(rbox(1.78, 0.22, 0.72, 0.1), mat(C.cream, 0.95), -3.0, 0.76, LASH.z);
  mesh(rbox(0.16, 0.24, 0.74, 0.06), mat(0xe8c9bf, 0.9), -3.78, 0.77, LASH.z);
  mesh(sph(0.15), mat(C.cream, 0.95), -2.1, 0.86, LASH.z - 0.11).scale.set(0.8, 1.0, 0.7);
  mesh(sph(0.15), mat(C.cream, 0.95), -2.1, 0.86, LASH.z + 0.11).scale.set(0.8, 1.0, 0.7);
}
// lash artist seated at the head
stool(-4.92, LASH.z - 0.05);
const lashArtist = seatedWoman({ outfit: 0xfbf7f2, pants: 0xe8d6c6, skin: C.skin1, hair: C.hair2, hairStyle: "bun", elbows: [0.27, 0.98, 0.25], hands: [0.08, 1.06, 0.52], lean: 0.18 });
lashArtist.position.set(-4.92, 0.0, LASH.z - 0.05);
lashArtist.rotation.y = Math.PI / 2;
scene.add(lashArtist);
// arc floor lamp, shade over the client's chest
const LAMP = { x: -3.45, y: 2.02, z: LASH.z - 0.02 };
mesh(cyl(0.2, 0.23, 0.035), GOLD, -3.25, 0.018, LASH.z - 0.95);
limb([-3.25, 0.02, LASH.z - 0.95], [-3.25, 2.25, LASH.z - 0.95], 0.024, GOLD);
{
  const arc = new THREE.QuadraticBezierCurve3(new V3(-3.25, 2.25, LASH.z - 0.95), new V3(-3.3, 2.75, LASH.z - 0.35), new V3(LAMP.x, LAMP.y + 0.16, LAMP.z));
  mesh(new THREE.TubeGeometry(arc, 40, 0.02, 10, false), GOLD);
}
const shade = mesh(new THREE.SphereGeometry(0.2, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8b47a, metalness: 1, roughness: 0.3, side: THREE.DoubleSide }), LAMP.x, LAMP.y, LAMP.z);
shade.scale.y = 0.8;
const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xfff1df, toneMapped: false, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const lampGlow = new THREE.Mesh(new THREE.CircleGeometry(0.18, 40), lampGlowMat);
lampGlow.rotation.x = Math.PI / 2;
lampGlow.position.set(LAMP.x, LAMP.y + 0.005, LAMP.z);
scene.add(lampGlow);
// little side table with lash tray
{
  const x = -4.55, z = -1.75;
  limb([x, 0.02, z], [x, 0.72, z], 0.03, GOLD);
  mesh(cyl(0.2, 0.24, 0.02), GOLD, x, 0.01, z);
  mesh(cyl(0.34, 0.34, 0.04), mat(0xf8f3ee, 0.25), x, 0.75, z);
  mesh(rbox(0.36, 0.03, 0.24, 0.02), mat(C.blush, 0.5), x, 0.785, z);
  for (let i = 0; i < 4; i++) mesh(cyl(0.025, 0.025, 0.09), i % 2 ? GOLD : GLASS(0xeccfc4), x - 0.12 + i * 0.08, 0.84, z);
}
// pampas vase (corner)
function pampasVase(x, z, h = 1.0, color = 0xf3ece4, seed = 3) {
  const v = mesh(lathe([[0, 0], [0.16, 0.0], [0.24, 0.15], [0.26, 0.35], [0.2, 0.6], [0.11, 0.78], [0.12, 0.86], [0, 0.86]].map(([r, y]) => [r * h, y * h])), mat(color, 0.45), x, 0, z);
  const rnd = mulberry32(seed);
  const stems = [];
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2, s = 0.25 + rnd() * 0.45;
    const g = new THREE.Group();
    g.position.set(x, 0.8 * h, z);
    scene.add(g);
    const top = [Math.cos(a) * s, 0.9 + rnd() * 0.7, Math.sin(a) * s];
    limb([0, 0, 0], top, 0.008, mat(0xcbb294, 0.8), g);
    const plume = limb(top, [top[0] * 1.25, top[1] + 0.32, top[2] * 1.25], 0.07, mat(0xeadbc6, 1), g);
    plume.scale.set(1, 1, 0.7);
    g.userData.phase = rnd() * 6.28;
    stems.push(g);
  }
  return stems;
}
const sway = [];
sway.push(...pampasVase(-5.65, -5.6, 1.05, 0xf4ede6, 3));

// ---------- FACIAL ZONE (peau) ----------
const FACE = { x: 3.1, z: -2.9 };
mesh(cyl(1, 1, 0.02, 64), mat(0xefe2d6, 0.95), 3.1, 0.01, -2.85).scale.set(2.2, 1, 1.4);
mesh(rbox(2.3, 0.44, 0.78, 0.08), mat(0xf6efe7, 0.55), 3.15, 0.22, FACE.z);
mesh(rbox(2.4, 0.04, 0.86, 0.02), GOLD, 3.15, 0.02, FACE.z);
mesh(rbox(2.7, 0.2, 0.94, 0.1), mat(0xfffaf5, 0.85), 3.15, 0.53, FACE.z);
mesh(rbox(2.0, 0.02, 0.96, 0.01), mat(C.blush, 0.9), 3.35, 0.64, FACE.z);
mesh(rbox(0.6, 0.14, 0.86, 0.07), mat(0xfffbf7, 0.9), 2.15, 0.69, FACE.z);
// client lying (facial) — head at -x, facing up toward the camera
let faceMask;
{
  const skin = mat(C.skin3, 0.55);
  const head = mesh(sph(0.185), skin, 2.13, 0.92, FACE.z);
  head.scale.set(1.05, 0.95, 0.92);
  // towel turban
  const turban = mesh(sph(0.215), mat(0xfffcf8, 0.95), 2.0, 0.95, FACE.z);
  turban.scale.set(0.95, 1.0, 1.08);
  const fold = mesh(new THREE.TorusGeometry(0.19, 0.04, 12, 40), mat(0xfffcf8, 0.95), 2.08, 0.97, FACE.z);
  fold.rotation.y = Math.PI / 2;
  fold.rotation.z = -0.4;
  // cream mask (applied during scene 3)
  faceMask = new THREE.Mesh(new THREE.SphereGeometry(0.192, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), new THREE.MeshStandardMaterial({ color: 0xfbe9e2, roughness: 0.45, transparent: true, opacity: 0 }));
  faceMask.position.set(2.17, 0.93, FACE.z);
  faceMask.rotation.z = -0.35;
  faceMask.scale.set(1.05, 0.95, 0.92);
  scene.add(faceMask);
  limb([2.32, 0.84, FACE.z], [2.44, 0.8, FACE.z], 0.06, skin);
  limb([2.46, 0.79, FACE.z - 0.21], [2.46, 0.79, FACE.z + 0.21], 0.11, mat(0xfbf7f2, 0.85));
  mesh(rbox(1.8, 0.22, 0.74, 0.1), mat(0xeccfc7, 0.92), 3.32, 0.75, FACE.z);
  mesh(rbox(0.15, 0.24, 0.76, 0.06), mat(0xfbf7f2, 0.9), 2.52, 0.76, FACE.z);
  mesh(sph(0.15), mat(0xeccfc7, 0.92), 4.22, 0.85, FACE.z - 0.11).scale.set(0.8, 1.0, 0.7);
  mesh(sph(0.15), mat(0xeccfc7, 0.92), 4.22, 0.85, FACE.z + 0.11).scale.set(0.8, 1.0, 0.7);
}
stool(1.42, FACE.z - 0.05);
const facialist = seatedWoman({ outfit: 0xf3e2d8, pants: 0xf3e2d8, skin: C.skin1, hair: C.hair1, hairStyle: "pony", elbows: [0.27, 0.98, 0.24], hands: [0.09, 1.04, 0.5], lean: 0.2 });
facialist.position.set(1.42, 0, FACE.z - 0.05);
facialist.rotation.y = Math.PI / 2;
scene.add(facialist);
// trolley with skincare
{
  const x = 1.75, z = -4.55;
  for (const [dx, dz] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) limb([x + dx, 0.06, z + dz], [x + dx, 0.95, z + dz], 0.018, GOLD);
  mesh(rbox(0.82, 0.04, 0.54, 0.02), mat(0xf8f3ee, 0.3), x, 0.95, z);
  mesh(rbox(0.82, 0.04, 0.54, 0.02), mat(0xf8f3ee, 0.3), x, 0.42, z);
  mesh(rbox(0.82, 0.12, 0.5, 0.04), mat(C.blush, 0.9), x, 0.5, z);
  for (const [dx, dz] of [[-0.35, -0.22], [0.35, -0.22], [-0.35, 0.22], [0.35, 0.22]]) mesh(sph(0.04), GOLD, x + dx, 0.04, z + dz);
  // products on top
  mesh(cyl(0.07, 0.07, 0.2), GLASS(0xe8b9a6), x - 0.25, 1.07, z);
  mesh(cyl(0.025, 0.03, 0.05), GOLD, x - 0.25, 1.2, z);
  mesh(sph(0.04), mat(C.blushDeep, 0.6), x - 0.25, 1.25, z);
  mesh(cyl(0.09, 0.09, 0.09), mat(0xfffaf5, 0.35), x, 1.015, z + 0.08);
  mesh(cyl(0.092, 0.092, 0.04), GOLD, x, 1.08, z + 0.08);
  mesh(rbox(0.09, 0.26, 0.09, 0.03), mat(0xf1e4d8, 0.35), x + 0.22, 1.1, z - 0.06);
  mesh(cyl(0.02, 0.02, 0.07), GOLD, x + 0.22, 1.26, z - 0.06);
  mesh(cyl(0.12, 0.12, 0.03), mat(0xf6e7df, 0.5), x + 0.2, 0.985, z + 0.15);
}
// wall shelf with products (right of window)
{
  const y = 2.1, x = 4.95, z = BACK_Z + 0.2;
  mesh(rbox(1.3, 0.06, 0.36, 0.02), mat(0xf8f3ee, 0.4), x, y, z);
  mesh(rbox(1.3, 0.02, 0.37, 0.01), GOLD, x, y - 0.04, z);
  const items = [
    [-0.48, 0.24, 0x0, "pump"], [-0.24, 0.16, 0x0, "jar"], [0.0, 0.3, 0x0, "bottle"], [0.24, 0.2, 0x0, "drop"], [0.46, 0.14, 0x0, "jar2"],
  ];
  for (const [dx, h, , kind] of items) {
    if (kind === "jar" || kind === "jar2") {
      mesh(cyl(0.08, 0.08, h * 0.6), mat(kind === "jar" ? 0xfffaf5 : C.blush, 0.35), x + dx, y + 0.03 + h * 0.3, z);
      mesh(cyl(0.082, 0.082, 0.04), GOLD, x + dx, y + 0.05 + h * 0.6, z);
    } else if (kind === "drop") {
      mesh(cyl(0.05, 0.05, h), GLASS(0xe9b7a4), x + dx, y + 0.03 + h / 2, z);
      mesh(cyl(0.02, 0.025, 0.05), GOLD, x + dx, y + 0.06 + h, z);
      mesh(sph(0.032), mat(C.blushDeep, 0.6), x + dx, y + 0.11 + h, z);
    } else {
      mesh(rbox(0.11, h, 0.11, 0.035), mat(kind === "pump" ? 0xf1e4d8 : 0xfbf6f0, 0.35), x + dx, y + 0.03 + h / 2, z);
      mesh(cyl(0.02, 0.02, 0.07), GOLD, x + dx, y + 0.06 + h, z);
    }
  }
}
// pendant lamp over the facial bed
const pendantY = 3.15;
limb([3.1, WALL_H + 0.6, FACE.z], [3.1, pendantY + 0.25, FACE.z], 0.008, GOLD);
mesh(cyl(0.06, 0.12, 0.08), GOLD, 3.1, pendantY + 0.24, FACE.z);
const globe = new THREE.Mesh(sph(0.26), new THREE.MeshStandardMaterial({ color: 0xfff6ec, emissive: 0xffe8cc, emissiveIntensity: 0.9, roughness: 0.4 }));
globe.position.set(3.1, pendantY, FACE.z);
scene.add(globe);
const pendantLight = new THREE.PointLight(0xffe6c8, 1.2, 4.5, 2);
pendantLight.position.set(3.1, pendantY - 0.3, FACE.z);
scene.add(pendantLight);
// olive tree in the back-right corner
{
  const x = 5.7, z = -5.55;
  mesh(lathe([[0, 0], [0.26, 0], [0.32, 0.5], [0.3, 0.56], [0, 0.56]]), mat(0xf2e9df, 0.6), x, 0, z);
  limb([x, 0.5, z], [x - 0.08, 1.6, z + 0.05], 0.035, mat(0x9a8170, 0.9));
  const rnd = mulberry32(21);
  const crown = new THREE.Group();
  crown.position.set(x - 0.08, 1.85, z + 0.05);
  scene.add(crown);
  for (let i = 0; i < 14; i++) {
    const m = mesh(sph(0.2 + rnd() * 0.12, 20, 14), mat(i % 3 ? C.sage : 0xa6b096, 0.9), (rnd() - 0.5) * 0.7, (rnd() - 0.3) * 0.6, (rnd() - 0.5) * 0.7, crown);
    m.scale.y = 0.75;
  }
  crown.userData.phase = 1.3;
  sway.push(crown);
}

// ---------- RECEPTION (front-left) ----------
{
  const x = -3.3, z = 2.4;
  mesh(rbox(2.6, 0.95, 0.82, 0.06), mat(C.champagne, 0.6), x, 0.5, z);
  for (let i = 0; i < 17; i++) {
    mesh(cyl(0.072, 0.072, 0.86, 20), mat(0xf1e4d2, 0.55), x - 1.2 + i * 0.15, 0.48, z + 0.39);
  }
  mesh(rbox(2.8, 0.08, 1.0, 0.03), mat(0xfaf6f1, 0.22), x, 1.0, z);
  mesh(rbox(2.62, 0.04, 0.86, 0.01), GOLD, x, 0.02, z);
  // gift boxes
  mesh(rbox(0.36, 0.22, 0.3, 0.02), mat(C.blush, 0.7), x + 0.8, 1.15, z - 0.05);
  mesh(rbox(0.38, 0.02, 0.06, 0.005), GOLD, x + 0.8, 1.15, z - 0.05);
  mesh(rbox(0.26, 0.16, 0.22, 0.02), mat(0xfbf7f2, 0.7), x + 0.78, 1.34, z - 0.05);
  mesh(rbox(0.04, 0.17, 0.23, 0.005), GOLD, x + 0.78, 1.34, z - 0.05);
  // bud vase with blush blooms
  mesh(lathe([[0, 0], [0.09, 0], [0.11, 0.14], [0.04, 0.3], [0.05, 0.34], [0, 0.34]]), GLASS(0xf2dcd2), x - 0.8, 1.04, z);
  const rnd = mulberry32(5);
  for (let i = 0; i < 4; i++) {
    const top = [x - 0.8 + (rnd() - 0.5) * 0.3, 1.6 + rnd() * 0.22, z + (rnd() - 0.5) * 0.3];
    limb([x - 0.8, 1.3, z], top, 0.008, mat(0x9fa88d, 0.8));
    mesh(sph(0.07, 20, 14), mat(i % 2 ? 0xf2cfc6 : 0xfbefe9, 0.8), ...top);
  }
  // card stand
  mesh(rbox(0.22, 0.14, 0.03, 0.01), GOLD, x - 0.2, 1.11, z + 0.2).rotation.x = -0.3;
}
// round mirror on the left wall above the reception
{
  const g = new THREE.Group();
  g.position.set(LEFT_X + 0.02, 2.75, 2.3);
  g.rotation.y = Math.PI / 2;
  scene.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), MIRROR);
  disc.position.z = 0.03;
  g.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.05, 16, 80), GOLD);
  rim.position.z = 0.04;
  shadowed(rim);
  g.add(rim);
}
sway.push(...pampasVase(-5.55, 4.9, 1.15, 0xeadbc8, 9));
// bouclé armchair helper
function armchair(x, z, rot, color = 0xf7f1ea) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  scene.add(g);
  const m = mat(color, 1);
  mesh(rbox(1.0, 0.36, 0.92, 0.16), m, 0, 0.3, 0, g);
  mesh(rbox(0.86, 0.14, 0.78, 0.07), m, 0, 0.52, 0.04, g);
  mesh(rbox(1.04, 0.72, 0.26, 0.13), m, 0, 0.64, -0.36, g);
  mesh(rbox(0.22, 0.5, 0.86, 0.1), m, -0.44, 0.48, 0.0, g);
  mesh(rbox(0.22, 0.5, 0.86, 0.1), m, 0.44, 0.48, 0.0, g);
  for (const [dx, dz] of [[-0.38, -0.34], [0.38, -0.34], [-0.38, 0.34], [0.38, 0.34]]) limb([dx, 0.0, dz], [dx, 0.13, dz], 0.025, GOLD, g);
  return g;
}
armchair(-1.4, 4.9, -0.6, 0xf5ede4);

// ---------- LOUNGE (front-right) ----------
mesh(cyl(1.7, 1.7, 0.02, 80), mat(0xf0e0d6, 0.95), 3.2, 0.01, 3.1);
armchair(2.25, 2.35, Math.PI * 0.25 + 0.15, 0xf8f2eb);
armchair(4.3, 4.05, Math.PI * 1.25 - 0.1, 0xf1dfd7);
// coffee table
{
  const x = 3.25, z = 3.15;
  limb([x, 0.02, z], [x, 0.42, z], 0.06, GOLD);
  mesh(cyl(0.3, 0.34, 0.03), GOLD, x, 0.015, z);
  mesh(cyl(0.55, 0.55, 0.05, 64), mat(0xfaf6f2, 0.2), x, 0.45, z);
  mesh(cyl(0.56, 0.56, 0.02, 64), GOLD, x, 0.42, z);
  // candle
  mesh(cyl(0.08, 0.08, 0.18), mat(0xfbf3ea, 0.6), x + 0.2, 0.565, z - 0.12);
  mesh(cyl(0.095, 0.095, 0.02), GOLD, x + 0.2, 0.48, z - 0.12);
  // tray with cups
  mesh(rbox(0.42, 0.025, 0.3, 0.012), GOLD, x - 0.15, 0.49, z + 0.15);
  mesh(cyl(0.06, 0.045, 0.07), mat(0xfffaf6, 0.3), x - 0.25, 0.54, z + 0.12);
  mesh(cyl(0.06, 0.045, 0.07), mat(0xfffaf6, 0.3), x - 0.05, 0.54, z + 0.2);
  mesh(cyl(0.05, 0.05, 0.005), mat(0xd9b59a, 0.2), x - 0.25, 0.576, z + 0.12);
}
const flame = new THREE.Mesh(sph(0.03, 16, 12), GLOW(0xffd9a0));
flame.position.set(3.45, 0.7, 3.03);
flame.scale.set(0.8, 1.9, 0.8);
scene.add(flame);
// client relaxing in the armchair, cup in hand
const lounger = seatedWoman({ outfit: 0xf3d9d0, pants: 0xf3d9d0, skin: C.skin3, hair: C.hair2, hairStyle: "pony", elbows: [0.26, 0.86, 0.12], hands: [0.08, 1.0, 0.3], lean: -0.12 });
lounger.position.set(2.32, 0.08, 2.42);
lounger.rotation.y = Math.PI * 0.25 + 0.15;
scene.add(lounger);
const cup = mesh(cyl(0.055, 0.042, 0.07), mat(0xfffaf6, 0.3), 0, 1.04, 0.3, lounger.userData.arms);
// product podiums (front-right corner, out of the skin-care close-up)
{
  const pods = [[5.35, 4.7, 0.9, C.blush], [5.65, 5.45, 0.55, 0xf6eee6], [4.95, 5.55, 0.35, C.champagne]];
  for (const [x, z, h, c] of pods) {
    mesh(cyl(0.3, 0.3, h, 48), mat(c, 0.5), x, h / 2, z);
    mesh(cyl(0.31, 0.31, 0.02, 48), GOLD, x, h, z);
  }
  // hero products on podiums
  mesh(cyl(0.09, 0.09, 0.32), GLASS(0xeab8a6), 5.35, 0.9 + 0.17, 4.7);
  mesh(cyl(0.03, 0.035, 0.07), GOLD, 5.35, 1.27, 4.7);
  mesh(sph(0.05), mat(C.blushDeep, 0.6), 5.35, 1.34, 4.7);
  mesh(cyl(0.14, 0.14, 0.12), mat(0xfffaf5, 0.3), 5.65, 0.55 + 0.07, 5.45);
  mesh(cyl(0.142, 0.142, 0.05), GOLD, 5.65, 0.55 + 0.155, 5.45);
  mesh(rbox(0.13, 0.36, 0.13, 0.04), mat(0xf1e4d8, 0.3), 4.95, 0.35 + 0.19, 5.55);
  mesh(cyl(0.025, 0.025, 0.1), GOLD, 4.95, 0.35 + 0.42, 5.55);
}
// tall plant against the back wall, between the two studios
{
  const x = 0.35, z = -5.75;
  mesh(lathe([[0, 0], [0.22, 0], [0.3, 0.45], [0.28, 0.5], [0, 0.5]]), mat(0xe9d6c6, 0.6), x, 0, z);
  const rnd = mulberry32(31);
  const g = new THREE.Group();
  g.position.set(x, 0.5, z);
  scene.add(g);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rnd() * 0.3, s = 0.25 + rnd() * 0.3, hgt = 0.6 + rnd() * 0.8;
    const tip = [Math.cos(a) * s, hgt, Math.sin(a) * s];
    limb([0, 0, 0], tip, 0.01, mat(0x9fa88d, 0.8), g);
    const leaf = mesh(sph(0.16, 18, 12), mat(i % 2 ? C.sage : 0xa3ad94, 0.85), tip[0], tip[1], tip[2], g);
    leaf.scale.set(1.2, 0.35, 0.7);
    leaf.rotation.y = -a;
    leaf.rotation.z = 0.4;
  }
  g.userData.phase = 2.2;
  sway.push(g);
}

// ---------- floating gold motes (deterministic)
const MOTES = 70;
const moteGeo = sph(0.028, 10, 8);
const moteMat = new THREE.MeshBasicMaterial({ color: 0xf0d6a4, toneMapped: false, transparent: true, opacity: 0.85 });
const motes = new THREE.InstancedMesh(moteGeo, moteMat, MOTES);
scene.add(motes);
const moteSeed = [];
{
  const rnd = mulberry32(77);
  for (let i = 0; i < MOTES; i++) moteSeed.push([(rnd() - 0.5) * 12, 0.3 + rnd() * 4.5, (rnd() - 0.5) * 12, rnd() * 6.28, 0.6 + rnd() * 0.8]);
}
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new V3(), tmpP = new V3();

// ---------- skincare hero objects (camera space, scene 3)
// Laid out for a frame 8 units tall (4.5 wide); the group is rescaled with the zoom.
const hero = new THREE.Group();
const heroItems = [];
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,247,238,0.95)");
  grd.addColorStop(0.45, "rgba(252,232,220,0.55)");
  grd.addColorStop(1, "rgba(252,232,220,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const glowMat = new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, toneMapped: false });
function heroItem(build, x, y, z, delay, glow = 0) {
  const g = new THREE.Group();
  const inner = new THREE.Group();
  g.add(inner);
  build(inner);
  if (glow) {
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(glow, glow), glowMat);
    halo.position.set(0, 0.45, -2.5);
    g.add(halo);
  }
  g.position.set(x, y, z);
  g.userData = { x, y, delay };
  hero.add(g);
  heroItems.push(g);
  return g;
}
const serumMat = new THREE.MeshStandardMaterial({ color: 0xeeb39d, roughness: 0.04, metalness: 0.05, transparent: true, opacity: 0.8, envMapIntensity: 2.2 });
const sparkle = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
function drop(g, s) {
  const m = new THREE.Mesh(lathe([[0, 0], [0.07, 0.02], [0.11, 0.08], [0.12, 0.15], [0.09, 0.24], [0.04, 0.33], [0, 0.4]], 32), serumMat);
  g.add(m);
  const hl = new THREE.Mesh(sph(0.028, 12, 10), sparkle);
  hl.position.set(-0.045, 0.14, 0.09);
  hl.scale.set(0.8, 1.4, 0.5);
  g.add(hl);
  g.scale.setScalar(s);
}
// serum dropper bottle
heroItem((g) => {
  g.add(new THREE.Mesh(lathe([[0, 0], [0.24, 0], [0.27, 0.06], [0.27, 0.62], [0.2, 0.74], [0.11, 0.8], [0, 0.8]]), GLASS(0xf0c2b2)));
  g.add(new THREE.Mesh(lathe([[0, 0.03], [0.23, 0.03], [0.24, 0.46], [0, 0.46]]), mat(0xe9a98f, 0.2, 0, { transparent: true, opacity: 0.88 })));
  const collar = new THREE.Mesh(cyl(0.13, 0.13, 0.16), GOLD); collar.position.y = 0.86; g.add(collar);
  const bulb = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.18, 8, 20), mat(0xf2d6cc, 0.45)); bulb.position.y = 1.08; g.add(bulb);
  const label = new THREE.Mesh(cyl(0.272, 0.272, 0.16, 48, 1, true), mat(0xfbf3ec, 0.45)); label.position.y = 0.36; g.add(label);
}, -1.3, -2.5, -25, 0.0, 2.4);
// open cream jar — the swirl pipes in like a soft-serve texture
let swirl, swirlCount;
heroItem((g) => {
  g.add(new THREE.Mesh(lathe([[0, 0], [0.42, 0], [0.46, 0.05], [0.46, 0.36], [0.42, 0.4], [0, 0.4]]), mat(0xfffaf5, 0.25)));
  g.add(new THREE.Mesh(cyl(0.462, 0.462, 0.07, 48, 1, true), GOLD)).position.y = 0.33;
  const bed = new THREE.Mesh(cyl(0.4, 0.4, 0.04, 48), mat(0xf6e2d8, 0.45)); bed.position.y = 0.41; g.add(bed);
  const pts = [];
  const N = 90;
  for (let k = 0; k <= N; k++) {
    const u = k / N;
    const a = u * Math.PI * 2 * 2.3;
    const r = 0.3 * Math.pow(1 - u, 0.7) + 0.02;
    pts.push(new V3(Math.cos(a) * r, 0.47 + u * 0.2, Math.sin(a) * r));
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.075, 18, false);
  swirl = new THREE.Mesh(geo, mat(0xfaeee8, 0.42));
  swirlCount = geo.index.count;
  g.add(swirl);
}, 1.2, -2.8, -25, 0.25, 2.6);
// floating serum drops
heroItem((g) => drop(g, 1.15), -1.75, -0.95, -24, 0.45);
heroItem((g) => drop(g, 0.85), 1.85, -1.3, -24, 0.6);
heroItem((g) => drop(g, 0.65), 0.05, -3.25, -24, 0.75);
// a drop falls into the jar, then a ripple
const fallDrop = new THREE.Group();
drop(fallDrop, 0.75);
hero.add(fallDrop);
const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: 0xfffaf4, transparent: true, opacity: 0.8, toneMapped: false }));
ripple.rotation.x = Math.PI / 2 - 0.38;
hero.add(ripple);

// things that move never cast shadows, so the one-time shadow map stays exact
for (const o of [lashArtist.userData.arms, facialist.userData.arms, lounger.userData.arms, ...sway]) {
  o.traverse((m) => { if (m.isMesh) m.castShadow = false; });
}

// ---------- lights
scene.add(new THREE.HemisphereLight(0xfff5ec, 0xe8d2c4, 1.5));
// soft bounce light (the matte Lambert surfaces get no environment lighting)
scene.add(new THREE.AmbientLight(0xfff3ea, 0.75));
const sun = new THREE.DirectionalLight(0xfff0e2, 2.3);
sun.position.set(-5.5, 12, 7.5);
sun.target.position.set(0, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 40 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.025;
sun.shadow.radius = 5;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xffe2d4, 0.55);
fill.position.set(9, 5, 3);
scene.add(fill);

// ---------- camera & shots
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 200);
scene.add(cam);
cam.add(hero);
const keys = [
  // t, focus P, sx, sy, frustum height, azimuth (deg)
  { t: 0.0, P: [-0.4, 1.0, -0.4], sx: 0, sy: -0.17, h: 40, az: -16 },
  { t: 4.0, P: [-0.4, 1.0, -0.4], sx: 0, sy: -0.2, h: 31, az: -7, ease: "sine" },
  { t: 5.7, P: [-3.75, 0.95, -2.65], sx: -0.07, sy: 0.0, h: 8.4, az: -4, ease: "cubic" },
  { t: 11.0, P: [-3.75, 0.95, -2.65], sx: -0.07, sy: 0.0, h: 7.3, az: 5, ease: "sine" },
  { t: 12.7, P: [2.75, 0.95, -2.85], sx: 0, sy: -0.02, h: 8.6, az: -5, ease: "cubic" },
  { t: 18.0, P: [2.75, 0.95, -2.85], sx: 0, sy: -0.02, h: 7.6, az: 3, ease: "sine" },
  { t: 19.9, P: [-0.4, 1.0, -0.4], sx: 0, sy: -0.13, h: 30, az: -14, ease: "cubic" },
  { t: 23.0, P: [-0.4, 1.0, -0.4], sx: 0, sy: -0.13, h: 29, az: 10, ease: "sine" },
  { t: 24.6, P: [-0.4, 1.0, -0.4], sx: 0, sy: 0.03, h: 42, az: 0, ease: "cubic" },
  { t: 30.0, P: [-0.4, 1.0, -0.4], sx: 0, sy: 0.03, h: 39, az: 4, ease: "sine" },
];
const easeF = {
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  cubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
};
function shotAt(t) {
  let i = 1;
  while (i < keys.length - 1 && t > keys[i].t) i++;
  const a = keys[i - 1], b = keys[i];
  const u = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
  const e = easeF[b.ease || "sine"](u);
  const lerp = (x, y) => x + (y - x) * e;
  return {
    P: new V3(lerp(a.P[0], b.P[0]), lerp(a.P[1], b.P[1]), lerp(a.P[2], b.P[2])),
    sx: lerp(a.sx, b.sx), sy: lerp(a.sy, b.sy),
    h: Math.exp(lerp(Math.log(a.h), Math.log(b.h))),
    az: lerp(a.az, b.az),
  };
}
const EL = THREE.MathUtils.degToRad(32);
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
  return s.h;
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, t) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const backOut = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

function renderAt(t) {
  const h = placeCamera(shotAt(t));

  // ambient life
  for (const g of sway) g.rotation.z = Math.sin(t * 0.9 + (g.userData.phase || 0)) * 0.025;
  const breathe = Math.sin(t * 2.2) * 0.02;
  lashArtist.userData.arms.rotation.x = -0.02 + Math.sin(t * 1.6) * 0.03;
  facialist.userData.arms.rotation.x = -0.02 + Math.sin(t * 1.3 + 1) * 0.035;
  lounger.userData.arms.rotation.x = -0.05 + smooth(19.0, 20.6, t) * -0.12 + smooth(21.2, 22.6, t) * 0.12;
  flame.scale.y = 1.9 + Math.sin(t * 9.1) * 0.18 + Math.sin(t * 13.7) * 0.1;

  // the arc lamp warms up during the lash scene
  const lampOn = smooth(4.6, 5.8, t) * (1 - smooth(11.0, 12.0, t));
  lampGlowMat.opacity = 0.55 + 0.45 * lampOn;
  pendantLight.intensity = 1.1 + 0.8 * smooth(11.4, 12.6, t) * (1 - smooth(18, 19, t));

  // gold motes drift
  const moteVis = 0.55 + 0.45 * (1 - smooth(4.5, 5.5, t) + smooth(18.2, 19.4, t));
  for (let i = 0; i < MOTES; i++) {
    const [x, y, z, ph, sp] = moteSeed[i];
    tmpP.set(x + Math.sin(t * 0.3 * sp + ph) * 0.3, ((y + t * 0.12 * sp) % 4.8) + 0.2, z + Math.cos(t * 0.25 * sp + ph) * 0.3);
    const tw = 0.6 + 0.4 * Math.sin(t * 2 * sp + ph * 3);
    tmpS.setScalar(Math.max(0.0001, tw * Math.min(1, moteVis)));
    tmpM.compose(tmpP, tmpQ, tmpS);
    motes.setMatrixAt(i, tmpM);
  }
  motes.instanceMatrix.needsUpdate = true;

  // face mask appears during the skin scene
  const maskK = smooth(13.4, 14.4, t);
  faceMask.visible = maskK > 0.001;
  faceMask.material.opacity = 0.95 * maskK;

  // hero skincare objects (camera space, scaled with the frame)
  const heroOn = t > 11.6 && t < 19.0;
  hero.visible = heroOn;
  if (heroOn) {
    hero.scale.setScalar(h / 8);
    const out = smooth(17.7, 18.5, t);
    for (const g of heroItems) {
      const k = clamp01((t - 12.0 - g.userData.delay) / 0.9);
      const s = Math.max(0.0001, backOut(k) * (1 - out));
      g.scale.setScalar(s);
      g.position.y = g.userData.y + Math.sin(t * 1.3 + g.userData.delay * 7) * 0.06 - (1 - k) * 0.4 + out * 0.6;
      const spin = g.userData.delay < 0.4 ? t * 0.3 + g.userData.delay * 4 : 0;
      g.children[0].rotation.set(0.38, spin, 0.06);
    }
    // the cream swirl pipes into the jar
    const sw = smooth(12.7, 14.0, t);
    swirl.geometry.setDrawRange(0, Math.max(0, Math.floor((swirlCount * sw) / 3) * 3));
    swirl.visible = sw > 0.002;
    // a serum drop falls onto the swirl at ~15s, then a soft ripple
    const f = clamp01((t - 14.4) / 0.55);
    fallDrop.visible = t > 14.4 && t < 14.95;
    fallDrop.position.set(1.2, -0.75 - 1.4 * f * f, -24.5);
    const r = clamp01((t - 14.95) / 1.1);
    ripple.visible = t > 14.95 && t < 16.05;
    ripple.position.set(1.2, -2.38 + Math.sin(t * 1.3 + 0.25 * 7) * 0.06, -24.4);
    ripple.scale.setScalar(0.4 + 1.6 * r);
    ripple.material.opacity = 0.85 * (1 - r);
  }

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
