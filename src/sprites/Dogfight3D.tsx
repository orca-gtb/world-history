import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { ToonPlane, toonMat, type ToonOpts } from "./Toon";

// Uji shot 3D cel-shaded (Brno, 8 Mei 1945): A = close-up 3/4 Bf 109 menukik & miring, B = kamera kejar di belakang, tembak Yak.
// Kerangka: kamera ikut Bf 109 (Bf di titik asal), udara/awan bergerak +X dengan kecepatan V.
export const BF: ToonOpts = { model: "bf109g6", base: [0, -90, 0], clipY: -0.58, hideBox: [2.6, 4.8, -0.9, 0.45], prop: { x: -4.47, y: 0.33, r: 1.5, blades: 3 } };
export const YAK: ToonOpts = { model: "yak1", base: [0, 0, 0], hide: "pilot", clipY: -0.66, prop: { x: -3.35, y: 0.46, r: 1.5, blades: 3 } };
const V = 0.35; // unit/frame
const CUT = 66;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const lerp = (f: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(f, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const Cam: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll?: number }> = ({ pos, look, fov, roll = 0 }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  cam.position.copy(pos); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(look); cam.fov = fov; cam.near = 0.1; cam.far = 600; cam.updateProjectionMatrix();
  return null;
};

// ---------- langit 2D bergaya kartun: gradasi + awan 2 nada, parallax
const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <svg style={{ position: "absolute", left: x - 260 * s, top: y - 110 * s, width: 520 * s, height: 220 * s, opacity: o, overflow: "visible" }} viewBox="0 0 520 220">
    <g fill="#f7fbff" stroke="#9fb4c6" strokeWidth={3}>
      <path d="M40 170 C10 170 10 120 55 118 C55 70 120 55 150 88 C170 30 260 20 290 75 C320 40 400 50 405 100 C460 95 500 130 470 170 Z" />
    </g>
    <path d="M60 170 C120 150 200 160 260 150 C330 140 420 150 465 168 Z" fill="#c9d8e6" />
  </svg>
);
const Sky: React.FC<{ f: number; dir: number; horizon: number; speed: number }> = ({ f, dir, horizon, speed }) => {
  const W = 1920;
  const layer = (n: number, sp: number, yb: number, s: number, o: number, seed: number) =>
    Array.from({ length: n }, (_, i) => {
      const span = W + 900; const x0 = rnd(i + seed) * span;
      const x = ((((x0 + dir * f * sp) % span) + span) % span) - 450;
      return <Cloud key={seed + i} x={x} y={yb + (rnd(i + seed + 50) - 0.5) * 160} s={s * (0.7 + rnd(i + seed + 9) * 0.6)} o={o} />;
    });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #5f8fb8 0%, #9cc0db ${horizon * 0.6}%, #e6eef0 ${horizon}%, #b7c6b0 ${horizon + 0.1}%, #8c9a78 100%)` }}>
      {layer(5, speed * 0.25, 230, 0.8, 0.85, 1)}
      {layer(4, speed * 0.6, 520, 1.3, 0.95, 20)}
      {layer(3, speed * 1.4, 880, 2.2, 1, 40)}
    </AbsoluteFill>
  );
};
const Speed: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
    {Array.from({ length: 16 }, (_, i) => {
      const y = rnd(i + 3) * 1080; const L = 200 + rnd(i + 7) * 380; const x = (((rnd(i) * 2600 + f * (70 + rnd(i + 1) * 60)) % 2600) - 340);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: L, height: 2 + rnd(i + 2) * 2, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.75))", borderRadius: 2 }} />;
    })}
  </AbsoluteFill>
);

// ---------- efek 3D
const glowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, "rgba(255,255,230,1)"); rg.addColorStop(0.25, "rgba(255,210,90,0.9)"); rg.addColorStop(0.6, "rgba(255,120,30,0.35)"); rg.addColorStop(1, "rgba(255,90,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
})();
const Glow: React.FC<{ p: THREE.Vector3; s: number; o: number }> = ({ p, s, o }) => (
  <sprite position={p} scale={[s, s, s]}><spriteMaterial map={glowTex()} transparent opacity={o} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
);
const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
const tracerGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6).rotateZ(Math.PI / 2);
const Tracer: React.FC<{ a: THREE.Vector3; b: THREE.Vector3 }> = ({ a, b }) => {
  const m = new THREE.Mesh(tracerGeo, tracerMat); m.position.copy(a);
  const d = b.clone().sub(a).normalize(); m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), d);
  return <primitive object={m} />;
};
const smokeGeo = new THREE.IcosahedronGeometry(1, 1);
const Puff: React.FC<{ p: THREE.Vector3; s: number; o: number; dark: number }> = ({ p, s, o, dark }) => (
  <mesh position={p} scale={[s, s * 0.85, s]} geometry={smokeGeo} material={toonMat(new THREE.Color().setHSL(0.08, 0.05, 0.62 - dark * 0.45), { transparent: true, opacity: o, depthWrite: false })} />
);

