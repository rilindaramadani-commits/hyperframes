// Props, modelled at real-world scale (metres): premium skincare packaging, the skin block,
// shelves, tray, mirror, calendar, hourglass, eucalyptus vase, bookmark and sky elements.
import {
  THREE, PAL, ENV, satin, satinU, lacquer, METAL, METAL_DARK, glass, emissive, mesh, group, rbox, cyl, sph, lathe, torus,
  plinthGeo, travertine, oak, labelCanvas, canvasTexture, glowSprite, contactShadow, clamp01, lerp, mulberry32, SANS, SERIF,
} from "./core.js";

// ---------------------------------------------------------------- packaging
const LIQ = {
  serum: 0xf1c3ae,
  retinol: 0xd59447,
  vitc: 0xf2a54a,
  toner: 0xe4dcf2,
  oil: 0xe0b25e,
  exfoliant: 0xe7efdf,
};
const liquidMat = (c) => satin(c, 0.18);
const WHITE_GLOSS = lacquer(0xf8f4ee, 0.32, 0.5);
const CREAM_GLOSS = lacquer(0xf3ebe0, 0.3, 0.6);

function band(parent, r, y, h, art, arc = Math.PI * 0.75, scaleZ = 1) {
  const tex = canvasTexture(art);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, h, 48, 1, true, -arc / 2, arc),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.55, metalness: 0, depthWrite: false }),
  );
  m.position.y = y;
  m.scale.z = scaleZ;
  m.renderOrder = 3;
  parent.add(m);
  return m;
}
function dropperTop(g, y, bulbMat) {
  mesh(lathe([[0, 0], [0.0138, 0], [0.0142, 0.002], [0.0142, 0.016], [0.0125, 0.0185], [0, 0.0185]], 40), METAL, 0, y, 0, g);
  mesh(lathe([[0, 0], [0.0102, 0], [0.0106, 0.006], [0.0098, 0.02], [0.0068, 0.029], [0.0025, 0.0315], [0, 0.0318]], 40), bulbMat, 0, y + 0.018, 0, g);
}

/**
 * A skincare product standing on y = 0. kind: serum | retinol | vitc | cleanser | cream | spf | toner | exfoliant | oil | mask | generic.
 * opt.label: printed name; opt.seed: variation for generic.
 */
