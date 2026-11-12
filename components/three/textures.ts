import { product } from "@/config/product";

/**
 * Génère l'étiquette de la canette sur un canvas 2D (aucun téléchargement).
 *
 * Disposition horizontale (u de 0 à 1, enroulée autour du cylindre) :
 *   [ FACE AVANT | CÔTÉ DROIT | ARRIÈRE | CÔTÉ GAUCHE ]
 * La géométrie du label est orientée pour que le centre de la face avant
 * (u = 0.125) regarde la caméra quand rotY = 0.
 */

export type LabelFonts = { display: string; body: string };

const C = {
  black: "#050509",
  ink: "#08070f",
  violet: "#8B2CFF",
  violetLight: "#B76BFF",
  blue: "#087BFF",
  blueLight: "#5DB4FF",
  white: "#F5F5F7",
};

type Ctx = CanvasRenderingContext2D;

function silverGradient(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.28, "#c9ccd8");
  g.addColorStop(0.45, "#f7f7fb");
  g.addColorStop(0.62, "#8d91a6");
  g.addColorStop(0.8, "#e8e9f0");
  g.addColorStop(1, "#a7abbd");
  return g;
}

function violetGradient(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, C.violetLight);
  g.addColorStop(0.55, C.violet);
  g.addColorStop(1, "#5b14c9");
  return g;
}

function fitFont(ctx: Ctx, text: string, font: (s: number) => string, size: number, maxW: number) {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 8) {
    s -= 2;
    ctx.font = font(s);
  }
  return s;
}

function setSpacing(ctx: Ctx, px: number) {
  // letterSpacing est supporté par Chrome/Edge/Firefox/Safari récents
  (ctx as Ctx & { letterSpacing?: string }).letterSpacing = `${px}px`;
}

/** Logo « D » italique façon métal, coordonnées locales 0..1 */
function dPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const skew = 0.22;
  const P = (px: number, py: number): [number, number] => [x + (px + (1 - py) * skew) * w, y + py * h];
  ctx.beginPath();
  // contour extérieur
  ctx.moveTo(...P(0.08, 0));
  ctx.lineTo(...P(0.6, 0));
  ctx.bezierCurveTo(...P(0.98, 0), ...P(1.02, 0.32), ...P(0.95, 0.52));
  ctx.bezierCurveTo(...P(0.87, 0.82), ...P(0.66, 1), ...P(0.36, 1));
  ctx.lineTo(...P(-0.12, 1));
  ctx.lineTo(...P(0.02, 0.74));
  ctx.lineTo(...P(0.33, 0.74));
  ctx.bezierCurveTo(...P(0.52, 0.74), ...P(0.64, 0.64), ...P(0.68, 0.5));
  ctx.bezierCurveTo(...P(0.72, 0.36), ...P(0.66, 0.26), ...P(0.5, 0.26));
  ctx.lineTo(...P(0.3, 0.26));
  ctx.lineTo(...P(0.17, 0.6));
  ctx.lineTo(...P(-0.08, 0.6));
  ctx.closePath();
}

