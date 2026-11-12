"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import type { QualityTier } from "@/lib/device";

/**
 * Canette DEVVERSE ENERGY procédurale (≈ canette « sleek » 330 ml).
 * Hauteur totale 2.6 unités, rayon 0.5, centrée à l'origine.
 *
 * Structure modulaire :
 *  - body   : corps aluminium (LatheGeometry : fond bombé, col, rebord)
 *  - label  : étiquette imprimée (cylindre, texture canvas 4 faces)
 *  - lid    : couvercle, ouverture (opercule) et languette animable
 */

export const CAN = {
  radius: 0.5,
  bodyBottom: -1.12,
  bodyTop: 1.08,
  lidY: 1.215,
};

function useCanGeometries() {
  return useMemo(() => {
    // Profil (rayon, y) du bas vers le haut
    const pts: [number, number][] = [
      [0.0, -1.17],
      [0.2, -1.19],
      [0.33, -1.24],
      [0.37, -1.295],
      [0.4, -1.3],
      [0.44, -1.285],
      [0.475, -1.24],
      [0.495, -1.18],
      [0.5, -1.12],
      [0.5, 1.08],
      [0.495, 1.12],
      [0.465, 1.18],
      [0.445, 1.225],
      [0.44, 1.25],
      [0.447, 1.275],
      [0.45, 1.295],
      [0.44, 1.305],
      [0.428, 1.295],
      [0.425, 1.26],
      [0.42, 1.22],
    ];
    const body = new THREE.LatheGeometry(
      pts.map(([r, y]) => new THREE.Vector2(r, y)),
      96,
    );

    const labelH = CAN.bodyTop - CAN.bodyBottom - 0.04;
    const label = new THREE.CylinderGeometry(
      0.5025,
      0.5025,
      labelH,
      128,
      1,
      true,
      (7 * Math.PI) / 4, // centre de la face avant (u=0.125) orienté vers +Z
      Math.PI * 2,
    );
    label.translate(0, (CAN.bodyTop + CAN.bodyBottom) / 2, 0);

    const lid = new THREE.CircleGeometry(0.422, 72);
    lid.rotateX(-Math.PI / 2);

    const groove = new THREE.TorusGeometry(0.37, 0.008, 8, 72);
    groove.rotateX(Math.PI / 2);

    // Ouverture (forme de goutte) — côté +Z
    const mouth = new THREE.Shape();
    mouth.moveTo(-0.07, 0);
    mouth.lineTo(0.07, 0);
    mouth.bezierCurveTo(0.13, -0.05, 0.12, -0.2, 0.0, -0.24);
    mouth.bezierCurveTo(-0.12, -0.2, -0.13, -0.05, -0.07, 0);
    const mouthGeo = new THREE.ShapeGeometry(mouth, 24);
    mouthGeo.rotateX(-Math.PI / 2); // shape.y négatif -> +z (vers l'avant), normale vers le haut

    // Languette (anneau + nez), extrudée
    const tab = new THREE.Shape();
    tab.moveTo(-0.07, -0.12);
    tab.quadraticCurveTo(0, -0.16, 0.07, -0.12);
    tab.lineTo(0.1, 0.12);
    tab.quadraticCurveTo(0.1, 0.3, 0, 0.3);
    tab.quadraticCurveTo(-0.1, 0.3, -0.1, 0.12);
    tab.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-0.055, 0.09);
    hole.lineTo(0.055, 0.09);
    hole.quadraticCurveTo(0.065, 0.25, 0, 0.25);
    hole.quadraticCurveTo(-0.065, 0.25, -0.055, 0.09);
    tab.holes.push(hole);
    const tabGeo = new THREE.ExtrudeGeometry(tab, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 16,
    });
    tabGeo.rotateX(-Math.PI / 2); // shape.y -> -z (anneau vers l'arrière)

    const rivet = new THREE.CylinderGeometry(0.03, 0.034, 0.02, 24);

    return { body, label, lid, groove, mouthGeo, tabGeo, rivet };
  }, []);
}

type Props = {
  labelTexture: THREE.Texture;
  dropletTexture: THREE.Texture;
  tier: QualityTier;
};

export function ProceduralCan({ labelTexture, dropletTexture, tier }: Props) {
  const geos = useCanGeometries();
  const gl = useThree((s) => s.gl);
  const labelMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const tabRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Group>(null);
  const normalScale = useMemo(() => new THREE.Vector2(0, 0), []);

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    labelTexture.anisotropy = Math.min(tier === "high" ? 8 : 4, maxAniso);
    labelTexture.needsUpdate = true;
  }, [gl, labelTexture, tier]);

  // Libération GPU des géométries créées manuellement
  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose());
    },
    [geos],
  );

  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#c7cad6",
        metalness: 1,
        roughness: 0.22,
        clearcoat: 0.4,
        clearcoatRoughness: 0.15,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const lidMetal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#b9bcc8",
        metalness: 1,
        roughness: 0.32,
      }),
    [],
  );
  const dark = useMemo(() => new THREE.MeshBasicMaterial({ color: "#020203" }), []);
  useEffect(
    () => () => {
      metal.dispose();
      lidMetal.dispose();
      dark.dispose();
    },
    [metal, lidMetal, dark],
  );

  useFrame(() => {
    const s = sceneState;
    const m = labelMat.current;
    if (m) {
      const c = s.condensation;
      normalScale.set(c * 0.9, c * 0.9);
      m.clearcoatRoughness = 0.06 + (1 - Math.min(c, 1)) * 0.1;
      m.emissiveIntensity = s.emissive;
    }
    if (tabRef.current) tabRef.current.rotation.x = s.tab * 0.95;
    if (flapRef.current) flapRef.current.rotation.x = s.tab * 1.25;
  });

  return (
    <group>
      <mesh geometry={geos.body} material={metal} />

      <mesh geometry={geos.label}>
        <meshPhysicalMaterial
          ref={labelMat}
          map={labelTexture}
          emissiveMap={labelTexture}
          emissive="#ffffff"
          emissiveIntensity={0.05}
          metalness={0.55}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.12}
          normalMap={dropletTexture}
          normalScale={normalScale}
          clearcoatNormalMap={dropletTexture}
          clearcoatNormalScale={normalScale}
        />
      </mesh>

      {/* Couvercle */}
      <group position={[0, CAN.lidY, 0]}>
        <mesh geometry={geos.lid} material={lidMetal} />
        <mesh geometry={geos.groove} material={lidMetal} position={[0, 0.004, 0]} />
        {/* trou noir sous l'opercule */}
        <mesh geometry={geos.mouthGeo} material={dark} position={[0, 0.0015, 0.075]} />
        {/* opercule, charnière côté rivet */}
        <group ref={flapRef} position={[0, 0.003, 0.075]}>
          <mesh geometry={geos.mouthGeo} material={lidMetal} />
        </group>
        <mesh geometry={geos.rivet} material={lidMetal} position={[0, 0.01, 0]} />
        {/* languette : pivote autour du rivet */}
        <group ref={tabRef} position={[0, 0.014, 0.0]}>
          <mesh geometry={geos.tabGeo} material={metal} position={[0, 0, -0.02]} />
        </group>
      </group>
    </group>
  );
}
