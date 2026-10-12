// The four sets, built at real-world scale (metres):
//  - LAB: a soft studio cyclorama with a monolithic travertine table and three round plinths (01, 02, 03)
//  - D1/D2/D3: round stages with an arched backdrop, one per error.
// Each diorama splits into `set` (cloned as the miniature on its plinth) and `env` (studio shell, not cloned).
import {
  THREE, PAL, satin, satinU, lacquer, METAL, glass, emissive, mesh, group, rbox, cyl, sph, lathe, torus, plinthGeo, plaster, skyTexture, mulberry32,
} from "./core.js";
import {
  product, skinBlock, stoneMat, oakMat, shelf, tray, dottedRing, mirror, calendar, hourglass, eucalyptus, bookmark, sun, uvBeam, cloud, skyDome, lightShaft, drop,
} from "./props.js";

export const STAGE_X = { lab: 0, d1: 100, d2: 200, d3: 300 };
export const STAGE_R = 1.35; // radius of a diorama platform
export const ISLAND_R = 0.26; // radius of a plinth on the lab table
export const MINI = 0.18; // miniature scale of a diorama on its plinth

// ---------------------------------------------------------------- studio shell
/** Seamless cyclorama: floor, cove and back wall (profile swept along x). */
function cyclorama(parent, color, { width = 24, front = 8, back = 4.5, cove = 1.6, height = 9 } = {}) {
  const prof = [];
  prof.push([0, front]);
  prof.push([0, -back]);
  for (let k = 1; k <= 12; k++) {
    const a = (k / 12) * (Math.PI / 2);
    prof.push([cove - Math.cos(a) * cove, -back - Math.sin(a) * cove]);
  }
  prof.push([height, -back - cove]);
  const segX = 2;
  const pos = [];
  const uv = [];
  const idx = [];
  prof.forEach(([y, z], i) => {
    for (let j = 0; j <= segX; j++) {
      pos.push(-width / 2 + (j / segX) * width, y, z);
      uv.push(j / segX, i / (prof.length - 1));
    }
  });
  for (let i = 0; i < prof.length - 1; i++)
    for (let j = 0; j < segX; j++) {
      const a = i * (segX + 1) + j;
      const b = a + segX + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const m = mesh(geo, satin(color, 0.92), 0, 0, 0, parent, { cast: false, receive: true });
  return m;
}
/** Arched panel (flat, faces +z) with optional rectangular-arched niche cut-out. */
function archShape(w, h, r = w / 2) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h - r);
  s.absarc(0, h - r, r, 0, Math.PI, false);
  s.lineTo(-w / 2, 0);
  return s;
}
function archPanel(parent, w, h, depth, mat, hole = null) {
  const s = archShape(w, h);
  if (hole) {
    const p = new THREE.Path();
    const { w: hw, h: hh, y } = hole;
    p.moveTo(-hw / 2, y);
    p.lineTo(-hw / 2, y + hh - hw / 2);
    p.absarc(0, y + hh - hw / 2, hw / 2, Math.PI, 0, true);
    p.lineTo(hw / 2, y);
    p.lineTo(-hw / 2, y);
    s.holes.push(p);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 48 });
  // planar uv in metres for the plaster texture
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 1.6 + 0.5, p.getY(i) / 1.6);
  const m = mesh(geo, mat, 0, 0, -depth / 2, parent);
  return m;
}
function roundStage(parent, topMat, baseColor) {
  const R = STAGE_R;
  mesh(plinthGeo(R, 0.07, 0.012, 96), topMat, 0, -0.07, 0, parent, { cast: false });
  mesh(cyl(R - 0.06, R - 0.03, 0.22, 96), satin(baseColor, 0.8), 0, -0.18, 0, parent, { cast: false });
  mesh(torus(R - 0.002, 0.004, 8, 160), METAL, 0, -0.035, 0, parent, { cast: false }).rotation.x = Math.PI / 2;
}