export function product(kind, opt = {}) {
  const g = new THREE.Group();
  let H = 0.1;
  let R = 0.026;
  const lab = (name, sub, r, y, h, extra = {}) => band(g, r, y, h, labelCanvas({ name, sub, ...extra }), extra.arc || Math.PI * 0.7, extra.scaleZ || 1);
  switch (kind) {
    case "serum":
    case "retinol":
    case "vitc": {
      const tint = { serum: 0xf0c4b6, retinol: 0xa3561f, vitc: 0xe39033 }[kind];
      const frost = kind === "serum" ? 0.28 : 0.06;
      const r = kind === "vitc" ? 0.022 : 0.026;
      const bh = kind === "vitc" ? 0.066 : 0.078;
      mesh(lathe([[0, 0], [r - 0.002, 0], [r, 0.003], [r, bh - 0.012], [r - 0.004, bh - 0.004], [0.0125, bh], [0.0115, bh + 0.008], [0, bh + 0.008]], 48), glass({ tint, dist: kind === "serum" ? 0.3 : 0.035, frost, thickness: 0.006 }), 0, 0, 0, g, { cast: false });
      mesh(cyl(r - 0.003, r - 0.003, bh * 0.55, 40), liquidMat(LIQ[kind]), 0, 0.003 + bh * 0.275, 0, g, { cast: true });
      dropperTop(g, bh + 0.002, kind === "serum" ? WHITE_GLOSS : lacquer(kind === "retinol" ? 0x2d2420 : 0xf8f4ee, 0.35, 0.4));
      if (opt.label) lab(opt.label, kind === "retinol" ? "0,3 %" : kind === "vitc" ? "15 %" : "hydratation", r + 0.0006, bh * 0.45, bh * 0.42, { ink: kind === "serum" ? "#5a4434" : "#fdf8f1", bg: null });
      H = bh + 0.052;
      R = r;
      break;
    }
    case "cleanser": {
      mesh(plinthGeo(0.03, 0.135, 0.008, 48), WHITE_GLOSS, 0, 0, 0, g);
      mesh(cyl(0.0125, 0.013, 0.012, 32), METAL, 0, 0.141, 0, g);
      mesh(cyl(0.0045, 0.0045, 0.022, 16), METAL, 0, 0.158, 0, g);
      mesh(rbox(0.032, 0.012, 0.016, 0.005), METAL, 0.006, 0.172, 0, g);
      mesh(cyl(0.003, 0.003, 0.018, 12), METAL, 0.026, 0.174, 0, g).rotation.z = Math.PI / 2;
      if (opt.label) lab(opt.label, "gel doux", 0.0306, 0.07, 0.06, { ink: "#5a4434" });
      H = 0.18;
      R = 0.03;
      break;
    }
    case "cream": {
      mesh(lathe([[0, 0], [0.043, 0], [0.045, 0.004], [0.045, 0.04], [0.043, 0.044], [0, 0.044]], 64), CREAM_GLOSS, 0, 0, 0, g);
      mesh(plinthGeo(0.0455, 0.024, 0.006, 64), METAL, 0, 0.043, 0, g);
      if (opt.label) lab(opt.label, "crème", 0.0456, 0.022, 0.03, { ink: "#5a4434", arc: Math.PI * 0.6 });
      H = 0.068;
      R = 0.046;
      break;
    }
    case "spf": {
      mesh(plinthGeo(0.0175, 0.024, 0.004, 40), lacquer(0xf6f1ea, 0.3, 0.5), 0, 0, 0, g);
      const tube = mesh(lathe([[0, 0], [0.0205, 0], [0.0215, 0.012], [0.021, 0.085], [0.0175, 0.11], [0.0035, 0.122], [0, 0.122]], 48), lacquer(0xfaf6f0, 0.4, 0.3), 0, 0.022, 0, g);
      tube.scale.z = 0.6;
      mesh(rbox(0.044, 0.01, 0.007, 0.002), lacquer(0xfaf6f0, 0.4, 0.3), 0, 0.146, 0, g);
      const art = labelCanvas({ name: "SPF 50", sub: "protection", ink: "#a37b4c", serif: false, w: 512, h: 384 });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.034, 0.0255), new THREE.MeshStandardMaterial({ map: canvasTexture(art), transparent: true, roughness: 0.5, depthWrite: false }));
      p.position.set(0, 0.075, 0.0128);
      p.renderOrder = 3;
      g.add(p);
      H = 0.152;
      R = 0.021;
      break;
    }
    case "toner": {
      mesh(lathe([[0, 0], [0.026, 0], [0.028, 0.004], [0.028, 0.118], [0.022, 0.13], [0.011, 0.136], [0.011, 0.145], [0, 0.145]], 48), glass({ tint: 0xeee6f6, dist: 0.6, frost: 0.03, thickness: 0.006 }), 0, 0, 0, g, { cast: false });
      mesh(cyl(0.025, 0.025, 0.09, 40), liquidMat(LIQ.toner), 0, 0.048, 0, g);
      mesh(plinthGeo(0.0165, 0.026, 0.004, 40), METAL, 0, 0.142, 0, g);
      if (opt.label) lab(opt.label, "lotion", 0.0286, 0.065, 0.05, { ink: "#5a4434" });
      H = 0.168;
      R = 0.028;
      break;
    }
    case "exfoliant": {
      mesh(rbox(0.056, 0.128, 0.034, 0.008), glass({ tint: 0xe6efe0, dist: 0.5, frost: 0.32, thickness: 0.008 }), 0, 0.064, 0, g, { cast: false });
      mesh(rbox(0.05, 0.085, 0.028, 0.006), liquidMat(LIQ.exfoliant), 0, 0.046, 0, g);
      mesh(plinthGeo(0.013, 0.03, 0.004, 32), lacquer(0xf6f1ea, 0.35, 0.4), 0, 0.127, 0, g);
      if (opt.label) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(0.046, 0.032), new THREE.MeshStandardMaterial({ map: canvasTexture(labelCanvas({ name: opt.label, sub: "AHA · BHA", ink: "#5a4434", w: 512, h: 356 })), transparent: true, roughness: 0.5, depthWrite: false }));
        p.position.set(0, 0.07, 0.0175);
        p.renderOrder = 3;
        g.add(p);
      }
      H = 0.157;
      R = 0.03;
      break;
    }
    case "oil": {
      mesh(lathe([[0, 0], [0.026, 0], [0.034, 0.02], [0.035, 0.04], [0.028, 0.062], [0.011, 0.075], [0.0105, 0.083], [0, 0.083]], 48), glass({ tint: 0xe9c27a, dist: 0.12, frost: 0.03, thickness: 0.008 }), 0, 0, 0, g, { cast: false });
      mesh(new THREE.SphereGeometry(0.03, 32, 16, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), liquidMat(LIQ.oil), 0, 0.034, 0, g);
      mesh(plinthGeo(0.0135, 0.026, 0.004, 32), METAL, 0, 0.08, 0, g);
      H = 0.106;
      R = 0.035;
      break;
    }
    case "mask": {
      mesh(lathe([[0, 0], [0.036, 0], [0.038, 0.004], [0.038, 0.05], [0.036, 0.054], [0, 0.054]], 56), lacquer(0xe9b7a6, 0.4, 0.4), 0, 0, 0, g);
      mesh(plinthGeo(0.0385, 0.02, 0.005, 56), lacquer(0xf8f4ee, 0.3, 0.5), 0, 0.053, 0, g);
      H = 0.073;
      R = 0.038;
      break;
    }
    default: {
      // generic shelf products: seeded silhouettes and tints
      const rnd = mulberry32(opt.seed || 1);
      const kinds = ["serum", "toner", "cream", "exfoliant", "oil", "cleanser", "mask", "vitc"];
      return product(kinds[Math.floor(rnd() * kinds.length)], { ...opt, seed: undefined });
    }
  }
  const sh = contactShadow(R * 1.9, 0.5);
  sh.position.y = 0.0008;
  g.add(sh);
  g.shadow = sh;
  g.H = H;
  g.R = R;
  g.kind = kind;
  return g;
}

