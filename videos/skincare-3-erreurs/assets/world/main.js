// Look-dev entry (temporary): builds the sets and lights, renders debug shots on demand.
import { THREE, scene, renderer, placeCamera, renderFrame, bokeh, V3 } from "./core.js";
import { buildLab, buildD1, buildD2, buildD3, STAGE_X, MINI } from "./stages.js";

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};

async function build() {
  await Promise.all(["600 64px \"Cormorant Garamond\"", "500 64px \"Plus Jakarta Sans\"", "600 64px \"Plus Jakarta Sans\""].map((f) => document.fonts.load(f)));
  const hemi = new THREE.HemisphereLight(0xfff6ec, 0xd9c3ad, 0.35);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0e0, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 20 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 9;
  key.shadow.blurSamples = 12;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffe6d2, 0.9);
  scene.add(rim, rim.target);
  const LAB = buildLab();
  const D1 = buildD1();
  const D2 = buildD2();
  const D3 = buildD3();
  for (const s of [LAB, D1, D2, D3]) scene.add(s.S);
  [D1, D2, D3].forEach((d, i) => {
    const mini = d.set.clone(true);
    mini.position.set(0, 0, 0);
    mini.scale.setScalar(MINI);
    LAB.islands[i].holder.add(mini);
  });
  window.__lookdev = (st, shot, opt = {}) => {
    const c = new V3(STAGE_X[st], 0, 0);
    key.position.set(c.x - 2.2, 4.2, 3.2);
    key.target.position.set(c.x, 0.6, -0.4);
    key.target.updateMatrixWorld();
    rim.position.set(c.x + 2.5, 2.5, -3);
    rim.target.position.set(c.x, 0.8, 0);
    rim.target.updateMatrixWorld();
    const P = [shot.P[0] + STAGE_X[st], shot.P[1], shot.P[2]];
    const { distance } = placeCamera({ ...shot, P });
    bokeh.enabled = !!opt.dof;
    if (opt.dof) {
      bokeh.uniforms.focus.value = distance;
      bokeh.uniforms.aperture.value = opt.dof;
    }
    const t0 = performance.now();
    renderFrame(0);
    renderer.getContext().finish();
    return Math.round(performance.now() - t0);
  };
}
window.__hf.buildReady.world = build();
