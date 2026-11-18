import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";

// Render sprite cel-shaded dari model GLB (toon shading + outline hull). Dipakai skrip scripts/render-sprites.mjs.
export type SpriteProps = {
  model: string;                       // nama file di public/models, tanpa .glb
  base: [number, number, number];      // rotasi dasar (derajat) agar hidung = -X, atas = +Y, sayap = Z
  view: [number, number, number];      // [yaw, pitch, roll] derajat tambahan
  toon: boolean;
  debug?: "x" | "y" | "z" | "";        // lihat dari sumbu tertentu tanpa toon (untuk mencari orientasi)
  outline?: number;                    // tebal outline (unit dunia, panjang model = 10)
  fill?: number;                       // bingkai: setengah tinggi ortho
  hide?: string;                       // regex nama node yang disembunyikan (mis. roda, pilot)
  noHull?: string;                     // regex nama node tanpa outline
  clipY?: number;                      // potong semua yang di bawah y dunia ini (hilangkan roda)
};

const gradient = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

const Model: React.FC<SpriteProps> = ({ model, base, view, toon, outline = 0.05, hide, noHull, clipY }) => {
  const gl = useThree((st) => st.gl); gl.localClippingEnabled = true;
  const gltf = useLoader(GLTFLoader, staticFile(`models/${model}.glb`));
  const obj = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const g = new THREE.Group(); g.add(scene);
    const D = THREE.MathUtils.degToRad;
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene); const c = new THREE.Vector3(); box.getCenter(c); const size = new THREE.Vector3(); box.getSize(size);
    scene.position.sub(c); g.scale.setScalar(10 / Math.max(size.x, size.y, size.z));
    const root = new THREE.Group(); root.add(g);
    root.rotation.set(D(base[0]), D(base[1]), D(base[2]), "XYZ");
    const outer = new THREE.Group(); outer.add(root);
    outer.rotation.set(D(view[1]), D(view[0]), D(view[2]), "YXZ");   // yaw(Y) lalu pitch/roll
    outer.updateMatrixWorld(true);
    const chain = (o: THREE.Object3D) => { let n = ""; let c: THREE.Object3D | null = o; while (c) { n += "/" + c.name; c = c.parent; } return n; };
    const hideRe = hide ? new RegExp(hide, "i") : null; const nhRe = noHull ? new RegExp(noHull, "i") : null;
    const clip = clipY !== undefined ? [new THREE.Plane(new THREE.Vector3(0, 1, 0), -clipY)] : undefined;
    scene.traverse((o) => { if (hideRe && (o as THREE.Mesh).isMesh && hideRe.test(chain(o))) o.visible = false; });
    if (toon) {
      const hulls: THREE.Mesh[] = [];
      scene.traverse((o) => {
        const m = o as THREE.Mesh; if (!m.isMesh) return;
        const conv = (mat: THREE.MeshStandardMaterial) => {
          const glass = (mat.transparent && mat.opacity < 0.95) || /glass|window|canopy|cockpit|transp/i.test(mat.name || "");
          const t = new THREE.MeshToonMaterial({ map: glass ? null : mat.map ?? null, color: glass ? 0xa9c8d9 : mat.map ? 0xffffff : (mat.color ? mat.color.clone() : new THREE.Color(0x888888)), gradientMap: gradient, side: THREE.DoubleSide, clippingPlanes: clip, transparent: glass, opacity: glass ? 0.6 : 1 });
          (t as unknown as { __glass: boolean }).__glass = glass; return t;
        };
        const old = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const nm = Array.isArray(old) ? old.map(conv) : conv(old);
        m.material = nm;
        const allGlass = Array.isArray(nm) ? nm.every((x) => (x as unknown as { __glass: boolean }).__glass) : (nm as unknown as { __glass: boolean }).__glass;
        if (!allGlass && m.visible && m.geometry.attributes.normal && !(nhRe && nhRe.test(chain(m)))) hulls.push(m);
      });
      scene.updateMatrixWorld(true);
      for (const m of hulls) {
        const ws = new THREE.Vector3(); m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), ws);
        const thick = outline / ((ws.x + ws.y + ws.z) / 3 * (10 / Math.max(size.x, size.y, size.z)) / (10 / Math.max(size.x, size.y, size.z)));
        // ws sudah mencakup skala grup g (dunia); tebal lokal = tebal dunia / skala dunia
        const worldScale = (ws.x + ws.y + ws.z) / 3;
        const mat = new THREE.MeshBasicMaterial({ color: 0x15100c, side: THREE.BackSide, clippingPlanes: clip });
        void thick;
        mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(normal) * ${(outline / worldScale).toFixed(6)};`); };
        const hull = new THREE.Mesh(m.geometry, mat); m.add(hull);
      }
    }
    return outer;
  }, [gltf, model, base, view, toon, outline, hide, noHull, clipY]);
  return <primitive object={obj} />;
};

const Cam: React.FC<{ debug: SpriteProps["debug"]; fill: number; aspect: number }> = ({ debug, fill, aspect }) => {
  const { camera, scene } = useThree() as { camera: THREE.Camera; scene: THREE.Scene };
  void scene;
  if (debug) {
    const p = camera as THREE.PerspectiveCamera;
    p.position.set(debug === "x" ? 18 : 0, debug === "y" ? 18 : 0, debug === "z" ? 18 : 0); p.up.set(0, debug === "y" ? 0 : 1, debug === "y" ? -1 : 0); p.lookAt(0, 0, 0); p.updateProjectionMatrix();
  } else {
    const o = camera as THREE.OrthographicCamera;
    o.left = -fill * aspect; o.right = fill * aspect; o.top = fill; o.bottom = -fill; o.near = -100; o.far = 100; o.position.set(0, 0, 30); o.lookAt(0, 0, 0); o.updateProjectionMatrix();
  }
  return null;
};

export const SpriteScene: React.FC<SpriteProps> = (p) => {
  const { width, height } = useVideoConfig();
  const ortho = !p.debug;
  const fill = p.fill ?? 3.6;
  return (
    <AbsoluteFill style={{ background: p.debug ? "#8fa4b4" : "transparent" }}>
      <ThreeCanvas width={width} height={height} orthographic={ortho} camera={ortho ? { position: [0, 0, 30], near: -100, far: 100 } : { fov: 36, position: [18, 0, 0], near: 0.1, far: 200 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <ambientLight intensity={p.toon ? 1.6 : 0.9} />
        <hemisphereLight args={["#ffffff", "#8a8f99", p.toon ? 0.6 : 1.1]} />
        <directionalLight position={[-6, 12, 14]} intensity={p.toon ? 2.4 : 2.6} />
        <directionalLight position={[8, -4, 6]} intensity={0.5} color="#a9cdef" />
        <Model {...p} />
        <Cam debug={p.debug} fill={fill} aspect={width / height} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
