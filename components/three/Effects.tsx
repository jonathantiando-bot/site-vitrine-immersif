"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";

/* ------------------------------------------------------------------ */
/* Particules lumineuses (un seul draw call, animées dans le shader)   */
/* ------------------------------------------------------------------ */

const particleVert = /* glsl */ `
  uniform float uTime;
  uniform float uSpread;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aPhase;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    // dérive lente (ambiance)
    float t = uTime * 0.15 + aPhase * 6.2831;
    p.x += sin(t) * 0.35;
    p.y += cos(t * 0.8) * 0.25 + sin(uTime * 0.05 + aPhase * 10.0) * 0.2;
    // expansion pilotée par le scroll (explosion d'énergie)
    vec3 dir = normalize(vec3(p.x, p.y * 0.6, p.z) + 0.0001);
    p += dir * uSpread * (2.0 + aScale * 4.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * aScale * uPixelRatio * (9.0 / max(-mv.z, 1.5)), 24.0 * uPixelRatio);
    vColor = aColor;
    vTwinkle = 0.65 + 0.35 * sin(uTime * 1.4 + aPhase * 40.0);
  }
`;

const particleFrag = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float a = pow(max(1.0 - d, 0.0), 1.6) * uOpacity * vTwinkle;
    gl_FragColor = vec4(vColor * 2.2, a);
  }
`;

export function Particles({ count }: { count: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const scale = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#8B2CFF"), new THREE.Color("#087BFF"), new THREE.Color("#F5F5F7"), new THREE.Color("#B76BFF")];
    let seed = 42;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      // distribution en coquille autour de la canette (évite de la masquer)
      const r = 1.5 + Math.pow(rnd(), 0.7) * 6.5;
      const th = rnd() * Math.PI * 2;
      const y = (rnd() - 0.5) * 6;
      pos[i * 3] = Math.cos(th) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(th) * r - 1.5;
      phase[i] = rnd();
      scale[i] = 0.4 + Math.pow(rnd(), 2) * 1.6;
      const c = palette[Math.floor(rnd() * palette.length)];
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value += Math.min(dt, 0.05);
    m.uniforms.uSpread.value = sceneState.spread;
    m.uniforms.uOpacity.value = sceneState.particles;
    m.uniforms.uPixelRatio.value = dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={particleVert}
        fragmentShader={particleFrag}
        uniforms={{
          uTime: { value: 0 },
          uSpread: { value: 0 },
          uSize: { value: 9 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0 },
        }}
        transparent
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Éclairs + halo énergétique (shader plein écran derrière la canette) */
/* ------------------------------------------------------------------ */

const energyFrag = /* glsl */ `
  uniform float uTime;
  uniform float uBolts;
  uniform float uHalo;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(float x) {
    float i = floor(x); float f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
  }
  float fbm(float x) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * (noise(x) - 0.5); x *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(2.0, 2.0);
    p.y *= 1.15;
    float r = length(p);
    float ang = atan(p.y, p.x);

    // Halo elliptique autour de la canette (silhouette ≈ rq = 0.3..0.7)
    vec2 q = p * vec2(4.5, 2.1);
    float rq = length(q);
    float ring = exp(-pow((rq - 1.0) * 6.0, 2.0));
    float glow = exp(-rq * 0.9) * 0.45;
    vec3 violet = vec3(0.545, 0.173, 1.0);
    vec3 blue = vec3(0.031, 0.482, 1.0);
    vec3 haloCol = mix(blue, violet, 0.5 + 0.5 * sin(ang * 2.0 + uTime * 0.6));
    vec3 col = haloCol * (ring * 0.8 + glow * 0.6) * uHalo;

    // Éclairs radiaux : chaque éclair a son propre cycle de vie,
    // sa forme ne change qu'au moment où il est invisible (pas de clignotement).
    float bolts = 0.0;
    for (int k = 0; k < 7; k++) {
      float fk = float(k);
      float cyc = uTime * 0.9 + hash(fk * 7.1);
      float slot = floor(cyc);
      float ph = fract(cyc);
      float life = smoothstep(0.0, 0.25, ph) * (1.0 - smoothstep(0.55, 1.0, ph));
      float seed = fk * 13.17 + slot * 0.37;
      float a0 = fk * 0.8976 + (hash(seed) - 0.5) * 0.6 + uTime * 0.04;
      float da = atan(sin(ang - a0), cos(ang - a0));
      float wob = fbm(r * 7.0 + seed * 3.0 + uTime * 0.8) * 0.4 * smoothstep(0.0, 0.8, r);
      float d = abs(da - wob) * r;
      float len = 0.65 + hash(seed + 1.0) * 0.35;
      float mask = smoothstep(0.65, 1.05, rq) * (1.0 - smoothstep(len * 0.7, len, r));
      bolts += (0.005 / (d + 0.003)) * mask * (0.4 + 0.6 * life);
    }
    vec3 boltCol = mix(violet, blue, 0.5 + 0.5 * sin(ang * 3.0)) + vec3(0.3);
    col += boltCol * min(bolts, 3.0) * uBolts;

    float edge = 1.0 - smoothstep(0.75, 1.0, r);
    vec3 outCol = col * edge * 1.15;
    float alpha = clamp(max(outCol.r, max(outCol.g, outCol.b)), 0.0, 1.0);
    gl_FragColor = vec4(outCol, alpha);
  }