// ---------------------------------------------------------------- the skin block (stylised cross-section, premium finish)
function sideArt() {
  // cut faces: thin epidermis, wavy junction, rosé dermis with fine fibres, cream hypodermis with soft lobules
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, "#efc3b4");
  grd.addColorStop(0.36, "#e6ae9e");
  grd.addColorStop(0.5, "#eccdb9");
  grd.addColorStop(0.62, "#f1dfcc");
  grd.addColorStop(1, "#e7d0b8");
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  // epidermis band with papillae
  g.fillStyle = "#f6dcd1";
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(512, 0);
  g.lineTo(512, 40);
  for (let x = 512; x >= 0; x -= 8) g.lineTo(x, 40 + Math.sin(x / 512 * Math.PI * 9) * 9);
  g.closePath();
  g.fill();
  const rnd = mulberry32(17);
  g.strokeStyle = "rgba(255,236,228,0.3)";
  g.lineWidth = 2;
  for (let k = 0; k < 14; k++) {
    const y = 70 + rnd() * 150;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 24) g.lineTo(x, y + Math.sin(x / 46 + k * 1.7) * 5);
    g.stroke();
  }
  for (let k = 0; k < 40; k++) {
    const x = rnd() * 512;
    const y = 300 + rnd() * 200;
    const r = 18 + rnd() * 16;
    g.strokeStyle = "rgba(200,166,132,0.2)";
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(x, y, r, r * 0.84, 0, 0, Math.PI * 2);
    g.stroke();
  }
  return canvasTexture(c);
}
export function skinBlock(size = 0.26, seed = 3) {
  const g = new THREE.Group();
  const s = size;
  // body (dermis + hypodermis) with the illustrated cut faces
  const sideMat = satinU(0xffffff, 0.62, { map: sideArt() });
  const topMat = satinU(0xefb7a7, 0.5);
  const body = mesh(rbox(s, s * 0.6, s, s * 0.035, 4), [sideMat, sideMat, topMat, topMat, sideMat, sideMat], 0, s * 0.3, 0, g);
  // epidermis plate
  const epi = mesh(rbox(s * 0.995, s * 0.035, s * 0.995, s * 0.012, 3), satinU(0xf7dacf, 0.45), 0, s * 0.62, 0, g);
  // irritation glow under the tiles + halo
  const glowM = new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL.coral).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const glowSheet = mesh(new THREE.PlaneGeometry(s * 0.96, s * 0.96), glowM, 0, s * 0.641, 0, g, { cast: false, receive: false });
  glowSheet.rotation.x = -Math.PI / 2;
  const halo = glowSprite(0xffa894, s * 3.0, 0);
  halo.position.y = s * 0.7;
  g.add(halo);
  // pearly tiles (stratum corneum)
  const N = 6;
  const tw = (s * 0.97) / N;
  const tileM = new THREE.MeshPhysicalMaterial({ color: 0xf9eee6, roughness: 0.22, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.08, sheen: 0.5, sheenColor: new THREE.Color(0xffd6c6), iridescence: 0.45, iridescenceIOR: 1.35, envMap: ENV, envMapIntensity: 0.8 });
  const tileGeo = rbox(tw * 0.93, s * 0.026, tw * 0.93, tw * 0.09, 2);
  const rnd = mulberry32(seed);
  const tiles = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = (i - (N - 1) / 2) * tw;
      const z = (j - (N - 1) / 2) * tw;
      const m = mesh(tileGeo, tileM, x, s * 0.651, z, g, { cast: true });
      m.tile = { x, z, ry: rnd() - 0.5, rl: rnd() };
      tiles.push(m);
    }
  // fine cracks between tiles (soft coral light)
  const crackM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe0705c).multiplyScalar(1.3), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const path = [[-3, -1], [-2, -1], [-1, 0], [0, 0], [0, -1], [1, -2], [2, -2], [3, -2]];
  const cracks = [];
  for (let k = 0; k < path.length - 1; k++) {
    const [ax, az] = path[k];
    const [bx, bz] = path[k + 1];
    const len = Math.hypot(bx - ax, bz - az) * tw;
    const c = mesh(new THREE.BoxGeometry(len, s * 0.05, s * 0.006), crackM, ((ax + bx) / 2) * tw, s * 0.655, ((az + bz) / 2) * tw, g, { cast: false, receive: false });
    c.rotation.y = -Math.atan2(bz - az, bx - ax);
    cracks.push(c);
  }
  // amber pigment spots inside the dermis (seen on the faces and through the top)
  const dotM = new THREE.MeshStandardMaterial({ color: PAL.amber, roughness: 0.5, transparent: true, opacity: 0 });
  const dots = [];
  for (let k = 0; k < 9; k++) {
    const d = mesh(sph(s * 0.04, 16, 12), dotM, (rnd() - 0.5) * s * 0.8, s * 0.6 + s * 0.012, (rnd() - 0.5) * s * 0.8, g, { cast: false });
    d.scale.set(1, 0.3, 1);
    d.at = rnd();
    dots.push(d);
  }
  // SPF film: iridescent nacre veil
  const filmM = new THREE.MeshPhysicalMaterial({ color: PAL.nacre, roughness: 0.08, metalness: 0, transmission: 0.6, thickness: 0.004, iridescence: 1, iridescenceIOR: 1.35, transparent: true, opacity: 0, clearcoat: 1, envMap: ENV, envMapIntensity: 1.2 });
  const film = mesh(rbox(s * 1.03, s * 0.025, s * 1.03, s * 0.012, 3), filmM, 0, s * 0.7, 0, g, { cast: false });
  film.scale.set(0.01, 1, 0.01);

  g.size = s;
  g.topY = s * 0.69;
  g.set = (st = {}) => {
    const { lift = 0, gap = 0, glow = 0, crack = 0, dots: dt = 0, dull = 0, film: fl = 0, ripple = 0, rippleT = 0 } = st;
    for (const m of tiles) {
      const u = m.tile;
      const out = 1 + gap * 0.08;
      const wave = ripple * Math.sin(Math.hypot(u.x, u.z) * (60 / s) * 0.26 - rippleT * 16) * Math.exp(-rippleT * 2.4);
      m.position.set(u.x * out, s * 0.651 + lift * s * 0.05 * u.rl + wave * s * 0.02, u.z * out);
      m.rotation.set(lift * 0.22 * (u.rl - 0.5), lift * 0.5 * u.ry, lift * 0.22 * (0.5 - u.rl));
    }
    glowM.opacity = 0.75 * glow;
    halo.material.opacity = 0.55 * glow;
    crackM.opacity = clamp01(crack);
    cracks.forEach((c, k) => (c.scale.x = Math.max(0.001, clamp01(crack * cracks.length - k))));
    dots.forEach((d) => {
      const a = clamp01((dt - d.at * 0.6) / 0.4);
      d.scale.set(Math.max(0.001, a), 0.3 * Math.max(0.001, a), Math.max(0.001, a));
    });
    dotM.opacity = clamp01(dt * 2);
    tileM.color.setHex(0xf9eee6).lerp(new THREE.Color(0xd8c9bb), dull);
    tileM.roughness = 0.22 + 0.45 * dull;
    tileM.sheen = 0.5 * (1 - dull);
    filmM.opacity = 0.75 * clamp01(fl * 1.5);
    const fs = 0.01 + 0.99 * clamp01(fl);
    film.scale.set(fs, 1, fs);
  };
  g.set({});
  return g;
}

