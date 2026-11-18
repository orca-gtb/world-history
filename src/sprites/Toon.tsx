import React, { useMemo } from "react";
import * as THREE from "three";
import { useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";

// Pesawat 3D bergaya cel-shaded (toon 4 nada + outline hull) yang bisa diputar bebas per frame.
// Ruang pose (outer, sebelum pose): hidung = -X, atas = +Y, sayap kiri = +Z, ukuran terbesar = 10 unit.
export type ToonOpts = {
  model: string;                        // public/models/<model>.glb
  base: [number, number, number];       // rotasi dasar (derajat) agar hidung -X
  hide?: string;                        // regex nama node disembunyikan
  clipY?: number;                       // buang semua di bawah y lokal ini (roda pendarat)
  hideBox?: [number, number, number, number]; // [xmin,xmax,ymin,ymax]: sembunyikan mesh yang seluruhnya di dalam kotak (mis. roda ekor)
  outline?: number;
  prop?: { x: number; y: number; r: number; blades: number }; // disc propeller berputar (posisi lokal)
};

const GRAD = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
export const toonMat = (color: THREE.ColorRepresentation, extra: Partial<THREE.MeshToonMaterialParameters> = {}) => new THREE.MeshToonMaterial({ color, gradientMap: GRAD, ...extra });

const discTex = (blades: number) => {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!;
  const rg = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  rg.addColorStop(0, "rgba(30,30,30,0)"); rg.addColorStop(0.55, "rgba(35,35,35,0.10)"); rg.addColorStop(0.92, "rgba(35,35,35,0.20)"); rg.addColorStop(1, "rgba(35,35,35,0)");
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
  for (let b = 0; b < blades; b++) { // bayangan bilah kabur: kipas tipis
    const a0 = (b / blades) * Math.PI * 2;
    const lg = g.createRadialGradient(128, 128, 10, 128, 128, 126); lg.addColorStop(0, "rgba(20,20,20,0.55)"); lg.addColorStop(1, "rgba(20,20,20,0.05)");
    g.fillStyle = lg; g.beginPath(); g.moveTo(128, 128); g.arc(128, 128, 126, a0, a0 + 0.42); g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
};

export type ToonHandle = { outer: THREE.Group; root: THREE.Group; local: THREE.Plane | null; world: THREE.Plane; disc: THREE.Mesh | null };

export const useToon = (o: ToonOpts): ToonHandle => {
  const gltf = useLoader(GLTFLoader, staticFile(`models/${o.model}.glb`));
  const gl = useThree((s) => s.gl); gl.localClippingEnabled = true;
  return useMemo(() => {
    const D = THREE.MathUtils.degToRad;
    const scene = gltf.scene.clone(true); scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene); const c = new THREE.Vector3(); box.getCenter(c); const size = new THREE.Vector3(); box.getSize(size);
    const k = 10 / Math.max(size.x, size.y, size.z);
    const g = new THREE.Group(); scene.position.sub(c); g.add(scene); g.scale.setScalar(k);
    const root = new THREE.Group(); root.add(g); root.rotation.set(D(o.base[0]), D(o.base[1]), D(o.base[2]), "XYZ");
    const outer = new THREE.Group(); outer.add(root); outer.updateMatrixWorld(true);
    const world = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6);
    const local = o.clipY !== undefined ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -o.clipY) : null;
    const clip = local ? [world] : undefined;
    const chain = (n: THREE.Object3D) => { let s = ""; let q: THREE.Object3D | null = n; while (q) { s += "/" + q.name; q = q.parent; } return s; };
    const hideRe = o.hide ? new RegExp(o.hide, "i") : null;
    const hulls: THREE.Mesh[] = [];
    scene.traverse((n) => {
      const m = n as THREE.Mesh; if (!m.isMesh) return;
      if (hideRe && hideRe.test(chain(m))) { m.visible = false; return; }
      const conv = (mat: THREE.MeshStandardMaterial) => {
        const glass = (mat.transparent && mat.opacity < 0.95) || /glass|window|canopy|cockpit|transp/i.test(mat.name || "");
        const t = toonMat(glass ? 0xa9c8d9 : mat.map ? 0xffffff : mat.color ? mat.color.clone() : 0x888888, { map: glass ? null : mat.map ?? null, side: THREE.DoubleSide, transparent: glass, opacity: glass ? 0.6 : 1, clippingPlanes: clip });
        (t.userData as { glass?: boolean }).glass = glass; return t;
      };
      const old = m.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
      m.material = Array.isArray(old) ? old.map(conv) : conv(old);
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      if (!mats.every((x) => (x.userData as { glass?: boolean }).glass) && m.geometry.attributes.normal) hulls.push(m);
    });
    if (o.hideBox) {
      outer.updateMatrixWorld(true); const [x0, x1, y0, y1] = o.hideBox;
      scene.traverse((n) => { const m = n as THREE.Mesh; if (!m.isMesh || !m.visible) return; const b = new THREE.Box3().setFromObject(m); if (b.min.x >= x0 && b.max.x <= x1 && b.min.y >= y0 && b.max.y <= y1) m.visible = false; });
    }
    // Sembunyikan bilah propeller asli (diganti disc berputar): mesh kecil di ujung hidung yang tinggi.
    if (o.prop) {
      outer.updateMatrixWorld(true);
      scene.traverse((n) => {
        const m = n as THREE.Mesh; if (!m.isMesh || !m.visible) return;
        const b = new THREE.Box3().setFromObject(m); // outer = identitas saat dibangun -> kerangka pose
        if (b.max.x < o.prop!.x + 0.7 && b.max.y - b.min.y > o.prop!.r * 0.9) m.visible = false;
      });
    }
    scene.updateMatrixWorld(true);
    const outline = o.outline ?? 0.05;
    for (const m of hulls) {
      if (!m.visible) continue;
      const ws = new THREE.Vector3(); m.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), ws);
      const mat = new THREE.MeshBasicMaterial({ color: 0x15100c, side: THREE.BackSide, clippingPlanes: clip });
      const th = (outline / ((ws.x + ws.y + ws.z) / 3)).toFixed(6);
      mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(normal) * ${th};`); };
      m.add(new THREE.Mesh(m.geometry, mat));
    }
    let disc: THREE.Mesh | null = null;
    if (o.prop) {
      const geo = new THREE.CircleGeometry(o.prop.r, 48); geo.rotateY(Math.PI / 2);
      disc = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: discTex(o.prop.blades), transparent: true, depthWrite: false, side: THREE.DoubleSide }));
      disc.position.set(o.prop.x, o.prop.y, 0);
      const hub = new THREE.Mesh(new THREE.ConeGeometry(o.prop.r * 0.16, o.prop.r * 0.42, 20).rotateZ(Math.PI / 2), toonMat(0x2a2c2e));
      hub.position.set(o.prop.x - o.prop.r * 0.12, o.prop.y, 0);
      const hubHull = new THREE.Mesh(hub.geometry, new THREE.MeshBasicMaterial({ color: 0x15100c, side: THREE.BackSide })); hubHull.scale.setScalar(1.08); hub.add(hubHull);
      outer.add(disc, hub);
    }
    return { outer, root, local, world, disc };
  }, [gltf]); // eslint-disable-line react-hooks/exhaustive-deps
};

export type Pose = { pos: [number, number, number]; yaw?: number; pitch?: number; roll?: number; spin?: number };
// yaw: putar kiri/kanan (sumbu Y), pitch: hidung naik(+)/turun(-) (sumbu Z), roll: miring (sumbu X).
export const ToonPlane: React.FC<ToonOpts & Pose> = (p) => {
  const h = useToon(p);
  const D = THREE.MathUtils.degToRad;
  h.outer.position.set(...p.pos);
  h.outer.rotation.set(D(p.roll ?? 0), D(p.yaw ?? 0), D(-(p.pitch ?? 0)), "YZX");
  h.outer.updateMatrixWorld(true);
  if (h.local) h.world.copy(h.local).applyMatrix4(h.outer.matrixWorld);
  if (h.disc) h.disc.rotation.x = p.spin ?? 0;
  return <primitive object={h.outer} />;
};
