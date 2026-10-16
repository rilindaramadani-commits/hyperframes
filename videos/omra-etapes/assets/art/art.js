/* Shared vector illustrations (original artwork, no third-party image).
 * Exposed on window.OmraArt and injected by the scene compositions at setup time.
 * Everything is static geometry — deterministic, no randomness.
 */
(function () {
  const r = (n) => Math.round(n * 10) / 10;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const pts = (arr) => arr.map((p) => `${r(p[0])},${r(p[1])}`).join(" ");

  /* Kaaba, three-quarter view from the mataf, viewBox 0 0 1000 900.
   * Front edge = Black Stone corner; right face carries the door (north-east face). */
  function kaaba(uid) {
    const Ft = [520, 196], Fb = [520, 704];
    const Lt = [168, 262], Lb = [168, 690];
    const Rt = [862, 264], Rb = [862, 692];
    // point on a face: u = 0 at front edge -> 1 at far edge, v = 0 top -> 1 bottom
    const onL = (u, v) => lerp(lerp(Ft, Lt, u), lerp(Fb, Lb, u), v);
    const onR = (u, v) => lerp(lerp(Ft, Rt, u), lerp(Fb, Rb, u), v);
    const quad = (fn, u0, u1, v0, v1) => pts([fn(u0, v0), fn(u1, v0), fn(u1, v1), fn(u0, v1)]);

    let band = "";
    // embroidered belt (hizam): two faces, with a fine geometric motif (not lettering)
    band += `<polygon points="${quad(onL, 0, 1, 0.205, 0.272)}" fill="url(#${uid}-goldL)"/>`;
    band += `<polygon points="${quad(onR, 0, 1, 0.205, 0.272)}" fill="url(#${uid}-goldR)"/>`;
    const motif = (fn, n, op) => {
      let s = "";
      for (let i = 0; i < n; i++) {
        const u0 = (i + 0.18) / n, u1 = (i + 0.82) / n;
        const a = fn(u0, 0.2385), b = fn((u0 + u1) / 2, 0.214), c = fn(u1, 0.2385), d = fn((u0 + u1) / 2, 0.263);
        s += `<polygon points="${pts([a, b, c, d])}" fill="none" stroke="#3a2a10" stroke-opacity="${op}" stroke-width="1.6"/>`;
      }
      return s;
    };
    band += motif(onL, 11, 0.55) + motif(onR, 12, 0.55);
    // thin gold rules above / below the belt
    [0.198, 0.279].forEach((v) => {
      band += `<polyline points="${pts([onL(1, v), onL(0, v), onR(0, v), onR(1, v)])}" fill="none" stroke="#e6c98a" stroke-opacity="0.55" stroke-width="2"/>`;
    });
    // small embroidered medallions under the belt
    let lamps = "";
    [[onL, [0.2, 0.5, 0.8]], [onR, [0.42, 0.62, 0.84]]].forEach(([fn, us]) => {
      us.forEach((u) => {
        const c = fn(u, 0.335);
        const w = fn === onL ? 15 : 13;
        lamps += `<path d="M ${r(c[0])} ${r(c[1] - 26)} L ${r(c[0] + w)} ${r(c[1])} L ${r(c[0])} ${r(c[1] + 26)} L ${r(c[0] - w)} ${r(c[1])} Z" fill="none" stroke="#c9a45c" stroke-opacity="0.75" stroke-width="2.2"/>`;
        lamps += `<circle cx="${r(c[0])}" cy="${r(c[1])}" r="4" fill="#e6c98a" fill-opacity="0.8"/>`;
      });
    });
    // the door, raised above the floor, near the Black Stone corner
    const door = [onR(0.085, 0.575), onR(0.27, 0.575), onR(0.27, 0.865), onR(0.085, 0.865)];
    let doorSvg = `<polygon points="${pts(door)}" fill="url(#${uid}-door)" stroke="#f0d9a0" stroke-opacity="0.7" stroke-width="2"/>`;
    for (let i = 1; i < 4; i++) {
      const v = 0.575 + (0.29 * i) / 4;
      doorSvg += `<polyline points="${pts([onR(0.1, v), onR(0.255, v)])}" stroke="#7a5a26" stroke-opacity="0.6" stroke-width="1.6" fill="none"/>`;
    }
    doorSvg += `<polyline points="${pts([onR(0.1775, 0.585), onR(0.1775, 0.855)])}" stroke="#7a5a26" stroke-opacity="0.7" stroke-width="2" fill="none"/>`;
    // the Black Stone, set in its silver frame at the corner
    const bs = lerp(Ft, Fb, 0.905);
    const stone = `<ellipse cx="${bs[0]}" cy="${r(bs[1])}" rx="7" ry="10" fill="#1d1d20" stroke="#9d998f" stroke-opacity="0.8" stroke-width="2.4"/>`;
    // marble base (shadhirwan)
    const base = `<polygon points="${pts([[Lb[0] - 16, Lb[1] + 12], [Fb[0], Fb[1] + 16], [Rb[0] + 16, Rb[1] + 12], Rb, Fb, Lb])}" fill="#d9cdb4" fill-opacity="0.9"/>`;

    return `
<svg viewBox="0 0 1000 900" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;overflow:visible">
  <defs>
    <linearGradient id="${uid}-faceL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#060607"/><stop offset="1" stop-color="#121214"/>
    </linearGradient>
    <linearGradient id="${uid}-faceR" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="#202024"/><stop offset="0.55" stop-color="#141416"/><stop offset="1" stop-color="#0b0b0c"/>
    </linearGradient>
    <linearGradient id="${uid}-goldL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7c5f2a"/><stop offset="1" stop-color="#b8924d"/>
    </linearGradient>
    <linearGradient id="${uid}-goldR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f0d9a0"/><stop offset="0.5" stop-color="#d4b06a"/><stop offset="1" stop-color="#9a7a3e"/>
    </linearGradient>
    <linearGradient id="${uid}-door" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3dea8"/><stop offset="0.5" stop-color="#cfa75e"/><stop offset="1" stop-color="#9c7637"/>
    </linearGradient>
    <linearGradient id="${uid}-top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6c98a" stop-opacity="0.10"/><stop offset="0.45" stop-color="#e6c98a" stop-opacity="0"/>
    </linearGradient>
    <pattern id="${uid}-weave" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#ffffff" stroke-opacity="0.05" stroke-width="2"/>
    </pattern>
  </defs>
  ${base}
  <polygon points="${pts([Lt, Ft, Fb, Lb])}" fill="url(#${uid}-faceL)"/>
  <polygon points="${pts([Ft, Rt, Rb, Fb])}" fill="url(#${uid}-faceR)"/>
  <polygon points="${pts([Lt, Ft, Fb, Lb])}" fill="url(#${uid}-weave)"/>
  <polygon points="${pts([Ft, Rt, Rb, Fb])}" fill="url(#${uid}-weave)"/>
  <polygon points="${pts([Lt, Ft, Fb, Lb])}" fill="url(#${uid}-top)"/>
  <polygon points="${pts([Ft, Rt, Rb, Fb])}" fill="url(#${uid}-top)"/>
  ${band}${lamps}${doorSvg}${stone}
  <polyline points="${pts([Ft, Fb])}" stroke="#e6c98a" stroke-opacity="0.35" stroke-width="2.5"/>
  <polyline points="${pts([Lt, Ft, Rt])}" fill="none" stroke="#e6c98a" stroke-opacity="0.22" stroke-width="2"/>
</svg>`;
  }

  /* Minaret silhouette, viewBox 0 0 120 1000 (finial at top). */
  function minaret(fill) {
    const f = fill || "#0b231b";
    return `
<svg viewBox="0 0 120 1000" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
  <path d="M60 0 L64 40 L66 60 L74 70 L74 95 L46 95 L46 70 L54 60 L56 40 Z" fill="${f}"/>
  <path d="M58 6 A 9 9 0 1 0 66 18 A 7 7 0 1 1 58 6 Z" fill="#c9a45c" fill-opacity="0.85"/>
  <rect x="40" y="95" width="40" height="150" fill="${f}"/>
  <rect x="30" y="240" width="60" height="16" rx="3" fill="${f}"/>
  <rect x="36" y="256" width="48" height="220" fill="${f}"/>
  <rect x="26" y="470" width="68" height="18" rx="3" fill="${f}"/>
  <rect x="32" y="488" width="56" height="512" fill="${f}"/>
  <rect x="54" y="140" width="12" height="40" rx="6" fill="#e6c98a" fill-opacity="0.55"/>
  <rect x="54" y="320" width="12" height="46" rx="6" fill="#e6c98a" fill-opacity="0.45"/>
  <rect x="54" y="560" width="12" height="54" rx="6" fill="#e6c98a" fill-opacity="0.35"/>
</svg>`;
  }

  window.OmraArt = { kaaba, minaret };
})();
