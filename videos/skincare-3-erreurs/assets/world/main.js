// Choreography of the whole film — camera, products, skin, light and the 2D interface are pure
// functions of time. Timing comes from window.__PLAN / __CUE (assets/plan.js) and the word timings
// (assets/words.js), so a retime is one edit upstream.
import { THREE, scene, V3, clamp01, lerp, ease, prog, bump, placeCamera, project, renderFrame, bokeh, starSprite, glowSprite } from "./core.js";
import { buildLab, buildD1, buildD2, buildD3, STAGE_X, MINI } from "./stages.js";
import { drop as makeDrop } from "./props.js";
import { createUI } from "./ui.js";

const PL = window.__PLAN;
const CU = window.__CUE;
const WD = window.__WORDS || [];
const TOTAL = window.__TOTAL;
const T = (id, s = 0) => PL[id].start + s;
const wordAt = (plan, prefix, fallback) => {
  const w = WD.find((x) => x.plan === plan && x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  return w ? w.s : fallback;
};

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
let ready = false;
let pendingT = null;
let renderAt = () => {};

async function build() {
  await Promise.all(['600 64px "Cormorant Garamond"', '500 64px "Plus Jakarta Sans"', '600 64px "Plus Jakarta Sans"'].map((f) => document.fonts.load(f)));
  const ui = createUI(document.getElementById("ui"));

  // ------------------------------------------------------------- lights
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0xdcc8b4, 0.95));
  scene.add(new THREE.AmbientLight(0xfff3ea, 0.25));
  const key = new THREE.DirectionalLight(0xfff0e0, 3.0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -1.7, right: 1.7, top: 1.7, bottom: -1.7, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffe6d2, 0.9);
  scene.add(rim, rim.target);

  // ------------------------------------------------------------- sets
  const LAB = buildLab();
  const D1 = buildD1();
  const D2 = buildD2();
  const D3 = buildD3();
  for (const s of [LAB, D1, D2, D3]) scene.add(s.S);
  // anything that only appears later is hidden before the miniatures are cloned
  [...D1.extra, D1.active, D1.riser, D2.spf, ...D3.trio, ...D3.circle].forEach((o) => (o.visible = false));
  D3.calW.visible = false;
  [D1, D2, D3].forEach((d, i) => {
    const mini = d.set.clone(true);
    mini.scale.setScalar(MINI);
    LAB.islands[i].holder.add(mini);
  });
  const ISLZ = LAB.islands.map((I) => I.z);
  const holderY = LAB.TOP + 0.05;
  const mini = (i, P) => [P[0] * MINI, holderY + P[1] * MINI, ISLZ[i] + P[2] * MINI];

  // golden drop of the hook (and of the loop ending)
  const gold = makeDrop(0.011, 0xe2b25c);
  LAB.S.add(gold);
  const goldGlow = glowSprite(0xffd9a0, 0.09, 0.6);
  LAB.S.add(goldGlow);

  // sparkle pools
  const pool = (n, parent) =>
    Array.from({ length: n }, (_, k) => {
      const s = starSprite(0.03, k % 2 ? 0xfff4dd : 0xffe2b8);
      s.visible = false;
      parent.add(s);
      return s;
    });
  const sparks = { lab: pool(10, LAB.S), d1: pool(10, D1.S), d2: pool(10, D2.S), d3: pool(10, D3.S) };
  // c is in world coordinates; sprites live in their stage group (x offset removed)
  const sparkle = (st, c, t, t0, dur, radius, size = 0.03) => {
    sparks[st].forEach((s, k) => {
      const ph = (t - t0 - k * 0.06) / dur;
      if (!(ph > 0 && ph < 1)) return;
      s.visible = true;
      const a = (k / 10) * Math.PI * 2 + k * 0.7;
      const r = radius * (0.45 + 0.55 * (((k * 37) % 10) / 10));
      s.position.set(c.x - STAGE_X[st] + Math.cos(a) * r, c.y + Math.sin(k * 1.9) * radius * 0.4 + ph * radius * 0.5, c.z + Math.sin(a) * r);
      s.scale.setScalar(size * Math.sin(Math.PI * ph) + 0.0005);
    });
  };
  const hideSparks = () => Object.values(sparks).forEach((p) => p.forEach((s) => (s.visible = false)));

  // ------------------------------------------------------------- camera keys (P in stage-local metres)
  const K = [];
  const key_ = (t, st, o, e) => K.push({ t, st, e, fov: 26, el: 20, az: 0, dof: 0, sx: 0, sy: 0, ...o });
  const dive = (tCut, i, st, from, land1, land2) => {
    key_(tCut - 0.45, "lab", from, ease.inOutS);
    key_(tCut, "lab", { ...land1, P: mini(i, land1.P), h: land1.h * MINI }, ease.inC);
    key_(tCut, st, land1);
    key_(tCut + 0.6, st, land2, ease.outC);
  };
  const exit = (tCut, i, st, full, pull) => {
    key_(tCut, st, full, ease.inC);
    key_(tCut, "lab", { ...full, P: mini(i, full.P), h: full.h * MINI });
    key_(tCut + 0.5, "lab", pull, ease.outC);
  };
  const HZ = LAB.heroZ;
  // P01 hook: macro on the golden drop and the skin, then the table reveals itself
  key_(0, "lab", { P: [0, 1.1, HZ], h: 0.38, az: 16, el: 10, fov: 20, dof: 0.0035 });
  key_(1.6, "lab", { P: [0, 1.08, HZ], h: 0.34, az: 12, el: 11, fov: 20, dof: 0.0035 }, ease.inOutS);
  key_(1.95, "lab", { P: [0, 1.08, HZ], h: 0.35, az: 11, el: 11, fov: 20, dof: 0.0035 }, ease.linear);
  key_(2.75, "lab", { P: [0, 1.01, HZ - 0.12], h: 0.95, az: 6, el: 22, fov: 24, dof: 0.0012 }, ease.inOutC);
  key_(T("p02"), "lab", { P: [0, 0.98, 0.45], h: 2.0, az: 0, el: 28 }, ease.inOutS);
  // P02 the three plinths, slow orbit, push toward 01
  key_(T("p02", 1.1), "lab", { P: [0, 0.97, -0.3], h: 2.7, az: -6, el: 40 }, ease.inOutS);
  const D_WIDE = { P: [0.0, 0.95, -0.5], h: 2.7, az: 6, el: 26 };
  dive(CU.d1In, 0, "d1", { P: [0, 0.98, -0.95], h: 1.5, az: 4, el: 30 }, D_WIDE, { P: [0.05, 1.06, -0.6], h: 1.75, az: 10, el: 12 });
  // P03–P06
  key_(T("p04"), "d1", { P: [0.02, 1.08, -0.62], h: 1.65, az: 6, el: 10 }, ease.linear);
  key_(T("p04", 0.5), "d1", { P: [0.0, 1.36, -0.74], h: 1.15, az: 6, el: 6 }, ease.inOutC);
  key_(T("p05"), "d1", { P: [0.03, 1.33, -0.74], h: 1.22, az: 4, el: 6 }, ease.linear);
  key_(T("p05", 0.7), "d1", { P: [0.13, 0.82, -0.52], h: 0.64, az: 16, el: 22 }, ease.inOutC);
  key_(CU.rw1[0], "d1", { P: [0.13, 0.8, -0.5], h: 0.6, az: 26, el: 24 }, ease.linear);
  key_(CU.rw1[1] + 0.1, "d1", { P: [0.05, 1.05, -0.6], h: 1.75, az: 12, el: 12 }, ease.inOutC);
  key_(CU.d1Out - 0.6, "d1", { P: [0.05, 1.05, -0.6], h: 1.85, az: 8, el: 12 }, ease.linear);
  const D_EXIT = { P: [0, 0.9, -0.4], h: 3.0, az: 6, el: 34 };
  exit(CU.d1Out, 0, "d1", D_EXIT, { P: [0, 0.97, -0.7], h: 1.7, az: 6, el: 32 });
  dive(CU.d2In, 1, "d2", { P: [0, 0.98, -0.45], h: 1.35, az: 8, el: 32 }, D_WIDE, { P: [0, 1.08, -0.62], h: 1.45, az: 10, el: 12 });
  // P07–P10
  key_(T("p08"), "d2", { P: [0, 1.1, -0.64], h: 1.4, az: 6, el: 12 }, ease.linear);
  key_(T("p08", 0.55), "d2", { P: [-0.12, 0.9, -0.6], h: 0.6, az: 8, el: 18 }, ease.inOutC);
  key_(T("p08", 1.25), "d2", { P: [-0.11, 0.9, -0.6], h: 0.58, az: 8, el: 18 }, ease.linear);
  key_(T("p08", 2.3), "d2", { P: [0.05, 1.45, -0.7], h: 2.5, az: 4, el: 6 }, ease.inOutC);
  key_(T("p09", 0.3), "d2", { P: [0.2, 1.75, -0.95], h: 3.1, az: 2, el: 4 }, ease.inOutS);
  const TAC = wordAt("p09", "taches", 27.96);
  const MEME = wordAt("p09", "Même", 28.39);
  key_(TAC - 0.35, "d2", { P: [0.2, 1.78, -0.95], h: 3.15, az: 2, el: 4 }, ease.linear);
  key_(TAC + 0.2, "d2", { P: [0.27, 0.98, -0.62], h: 0.55, az: 14, el: 18 }, ease.inOutC);
  key_(MEME + 0.05, "d2", { P: [0.27, 0.98, -0.62], h: 0.53, az: 16, el: 18 }, ease.linear);
  key_(MEME + 0.75, "d2", { P: [0.1, 1.8, -1.0], h: 3.2, az: 2, el: 4 }, ease.inOutC);
  key_(CU.rw2[0], "d2", { P: [0.1, 1.82, -1.0], h: 3.25, az: 2, el: 4 }, ease.linear);
  key_(CU.rw2[1] + 0.1, "d2", { P: [-0.1, 0.92, -0.6], h: 0.66, az: 8, el: 18 }, ease.inOutC);
  key_(CU.whip10[0], "d2", { P: [-0.08, 0.92, -0.6], h: 0.6, az: 8, el: 18 }, ease.linear);
  key_(CU.whip10[1], "d2", { P: [0.27, 1.42, -0.75], h: 1.9, az: 10, el: 6 }, ease.inOutC);
  key_(CU.d2Out - 0.45, "d2", { P: [0.25, 1.48, -0.78], h: 2.0, az: 8, el: 6 }, ease.linear);
  exit(CU.d2Out, 1, "d2", { ...D_EXIT, az: 8 }, { P: [0, 0.97, 0.15], h: 1.7, az: 8, el: 32 });
  dive(CU.d3In, 2, "d3", { P: [0, 0.98, 0.35], h: 1.35, az: 8, el: 32 }, D_WIDE, { P: [0, 1.2, -0.62], h: 1.95, az: 10, el: 12 });
  // P11–P14
  key_(T("p12", 0.4), "d3", { P: [0, 1.2, -0.66], h: 1.85, az: 2, el: 12 }, ease.linear);
  const dayB = { P: [0.0, 0.92, -0.34], h: 0.95, az: 6, el: 18 };
  const dayA = { P: [-0.29, 0.87, -0.38], h: 0.44, az: 16, el: 10 };
  key_(CU.days[0] - 0.5, "d3", dayB, ease.inOutC);
  CU.days.forEach((f) => {
    key_(f - 0.22, "d3", dayB, ease.linear);
    key_(f, "d3", dayA, ease.inOutC);
    key_(f + 0.18, "d3", dayA, ease.linear);
    key_(f + 0.4, "d3", dayB, ease.inOutC);
  });
  key_(T("p13", 0.6), "d3", { P: [0.03, 0.86, -0.38], h: 1.4, az: 0, el: 56 }, ease.inOutC);
  key_(CU.rw3[0], "d3", { P: [0.03, 0.86, -0.38], h: 1.36, az: 18, el: 56 }, ease.linear);
  key_(CU.rw3[1] + 0.25, "d3", { P: [0.02, 0.92, -0.38], h: 0.95, az: 10, el: 14 }, ease.inOutC);
  key_(CU.d3Out - 0.45, "d3", { P: [0.02, 0.92, -0.38], h: 0.8, az: 16, el: 14 }, ease.linear);
  exit(CU.d3Out, 2, "d3", { ...D_EXIT, az: 12 }, { P: [0, 0.98, -0.45], h: 2.5, az: 8, el: 32 });
  // P15 recap, P16 hero shot of the routine, P17 call to action
  key_(T("p15", 0.4), "lab", { P: [0, 1.0, -0.4], h: 1.25, az: -8, el: 24 }, ease.inOutC);
  key_(T("p16"), "lab", { P: [0, 1.0, -0.4], h: 1.15, az: 12, el: 24 }, ease.linear);
  key_(T("p16", 0.5), "lab", { P: [0, 1.02, -0.38], h: 0.6, az: -6, el: 8, fov: 20, dof: 0.003, sy: -0.16 }, ease.inOutC);
  key_(T("p17"), "lab", { P: [0, 1.02, -0.38], h: 0.52, az: 2, el: 8, fov: 20, dof: 0.003, sy: -0.16 }, ease.linear);
  key_(T("p17", 0.85), "lab", { P: [0, 1.15, -0.4], h: 1.85, az: 0, el: 20, fov: 24 }, ease.inOutC);
  key_(TOTAL, "lab", { P: [0, 1.15, -0.4], h: 1.8, az: 0, el: 20, fov: 24 }, ease.linear);

  // products raining onto the D1 shelves, synced to the words of plan 04
  const D1S = [
    { i: 0, sh: 1, x: -0.08, tl: wordAt("p04", "Sérum", 8.63) + 0.12, label: "Sérum", side: -1 },
    { i: 1, sh: 2, x: -0.02, tl: wordAt("p04", "exfoliant", 9.01) + 0.12, label: "Exfoliant", side: 1 },
    { i: 2, sh: 1, x: 0.22, tl: wordAt("p04", "rétinol", 9.59) + 0.12, label: "Rétinol", side: 1 },
    { i: 3, sh: 0, x: 0.24, tl: wordAt("p04", "vitamine", 10.31) + 0.15, label: "Vitamine C", side: 1 },
    { i: 4, sh: 2, x: 0.17, tl: 10.95 },
    { i: 5, sh: 1, x: -0.24, tl: 11.12 },
    { i: 6, sh: 0, x: -0.31, tl: 11.3 },
    { i: 7, sh: 2, x: -0.2, tl: 11.47 },
    { i: 8, sh: 1, x: 0.08, tl: 11.64 },
  ];
  const TIP = D1S[3];
  // micro punch-ins on the beats (products landing, calendar days)
  const punchTimes = [...D1S.map((b) => b.tl), ...CU.days.map((d) => d + 0.25)];
  const punch = (t) => punchTimes.reduce((a, tk) => a + Math.exp(-(((t - tk) / 0.07) ** 2)), 0);

  const getP = (P, t) => (typeof P === "function" ? P(t) : P);
  function shotAt(t) {
    let i = 1;
    while (i < K.length && K[i].t <= t) i++;
    const a = K[i - 1];
    const b = K[i];
    if (!b || b.st !== a.st) return { ...a, P: getP(a.P, t) };
    const u = (b.e || ease.inOutC)(clamp01((t - a.t) / Math.max(1e-6, b.t - a.t)));
    const pa = getP(a.P, t);
    const pb = getP(b.P, t);
    return {
      st: a.st,
      P: [lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u), lerp(pa[2], pb[2], u)],
      h: Math.exp(lerp(Math.log(a.h), Math.log(b.h), u)),
      az: lerp(a.az, b.az, u),
      el: lerp(a.el, b.el, u),
      fov: lerp(a.fov, b.fov, u),
      dof: lerp(a.dof, b.dof, u),
      sx: lerp(a.sx, b.sx, u),
      sy: lerp(a.sy, b.sy, u),
    };
  }

  // ------------------------------------------------------------- shared helpers
  const W3 = (st, x, y, z) => new V3(x + STAGE_X[st], y, z);
  const arc = (a, b, u, hgt) => new V3(lerp(a.x, b.x, u), lerp(a.y, b.y, u) + Math.sin(Math.PI * u) * hgt, lerp(a.z, b.z, u));
  const fadeWin = (t, a, b, fi = 0.2, fo = 0.25) => prog(t, a, a + fi, ease.inOutS) * (1 - prog(t, b - fo, b, ease.inOutS));
  const worldTop = (obj, extra = 0.02) => {
    const v = new V3();
    obj.getWorldPosition(v);
    v.y += (obj.H || 0.1) * obj.scale.y + extra;
    return v;
  };
  const exitT = [CU.d1Out, CU.d2Out, CU.d3Out];
  const shelfTop = (k) => D1.SHELF_Y[k] + 0.017;
  const placedOn = (t, shelfIdx = null) => {
    let n = 0;
    D1S.forEach((b, order) => {
      if (shelfIdx !== null && b.sh !== shelfIdx) return;
      const back = CU.rw1[0] + 0.035 * (8 - order);
      if (t >= b.tl && t < back + 0.18) n += t < back ? 1 : 1 - (t - back) / 0.18;
    });
    return n;
  };
  // D3 daily picks (indices in the niche) and the table front row
  const DAILY = [10, 2, 11, 14];
  const ROW = [-0.17, -0.05, 0.07, 0.19];
  const ROWZ = D3.TZ + 0.11;
  const nicheHome = D3.nicheProducts.map((p) => p.position.clone()); // panel-local
  const PANEL_Z = D3.panel.position.z;
  const ORBIT = [...DAILY.map((idx) => D3.nicheProducts[idx]), ...D3.circle.slice(0, 6)];
  const ORBIT_SPAWN = [0, 5, 8, 13, 16, 3].map((idx) => nicheHome[idx].clone().add(new V3(0, 0, PANEL_Z)));

  let shadowStage = null;

  renderAt = (t) => {
    const shot = shotAt(t);
    const st = shot.st;
    const hEff = shot.h * (1 - 0.03 * punch(t));
    const { distance } = placeCamera({ ...shot, h: hEff, P: [shot.P[0] + STAGE_X[st], shot.P[1], shot.P[2]] });
    bokeh.enabled = shot.dof > 0.0002;
    if (bokeh.enabled) {
      bokeh.uniforms.focus.value = distance;
      bokeh.uniforms.aperture.value = shot.dof;
      bokeh.uniforms.maxblur.value = 0.008;
    }
    // ------------------------------------------------ light rig follows the stage
    const cx = STAGE_X[st];
    const wide = st === "lab" ? 2.6 : 1.7;
    if (shadowStage !== st) {
      Object.assign(key.shadow.camera, { left: -wide, right: wide, top: wide, bottom: -wide });
      key.shadow.camera.updateProjectionMatrix();
      shadowStage = st;
    }
    let open = 0;
    if (st === "d2") {
      const a = prog(t, T("p08", 1.35), T("p08", 2.4));
      if (t < CU.rw2[1]) open = a * (1 - prog(t, CU.rw2[0], CU.rw2[1]));
      else open = prog(t, CU.whip10[0], CU.whip10[1]);
    }
    const studio = st === "lab" ? new V3(cx - 2.4, 4.6, 3.6) : new V3(cx - 2.0, 4.2, 3.2);
    const sunLight = new V3(cx + 1.6, 4.4, -3.6);
    key.position.copy(studio).lerp(sunLight, open);
    key.intensity = lerp(3.0, 3.8, open);
    key.color.setHex(0xfff0e0).lerp(new THREE.Color(0xffe2bf), open);
    key.target.position.set(cx, st === "lab" ? 0.7 : 0.8, st === "lab" ? -0.3 : -0.5);
    key.target.updateMatrixWorld();
    rim.position.set(cx + 2.5, 2.5, -3);
    rim.target.position.set(cx, 0.9, 0);
    rim.target.updateMatrixWorld();
    hideSparks();
    ui.begin(t);

    // ================================================= LAB
    if (st === "lab") {
      const top = LAB.cube.position.y + LAB.cube.topY;
      // golden drop: slow-motion fall in the hook, and again in the last half-second (loop)
      const inHook = t < 1.62;
      const inLoop = false;
      gold.visible = goldGlow.visible = inHook || inLoop;
      const gy = inHook ? lerp(top + 0.17, top + 0.004, ease.inQ(prog(t, 0, 1.6, ease.linear))) : lerp(top + 0.5, top + 0.004, ease.inQ(prog(t, TOTAL - 0.55, TOTAL, ease.linear)));
      gold.position.set(0, gy, HZ);
      gold.scale.set(1, inHook ? 1 + 0.12 * prog(t, 1.2, 1.6) : 1.1, 1);
      goldGlow.position.set(0, gy + 0.015, HZ);
      // the hero skin: impact ripple, crack on « saboter », healed a third after each corrected error
      const sab = wordAt("p01", "saboter", 2.88);
      const heal = (prog(t, CU.d1Out + 0.1, CU.d1Out + 0.6) + prog(t, CU.d2Out + 0.1, CU.d2Out + 0.6) + prog(t, CU.d3Out + 0.15, CU.d3Out + 0.7)) / 3;
      LAB.cube.set({
        crack: prog(t, sab, sab + 0.45, ease.outQ) * (1 - heal),
        glow: 0.7 * prog(t, sab + 0.1, sab + 0.7) * (1 - heal),
        lift: 0.25 * prog(t, sab, sab + 0.5) * (1 - heal),
        ripple: t > 1.6 && t < 3.4 ? 1 : 0,
        rippleT: t - 1.6,
      });
      exitT.forEach((e) => sparkle("lab", W3("lab", 0, top + 0.03, HZ), t, e + 0.15, 0.8, 0.12, 0.025));
      // the hero skin leaves the stage to the routine for the closing shots
      LAB.cube.visible = LAB.riser.visible = t < T("p16");
      // best products sink into the table as the plinths rise
      LAB.luxItems.forEach((p, k) => {
        const s = prog(t, T("p02", 0.05) + 0.05 * k, T("p02", 0.55) + 0.05 * k, ease.inQ);
        p.position.y = -0.24 * s;
        p.visible = s < 0.999;
      });
      const merge = prog(t, T("p15", 0.0), T("p15", 0.6));
      const names = ["01", "02", "03"];
      LAB.islands.forEach((I, i) => {
        const rise = clamp01((t - T("p02", 0.15) - i * 0.12) / 0.55);
        I.lift.position.y = lerp(-0.056, 0, ease.outC(rise)) - 0.06 * merge;
        I.holder.scale.setScalar(Math.max(0.001, ease.outBack(clamp01((t - T("p02", 0.3) - i * 0.12) / 0.5)) * (1 - merge)));
        I.g.position.z = lerp(I.z, ISLZ[1], merge);
        I.g.visible = rise > 0.001 && merge < 0.999;
        // labels (plan 02) and completion checks
        const anchor = project(W3("lab", -0.29, LAB.TOP + 0.04, I.g.position.z));
        ui.callout(anchor, names[i], fadeWin(t, T("p02", 0.55) + 0.12 * i, CU.d1In - 0.35, 0.25, 0.3), { side: -1, dx: 46, dy: 0, size: 32 });
        const ck = ease.outBack(clamp01((t - exitT[i] - 0.15) / 0.35));
        ui.check(project(W3("lab", 0.0, LAB.TOP + 0.52, I.g.position.z)), ck * (1 - merge), 1 - merge);
      });
      // one clean routine where the plinths merge
      const up = clamp01((t - T("p15", 0.35)) / 0.55);
      LAB.routine.visible = up > 0.001;
      LAB.rLift.position.y = lerp(-0.056, 0, ease.outC(up));
      LAB.routineItems.forEach((p, k) => {
        const s = ease.outBack(clamp01((t - T("p15", 0.6) - k * 0.1) / 0.4));
        p.visible = s > 0.001;
        p.scale.setScalar((k === 4 ? 1.1 : 1.2) * Math.max(0.001, s));
      });
      LAB.rGlass.set(1 - 0.8 * prog(t, T("p15", 0.8), TOTAL, ease.linear), t > T("p15", 0.8), 0);
      // the save icon
      const bm = ease.outBack(clamp01((t - T("p17", 0.2)) / 0.55));
      LAB.mark.visible = bm > 0.001;
      LAB.mark.scale.setScalar(Math.max(0.001, bm));
      LAB.mark.position.y = 1.315 + 0.008 * Math.sin(t * 2.4);
      LAB.mark.rotation.y = 0.18 * Math.sin(t * 1.1);
      const pressT = T("p17", 1.15);
      LAB.mark.set(bump(t, pressT, pressT + 0.36, 0.12), prog(t, pressT + 0.05, pressT + 0.4));
      sparkle("lab", W3("lab", LAB.mark.position.x, LAB.mark.position.y, LAB.mark.position.z), t, pressT + 0.1, 0.8, 0.16, 0.035);
    }

    // ================================================= D1 — too many products
    if (st === "d1") {
      D1S.forEach((b, order) => {
        const p = D1.extra[b.i];
        const ys = shelfTop(b.sh);
        const back = CU.rw1[0] + 0.035 * (8 - order);
        let y = ys;
        let vis = t >= b.tl - 0.38;
        if (t < b.tl) y = ys + 0.75 * (1 - clamp01((t - (b.tl - 0.38)) / 0.38)) ** 2;
        else if (t < back) y = ys + 0.012 * Math.exp(-(t - b.tl) * 10) * Math.abs(Math.sin((t - b.tl) * 26));
        else {
          y = ys + 0.9 * ease.inQ(prog(t, back, back + 0.18, ease.linear));
          vis = t < back + 0.18;
        }
        p.visible = vis;
        let z = D1.SZ;
        let rx = 0;
        if (b === TIP && t < back) {
          // tips forward over the shelf edge, pouring onto the skin below
          const th = 1.15 * ease.outBack(prog(t, T("p05", 0.05), T("p05", 0.4), ease.linear)) * (1 - prog(t, CU.rw1[0], CU.rw1[0] + 0.12));
          rx = th;
          y += p.R * Math.sin(th);
          z += p.R - p.R * Math.cos(th);
        }
        p.position.set(b.x, y, z);
        p.rotation.set(rx, 0, t > b.tl && t < back ? 0.05 * Math.exp(-(t - b.tl) * 8) * Math.sin((t - b.tl) * 30) : 0);
        p.shadow.material.opacity = p.shadow.baseOpacity * (1 - clamp01((y - ys) / 0.15)) * (rx > 0.2 ? 0.3 : 1);
        if (b.label) {
          const a = fadeWin(t, b.tl, Math.min(b.tl + 1.05, CU.rw1[0]), 0.18, 0.25);
          ui.callout(project(worldTop(p, 0.01)), b.label, a, { side: b.side, dx: 120, dy: -70, size: 30 });
        }
      });
      for (let k = 0; k < 3; k++) D1.shelves[k].bend(0.0045 * Math.pow(placedOn(t, k), 1.2));
      // the pour: drops arc from the tipped bottle onto the skin
      const tipP = D1.extra[TIP.i];
      const th = tipP.rotation.x;
      const mouth = new V3(TIP.x, tipP.position.y + tipP.H * Math.cos(th), tipP.position.z + tipP.H * Math.sin(th));
      const cubeTop = new V3(D1.ped.position.x, D1.cube.position.y + D1.cube.topY + 0.004, D1.ped.position.z);
      D1.drops.forEach((d, k) => {
        const target = cubeTop.clone().add(new V3(Math.sin(k * 2.3) * 0.06, 0, Math.cos(k * 1.7) * 0.05));
        const t0 = T("p05", 0.3) + k * 0.1;
        let u = (t - t0) / 0.42;
        if (t >= CU.rw1[0]) u = 1 - prog(t, CU.rw1[0] + 0.02 * k, CU.rw1[0] + 0.2 + 0.02 * k, ease.linear);
        d.visible = u > 0 && u < 1 && t < CU.rw1[1] && th > 0.5;
        if (d.visible) d.position.copy(arc(mouth, target, ease.inQ(u), 0.05));
      });
      // the skin reacts, then heals in plan 06
      const firstHit = T("p05", 0.3) + 0.42;
      const irr = wordAt("p05", "irriter", 13.54);
      const fra = wordAt("p05", "fragiliser", 14.7);
      const rwU = prog(t, CU.rw1[0], CU.rw1[1]);
      const healU = prog(t, T("p06", 0.15), T("p06", 1.1));
      const keep = (1 - 0.7 * rwU) * (1 - healU);
      D1.cube.set({
        lift: prog(t, firstHit, irr + 0.4) * keep,
        gap: prog(t, firstHit, irr + 0.4) * keep,
        glow: 0.9 * prog(t, irr - 0.1, irr + 0.6) * keep,
        crack: prog(t, fra, fra + 0.7) * keep,
        ripple: t > firstHit && t < firstHit + 1.4 ? 0.7 : 0,
        rippleT: t - firstHit,
      });
      const cubeW = W3("d1", cubeTop.x, cubeTop.y, cubeTop.z);
      sparkle("d1", cubeW.clone().add(new V3(0, 0.06, 0)), t, T("p06", 0.4), 0.9, 0.16, 0.03);
      ui.callout(project(cubeW.clone().add(new V3(-0.05, 0.03, 0.02))), "Peau sensibilisée", fadeWin(t, irr + 0.15, CU.rw1[0], 0.2, 0.15), { side: -1, dx: 150, dy: -120, accent: true });
      ui.callout(project(cubeW.clone().add(new V3(0.08, 0.0, 0.1))), "Barrière cutanée", fadeWin(t, fra + 0.1, CU.rw1[0], 0.2, 0.15), { side: 1, dx: 110, dy: 110 });
      // tolerance gauge
      const v = 0.1 + 0.8 * clamp01(placedOn(t) / 9) + 0.08 * (th > 0.5 ? 1 : 0) * (1 - rwU);
      ui.gauge(790, 430, v, fadeWin(t, T("p04", 0.4), CU.rw1[1], 0.3, 0.3), v > 0.72 ? 0.5 + 0.5 * Math.sin(t * 9) : 0);
      // « 1 actif »: a small riser and a single active bottle
      const rs = ease.outBack(clamp01((t - T("p06", 0.4)) / 0.4));
      D1.riser.visible = rs > 0.001;
      D1.riser.scale.setScalar(Math.max(0.001, rs));
      const act = wordAt("p06", "actif", 18.0);
      const aTop = D1.SHELF_Y[0] + 0.03 + 0.0125;
      D1.active.visible = t > act - 0.38;
      const au = clamp01((t - (act - 0.38)) / 0.38);
      D1.active.position.set(0.25, aTop + 0.6 * (1 - au) ** 2 + (t > act ? 0.01 * Math.exp(-(t - act) * 10) * Math.abs(Math.sin((t - act) * 26)) : 0), D1.SZ);
      D1.active.shadow.material.opacity = D1.active.shadow.baseOpacity * au;
      ui.callout(project(worldTop(D1.active, 0.01)), "1 actif", fadeWin(t, act + 0.05, CU.d1Out - 0.1, 0.2, 0.25), { side: 1, dx: 110, dy: -80, accent: true });
    }

    // ================================================= D2 — forgetting SPF
    if (st === "d2") {
      D2.panel.position.x = -1.8 * open;
      D2.sky.visible = D2.sun.visible = D2.cloud.visible = open > 0.001;
      D2.cyc.visible = open < 0.001;
      D2.shafts.forEach((s) => (s.material.opacity = 0.16 * (1 - open) * (t < T("p09") ? 1 : 0)));
      // the routine tray: three steps checked, the fourth one missing
      const w = [wordAt("p08", "Nettoyant", 22.08), wordAt("p08", "sérum", 22.52), wordAt("p08", "crème", 22.96)];
      D2.routine.forEach((p, i) => (p.position.y = D2.CY + D2.tray.topY + 0.022 * bump(t, w[i], w[i] + 0.5, 0.15)));
      const manque = wordAt("p08", "manque", 24.11);
      const spfLand = wordAt("p10", "SPF", 30.24) + 0.45;
      const missing = bump(t, manque - 0.2, T("p08", 3.2), 0.15) + (t > CU.rw2[1] && t < spfLand ? 1 : 0);
      const pulse = 0.5 + 0.5 * Math.sin(t * 9);
      D2.ring.visible = t < spfLand;
      D2.ring.scale.setScalar(1 + 0.15 * missing * pulse);
      const checks = [prog(t, w[0], w[0] + 0.3), prog(t, w[1], w[1] + 0.3), prog(t, w[2], w[2] + 0.3), prog(t, spfLand + 0.05, spfLand + 0.35)];
      const listA = Math.max(fadeWin(t, T("p08", -0.05), T("p08", 3.0), 0.25, 0.3), fadeWin(t, CU.rw2[1], spfLand + 0.68, 0.25, 0.22));
      ui.checklist(108, 300, ["Nettoyant", "Sérum", "Hydratant", "SPF"], checks, listA, 3, missing > 0.01 ? 0.4 + 0.6 * pulse : 0);
      // SPF lands in the empty slot (plan 10)
      const slot = new V3(D2.tray.position.x + D2.tray.slotX[3], D2.CY + D2.tray.topY, D2.tray.position.z);
      D2.spf.visible = t > spfLand - 0.38 && t > CU.rw2[1];
      const su = clamp01((t - (spfLand - 0.38)) / 0.38);
      D2.spf.position.set(slot.x, slot.y + 0.55 * (1 - su) ** 2 + (t > spfLand ? 0.01 * Math.exp(-(t - spfLand) * 10) * Math.abs(Math.sin((t - spfLand) * 26)) : 0), slot.z);
      // sky: the cloud drifts across the sun on « même quand il fait gris »
      const cu = t < CU.rw2[0] ? prog(t, MEME - 0.15, MEME + 0.75) : t < CU.rw2[1] ? 1 - prog(t, CU.rw2[0], CU.rw2[1]) : 0;
      D2.cloud.position.set(lerp(-0.5, 0.9, cu), 2.95, -2.8);
      // UV beams from the sun onto the skin; after the SPF they bounce off a nacre film
      const cubeTop = new V3(D2.cube.position.x, D2.cube.position.y + D2.cube.topY, D2.cube.position.z);
      const beamOn = open > 0.5 && ((t >= T("p09", 0.05) && t < CU.rw2[1]) || t >= CU.whip10[1]);
      const reach = t < CU.rw2[1] ? prog(t, T("p09", 0.05), T("p09", 0.6), ease.outQ) * (1 - prog(t, CU.rw2[0], CU.rw2[1])) : prog(t, CU.whip10[1], CU.whip10[1] + 0.35, ease.outQ);
      const sunP = D2.sun.position;
      D2.beams.forEach((b, k) => {
        b.visible = beamOn;
        if (!beamOn) return;
        const o = sunP.clone().add(new V3(Math.cos(k * 1.7) * 0.1, Math.sin(k * 2.3) * 0.08, Math.sin(k * 1.7) * 0.1));
        const end = cubeTop.clone().add(new V3(Math.cos(k * 2.4) * 0.04, 0, Math.sin(k * 2.4) * 0.04));
        const d = end.clone().sub(o);
        const len = d.length();
        b.position.copy(o);
        b.quaternion.setFromUnitVectors(new V3(0, -1, 0), d.normalize());
        b.set(0.85 * (1 - 0.2 * cu), t + k * 0.27, (reach * len) / 4.5);
      });
      const filmOn = t >= CU.whip10[1];
      D2.bounces.forEach((b, k) => {
        b.visible = filmOn && t < CU.d2Out;
        if (!b.visible) return;
        const a = (k / 4) * Math.PI * 2 + 0.6;
        b.position.copy(cubeTop).add(new V3(0, 0.01, 0));
        b.quaternion.setFromUnitVectors(new V3(0, -1, 0), new V3(Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7).normalize());
        b.set(0.8, t * 1.4 + k * 0.25, prog(t, CU.whip10[1] + 0.35 + k * 0.07, CU.whip10[1] + 0.7 + k * 0.07, ease.outQ));
      });
      const vie = wordAt("p09", "vieillissement", 26.34);
      const rw = 1 - prog(t, CU.rw2[0], CU.rw2[1]);
      D2.cube.set({
        dull: t < CU.rw2[1] ? 0.65 * prog(t, vie, vie + 0.8) * rw : 0,
        dots: t < CU.rw2[1] ? prog(t, TAC - 0.3, TAC + 0.4) * rw : 0,
        film: filmOn ? prog(t, CU.whip10[1] + 0.05, CU.whip10[1] + 0.55) : 0,
      });
      const cubeW = W3("d2", cubeTop.x, cubeTop.y, cubeTop.z);
      sparkle("d2", cubeW.clone().add(new V3(0, 0.04, 0)), t, CU.whip10[1] + 0.45, 0.9, 0.13, 0.03);
      const mid = W3("d2", lerp(sunP.x, cubeTop.x, 0.55), lerp(sunP.y, cubeTop.y, 0.55), lerp(sunP.z, cubeTop.z, 0.55));
      ui.callout(project(mid), "UV", fadeWin(t, T("p09", 0.45), CU.rw2[0] - 0.05, 0.2, 0.2), { side: 1, dx: 90, dy: -40, accent: true, size: 32 });
      ui.callout(project(W3("d2", D2.cloud.position.x, D2.cloud.position.y - 0.22, D2.cloud.position.z)), "Même quand il fait gris", fadeWin(t, MEME + 0.1, CU.rw2[0], 0.2, 0.15), { side: -1, dx: 40, dy: 120 });
    }

    // ================================================= D3 — changing everything
    if (st === "d3") {
      const days = CU.days;
      let pg = 0;
      days.forEach((f) => (pg += prog(t, f - 0.12, f + 0.12, ease.inOutS)));
      pg *= 1 - prog(t, CU.rw3[0], CU.rw3[1]);
      D3.cal.set(pg);
      const weeks = t >= CU.rw3[1];
      D3.cal.visible = !weeks;
      D3.calW.visible = weeks;
      const q = wordAt("p14", "quelques", 46.17);
      D3.calW.set([0, 0.3, 0.6].reduce((a, x) => a + prog(t, q + x - 0.1, q + x + 0.12, ease.inOutS), 0));
      // hourglass: flipped before it can run (plan 12), frozen (13), finally flowing (14)
      let topSand = 0.97;
      let flip = 0;
      if (t < CU.rw3[1]) {
        days.forEach((f) => {
          const u = prog(t, f + 0.62, f + 0.85, ease.inOutC);
          if (u > 0 && u < 1) flip = Math.PI * u;
        });
      } else topSand = 1 - 0.85 * prog(t, CU.rw3[1], CU.d3Out, ease.linear);
      D3.glassH.set(topSand, t >= CU.rw3[1], flip);
      D3.vase.set(t < CU.rw3[1] ? 0.62 : 0.62 + 0.38 * prog(t, CU.rw3[1], CU.d3Out - 0.6, ease.outQ));
      // niche shimmer: the temptation (plan 11)
      sparkle("d3", W3("d3", 0, 1.32, PANEL_Z + 0.08), t, T("p11", 0.5), 1.4, 0.5, 0.035);
      // the daily picks fly from the niche to the table, each with a « NOUVEAU » tag
      const orbitStart = T("p13", 0.05);
      ORBIT.forEach((p, k) => {
        const isDaily = k < 4;
        const homeSet = isDaily ? nicheHome[DAILY[k]].clone().add(new V3(0, 0, PANEL_Z)) : ORBIT_SPAWN[k - 4];
        let pos = homeSet.clone();
        let vis = isDaily;
        let spin = 0;
        if (isDaily) {
          const f = days[k];
          const land = new V3(ROW[k], D3.TY, ROWZ);
          if (t >= f + 0.15 && t < f + 0.55) pos = arc(homeSet, land, ease.inOutS(prog(t, f + 0.15, f + 0.55, ease.linear)), 0.14);
          else if (t >= f + 0.55) pos = land.clone();
          if (t >= f + 0.55 && t < orbitStart) pos.y += 0.01 * Math.exp(-(t - f - 0.55) * 10) * Math.abs(Math.sin((t - f - 0.55) * 26));
          const until = k < 3 ? days[k + 1] + 0.5 : orbitStart;
          ui.tag(project(W3("d3", land.x, land.y + (p.H || 0.15) * p.scale.y + 0.06, land.z)), "NOUVEAU", fadeWin(t, f + 0.55, until, 0.12, 0.15), { accent: true, size: 24, spacing: 0.14 });
        }
        // plan 13: everything orbits around the vanity; the rewind sends it all back
        const a0 = (k / ORBIT.length) * Math.PI * 2;
        const orbitAt = (tt) => {
          const ang = a0 + 0.5 * (tt - orbitStart);
          return new V3(0.02 + Math.cos(ang) * 0.52, 0.96 + 0.03 * Math.sin(tt * 2 + k), -0.36 + Math.sin(ang) * 0.34);
        };
        const rise = prog(t, orbitStart + 0.04 * k, orbitStart + 0.6 + 0.04 * k);
        const back0 = CU.rw3[0] + 0.025 * k;
        if (t >= orbitStart && t < back0) {
          pos = pos.clone().lerp(orbitAt(t), rise);
          vis = true;
          spin = (t - orbitStart) * 0.8 + k;
        } else if (t >= back0 && t < CU.rw3[1] + 0.2) {
          const u = prog(t, back0, back0 + 0.3, ease.linear);
          pos = arc(orbitAt(back0), homeSet, ease.inOutS(u), 0.1);
          vis = isDaily || u < 0.999;
          spin = (back0 - orbitStart) * 0.8 + k;
        } else if (t >= CU.rw3[1] + 0.2) {
          pos = homeSet.clone();
          vis = isDaily;
        }
        p.visible = vis;
        if (isDaily) p.position.set(pos.x, pos.y, pos.z - PANEL_Z);
        else p.position.copy(pos);
        p.rotation.y = spin;
        if (p.shadow) p.shadow.visible = !(t >= orbitStart && t < CU.rw3[1]);
        const qa = fadeWin(t, T("p13", 0.7) + 0.05 * k, CU.rw3[0] + 0.05, 0.25, 0.12);
        if (qa > 0.01) ui.question(project(W3("d3", pos.x, pos.y + 0.2, pos.z)), ease.outBack(clamp01(qa)), clamp01(qa));
      });
      // plan 14: the same three products, calmly, every day
      D3.trio.forEach((p, k) => {
        const s = ease.outBack(clamp01((t - CU.rw3[1] - 0.05 - k * 0.12) / 0.4));
        p.visible = s > 0.001;
        p.scale.setScalar(Math.max(0.001, s));
        p.position.set([-0.12, 0.0, 0.12][k], D3.TY, ROWZ);
      });
      const cubeW = W3("d3", D3.cube.position.x, D3.cube.position.y + D3.cube.topY, D3.cube.position.z);
      sparkle("d3", cubeW.clone().add(new V3(0, 0.03, 0)), t, q + 0.6, 0.9, 0.09, 0.025);
    }

    renderFrame(t);
  };

  window.__worldDebug = { shotAt, K };
  ready = true;
  renderAt(pendingT ?? window.__hfThreeTime ?? 0);
}

window.__hf.buildReady.world = build();
window.addEventListener("hf-seek", (e) => {
  if (!ready) {
    pendingT = e.detail.time;
    return;
  }
  renderAt(e.detail.time);
});