// ---------- pose
const bfPoseA = (f: number) => ({ pos: [0, 0, 0] as [number, number, number], yaw: lerp(f, 0, CUT, -14, 6), pitch: lerp(f, 0, CUT, 4, -14), roll: lerp(f, 0, CUT, -8, 38) });
const camA = (f: number) => ({ pos: new THREE.Vector3(lerp(f, 0, CUT, -9.5, -6.5), lerp(f, 0, CUT, -2.2, -0.6), lerp(f, 0, CUT, 13, 9.5)), look: new THREE.Vector3(lerp(f, 0, CUT, -1, 0.5), 0, 0), fov: 34 });
const HIT = 112;
const yakPos = (f: number): THREE.Vector3 => {
  const g = f - CUT;
  const x = -30 + g * 0.17 + (f > HIT ? (f - HIT) * 0.12 : 0);
  const y = -3.2 + Math.sin(g * 0.07) * 0.25 - (f > HIT ? Math.pow(f - HIT, 1.6) * 0.03 : 0);
  return new THREE.Vector3(x, y, -1.2 + Math.sin(g * 0.05) * 0.4);
};
const yakRot = (f: number) => ({ yaw: 0, pitch: f > HIT ? -Math.min((f - HIT) * 1.4, 35) : 0, roll: (f > HIT ? (f - HIT) * 5 : 0) + Math.sin((f - CUT) * 0.06) * 8 });

export const Dogfight3D: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const A = f < CUT;
  const fire = f >= 92 && f <= HIT + 6;
  const shake = fire ? new THREE.Vector3((rnd(f) - 0.5) * 0.08, (rnd(f + 9) - 0.5) * 0.08, 0) : new THREE.Vector3();
  const bf = A ? bfPoseA(f) : { pos: [0, 0, 0] as [number, number, number], yaw: 0, pitch: -3 + Math.sin(f * 0.05) * 1, roll: 6 + Math.sin(f * 0.04) * 5 };
  const cam = A ? camA(f) : { pos: new THREE.Vector3(10.5, 4.6, 5.4).add(shake), look: new THREE.Vector3(-14, -2.6, -1.8).add(shake), fov: 40 };
  const yp = yakPos(f); const yr = yakRot(f);
  // peluru: tiap 2 frame dari moncong (koordinat lokal Bf -> dunia)
  const bullets: React.ReactNode[] = [];
  if (!A) {
    const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(bf.roll), 0, THREE.MathUtils.degToRad(-bf.pitch), "YZX"));
    for (let s0 = 92; s0 <= Math.min(f, HIT + 6); s0 += 2) {
      const age = f - s0; if (age > 9) continue;
      for (const gz of [0.32, -0.32]) {
        const a = new THREE.Vector3(-4.2, 0.62, gz).applyMatrix4(m);
        const tgt = yakPos(s0 + 8).add(new THREE.Vector3((rnd(s0 + gz) - 0.5) * 1.2, (rnd(s0 * 3 + gz) - 0.5) * 0.9, (rnd(s0 * 7) - 0.5) * 0.9));
        const p = a.clone().lerp(tgt, age / 9);
        bullets.push(<Tracer key={`${s0}${gz}`} a={p} b={tgt} />, <Glow key={`g${s0}${gz}`} p={p} s={0.7} o={0.8} />);
      }
    }
  }
  const muzzle = fire && f % 2 === 0;
  const puffs: React.ReactNode[] = [];
  if (f > HIT) for (let e = HIT + 1; e <= f; e += 1) {
    const age = f - e; if (age > 22) continue; const p = yakPos(e).add(new THREE.Vector3(1.2 + age * V * 0.45, age * 0.03, 0));
    puffs.push(<Puff key={e} p={p} s={0.3 + age * 0.04} o={Math.max(0, 0.9 - age / 24)} dark={Math.min(1, (e - HIT) / 18)} />);
  }
  const fadeIn = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const cutFlash = f < CUT ? 0 : interpolate(f, [CUT, CUT + 4], [0.6, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Sky f={f} dir={1} horizon={A ? 118 : 92} speed={A ? 26 : 14} />
        <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [0, 0, 20] }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
          <ambientLight intensity={1.5} />
          <hemisphereLight args={["#ffffff", "#8a8f99", 0.6]} />
          <directionalLight position={[-6, 12, 14]} intensity={2.4} />
          <directionalLight position={[8, -4, 6]} intensity={0.5} color="#a9cdef" />
          <ToonPlane {...BF} {...bf} spin={f * 1.9} />
          {!A && <ToonPlane {...YAK} pos={[yp.x, yp.y, yp.z]} {...yr} spin={f * 1.7} />}
          {bullets}
          {muzzle && <Glow p={new THREE.Vector3(-4.6, 0.6, 0)} s={1.6} o={0.9} />}
          {f >= HIT - 2 && f < HIT + 10 && <Glow p={yp.clone().add(new THREE.Vector3(0.6, 0.3, 0))} s={3 + (f - HIT) * 0.5} o={1 - Math.max(0, f - HIT) / 10} />}
          {f > HIT && <Glow p={yakPos(f).add(new THREE.Vector3(0.9, 0.2, 0))} s={1.3 + rnd(f) * 0.5} o={0.85} />}
          {puffs}
          <Cam {...cam} />
        </ThreeCanvas>
        <Speed f={f} o={A ? 0.5 : 0.3} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: cutFlash }} />
    </AbsoluteFill>
  );
};
