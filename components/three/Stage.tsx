"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { sceneState, pointer } from "@/lib/sceneState";
import type { QualityTier } from "@/lib/device";
import { product } from "@/config/product";
import { ProceduralCan } from "./ProceduralCan";
import { Particles, EnergyField, FarGlow, VolumetricBeams } from "./Effects";
import { createLabelCanvas, createDropletNormalCanvas, type LabelFonts } from "./textures";

type StageProps = {
  tier: QualityTier;
  fonts: LabelFonts;
  active: boolean;
  onReady: () => void;
};

/* ---------------------------- Caméra ------------------------------ */

function CameraRig() {
  const size = useThree((s) => s.size);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tgt = useMemo(() => new THREE.Vector3(), []);
  const smooth = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const s = sceneState;
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(size.height, 1);
    const dist = Math.hypot(s.camX - s.tgtX, s.camY - s.tgtY, s.camZ - s.tgtZ);
    const notZoom = Math.min(1, Math.max(0, (dist - 3.5) / 2));
    // En portrait, on recule la caméra (sauf en très gros plan) pour garder la canette et les textes lisibles
    const k = aspect < 0.85 ? 1 + (0.85 - aspect) * 1.2 * notZoom : 1;
    const shift = aspect > 1.15 ? s.shift * 0.95 : 0;

    // Parallaxe souris très légère (ambiance), atténuée en gros plan
    const f = Math.min(1, dt * 2.5);
    smooth.current.x += (pointer.x - smooth.current.x) * f;
    smooth.current.y += (pointer.y - smooth.current.y) * f;
    const par = Math.min(1, Math.max(0, (dist - 2.5) / 4)) * 0.18;

    tgt.set(s.tgtX - shift, s.tgtY, s.tgtZ);
    pos.set(s.camX - shift, s.camY, s.camZ).sub(tgt).multiplyScalar(k).add(tgt);
    pos.x += smooth.current.x * par;
    pos.y += smooth.current.y * par * 0.6;
    cam.position.copy(pos);
    cam.lookAt(tgt);
    if (Math.abs(cam.fov - s.fov) > 0.001) {
      cam.fov = s.fov;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

/* ---------------------------- Lumières ---------------------------- */

function Lights() {
  const scene = useThree((s) => s.scene);
  const ambient = useRef<THREE.AmbientLight>(null);
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const violet = useRef<THREE.PointLight>(null);
  const blue = useRef<THREE.PointLight>(null);
  const sheen = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    scene.add(target);
    if (key.current) key.current.target = target;
    if (sheen.current) sheen.current.target = target;
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  useFrame(() => {
    const s = sceneState;
    target.position.set(s.canX, s.canY, s.canZ);
    scene.environmentIntensity = s.env;
    if (ambient.current) ambient.current.intensity = 0.04 + s.key * 0.12;
    if (key.current) key.current.intensity = s.key * 90;
    if (rim.current) rim.current.intensity = s.rim * 35;
    if (violet.current) violet.current.intensity = s.purple * 40;
    if (blue.current) blue.current.intensity = s.blue * 40;
    if (sheen.current) {
      // balayage lumineux de gauche à droite piloté par le scroll
      sheen.current.position.set(-5 + s.sheen * 10, 1.2, 4.5);
      sheen.current.intensity = Math.sin(Math.PI * Math.min(Math.max(s.sheen, 0), 1)) * 140;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0} />
      <spotLight ref={key} position={[3.5, 5, 6]} angle={0.45} penumbra={1} intensity={0} color="#f5f5f7" />
      <pointLight ref={rim} position={[0, 4, -3]} intensity={0} color="#dcd6ff" />
      <pointLight ref={violet} position={[-3, 0.6, -1.2]} intensity={0} color="#8B2CFF" />
      <pointLight ref={blue} position={[3, -0.4, -1.2]} intensity={0} color="#087BFF" />
      <spotLight ref={sheen} angle={0.35} penumbra={1} intensity={0} color="#ffffff" />
    </>
  );
}

/* --------------------------- Canette ------------------------------ */

function GltfCan({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function CanRig({ tier, fonts }: { tier: QualityTier; fonts: LabelFonts }) {
  const ref = useRef<THREE.Group>(null);

  const textures = useMemo(() => {
    const label = new THREE.CanvasTexture(createLabelCanvas(fonts, tier === "high" ? 2048 : 1024));
    label.colorSpace = THREE.SRGBColorSpace;
    label.generateMipmaps = true;
    label.minFilter = THREE.LinearMipmapLinearFilter;
    const drops = new THREE.CanvasTexture(createDropletNormalCanvas(tier === "high" ? 1024 : 512, tier === "high" ? 1500 : 700));
    drops.wrapS = drops.wrapT = THREE.RepeatWrapping;
    drops.repeat.set(3, 2);
    return { label, drops };
  }, [fonts, tier]);

  useEffect(
    () => () => {
      textures.label.dispose();
      textures.drops.dispose();
    },
    [textures],
  );

  useFrame(() => {
    const s = sceneState;
    const g = ref.current;
    if (!g) return;
    g.position.set(s.canX, s.canY, s.canZ);
    g.rotation.set(s.rotX, s.rotY, s.rotZ);
  });

  return (
    <group ref={ref}>
      {product.modelUrl ? (
        <Suspense fallback={null}>
          <GltfCan url={product.modelUrl} />
        </Suspense>
      ) : (
        <ProceduralCan labelTexture={textures.label} dropletTexture={textures.drops} tier={tier} />
      )}
    </group>
  );
}

/* ----------------------- Sol : ombre + reflet --------------------- */

const floorFrag = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uShadow;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - 0.5) * vec2(1.0, 1.0)) * 2.0;
    float a = (1.0 - smoothstep(0.0, 1.0, d));
    a = pow(a, uShadow > 0.5 ? 2.2 : 1.6) * uOpacity;
    gl_FragColor = uShadow > 0.5 ? vec4(0.0, 0.0, 0.0, a) : vec4(uColor * a, a);
  }
`;
const floorVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

function Floor() {
  const ref = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.ShaderMaterial>(null);
  const shadowRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(() => {
    const s = sceneState;
    if (glowRef.current) glowRef.current.uniforms.uOpacity.value = s.floor * 0.65;
    if (shadowRef.current) shadowRef.current.uniforms.uOpacity.value = s.floor * 0.85;
    if (ref.current) {
      ref.current.visible = s.floor > 0.002;
      ref.current.position.set(s.canX, s.canY - 1.42, s.canZ);
    }
  });
  return (
    <group ref={ref}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7, 3.5]} />
        <shaderMaterial ref={glowRef} vertexShader={floorVert} fragmentShader={floorFrag} uniforms={{ uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#7a2cff") }, uShadow: { value: 0 } }} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 0]}>
        <planeGeometry args={[1.8, 1.0]} />
        <shaderMaterial ref={shadowRef} vertexShader={floorVert} fragmentShader={floorFrag} uniforms={{ uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#000") }, uShadow: { value: 1 } }} transparent depthWrite={false} fog={false} />
      </mesh>
    </group>
  );
}

/* --------------------- Signal « prêt » (loader) ------------------- */

function ReadySignal({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // pré-compilation des shaders pour éviter tout à-coup au premier scroll
    gl.compile(scene, camera);
    let raf = 0;
    let frames = 0;
    const tick = () => {
      frames++;
      if (frames > 3) onReady();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gl, scene, camera, onReady]);
  return null;
}

/* ------------------------------ Stage ----------------------------- */

export default function Stage({ tier, fonts, active, onReady }: StageProps) {
  const high = tier === "high";
  const [dpr, setDpr] = useState(high ? 1.75 : 1.25);

  return (
    <Canvas
      className="stage-canvas"
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: !high, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: 35, near: 0.05, far: 120, position: [0, 0.4, 9] }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color("#050509");
        scene.fog = new THREE.Fog("#050509", 9, 23);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      aria-hidden="true"
    >
      {/* Réduction automatique de la résolution si le framerate chute */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(high ? 2 : 1.5, d + 0.25))}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <CameraRig />
      <Lights />
      <Environment resolution={high ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 6, -1]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={5} color="#8B2CFF" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[3, 9, 1]} />
        <Lightformer form="rect" intensity={5} color="#087BFF" position={[5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[3, 9, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[1.5, 0, 6]} scale={[0.6, 7, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[-2, 0, 6]} scale={[0.3, 7, 1]} />
        <Lightformer form="ring" intensity={2} color="#B76BFF" position={[2, 3, -5]} scale={2.5} />
      </Environment>

      <FarGlow />
      <VolumetricBeams />
      <EnergyField />
      <Particles count={high ? 1400 : 500} />
      <Floor />
      <CanRig tier={tier} fonts={fonts} />

      {high && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={0.75} luminanceSmoothing={0.2} intensity={0.75} radius={0.7} />
          <Vignette offset={0.3} darkness={0.75} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