// ======================================================================= LAB
export function buildLab() {
  const S = group(null, STAGE_X.lab, 0, 0);
  cyclorama(S, 0xe6ddd2, { back: 4.2 });
  const TOP = 0.9;
  // monolithic travertine table running away from camera (along z)
  const topMat = stoneMat(4, [236, 226, 212], 0.62, [1, 3]);
  mesh(rbox(0.95, 0.06, 3.7, 0.012, 3), topMat, 0, TOP - 0.03, -0.35, S);
  mesh(rbox(0.72, 0.82, 3.3, 0.01, 2), stoneMat(6, [222, 208, 190], 0.8, [1, 3]), 0, 0.41, -0.35, S);
  mesh(rbox(0.76, 0.02, 3.34, 0.004, 1), METAL, 0, 0.83, -0.35, S, { cast: false });

  // the three plinths (rise out of the table in plan 02)
  const islands = [];
  const ISL = [-1.4, -0.45, 0.5];
  ISL.forEach((z, i) => {
    const g = group(S, 0, TOP, z);
    const lift = group(g);
    mesh(plinthGeo(ISLAND_R, 0.05, 0.008, 72), stoneMat(40 + i, [240, 233, 223], 0.55), 0, 0, 0, lift);
    mesh(torus(ISLAND_R + 0.001, 0.0035, 8, 120), METAL, 0, 0.046, 0, lift, { cast: false }).rotation.x = Math.PI / 2;
    const holder = group(lift, 0, 0.05, 0); // receives the diorama miniature
    islands.push({ g, lift, holder, x: 0, z });
  });

  // hero skin block on an acrylic riser + the « best products » around it
  const heroZ = 1.12;
  const riser = mesh(rbox(0.16, 0.06, 0.16, 0.006, 3), glass({ tint: 0xffffff, dist: 2, frost: 0.05, thickness: 0.06 }), 0, TOP + 0.03, heroZ, S, { cast: false });
  const cube = skinBlock(0.17, 5);
  cube.position.set(0, TOP + 0.06, heroZ);
  S.add(cube);
  const lux = group(S, 0, TOP, 0);
  const LUX = [["cleanser", -0.27, 0.86, "Nettoyant"], ["serum", -0.24, 1.36, "Sérum"], ["cream", 0.25, 1.34, "Crème"], ["toner", 0.28, 0.84, "Tonique"], ["retinol", 0.0, 0.9, "Rétinol"]];
  const luxItems = LUX.map(([k, x, z, label]) => {
    const p = product(k, { label });
    p.position.set(x, 0, z);
    p.scale.setScalar(1.15);
    lux.add(p);
    return p;
  });

  // conclusion: one clean routine plinth where plinth 02 stands
  const routine = group(S, 0, TOP, ISL[1]);
  const rLift = group(routine);
  mesh(plinthGeo(0.34, 0.05, 0.01, 96), stoneMat(48, [240, 233, 223], 0.55), 0, 0, 0, rLift);
  mesh(torus(0.341, 0.0035, 8, 140), METAL, 0, 0.046, 0, rLift, { cast: false }).rotation.x = Math.PI / 2;
  const RT = [["cleanser", -0.18, 0.06, "Nettoyant"], ["serum", -0.06, 0.13, "Sérum"], ["cream", 0.07, 0.12, "Hydratant"], ["spf", 0.19, 0.05]];
  const routineItems = RT.map(([k, x, z, label]) => {
    const p = product(k, { label });
    p.position.set(x, 0.05, z);
    p.scale.setScalar(1.2);
    rLift.add(p);
    return p;
  });
  const rGlass = hourglass();
  rGlass.position.set(0.0, 0.05, -0.15);
  rGlass.scale.setScalar(1.1);
  rLift.add(rGlass);
  routineItems.push(rGlass);

  const mark = bookmark();
  mark.position.set(0, 1.32, -0.2);
  S.add(mark);

  return { S, TOP, islands, cube, riser, heroZ, lux, luxItems, routine, rLift, routineItems, rGlass, mark };
}