function drawDLogo(ctx: Ctx, cx: number, cy: number, size: number) {
  const w = size;
  const h = size * 0.82;
  const x = cx - w * 0.55;
  const y = cy - h / 2;

  // halo violet
  ctx.save();
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.9);
  halo.addColorStop(0, "rgba(139,44,255,0.35)");
  halo.addColorStop(1, "rgba(139,44,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
  ctx.restore();

  // swoosh bleu sous le D
  ctx.save();
  ctx.shadowColor = C.blue;
  ctx.shadowBlur = 30;
  const sw = ctx.createLinearGradient(x - w * 0.2, 0, x + w * 0.9, 0);
  sw.addColorStop(0, "rgba(8,123,255,0)");
  sw.addColorStop(0.5, C.blueLight);
  sw.addColorStop(1, C.violet);
  ctx.fillStyle = sw;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.25, y + h * 1.02);
  ctx.quadraticCurveTo(x + w * 0.35, y + h * 0.82, x + w * 0.95, y + h * 0.7);
  ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.95, x - w * 0.1, y + h * 1.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ombre portée
  ctx.save();
  ctx.translate(6, 8);
  dPath(ctx, x, y, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fill();
  ctx.restore();

  // corps métal
  ctx.save();
  dPath(ctx, x, y, w, h);
  ctx.fillStyle = silverGradient(ctx, x, y, x + w * 0.8, y + h);
  ctx.shadowColor = "rgba(183,107,255,0.55)";
  ctx.shadowBlur = 24;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.stroke();
  // reflet diagonal
  ctx.clip();
  const shine = ctx.createLinearGradient(x, y, x + w, y + h);
  shine.addColorStop(0.35, "rgba(255,255,255,0)");
  shine.addColorStop(0.45, "rgba(255,255,255,0.75)");
  shine.addColorStop(0.52, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.fillRect(x - w, y, w * 3, h);
  ctx.restore();
}

function lightningPath(ctx: Ctx, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x + 0.15 * s, y - 0.5 * s);
  ctx.lineTo(x - 0.2 * s, y + 0.08 * s);
  ctx.lineTo(x + 0.02 * s, y + 0.08 * s);
  ctx.lineTo(x - 0.12 * s, y + 0.5 * s);
  ctx.lineTo(x + 0.22 * s, y - 0.1 * s);
  ctx.lineTo(x + 0.0 * s, y - 0.1 * s);
  ctx.closePath();
}

function drawIcon(ctx: Ctx, kind: "bolt" | "brain" | "run", x: number, y: number, s: number) {
  ctx.save();
  ctx.strokeStyle = C.white;
  ctx.fillStyle = C.white;
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (kind === "bolt") {
    lightningPath(ctx, x, y, s);
    ctx.stroke();
  } else if (kind === "brain") {
    ctx.beginPath();
    ctx.ellipse(x - s * 0.16, y, s * 0.2, s * 0.32, 0, 0, Math.PI * 2);
    ctx.ellipse(x + s * 0.16, y, s * 0.2, s * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - s * 0.2, y - s * 0.12);
    ctx.quadraticCurveTo(x - s * 0.05, y, x - s * 0.2, y + s * 0.12);
    ctx.moveTo(x + s * 0.2, y - s * 0.12);
    ctx.quadraticCurveTo(x + s * 0.05, y, x + s * 0.2, y + s * 0.12);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x + s * 0.12, y - s * 0.36, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.05, y - s * 0.22);
    ctx.lineTo(x - s * 0.05, y + s * 0.08);
    ctx.lineTo(x + s * 0.15, y + s * 0.22);
    ctx.lineTo(x + s * 0.1, y + s * 0.45);
    ctx.moveTo(x - s * 0.05, y + s * 0.08);
    ctx.lineTo(x - s * 0.25, y + s * 0.42);
    ctx.moveTo(x + s * 0.03, y - s * 0.15);
    ctx.lineTo(x + s * 0.25, y - s * 0.02);
    ctx.moveTo(x + s * 0.0, y - s * 0.15);
    ctx.lineTo(x - s * 0.25, y - s * 0.05);
    ctx.stroke();
  }
  ctx.restore();
}

function shard(ctx: Ctx, pts: number[], c0: string, c1: string, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < pts.length; i += 2) {
    minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]);
    minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]);
  }
  const g = ctx.createLinearGradient(minX, minY, maxX, maxY);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.shadowColor = c1;
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ */

