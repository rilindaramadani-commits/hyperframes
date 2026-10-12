// Crisp 2D interface drawn over the 3D each frame (anchored callouts, gauge, checklist, tags).
// Positions come from the live camera projection, so labels stay glued to their objects.
const SANS = '"Plus Jakarta Sans"';
const SERIF = '"Cormorant Garamond"';
const INK = "#2e231c";
const BRONZE = "#a37b4c";
const CREAM = "rgba(251,248,243,0.94)";
const SAGE = "#8faa8c";
const CORAL = "#e58c7a";

export function createUI(canvas) {
  const W = canvas.width;
  const H = canvas.height;
  const g = canvas.getContext("2d");
  const clamp01 = (x) => Math.min(1, Math.max(0, x));

  function pill(x, y, text, { size = 30, weight = 600, accent = false, alpha = 1, align = "center", font = SANS, spacing = 0.02 } = {}) {
    if (alpha <= 0.01) return null;
    g.save();
    g.globalAlpha = alpha;
    g.font = `${weight} ${size}px ${font}`;
    g.letterSpacing = `${spacing * size}px`;
    const tw = g.measureText(text).width;
    const padX = size * 0.75;
    const h = size * 1.85;
    const w = tw + padX * 2;
    const x0 = align === "left" ? x : align === "right" ? x - w : x - w / 2;
    const y0 = y - h / 2;
    g.shadowColor = "rgba(70,50,35,0.16)";
    g.shadowBlur = 24;
    g.shadowOffsetY = 8;
    g.fillStyle = accent ? BRONZE : CREAM;
    g.beginPath();
    g.roundRect(x0, y0, w, h, h / 2);
    g.fill();
    g.shadowColor = "transparent";
    if (!accent) {
      g.strokeStyle = "rgba(163,123,76,0.5)";
      g.lineWidth = 1.5;
      g.stroke();
    }
    g.fillStyle = accent ? "#fbf7f1" : INK;
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillText(text, x0 + padX, y + size * 0.04);
    g.restore();
    return { x0, y0, w, h };
  }

  /** Dot on the object, a thin bronze leader line, then the label. side: -1 = label on the left. */
  function callout(anchor, text, alpha, { dx = 170, dy = -90, side = 1, size = 30, accent = false, serif = false } = {}) {
    if (!anchor || alpha <= 0.01) return;
    const a = clamp01(alpha);
    g.save();
    g.font = `600 ${size}px ${SANS}`;
    g.letterSpacing = `${0.02 * size}px`;
    const lw = g.measureText(text).width + size * 1.5 + 12;
    g.restore();
    let ex = anchor.x + side * dx;
    if (side > 0) ex = Math.min(ex, 1000 - lw);
    else ex = Math.max(ex, 80 + lw);
    const ey = Math.min(1480, Math.max(240, anchor.y + dy));
    g.save();
    g.globalAlpha = a;
    g.strokeStyle = "rgba(163,123,76,0.9)";
    g.lineWidth = 2;
    const grow = clamp01(a * 1.6);
    g.beginPath();
    g.moveTo(anchor.x, anchor.y);
    const mx = anchor.x + (ex - anchor.x) * grow;
    const my = anchor.y + (ey - anchor.y) * grow;
    g.lineTo(mx, my);
    g.stroke();
    g.fillStyle = "#fbf7f1";
    g.beginPath();
    g.arc(anchor.x, anchor.y, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = BRONZE;
    g.beginPath();
    g.arc(anchor.x, anchor.y, 4.5, 0, Math.PI * 2);
    g.fill();
    g.restore();
    pill(ex + side * 6, ey, text, { size, align: side > 0 ? "left" : "right", alpha: clamp01((a - 0.35) / 0.65), accent, font: serif ? SERIF : SANS, weight: serif ? 600 : 600 });
  }

  function tag(p, text, alpha, opts = {}) {
    if (!p) return;
    pill(p.x, p.y, text, { alpha, ...opts });
  }

  /** Sage medallion with a check mark (completed island). */
  function check(p, s, alpha = 1) {
    if (!p || s <= 0.01 || alpha <= 0.01) return;
    g.save();
    g.globalAlpha = alpha;
    g.translate(p.x, p.y);
    g.scale(s, s);
    g.shadowColor = "rgba(70,50,35,0.2)";
    g.shadowBlur = 20;
    g.shadowOffsetY = 6;
    g.fillStyle = SAGE;
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(255,255,255,0.85)";
    g.lineWidth = 3;
    g.stroke();
    g.strokeStyle = "#fff";
    g.lineWidth = 6;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(-12, 1);
    g.lineTo(-3, 10);
    g.lineTo(14, -9);
    g.stroke();
    g.restore();
  }

  /** Question mark bubble (plan 13). */
  function question(p, s, alpha = 1) {
    if (!p || s <= 0.01 || alpha <= 0.01) return;
    g.save();
    g.globalAlpha = alpha;
    g.translate(p.x, p.y);
    g.scale(s, s);
    g.shadowColor = "rgba(70,50,35,0.18)";
    g.shadowBlur = 16;
    g.shadowOffsetY = 5;
    g.fillStyle = CREAM;
    g.beginPath();
    g.arc(0, 0, 26, 0, Math.PI * 2);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(163,123,76,0.65)";
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = BRONZE;
    g.font = `600 40px ${SERIF}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("?", 0, 2);
    g.restore();
  }

  /** Thin semicircular gauge: « Tolérance de la peau ». */
  function gauge(cx, cy, value, alpha, pulse = 0) {
    if (alpha <= 0.01) return;
    const R = 92;
    g.save();
    g.globalAlpha = alpha;
    g.shadowColor = "rgba(70,50,35,0.14)";
    g.shadowBlur = 28;
    g.shadowOffsetY = 10;
    g.fillStyle = CREAM;
    g.beginPath();
    g.roundRect(cx - 150, cy - 128, 300, 210, 34);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(163,123,76,0.4)";
    g.lineWidth = 1.5;
    g.stroke();
    g.lineCap = "round";
    g.lineWidth = 12;
    g.strokeStyle = "rgba(46,35,28,0.09)";
    g.beginPath();
    g.arc(cx, cy, R, Math.PI, Math.PI * 2);
    g.stroke();
    const grd = g.createLinearGradient(cx - R, 0, cx + R, 0);
    grd.addColorStop(0, SAGE);
    grd.addColorStop(0.55, "#e2b877");
    grd.addColorStop(1, CORAL);
    g.strokeStyle = grd;
    const v = clamp01(value);
    g.beginPath();
    g.arc(cx, cy, R, Math.PI, Math.PI + Math.PI * Math.max(0.001, v));
    g.stroke();
    const a = Math.PI + Math.PI * v;
    const px = cx + Math.cos(a) * R;
    const py = cy + Math.sin(a) * R;
    if (pulse > 0) {
      g.fillStyle = `rgba(229,140,122,${0.25 * pulse})`;
      g.beginPath();
      g.arc(px, py, 22 + 10 * pulse, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#fbf7f1";
    g.beginPath();
    g.arc(px, py, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = v > 0.72 ? CORAL : v > 0.4 ? "#d6a35f" : SAGE;
    g.beginPath();
    g.arc(px, py, 7.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = INK;
    g.font = `600 19px ${SANS}`;
    g.letterSpacing = "3.4px";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("TOLÉRANCE", cx, cy + 34);
    g.fillText("DE LA PEAU", cx, cy + 60);
    g.restore();
  }

  /** Morning checklist card. checks: 0..1 per row; hl = index of the highlighted (missing) row. */
  function checklist(x, y, rows, checks, alpha, hl = -1, pulse = 0) {
    if (alpha <= 0.01) return;
    const w = 400;
    const rowH = 70;
    const h = 96 + rows.length * rowH;
    g.save();
    g.globalAlpha = alpha;
    g.shadowColor = "rgba(70,50,35,0.15)";
    g.shadowBlur = 30;
    g.shadowOffsetY = 12;
    g.fillStyle = CREAM;
    g.beginPath();
    g.roundRect(x, y, w, h, 34);
    g.fill();
    g.shadowColor = "transparent";
    g.strokeStyle = "rgba(163,123,76,0.4)";
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = BRONZE;
    g.font = `600 20px ${SANS}`;
    g.letterSpacing = "4px";
    g.textBaseline = "middle";
    g.textAlign = "left";
    g.fillText("ROUTINE DU MATIN", x + 36, y + 52);
    rows.forEach((label, i) => {
      const ry = y + 104 + i * rowH;
      const c = clamp01(checks[i] || 0);
      const isHl = i === hl && pulse > 0;
      if (isHl) {
        g.fillStyle = `rgba(163,123,76,${0.1 + 0.08 * pulse})`;
        g.beginPath();
        g.roundRect(x + 18, ry - 30, w - 36, 60, 20);
        g.fill();
      }
      const cx = x + 60;
      if (c > 0.01) {
        g.fillStyle = SAGE;
        g.beginPath();
        g.arc(cx, ry, 19 * (0.6 + 0.4 * c), 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "#fff";
        g.lineWidth = 4.5;
        g.lineCap = "round";
        g.lineJoin = "round";
        g.beginPath();
        const k = clamp01((c - 0.3) / 0.7);
        g.moveTo(cx - 8, ry + 1);
        g.lineTo(cx - 2, ry + 7);
        if (k > 0.4) g.lineTo(cx - 2 + 12 * clamp01((k - 0.4) / 0.6), ry + 7 - 14 * clamp01((k - 0.4) / 0.6));
        g.stroke();
      } else {
        g.strokeStyle = isHl ? BRONZE : "rgba(46,35,28,0.35)";
        g.lineWidth = 2.5;
        g.setLineDash([5, 6]);
        g.beginPath();
        g.arc(cx, ry, 18, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
      }
      g.fillStyle = INK;
      g.globalAlpha = alpha * (c > 0.01 || isHl ? 1 : 0.62);
      g.font = `600 32px ${SANS}`;
      g.letterSpacing = "0.5px";
      g.fillText(label, x + 98, ry + 1);
      g.globalAlpha = alpha;
    });
    g.restore();
  }

  return {
    W,
    H,
    begin(t = 0) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.clearRect(0, 0, W, H);
      // a near-invisible pixel that changes every frame keeps the layer from being cached as stale
      g.fillStyle = `rgba(255,255,255,${(1 + (Math.round(t * 30) % 3)) / 255})`;
      g.fillRect(0, 0, 1, 1);
    },
    pill,
    callout,
    tag,
    check,
    question,
    gauge,
    checklist,
  };
}