// ======================================================================= D1 — too many products
export function buildD1() {
  const S = group(null, STAGE_X.d1, 0, 0);
  const env = group(S);
  const set = group(S);
  cyclorama(env, 0xe7dbd4, { back: 3.4 });
  roundStage(set, stoneMat(12, [238, 228, 218], 0.6, [2, 2]), 0xd9c6b5);
  const plasterM = new THREE.MeshLambertMaterial({ map: plaster(13, [234, 218, 208]).map });
  const panel = group(set, 0, 0, -0.9);
  archPanel(panel, 1.5, 2.3, 0.07, plasterM);
  // three floating travertine shelves
  const SHELF_Y = [1.0, 1.32, 1.64];
  const SX = 0.0;
  const SZ = -0.9 + 0.035 + 0.1;
  const shelfM = stoneMat(14, [236, 225, 210], 0.6, [1, 0.3]);
  const shelves = SHELF_Y.map((y) => {
    const s = shelf(0.66, 0.2, 0.034, shelfM);
    s.position.set(SX, y, SZ);
    set.add(s);
    return s;
  });
  // essentials already on the lower shelf (they stay)
  const essentials = [["cleanser", -0.22, "Nettoyant"], ["serum", -0.07, "Sérum"], ["cream", 0.09, "Hydratant"]].map(([k, x, label]) => {
    const p = product(k, { label });
    p.position.set(x, SHELF_Y[0] + 0.017, SZ);
    set.add(p);
    return p;
  });
  // skin block on a travertine pedestal
  const PED_H = 0.56;
  const ped = group(set, 0.13, 0, -0.5);
  mesh(cyl(0.15, 0.165, PED_H, 72), stoneMat(15, [226, 212, 194], 0.7, [1, 1.2]), 0, PED_H / 2, 0, ped);
  mesh(torus(0.151, 0.003, 8, 100), METAL, 0, PED_H - 0.004, 0, ped, { cast: false }).rotation.x = Math.PI / 2;
  const cube = skinBlock(0.24, 9);
  cube.position.y = PED_H;
  ped.add(cube);
  // décor
  const vase = eucalyptus(12, 0.5);
  vase.position.set(-0.52, 0, -0.55);
  set.add(vase);
  // « 1 actif » riser (plan 06)
  const riser = mesh(rbox(0.07, 0.025, 0.07, 0.005, 2), stoneMat(16, [244, 236, 226], 0.5), 0.25, SHELF_Y[0] + 0.03, SZ, set);
  // products that rain onto the shelves in plan 04
  const KINDS = [["serum", "Sérum"], ["exfoliant", "Exfoliant"], ["retinol", "Rétinol"], ["vitc", "Vitamine C"], ["toner"], ["oil"], ["mask"], ["generic"], ["generic"]];
  const extra = KINDS.map(([k, label], i) => {
    const p = product(k, { label, seed: 40 + i });
    set.add(p);
    return p;
  });
  const active = product("serum", { label: "Sérum" });
  set.add(active);
  // drops poured by the tipped bottle (plan 05)
  const drops = [];
  for (let k = 0; k < 9; k++) {
    const d = drop(0.008, [0xf1c3ae, 0xf2a54a, 0xe7efdf, 0xd59447][k % 4]);
    d.visible = false;
    set.add(d);
    drops.push(d);
  }
  return { S, env, set, panel, shelves, SHELF_Y, SX, SZ, essentials, ped, cube, vase, riser, extra, active, drops };
}

