import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// UJI PRIBADI model GLB (PBR). Model Bf 109 GRIP420 berlisensi CC-BY-NC => TIDAK BOLEH dipublikasikan di kanal monetisasi.
// Komponen ini generik: ganti URL dengan model berlisensi CC0/CC-BY yang sudah dibersihkan dari lambang.
export const MODEL_URL = "models/bf109-grip420.glb";
export const ALBEDO_URL = "models/bf109-albedo-clean.jpg";

const Plane: React.FC<{ roll: number; pitch: number }> = ({ roll, pitch }) => {
  const gltf = useLoader(GLTFLoader, staticFile(MODEL_URL));
  const albedo = useLoader(THREE.TextureLoader, staticFile(ALBEDO_URL));
  const { obj, len } = useMemo(() => {
    albedo.flipY = false; albedo.colorSpace = THREE.SRGBColorSpace; albedo.anisotropy = 8;
    const scene = gltf.scene.clone(true);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { const mat = m.material as THREE.MeshStandardMaterial; if (mat.map) { mat.map = albedo; mat.needsUpdate = true; } mat.envMapIntensity = 1.0; }
    });
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene); const size = new THREE.Vector3(); box.getSize(size); const c = new THREE.Vector3(); box.getCenter(c);
    const g = new THREE.Group(); scene.position.sub(c); g.add(scene);
    const k = 9.9 / Math.max(size.x, size.y, size.z); g.scale.setScalar(k);
    return { obj: g, len: size };
  }, [gltf, albedo]);
  void len;
  return <group rotation={[pitch, 0, roll]}><primitive object={obj} /></group>;
};

const Rig: React.FC<{ f: number; total: number }> = ({ f, total }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const u = f / total;
  const a = THREE.MathUtils.lerp(-0.6, 2.9, u);
  const R = THREE.MathUtils.lerp(12.5, 8.5, Math.sin(u * Math.PI));
  camera.position.set(Math.cos(a) * R, 3.2 + Math.sin(u * Math.PI) * 2.2, Math.sin(a) * R);
  camera.lookAt(0, 0.2, 0); camera.fov = 34; camera.updateProjectionMatrix();
  return null;
};

export const Bf109Glb: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const roll = Math.sin(f / 40) * 0.12, pitch = Math.sin(f / 55) * 0.05;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #6d8fa9 0%, #dcd3b8 100%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 38, position: [16, 3, 8], near: 0.1, far: 300 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <hemisphereLight args={["#bcd3e6", "#5b5a48", 1.1]} />
        <directionalLight position={[10, 14, 8]} intensity={3.2} color="#fff0d6" />
        <directionalLight position={[-12, 6, -10]} intensity={1.4} color="#8fb0d8" />
        <directionalLight position={[2, 4, -14]} intensity={1.8} color="#ffe2b8" />
        <Plane roll={roll} pitch={pitch} />
        <Rig f={f} total={total} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
