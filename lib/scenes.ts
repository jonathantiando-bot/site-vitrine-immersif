/**
 * Découpage de la timeline maître (unités arbitraires, total = 100).
 * La plage de scroll de la section #experience est mappée linéairement
 * sur ces 100 unités via GSAP ScrollTrigger (scrub).
 */
export const TIMELINE_LENGTH = 100;

export type SceneDef = {
  id: string;
  index: number;
  label: string;
  start: number;
  end: number;
};

export const SCENES: SceneDef[] = [
  { id: "apparition", index: 1, label: "Apparition", start: 0, end: 12 },
  { id: "face-avant", index: 2, label: "Face avant", start: 12, end: 24 },
  { id: "rotation", index: 3, label: "Rotation 360°", start: 24, end: 42 },
  { id: "ingredients", index: 4, label: "Ingrédients", start: 42, end: 58 },
  { id: "details", index: 5, label: "Détails", start: 58, end: 76 },
  { id: "energie", index: 6, label: "Explosion d'énergie", start: 76, end: 88 },
  { id: "final", index: 7, label: "Présentation finale", start: 88, end: 100 },
];

/** Hauteur de la séquence en vh (le dernier écran sert de « respiration »). */
export const EXPERIENCE_HEIGHT_VH = { desktop: 1500, mobile: 1200 };
