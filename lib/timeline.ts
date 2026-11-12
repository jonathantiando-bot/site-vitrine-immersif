import gsap from "gsap";
import { sceneState, resetSceneState } from "@/lib/sceneState";

/**
 * Construit la timeline maître (durée totale = 100 unités).
 * Elle anime à la fois :
 *  - l'objet `sceneState` lu par la scène 3D (canette, caméra, lumières, effets)
 *  - les éléments DOM des overlays (textes, panneaux)
 * Tout est dans UNE seule timeline scrubée => synchronisation parfaite
 * entre le produit et les textes.
 *
 * Règle : pour une même propriété, les segments ne se chevauchent jamais.
 */
export function buildMasterTimeline(root: HTMLElement) {
  resetSceneState();
  const q = gsap.utils.selector(root);
  const S = sceneState;
  const TAU = Math.PI * 2;
  const tl = gsap.timeline({ defaults: { ease: "sine.inOut" }, paused: true });

  /** tween d'état 3D */
  const k = (at: number, dur: number, props: Partial<typeof S>, ease = "sine.inOut") =>
    tl.to(S, { ...props, duration: dur, ease }, at);

  /** apparition / disparition de texte */
  const show = (sel: string, at: number, dur = 2, from: gsap.TweenVars = {}, to: gsap.TweenVars = {}) =>
    tl.fromTo(
      q(sel),
      { autoAlpha: 0, y: 40, filter: "blur(12px)", ...from },
      { autoAlpha: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)", duration: dur, ease: "power2.out", ...to },
      at,
    );
  const hide = (sel: string, at: number, dur = 2, to: gsap.TweenVars = {}) =>
    tl.to(q(sel), { autoAlpha: 0, y: -40, filter: "blur(10px)", duration: dur, ease: "power2.in", ...to }, at);

  // Garantit la durée totale exacte
  tl.set({}, {}, 100);

  /* ---------------- SCÈNE 1 — APPARITION (0 → 12) ---------------- */
  hide('[data-a="hint"]', 0.3, 1.5);
  k(0, 3.5, { farGlow: 1 }, "power1.out");
  k(1, 5, { particles: 0.7 }, "power1.out");
  k(1, 9, { canZ: 0, rotY: -0.35, rotX: 0.08 }, "power2.out");
  k(1, 9, { env: 1, rim: 1, purple: 1, blue: 1 }, "power1.inOut");
  k(2.5, 8.5, { key: 1 }, "power1.inOut");
  k(0, 11, { camZ: 6.4, camY: 0.15 }, "sine.inOut");
  k(8, 5, { farGlow: 0.15 }, "sine.inOut");
  show('[data-a="s1"]', 5.5, 2.5, { letterSpacing: "0.5em" }, { letterSpacing: "0.12em" });
  hide('[data-a="s1"]', 10.5, 2);

  /* ---------------- SCÈNE 2 — FACE AVANT (12 → 24) --------------- */
  k(12, 6, { rotY: 0, rotX: 0 }, "sine.inOut");
  k(12, 10, { camZ: 5.4, camY: 0.1 }, "sine.inOut");
  k(13, 5, { shift: 1 }, "sine.inOut");
  k(13, 10, { sheen: 1 }, "none");
  k(14, 7, { condensation: 1 }, "power1.inOut");
  k(12, 6, { emissive: 0.16 }, "sine.inOut");
  show('[data-a="s2"]', 15.5, 2.5, { x: -40, y: 0 });
  hide('[data-a="s2"]', 21.5, 2, { x: -40, y: 0 });
  k(21.5, 3, { shift: 0 }, "sine.inOut");

  /* ---------------- SCÈNE 3 — ROTATION 360° (24 → 42) ------------ */
  // sine.inOut : départ et arrivée en douceur ; repères à 1/3, 1/2, 2/3
  k(24, 18, { rotY: -TAU }, "sine.inOut");
  k(24, 6, { camZ: 6.0, camY: 0.55, tgtY: 0.1 }, "sine.inOut");
  k(36, 6, { camY: 0.2, tgtY: 0 }, "sine.inOut");
  show('[data-a="s3"]', 24, 2);
  tl.fromTo(q('[data-a="s3-ring"]'), { strokeDashoffset: 339.29 }, { strokeDashoffset: 0, duration: 18, ease: "sine.inOut" }, 24);
  const views = [24.5, 30, 33, 36, 39.6];
  views.forEach((t, i) => {
    show(`[data-a="v${i}"]`, t - (i ? 0.9 : 0), 1.2, { y: 14, filter: "blur(6px)" });
    if (i < 4) hide(`[data-a="v${i}"]`, views[i + 1] - 1.6, 0.9, { y: -14 });
  });
  hide('[data-a="s3"]', 40.6, 1.6);

  /* ---------------- SCÈNE 4 — INGRÉDIENTS (42 → 58) -------------- */
  k(42, 4, { camZ: 7.4, camY: 0.25 }, "sine.inOut");
  k(43, 14, { rotY: -TAU - 0.3 }, "sine.inOut");
  k(42, 4, { purple: 1.35, blue: 1.2, particles: 0.45 }, "sine.inOut");
  show('[data-a="s4h"]', 42.5, 2);
  q('[data-a="ing"]').forEach((el: Element, i: number) => {
    const dir = i % 2 === 0 ? -1 : 1;
    tl.fromTo(
      el,
      { autoAlpha: 0, x: dir * 50, y: 20, scale: 0.85, filter: "blur(10px)" },
      { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 1.8, ease: "power3.out" },
      43.4 + i * 0.55,
    );
  });
  show('[data-a="s4p"]', 48.5, 2, { y: 50 });
  tl.fromTo(
    q('[data-a="ring"]'),
    { strokeDashoffset: 169.65 },
    { strokeDashoffset: (_i: number, el: Element) => 169.65 * (1 - Number((el as HTMLElement).dataset.ratio ?? 0)), duration: 2.5, ease: "power2.out", stagger: 0.25 },
    49.2,
  );
  hide('[data-a="s4h"]', 55, 2);
  hide('[data-a="ing"]', 55, 2, { stagger: 0.08, y: -20 });
  hide('[data-a="s4p"]', 55.4, 2);
  k(55, 3, { purple: 1, blue: 1 }, "sine.inOut");

  /* ---------------- SCÈNE 5 — ZOOMS DÉTAILS (58 → 76) ------------ */
  // 1. Logo D
  k(57, 3, { rotY: -TAU }, "sine.inOut");
  k(57, 3, { camX: 0, camY: 0.62, camZ: 2.35, tgtX: 0, tgtY: 0.62, tgtZ: 0, fov: 30 }, "power2.inOut");
  k(57, 3, { particles: 0.25 }, "sine.inOut");
  // 2. Nom DEVVERSE ENERGY
  k(61, 3, { camX: 0.1, camY: 0.0, camZ: 2.45, tgtY: 0.0 }, "power2.inOut");
  // 3. Finitions (fond / rebord)
  k(64.5, 3, { rotY: -TAU - 0.55 }, "sine.inOut");
  k(64.5, 3, { camX: 1.0, camY: -1.25, camZ: 1.9, tgtY: -1.05 }, "power2.inOut");
  // 4. Ouverture supérieure
  k(67.6, 3, { rotY: -TAU }, "sine.inOut");
  k(67.6, 3, { camX: 0, camY: 2.75, camZ: 1.45, tgtY: 1.2, tgtZ: 0.05 }, "power2.inOut");
  k(69, 2.2, { tab: 1 }, "power2.inOut");
  // 5. Condensation
  k(71.4, 3, { rotY: -TAU + 0.6 }, "sine.inOut");
  k(71.4, 3, { camX: -0.45, camY: 0.1, camZ: 1.7, tgtY: -0.15, tgtZ: 0, fov: 29 }, "power2.inOut");
  k(71.4, 3, { condensation: 1.5 }, "sine.inOut");
  k(72.2, 2.4, { tab: 0 }, "power2.inOut");
  const zooms = [57.2, 60.8, 64.4, 67.6, 71.4];
  zooms.forEach((t, i) => {
    show(`[data-a="z${i}"]`, t, 1.0, { y: 24 });
    hide(`[data-a="z${i}"]`, (zooms[i + 1] ?? 75.6) - 0.6, 0.7, { y: -24 });
  });

  /* ---------------- SCÈNE 6 — EXPLOSION D'ÉNERGIE (76 → 88) ------- */
  k(75, 5, { camX: 0, camY: 0.1, camZ: 7.0, tgtX: 0, tgtY: 0, tgtZ: 0, fov: 35 }, "power2.inOut");
  k(75, 4, { condensation: 1, particles: 1 }, "sine.inOut");
  k(76, 12, { rotY: -TAU * 1.5 }, "sine.inOut");
  k(76, 6, { rotZ: 0.07 }, "sine.inOut");
  k(77, 5, { halo: 1 }, "power1.inOut");
  k(78, 4, { bolts: 1, purple: 2, blue: 1.8 }, "power2.out");
  k(78, 8, { spread: 1 }, "power1.out");
  show('[data-a="s6"]', 80, 3, { scale: 1.15, y: 0, letterSpacing: "0.4em" }, { letterSpacing: "0.08em" });
  hide('[data-a="s6"]', 86, 2, { scale: 0.95, y: 0 });
  k(86, 5, { bolts: 0.12 }, "sine.inOut");

  /* ---------------- SCÈNE 7 — PRÉSENTATION FINALE (88 → 100) ----- */
  k(88, 10, { rotY: -TAU * 2, rotZ: 0 }, "sine.inOut");
  k(88, 11, { camY: 0.45, camZ: 9.2, tgtY: 0.15 }, "sine.inOut");
  k(88, 6, { purple: 1.4, blue: 1.3, spread: 0.35 }, "sine.inOut");
  k(88, 7, { beams: 1, floor: 1 }, "power1.inOut");
  k(93, 7, { halo: 0.55, particles: 0.7 }, "sine.inOut");
  show('[data-a="s7-logo"]', 90.5, 2.5, { y: -30, letterSpacing: "0.35em" }, { letterSpacing: "0.02em" });
  show('[data-a="s7-cta"]', 91.5, 2.2, { y: 30 });

  return tl;
}