// ======================================================================= D2 — forgetting SPF
export function buildD2() {
  const S = group(null, STAGE_X.d2, 0, 0);
  const env = group(S);
  const set = group(S);
  const cyc = cyclorama(env, 0xe6ddd1, { back: 3.4 });
  const sky = skyDome(7.5, skyTexture("#a9c8e4", "#dbe7f0", "#f8ecdf"));
  sky.position.set(0, -0.5, -0.8);
  sky.visible = false;
  env.add(sky);
  roundStage(set, stoneMat(22, [238, 230, 220], 0.6, [2, 2]), 0xd8c7b6);
  // the backdrop panel that slides aside to let the sky in
  const plasterM = new THREE.MeshLambertMaterial({ map: plaster(21, [236, 227, 214]).map });
  const panel = group(set, 0, 0, -0.92);
  archPanel(panel, 1.6, 2.35, 0.07, plasterM);
  const mir = mirror(0.24);
  mir.position.set(0, 1.42, 0.045);
  panel.add(mir);
  // freestanding travertine console
  const CY = 0.82;
  const consoleM = stoneMat(24, [234, 224, 210], 0.6, [1, 0.5]);
  mesh(rbox(0.84, 0.05, 0.34, 0.01, 3), consoleM, 0, CY - 0.025, -0.62, set);
  for (const x of [-0.36, 0.36]) mesh(rbox(0.05, CY - 0.05, 0.3, 0.008, 2), consoleM, x, (CY - 0.05) / 2, -0.62, set);
  // routine tray: cleanser, serum, cream… and an empty slot
  const tr = tray(4, 0.1);
  tr.position.set(-0.13, CY, -0.6);
  set.add(tr);
  const routine = [["cleanser", "Nettoyant"], ["serum", "Sérum"], ["cream", "Hydratant"]].map(([k, label], i) => {
    const p = product(k, { label });
    p.position.set(tr.position.x + tr.slotX[i], CY + tr.topY, tr.position.z);
    p.scale.setScalar(0.92);
    set.add(p);
    return p;
  });
  const ring = dottedRing(0.034, 16);
  ring.position.set(tr.position.x + tr.slotX[3], CY + tr.topY + 0.002, tr.position.z);
  set.add(ring);
  const spf = product("spf");
  spf.scale.setScalar(0.92);
  set.add(spf);
  // skin block on a small acrylic riser at the end of the console
  const riser = mesh(rbox(0.13, 0.05, 0.13, 0.006, 3), glass({ tint: 0xffffff, dist: 2, frost: 0.05, thickness: 0.05 }), 0.27, CY + 0.025, -0.62, set, { cast: false });
  const cube = skinBlock(0.15, 13);
  cube.position.set(0.27, CY + 0.05, -0.62);
  set.add(cube);
  const vase = eucalyptus(22, 0.42, 0xefe6da);
  vase.position.set(0.62, 0, -0.35);
  set.add(vase);
  // morning light through the room before the wall opens
  const shafts = [0, 1].map((k) => {
    const s = lightShaft(0.35, 1.6, 0xfff1da, 0.18);
    s.position.set(-0.55 + k * 0.32, 1.25, -0.4);
    s.rotation.set(0, 0.35, -0.5);
    env.add(s);
    return s;
  });
  // sky elements (visible once the wall has slid away)
  const sunG = sun(0.2);
  sunG.position.set(0.95, 3.0, -3.2);
  env.add(sunG);
  const cl = cloud(5, 0.9);
  cl.position.set(-0.4, 2.85, -2.8);
  env.add(cl);
  const beams = [0, 1, 2, 3].map(() => {
    const b = uvBeam(4.5, 0.03);
    env.add(b);
    return b;
  });
  const bounces = [0, 1, 2, 3].map(() => {
    const b = uvBeam(0.7, 0.025);
    env.add(b);
    return b;
  });
  return { S, env, set, cyc, sky, panel, CY, tray: tr, routine, ring, spf, riser, cube, vase, shafts, sun: sunG, cloud: cl, beams, bounces };
}