// ---------------------------------------------------------------- stone + wood pieces
export const stoneMat = (seed = 3, tone, rough = 0.78, repeat) => {
  const t = travertine(seed, tone, repeat);
  if (rough >= 0.75) return new THREE.MeshLambertMaterial({ map: t.map });
  return new THREE.MeshStandardMaterial({ map: t.map, roughnessMap: t.rough, roughness: rough, metalness: 0, envMap: ENV, envMapIntensity: 0.35 });
};
export const oakMat = (seed = 9, repeat) => new THREE.MeshStandardMaterial({ map: oak(seed, repeat).map, roughness: 0.58, metalness: 0 });

/** Floating shelf that can sag under weight (bend along x). */
export function shelf(w, d, t, mat) {
  const geo = new THREE.BoxGeometry(w, t, d, 32, 1, 1);
  const base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.bend = (amount) => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i] / (w / 2);
      p[i + 1] = base[i + 1] - amount * (1 - x * x);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return m;
}

/** Morning tray with four shallow round recesses. */
export function tray(slots = 4, pitch = 0.11) {
  const g = new THREE.Group();
  const w = pitch * slots + 0.04;
  mesh(rbox(w, 0.018, 0.12, 0.008, 3), stoneMat(23, [236, 228, 218], 0.6), 0, 0.009, 0, g);
  const pos = [];
  for (let k = 0; k < slots; k++) {
    const x = -w / 2 + 0.02 + pitch * (k + 0.5);
    mesh(cyl(0.036, 0.036, 0.002, 48), satin(0xe2d6c7, 0.7), x, 0.0185, 0, g, { cast: false });
    pos.push(x);
  }
  g.slotX = pos;
  g.topY = 0.0195;
  return g;
}
/** Dotted ring marking the missing step. */
export function dottedRing(r = 0.04, n = 16) {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL.bronze).multiplyScalar(1.15), toneMapped: false, transparent: true });
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const d = mesh(rbox(0.009, 0.0015, 0.0035, 0.001, 1), m, Math.cos(a) * r, 0, Math.sin(a) * r, g, { cast: false, receive: false });
    d.rotation.y = -a + Math.PI / 2;
  }
  g.mat = m;
  return g;
}