`;

const basicVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function EnergyField() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const camera = useThree((s) => s.camera);
  useFrame((_, dt) => {
    const s = sceneState;
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value += Math.min(dt, 0.05);
      mat.uniforms.uBolts.value = s.bolts;
      mat.uniforms.uHalo.value = s.halo;
    }
    const m = ref.current;
    if (m) {
      m.visible = s.bolts > 0.002 || s.halo > 0.002;
      m.position.set(s.canX, s.canY, s.canZ - 1.4);
      m.quaternion.copy(camera.quaternion);
    }
  });
  return (
    <mesh ref={ref} renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[9, 9]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={basicVert}
        fragmentShader={energyFrag}
        uniforms={{ uTime: { value: 0 }, uBolts: { value: 0 }, uHalo: { value: 0 } }}
        transparent
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Lueur lointaine (scène 1) et faisceaux volumétriques (scène 7)      */
/* ------------------------------------------------------------------ */

const glowFrag = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float core = exp(-d * 9.0);
    float halo = exp(-d * 3.2) * 0.45;
    vec3 c = uColor * (core * 2.0 + halo) * uIntensity;
    gl_FragColor = vec4(c, clamp(core * 2.0 + halo, 0.0, 1.0) * uIntensity);
  }
`;

export function FarGlow() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uIntensity.value = sceneState.farGlow;
    const m = ref.current;
    if (m) {
      m.visible = sceneState.farGlow > 0.002;
      m.quaternion.copy(camera.quaternion);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.2, -16]} frustumCulled={false}>
      <planeGeometry args={[12, 12]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={basicVert}
        fragmentShader={glowFrag}
        uniforms={{ uIntensity: { value: 0 }, uColor: { value: new THREE.Color("#8B2CFF") } }}
        transparent
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

const beamFrag = /* glsl */ `
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.85, 1.0, vUv.y));
    float a = pow(max(across, 0.0), 2.5) * along * uIntensity * 0.45;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

function Beam({ color, position, rotation }: { color: string; position: [number, number, number]; rotation: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uIntensity.value = sceneState.beams;
    if (ref.current) ref.current.visible = sceneState.beams > 0.002;
  });
  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <coneGeometry args={[2.4, 14, 32, 1, true]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={basicVert}
        fragmentShader={beamFrag}
        uniforms={{ uIntensity: { value: 0 }, uColor: { value: new THREE.Color(color) } }}
        transparent
        depthWrite={false}
        fog={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function VolumetricBeams() {
  return (
    <group position={[0, 0, -4]}>
      <Beam color="#8B2CFF" position={[-3.2, 4, 0]} rotation={[0, 0, -0.35]} />
      <Beam color="#087BFF" position={[3.2, 4, 0]} rotation={[0, 0, 0.35]} />
    </group>
  );
}