// ======================================================================= D3 — changing everything
export function buildD3() {
  const S = group(null, STAGE_X.d3, 0, 0);
  const env = group(S);
  const set = group(S);
  cyclorama(env, 0xe2dcda, { back: 3.4 });
  roundStage(set, stoneMat(32, [236, 229, 222], 0.6, [2, 2]), 0xd4c8bd);
  const plasterM = new THREE.MeshLambertMaterial({ map: plaster(33, [228, 218, 214]).map });
  const panel = group(set, 0, 0, -0.95);
  const NW = 1.1;
  archPanel(panel, 1.7, 2.45, 0.09, plasterM, { w: NW, h: 1.55, y: 0.72 });
  // niche back + glowing display shelves
  mesh(new THREE.PlaneGeometry(NW + 0.02, 1.6), satin(0xe4dad3, 0.9), 0, 1.5, -0.055, panel, { cast: false });
  const NY = [1.0, 1.32, 1.64];
  const nicheProducts = [];
  const KINDS = ["serum", "toner", "cleanser", "vitc", "exfoliant", "oil", "mask", "retinol", "cream", "toner", "serum", "exfoliant", "cream", "oil", "vitc", "cleanser", "mask", "retinol"];
  NY.forEach((y, r) => {
    mesh(rbox(NW - 0.02, 0.016, 0.16, 0.003, 1), glass({ tint: 0xffffff, dist: 2, frost: 0.08, thickness: 0.016 }), 0, y, 0.03, panel, { cast: false });
    mesh(rbox(NW - 0.06, 0.004, 0.008, 0.001, 1), emissive(0xfff1dc, 1.4), 0, y - 0.012, 0.1, panel, { cast: false, receive: false });
    for (let c = 0; c < 6; c++) {
      const p = product(KINDS[r * 6 + c], { seed: 70 + r * 6 + c });
      p.position.set(-0.4 + c * 0.16, y + 0.008, 0.03);
      p.scale.setScalar(0.95);
      panel.add(p);
      nicheProducts.push(p);
    }
  });
  // oak vanity table with slim brass legs
  const TY = 0.76;
  const TZ = -0.34;
  mesh(rbox(0.82, 0.03, 0.42, 0.008, 3), oakMat(34, [1, 0.5]), 0, TY - 0.015, TZ, set);
  for (const [dx, dz] of [[-0.38, -0.18], [0.38, -0.18], [-0.38, 0.18], [0.38, 0.18]]) mesh(cyl(0.008, 0.007, TY - 0.03, 12), METAL, dx, (TY - 0.03) / 2, TZ + dz, set);
  const cal = calendar([{ head: "", big: "" }, { head: "JOUR", big: "1" }, { head: "JOUR", big: "3" }, { head: "JOUR", big: "5" }, { head: "JOUR", big: "7" }]);
  cal.position.set(-0.29, TY, TZ - 0.04);
  cal.rotation.y = 0.22;
  set.add(cal);
  const calW = calendar([{ head: "SEMAINE", big: "1", check: true }, { head: "SEMAINE", big: "2", check: true }, { head: "SEMAINE", big: "3", check: true }, { head: "SEMAINE", big: "4", check: true }, { head: "SEMAINE", big: "4", check: true }]);
  calW.position.copy(cal.position);
  calW.rotation.copy(cal.rotation);
  calW.visible = false;
  set.add(calW);
  const glassH = hourglass();
  glassH.position.set(0.29, TY, TZ - 0.06);
  set.add(glassH);
  const riser = mesh(rbox(0.12, 0.03, 0.12, 0.005, 2), stoneMat(35, [240, 233, 224], 0.5), 0.05, TY + 0.015, TZ - 0.1, set);
  const cube = skinBlock(0.12, 21);
  cube.position.set(0.05, TY + 0.03, TZ - 0.1);
  set.add(cube);
  const trio = [["cleanser", "Nettoyant"], ["serum", "Sérum"], ["cream", "Hydratant"]].map(([k, label]) => {
    const p = product(k, { label });
    set.add(p);
    return p;
  });
  const vase = eucalyptus(77, 0.46, 0xe9e1dc);
  vase.position.set(0.66, 0, -0.5);
  set.add(vase);
  // the circle of products (plan 13)
  const circle = [];
  for (let k = 0; k < 10; k++) {
    const p = product(KINDS[(k * 3) % KINDS.length], { seed: 120 + k });
    p.visible = false;
    set.add(p);
    circle.push(p);
  }
  return { S, env, set, panel, NY, nicheProducts, TY, TZ, cal, calW, glassH, riser, cube, trio, vase, circle };
}