/** Round mirror with a thin brass frame (faces +z). */
export function mirror(r = 0.3) {
  const g = new THREE.Group();
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const grd = x.createLinearGradient(0, 0, 256, 256);
  grd.addColorStop(0, "#f4eee7");
  grd.addColorStop(0.45, "#e2d8cc");
  grd.addColorStop(0.62, "#efe7dd");
  grd.addColorStop(1, "#d6cabd");
  x.fillStyle = grd;
  x.fillRect(0, 0, 256, 256);
  x.globalAlpha = 0.5;
  x.fillStyle = "#fffaf3";
  x.beginPath();
  x.moveTo(40, 256);
  x.lineTo(110, 256);
  x.lineTo(256, 110);
  x.lineTo(256, 60);
  x.fill();
  const glassM = new THREE.MeshPhysicalMaterial({ map: canvasTexture(c), roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMap: ENV, envMapIntensity: 0.6 });
  mesh(cyl(r, r, 0.01, 72), glassM, 0, 0, 0, g, { cast: false }).rotation.x = Math.PI / 2;
  mesh(torus(r + 0.006, 0.008, 12, 96), METAL, 0, 0, 0.004, g, { cast: false });
  return g;
}

// ---------------------------------------------------------------- flip calendar (paper pages with serif numerals)
function pageCanvas(head, big, check = false) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 640;
  const g = c.getContext("2d");
  g.fillStyle = "#fbf8f3";
  g.beginPath();
  g.roundRect(0, 0, 512, 640, 26);
  g.fill();
  g.fillStyle = "#a37b4c";
  g.font = `600 54px ${SANS}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(head.split("").join(String.fromCharCode(8202, 8202)), 256, 110);
  g.fillStyle = "rgba(163,123,76,0.4)";
  g.fillRect(196, 160, 120, 3);
  g.fillStyle = "#2e231c";
  g.font = `600 330px ${SERIF}`;
  g.fillText(big, 256, 390);
  if (check) {
    g.strokeStyle = "#7f9b7c";
    g.lineWidth = 6;
    g.beginPath();
    g.arc(256, 572, 38, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 8;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(238, 573);
    g.lineTo(251, 586);
    g.lineTo(275, 558);
    g.stroke();
  }
  return c;
}
export function calendar(pages) {
  const g = new THREE.Group();
  const PW = 0.12;
  const PH = 0.15;
  mesh(rbox(0.14, 0.012, 0.07, 0.004), stoneMat(31, [226, 214, 198], 0.7), 0, 0.006, 0, g);
  const easel = mesh(rbox(0.13, 0.17, 0.006, 0.004), satin(0xd9c7b1, 0.7), 0, 0.095, -0.022, g);
  easel.rotation.x = -0.2;
  const stack = group(g, 0, 0.175, -0.012);
  stack.rotation.x = -0.2;
  for (let k = 0; k < 4; k++) {
    const ring = mesh(torus(0.006, 0.0016, 8, 20), METAL, -0.039 + k * 0.026, 0.002, 0, stack, { cast: false });
    ring.rotation.y = Math.PI / 2;
  }
  const sheets = pages.map((p, i) => {
    const hinge = group(stack, 0, 0, 0.002 + (pages.length - i) * 0.0008);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: canvasTexture(pageCanvas(p.head, p.big, p.check)), side: THREE.DoubleSide, roughness: 0.85 }));
    m.position.y = -PH / 2 - 0.004;
    m.castShadow = true;
    hinge.add(m);
    return hinge;
  });
  /** p: number of pages turned (fractional = mid-flip). */
  g.set = (p) => {
    sheets.forEach((h, i) => {
      const f = clamp01(p - i);
      h.rotation.x = -Math.PI * 0.95 * (f * f * (3 - 2 * f));
      h.visible = f < 0.999;
    });
  };
  g.set(0);
  return g;
}

// ---------------------------------------------------------------- hourglass (brass + glass + sand)
export function hourglass() {
  const g = new THREE.Group();
  const body = group(g, 0, 0.085, 0); // pivot at the waist
  for (const y of [-0.078, 0.078]) mesh(plinthGeo(0.042, 0.008, 0.003, 40), METAL, 0, y - 0.004, 0, body);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    mesh(cyl(0.0025, 0.0025, 0.15, 10), METAL, Math.cos(a) * 0.035, 0, Math.sin(a) * 0.035, body, { cast: false });
  }
  const prof = [[0.0, -0.074], [0.028, -0.07], [0.031, -0.05], [0.022, -0.022], [0.004, 0], [0.022, 0.022], [0.031, 0.05], [0.028, 0.07], [0, 0.074]];
  mesh(lathe(prof, 48), glass({ tint: 0xffffff, dist: 1, frost: 0.02, thickness: 0.003 }), 0, 0, 0, body, { cast: false });
  const sandM = satin(0xe0bd84, 0.85);
  const top = mesh(lathe([[0, 0], [0.026, 0.024], [0, 0.024]], 32), sandM, 0, 0.004, 0, body, { cast: false });
  const bottom = mesh(lathe([[0, 0], [0.028, 0], [0, 0.034]], 32), sandM, 0, -0.07, 0, body, { cast: false });
  const stream = mesh(cyl(0.0012, 0.0012, 0.066, 6), sandM, 0, -0.035, 0, body, { cast: false });
  g.set = (amountTop, flowing, flip = 0) => {
    const a = clamp01(amountTop);
    top.scale.set(Math.max(0.01, Math.sqrt(a)), Math.max(0.01, a), Math.max(0.01, Math.sqrt(a)));
    top.position.y = 0.004 + (1 - a) * 0.008;
    const b = 1 - a;
    bottom.scale.set(Math.max(0.01, 0.3 + 0.7 * Math.sqrt(b)), Math.max(0.01, b), Math.max(0.01, 0.3 + 0.7 * Math.sqrt(b)));
    stream.visible = !!flowing && a > 0.02;
    body.rotation.z = flip;
  };
  g.set(1, false, 0);
  return g;
}

// ---------------------------------------------------------------- ceramic vase with eucalyptus stems
export function eucalyptus(seed = 4, h = 0.42, vaseColor = 0xe8ddd0) {
  const g = new THREE.Group();
  mesh(lathe([[0, 0], [0.05, 0], [0.065, 0.04], [0.06, 0.11], [0.035, 0.15], [0.03, 0.17], [0.034, 0.18], [0, 0.18]], 48), satin(vaseColor, 0.55), 0, 0, 0, g);
  const rnd = mulberry32(seed);
  const leafM = satin(0x9aae97, 0.6, { side: THREE.DoubleSide });
  const leafM2 = satin(0xa9baa3, 0.6, { side: THREE.DoubleSide });
  const stemM = satin(0x8b8f74, 0.7);
  const leafGeo = new THREE.CircleGeometry(0.018, 14);
  const stems = [];
  for (let s = 0; s < 5; s++) {
    const stem = group(g, 0, 0.17, 0);
    stem.rotation.y = s * 1.3 + rnd();
    stem.rotation.z = 0.12 + rnd() * 0.32;
    const L = h * (0.7 + rnd() * 0.45);
    mesh(cyl(0.0016, 0.002, L, 6), stemM, 0, L / 2, 0, stem, { cast: false });
    for (let k = 1; k < 9; k++) {
      const y = (k / 9) * L;
      for (const side of [-1, 1]) {
        const lf = mesh(leafGeo, k % 2 ? leafM : leafM2, side * 0.014, y, 0, stem, { cast: true });
        lf.rotation.set(0.3 * side, side * 0.6 + k, side * 0.4);
        lf.scale.setScalar(1 - k * 0.06);
      }
    }
    stems.push(stem);
  }
  g.set = (grow) => stems.forEach((s, i) => s.scale.setScalar(Math.max(0.001, clamp01(grow * 1.3 - i * 0.06))));
  return g;
}

// ---------------------------------------------------------------- bookmark (the « save » icon)
export function bookmark(w = 0.16, h = 0.21) {
  const s = new THREE.Shape();
  const r = 0.022;
  s.moveTo(-w / 2 + r, h / 2);
  s.lineTo(w / 2 - r, h / 2);
  s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(0, -h / 2 + h * 0.26);
  s.lineTo(-w / 2, -h / 2);
  s.lineTo(-w / 2, h / 2 - r);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 4, curveSegments: 12 });
  geo.translate(0, 0, -0.011);
  const m = new THREE.MeshPhysicalMaterial({ color: 0xf8f3ec, roughness: 0.3, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.1, envMap: ENV, envMapIntensity: 1 });
  const g = new THREE.Group();
  const icon = mesh(geo, m, 0, 0, 0, g);
  const gold = new THREE.Color(0xc9a46a);
  const ivory = new THREE.Color(0xf8f3ec);
  g.set = (press, fill) => {
    icon.scale.set(1 + 0.05 * press, 1 - 0.08 * press, 1 - 0.35 * press);
    const f = clamp01(fill);
    m.color.copy(ivory).lerp(gold, f);
    m.metalness = 0.95 * f;
    m.roughness = 0.3 - 0.06 * f;
  };
  g.set(0, 0);
  return g;
}

// ---------------------------------------------------------------- sky: dome, sun, UV beams, cloud
export function sun(r = 0.32) {
  const g = new THREE.Group();
  mesh(sph(r, 40, 24), emissive(0xfff3da, 1.6), 0, 0, 0, g, { cast: false, receive: false });
  const h1 = glowSprite(0xffe2b0, r * 9, 0.75);
  const h2 = glowSprite(0xfff4e0, r * 3.6, 0.9);
  g.add(h1, h2);
  return g;
}
let beamTex = null;
export function uvBeam(len, width = 0.05) {
  if (!beamTex) {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 256;
    const x = c.getContext("2d");
    const grd = x.createLinearGradient(0, 0, 64, 0);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.5, "rgba(255,255,255,1)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = grd;
    x.fillRect(0, 0, 64, 256);
    const fade = x.createLinearGradient(0, 0, 0, 256);
    fade.addColorStop(0, "rgba(0,0,0,0.0)");
    fade.addColorStop(0.15, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0.25)");
    x.globalCompositeOperation = "destination-out";
    x.fillStyle = fade;
    x.fillRect(0, 0, 64, 256);
    beamTex = new THREE.CanvasTexture(c);
  }
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ map: beamTex, color: new THREE.Color(PAL.lilac).multiplyScalar(1.4), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  // two crossed planes read as a soft volumetric beam from any angle
  const planes = [0, Math.PI / 2].map((ry) => {
    const p = mesh(new THREE.PlaneGeometry(width, len), m, 0, -len / 2, 0, g, { cast: false, receive: false });
    p.rotation.y = ry;
    return p;
  });
  const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xd9d2ff).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const photons = [];
  for (let k = 0; k < 3; k++) photons.push(mesh(new THREE.CapsuleGeometry(width * 0.16, width * 1.6, 4, 8), pm, 0, 0, 0, g, { cast: false, receive: false }));
  g.set = (op, t, reach = 1) => {
    m.opacity = 0.7 * op;
    pm.opacity = 0.85 * op;
    const R = clamp01(reach);
    planes.forEach((p) => {
      p.scale.y = Math.max(0.001, R);
      p.position.y = (-len * R) / 2;
    });
    photons.forEach((p, k) => {
      const f = ((t * 0.8 + k / photons.length) % 1) * R;
      p.position.y = -f * len;
      p.visible = f > 0.03 && op > 0.01;
    });
  };
  g.set(0, 0, 0);
  return g;
}
export function cloud(seed = 8, s = 1) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, transparent: true, opacity: 0.96 });
  const rnd = mulberry32(seed);
  [[0, 0, 0, 0.3], [0.3, -0.04, 0.04, 0.24], [-0.3, -0.06, 0.02, 0.22], [0.13, 0.15, -0.04, 0.21], [-0.14, 0.12, 0.05, 0.2]].forEach(([x, y, z, r]) => {
    mesh(sph(r * s, 28, 18), m, x * s, y * s, z * s, g, { cast: false, receive: false }).scale.y = 0.8 + rnd() * 0.1;
  });
  g.mat = m;
  return g;
}
export function skyDome(radius = 6, tex) {
  const m = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, toneMapped: true, depthWrite: false });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), m);
  dome.renderOrder = -5;
  return dome;
}
/** Soft light shaft (additive gradient card), e.g. morning light through a window. */
let shaftTex = null;
export function lightShaft(w, h, color = 0xfff2dc, op = 0.35) {
  if (!shaftTex) {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 256;
    const x = c.getContext("2d");
    const grd = x.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = grd;
    x.fillRect(0, 0, 128, 256);
    const side = x.createLinearGradient(0, 0, 128, 0);
    side.addColorStop(0, "rgba(0,0,0,1)");
    side.addColorStop(0.25, "rgba(0,0,0,0)");
    side.addColorStop(0.75, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,1)");
    x.globalCompositeOperation = "destination-out";
    x.fillStyle = side;
    x.fillRect(0, 0, 128, 256);
    shaftTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.MeshBasicMaterial({ map: shaftTex, color, transparent: true, opacity: op, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  p.renderOrder = 8;
  return p;
}

// ---------------------------------------------------------------- golden drop
export function drop(r = 0.012, color = 0xe2b25c) {
  const geo = lathe([[0, 0], [r * 0.62, r * 0.18], [r * 0.95, r * 0.75], [r, r * 1.2], [r * 0.78, r * 1.8], [r * 0.32, r * 2.4], [0, r * 2.7]], 32);
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.05, metalness: 0, transmission: 0.35, thickness: r, ior: 1.4, clearcoat: 1, transparent: true, opacity: 0.95, envMap: ENV, envMapIntensity: 1.2 });
  return mesh(geo, m, 0, 0, 0, null, { cast: false });
}

export { contactShadow };