function drawFront(ctx: Ctx, P: number, H: number, f: LabelFonts) {
  const cx = P / 2;
  // lueur basse
  const g = ctx.createRadialGradient(cx, H * 0.66, 0, cx, H * 0.66, P * 0.8);
  g.addColorStop(0, "rgba(139,44,255,0.55)");
  g.addColorStop(0.5, "rgba(8,123,255,0.18)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, P, H);

  // éclats latéraux
  shard(ctx, [0, H * 0.18, P * 0.18, H * 0.12, P * 0.05, H * 0.42], "rgba(8,123,255,0)", C.blue, 0.7);
  shard(ctx, [P, H * 0.3, P * 0.82, H * 0.36, P, H * 0.55], "rgba(139,44,255,0)", C.violet, 0.8);

  drawDLogo(ctx, cx, H * 0.235, P * 0.62);

  // DEVVERSE
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  setSpacing(ctx, 2);
  const s1 = fitFont(ctx, "DEVVERSE", (s) => `italic 900 ${s}px ${f.display}`, 96, P * 0.88);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillText("DEVVERSE", cx + 4, H * 0.445 + 5);
  ctx.fillStyle = silverGradient(ctx, 0, H * 0.445 - s1, 0, H * 0.445);
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 10;
  ctx.fillText("DEVVERSE", cx, H * 0.445);
  ctx.shadowBlur = 0;

  setSpacing(ctx, 6);
  const s2 = fitFont(ctx, "ENERGY", (s) => `italic 900 ${s}px ${f.display}`, 76, P * 0.62);
  ctx.fillStyle = violetGradient(ctx, 0, H * 0.505 - s2, 0, H * 0.505);
  ctx.shadowColor = C.violet;
  ctx.shadowBlur = 22;
  ctx.fillText("ENERGY", cx, H * 0.505);
  ctx.shadowBlur = 0;

  setSpacing(ctx, 5);
  fitFont(ctx, product.tagline, (s) => `700 ${s}px ${f.body}`, 32, P * 0.82);
  ctx.fillStyle = C.white;
  ctx.fillText(product.tagline, cx, H * 0.585);
  ctx.restore();

  // burst d'énergie
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const by = H * 0.665;
  const bg = ctx.createRadialGradient(cx, by, 0, cx, by, P * 0.45);
  bg.addColorStop(0, "rgba(180,220,255,0.95)");
  bg.addColorStop(0.15, "rgba(8,123,255,0.6)");
  bg.addColorStop(1, "rgba(139,44,255,0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(cx, by, P * 0.5, P * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,230,255,0.9)";
  ctx.lineWidth = 2;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 9; k++) {
    ctx.beginPath();
    let px = cx, py = by;
    const dir = k % 2 ? 1 : -1;
    ctx.moveTo(px, py);
    for (let j = 0; j < 7; j++) {
      px += dir * (12 + rnd() * 22);
      py += (rnd() - 0.5) * 26;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();

  // montagnes
  ctx.save();
  const base = H * 0.8;
  ctx.beginPath();
  ctx.moveTo(0, base);
  const peaks = [0, 0.74, 0.12, 0.7, 0.24, 0.73, 0.38, 0.67, 0.5, 0.69, 0.6, 0.66, 0.72, 0.71, 0.84, 0.69, 1, 0.74];
  for (let i = 0; i < peaks.length; i += 2) ctx.lineTo(peaks[i] * P, peaks[i + 1] * H + H * 0.02);
  ctx.lineTo(P, base);
  ctx.closePath();
  const mg = ctx.createLinearGradient(0, H * 0.67, 0, base);
  mg.addColorStop(0, "#2a1650");
  mg.addColorStop(1, "#07060c");
  ctx.fillStyle = mg;
  ctx.fill();
  ctx.strokeStyle = "rgba(183,107,255,0.9)";
  ctx.shadowColor = C.violet;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // pictogrammes
  const iy = H * 0.85;
  const labels: [("bolt" | "brain" | "run"), string, string][] = [
    ["bolt", "ENERGY", "BOOST"],
    ["brain", "MENTAL", "FOCUS"],
    ["run", "ENDURANCE", ""],
  ];
  labels.forEach(([k, l1, l2], i) => {
    const x = P * (0.2 + i * 0.3);
    drawIcon(ctx, k, x, iy, 56);
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = C.white;
    setSpacing(ctx, 1);
    ctx.font = `700 19px ${f.body}`;
    ctx.fillText(l1, x, iy + 58);
    if (l2) ctx.fillText(l2, x, iy + 80);
    ctx.restore();
  });

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = C.white;
  ctx.font = `600 30px ${f.body}`;
  ctx.fillText(product.volume, P / 2, H * 0.965);
  ctx.restore();
}

function drawRight(ctx: Ctx, P: number, H: number, f: LabelFonts) {
  shard(ctx, [P * 0.1, H, P * 0.95, H * 0.62, P, H * 0.7, P * 0.45, H], "rgba(8,123,255,0.2)", C.violet, 0.9);
  shard(ctx, [P * 0.55, H * 0.85, P, H * 0.5, P, H * 0.62], "rgba(139,44,255,0.1)", C.blue, 0.85);
  shard(ctx, [P * 0.6, 0, P, 0, P, H * 0.22], "rgba(139,44,255,0)", C.violet, 0.7);
  shard(ctx, [0, H * 0.08, P * 0.25, 0, P * 0.12, 0], "rgba(8,123,255,0)", C.blue, 0.6);

  ctx.save();
  ctx.translate(P * 0.44, H * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setSpacing(ctx, 4);
  const s = fitFont(ctx, "DEVVERSE", (z) => `italic 900 ${z}px ${f.display}`, 190, H * 0.8);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillText("DEVVERSE", 5, 6);
  ctx.fillStyle = silverGradient(ctx, 0, -s / 2, 0, s / 2);
  ctx.fillText("DEVVERSE", 0, 0);

  setSpacing(ctx, 10);
  fitFont(ctx, "ENERGY", (z) => `italic 900 ${z}px ${f.display}`, 110, H * 0.5);
  ctx.fillStyle = violetGradient(ctx, -200, 0, 200, 0);
  ctx.shadowColor = C.violet;
  ctx.shadowBlur = 24;
  ctx.fillText("ENERGY", H * 0.08, P * 0.29);
  ctx.shadowBlur = 0;

  setSpacing(ctx, 9);
  ctx.font = `600 26px ${f.body}`;
  ctx.fillStyle = "rgba(245,245,247,0.9)";
  ctx.fillText(product.tagline, H * 0.06, P * 0.44);
  ctx.restore();
}

function drawBack(ctx: Ctx, P: number, H: number, f: LabelFonts) {
  const m = P * 0.08;
  const w = P - m * 2;
  let y = H * 0.07;
  ctx.save();
  ctx.fillStyle = C.white;
  ctx.textBaseline = "alphabetic";

  ctx.font = `700 25px ${f.body}`;
  setSpacing(ctx, 1);
  fitFont(ctx, "INFORMATIONS NUTRITIONNELLES", (s) => `700 ${s}px ${f.body}`, 27, w);
  ctx.fillText("INFORMATIONS NUTRITIONNELLES", m, y);
  y += 16;

  // tableau
  ctx.strokeStyle = "rgba(245,245,247,0.75)";
  ctx.lineWidth = 1.5;
  const c1 = m + w * 0.52;
  const c2 = m + w * 0.77;
  const tableTop = y;
  ctx.font = `600 17px ${f.body}`;
  y += 26;
  ctx.fillText("Pour 100 ml", c1 + 4, y);
  ctx.fillText(`Pour ${product.nutritionServing}`, c2 + 4, y);
  y += 12;
  ctx.beginPath(); ctx.moveTo(m, y); ctx.lineTo(m + w, y); ctx.stroke();
  for (const row of product.nutrition) {
    y += 30;
    ctx.font = `${row.indent ? 500 : 600} 17px ${f.body}`;
    ctx.fillText(row.label, m + (row.indent ? 14 : 4), y, c1 - m - 18);
    ctx.font = `600 17px ${f.body}`;
    ctx.fillText(row.per100, c1 + 4, y, c2 - c1 - 8);
    ctx.fillText(row.perServing, c2 + 4, y, m + w - c2 - 8);
    y += 10;
    ctx.beginPath(); ctx.moveTo(m, y); ctx.lineTo(m + w, y); ctx.stroke();
  }
  ctx.strokeRect(m, tableTop, w, y - tableTop);
  ctx.beginPath();
  ctx.moveTo(c1, tableTop); ctx.lineTo(c1, y);
  ctx.moveTo(c2, tableTop); ctx.lineTo(c2, y);
  ctx.stroke();

  // ingrédients
  y += 46;
  ctx.font = `700 21px ${f.body}`;
  ctx.fillText("INGRÉDIENTS :", m, y);
  y += 28;
  ctx.font = `500 18px ${f.body}`;
  const words = product.ingredientsText.split(" ");
  let line = "";
  for (const wd of words) {
    const test = line ? `${line} ${wd}` : wd;
    if (ctx.measureText(test).width > w) {
      ctx.fillText(line, m, y);
      y += 24;
      line = wd;
    } else line = test;
  }
  if (line) ctx.fillText(line, m, y);

  // vitamines
  y += 44;
  ctx.font = `700 20px ${f.body}`;
  ctx.fillText("Vitamines :", m, y);
  ctx.font = `500 17px ${f.body}`;
  for (const v of product.vitamins) {
    y += 27;
    ctx.fillText(v.label, m, y);
    ctx.fillText(v.amount, m + w * 0.5, y);
    ctx.fillText(`(${v.ar})`, m + w * 0.7, y);
  }
  y += 26;
  ctx.font = `500 15px ${f.body}`;
  ctx.fillText("*AR : Apports de Référence", m, y);

  // badges
  y += 70;
  ctx.textAlign = "center";
  product.badges.forEach((b, i) => {
    const x = m + w * (0.17 + i * 0.33);
    ctx.beginPath();
    ctx.arc(x, y - 18, 20, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `600 13px ${f.body}`;
    const parts = b.toUpperCase().split(" ");
    const half = Math.ceil(parts.length / 2);
    ctx.fillText(parts.slice(0, half).join(" "), x, y + 22, w * 0.32);
    if (parts.length > 1) ctx.fillText(parts.slice(half).join(" "), x, y + 38, w * 0.32);
  });
  ctx.textAlign = "left";

  // code-barres
  y = H * 0.86;
  const bw = w * 0.62;
  ctx.fillStyle = "#f5f5f7";
  ctx.fillRect(m, y, bw, H * 0.085);
  ctx.fillStyle = "#050509";
  let x = m + 14;
  const digits = product.barcode;
  for (let i = 0; i < digits.length * 4 && x < m + bw - 14; i++) {
    const d = Number(digits[i % digits.length]);
    const bar = 1.5 + ((d + i) % 4) * 1.2;
    if (i % 2 === 0) ctx.fillRect(x, y + 8, bar, H * 0.085 - 34);
    x += bar + 1.6;
  }
  ctx.font = `600 16px ${f.body}`;
  ctx.fillText(digits.replace(/^(\d)(\d{6})(\d{6})$/, "$1 $2 $3"), m + 14, y + H * 0.085 - 8);

  ctx.fillStyle = C.white;
  ctx.font = `600 26px ${f.body}`;
  ctx.textAlign = "right";
  ctx.fillText(product.volume, m + w, H * 0.94);
  ctx.font = `700 40px ${f.body}`;
  ctx.fillText("♻", m + w, H * 0.89);
  ctx.restore();
}

function drawLeft(ctx: Ctx, P: number, H: number, f: LabelFonts) {
  // grande flèche / éclair
  shard(ctx, [P * 0.15, H * 0.3, P * 0.62, H * 0.08, P * 0.55, H * 0.24, P * 0.95, H * 0.55, P * 0.42, H * 0.3], "#3a0f86", C.violet, 0.95);
  shard(ctx, [P * 0.2, H * 0.62, P * 0.85, H * 0.4, P * 0.6, H * 0.6, P, H * 0.9, P * 0.45, H * 0.66], "#05224a", C.blue, 0.85);
  shard(ctx, [0, H * 0.75, P * 0.4, H * 0.9, P * 0.15, H], "rgba(139,44,255,0)", C.violet, 0.8);
  shard(ctx, [P * 0.7, H * 0.9, P, H * 0.8, P, H], "rgba(8,123,255,0)", C.blue, 0.7);

  ctx.save();
  ctx.translate(P * 0.2, H * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = C.white;
  setSpacing(ctx, 14);
  ctx.font = `600 36px ${f.body}`;
  ctx.fillText("•  FOCUS  •  ENDURANCE", 0, 0);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = C.violetLight;
  ctx.shadowColor = C.violet;
  ctx.shadowBlur = 20;
  lightningPath(ctx, P * 0.42, H * 0.8, 70);
  ctx.fill();
  ctx.restore();
}

export function createLabelCanvas(fonts: LabelFonts, width = 2048) {
  const W = width;
  const P = W / 4;
  const H = Math.round(P * 2.734); // ≈ 512 x 1400 par face (proportions du cylindre)
  const scale = width / 2048;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // le dessin est conçu pour une largeur de 2048 px puis mis à l'échelle
  const DP = 512;
  const DH = 1400;
  ctx.scale(scale, H / DH);

  // fond continu (raccord invisible entre u=0 et u=1)
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, 2048, DH);
  const vg = ctx.createLinearGradient(0, 0, 0, DH);
  vg.addColorStop(0, "rgba(20,10,40,0.9)");
  vg.addColorStop(0.5, "rgba(5,5,9,0)");
  vg.addColorStop(1, "rgba(25,10,55,0.9)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 2048, DH);

  const panels = [drawFront, drawRight, drawBack, drawLeft];
  panels.forEach((fn, i) => {
    ctx.save();
    ctx.translate(i * DP, 0);
    ctx.beginPath();
    ctx.rect(0, 0, DP, DH);
    ctx.clip();
    fn(ctx, DP, DH, fonts);
    ctx.restore();
  });

  // micro-bandes métalliques haut / bas
  const band = (y: number) => {
    const g = ctx.createLinearGradient(0, y, 0, y + 10);
    g.addColorStop(0, "rgba(255,255,255,0.0)");
    g.addColorStop(0.5, "rgba(220,220,235,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, y, 2048, 10);
  };
  band(4);
  band(DH - 14);

  return canvas;
}

/**
 * Carte de normales des gouttelettes de condensation (tuile répétable).
 */
export function createDropletNormalCanvas(size = 1024, count = 1500) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 128; d[i + 1] = 128; d[i + 2] = 255; d[i + 3] = 255;
  }
  let seed = 1337;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const k = size / 1024;
  const stamp = (cx: number, cy: number, rx: number, ry: number) => {
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        const nz = Math.sqrt(1 - r2);
        const px = ((x % size) + size) % size;
        const py = ((y % size) + size) % size;
        const idx = (py * size + px) * 4;
        d[idx] = Math.round((nx * 0.5 + 0.5) * 255);
        d[idx + 1] = Math.round((-ny * 0.5 + 0.5) * 255);
        d[idx + 2] = Math.round(nz * 255);
      }
    }
  };
  for (let i = 0; i < count; i++) {
    const r = (1.2 + Math.pow(rnd(), 3) * 9) * k;
    stamp(rnd() * size, rnd() * size, r, r * (0.9 + rnd() * 0.25));
  }
  // quelques coulures
  for (let i = 0; i < 26; i++) {
    const x = rnd() * size;
    let y = rnd() * size;
    const r = (3 + rnd() * 3) * k;
    const len = 6 + Math.floor(rnd() * 14);
    for (let j = 0; j < len; j++) {
      stamp(x + (rnd() - 0.5) * 1.5 * k, y, r * (1 - j / (len * 1.6)), r * 1.4);
      y += r * 1.1;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
