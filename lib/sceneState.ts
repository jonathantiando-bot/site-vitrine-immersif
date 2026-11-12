/**
 * État d'animation partagé entre GSAP (écriture, pilotée par le scroll)
 * et React Three Fiber (lecture dans useFrame).
 *
 * C'est un simple objet mutable : aucune re-render React, aucune allocation
 * par frame. GSAP interpole ses propriétés, la scène 3D les lit.
 */
export const INITIAL_STATE = {
  // Canette
  canX: 0,
  canY: 0,
  canZ: -14,
  rotX: 0.25,
  rotY: -0.9,
  rotZ: 0,
  // Caméra
  camX: 0,
  camY: 0.4,
  camZ: 9,
  tgtX: 0,
  tgtY: 0,
  tgtZ: 0,
  fov: 35,
  /** Décalage latéral (desktop) pour laisser la place aux textes */
  shift: 0,
  // Lumières
  env: 0,
  key: 0,
  rim: 0,
  purple: 0,
  blue: 0,
  farGlow: 0,
  sheen: 0,
  beams: 0,
  // Matière / effets
  condensation: 0,
  emissive: 0.04,
  tab: 0,
  particles: 0,
  spread: 0,
  bolts: 0,
  halo: 0,
  floor: 0,
};

export type SceneState = typeof INITIAL_STATE;

export const sceneState: SceneState = { ...INITIAL_STATE };

export function resetSceneState() {
  Object.assign(sceneState, INITIAL_STATE);
}

/** Position souris normalisée (-1..1), lissée côté 3D. Effet d'ambiance uniquement. */
export const pointer = { x: 0, y: 0 };
