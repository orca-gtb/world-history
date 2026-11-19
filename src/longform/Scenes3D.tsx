import React, { useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Easing, Img, OffthreadVideo, Sequence, staticFile } from "remotion";
import timing from "./timing.json";
import { C, F, clamp01 } from "../kit/theme";
import { ToonPlane, toonMat, type ToonOpts, type Pose } from "../sprites/Toon";
import type { Line } from "./types";

// Adegan dogfight 3D cel-shaded (model CC-BY, lihat assets-src/ASSETS.md). Waktu `t` = detik sejak suara bab mulai.
// Tiap adegan = beberapa shot pendek (cut), gaya gerak dari bedah referensi: fly-by ease-out, head-on, kamera kejar, goyang saat tembak.
// Kerangka tiap shot relatif kamera/udara; semua posisi fungsi murni dari t (aman untuk render paralel).
const W = 1700, H = 900;
type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const bz = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.inOut(Easing.cubic);
const u = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mixV = (a: V3, b: V3, k: number) => a.clone().lerp(b, k);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const rv = (t: number, at: number, d = 0.5) => bz(clamp01((t - at) / d));
const D2R = THREE.MathUtils.degToRad;

export const BF: ToonOpts = { model: "bf109g6", base: [0, -90, 0], clipY: -0.58, hideBox: [2.6, 4.8, -0.9, 0.45], prop: { x: -4.47, y: 0.33, r: 1.5, blades: 3 } };
export const YAK: ToonOpts = { model: "yak1", base: [0, 0, 0], hide: "pilot", clipY: -0.66, prop: { x: -3.35, y: 0.46, r: 1.5, blades: 3 } };
export const JU87: ToonOpts = { model: "ju87", base: [0, -90, 0], prop: { x: -4.05, y: 0.35, r: 1.7, blades: 3 } };
export const BFG: ToonOpts = { model: "bf109g6", base: [0, -90, 0], prop: { x: -4.47, y: 0.33, r: 1.5, blades: 3 } }; // roda pendarat TIDAK dipotong (untuk adegan darat)
export const P51: ToonOpts = { model: "p51b", base: [0, -90, 0], clipY: -0.9, prop: { x: -4.3, y: 0.12, r: 1.55, blades: 4 } };

// ------------------------------------------------------------ spesifikasi frame
type Cam = { pos: V3; look: V3; fov: number; roll?: number };
type PlaneS = { o: ToonOpts; p: Pose; key: string };
type Tag = { p: V3; text: string; color?: string; o: number; dy?: number };
type Frame = {
  cam: Cam; planes: PlaneS[];
  tracers?: { a: V3; b: V3 }[]; glows?: { p: V3; s: number; o: number }[]; puffs?: { p: V3; s: number; o: number; dark: number; tint?: "dust" }[];
  chute?: { p: V3; sway: number }; ground?: { y: number; scroll: number; rep?: number; tint?: number }; extras?: React.ReactNode;
  sky: { scroll: number; lift?: number; fg?: boolean; tone?: "day" | "late" };
  white?: number; shake?: number; tags?: Tag[];
};

// yaw agar hidung (-X lokal) menghadap arah d
const yawTo = (d: V3) => THREE.MathUtils.radToDeg(Math.atan2(d.z, -d.x));
const poseMat = (p: Pose) => new THREE.Matrix4().compose(V(...p.pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(D2R(p.roll ?? 0), D2R(p.yaw ?? 0), D2R(-(p.pitch ?? 0)), "YZX")), V(1, 1, 1));
const local = (p: Pose, v: V3) => v.clone().applyMatrix4(poseMat(p));

const makeCam = (c: Cam, shake = 0, seed = 0) => {
  const cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.1, 3000);
  const s = V((rnd(seed) - 0.5) * shake, (rnd(seed + 7) - 0.5) * shake, 0);
  cam.position.copy(c.pos).add(s); cam.up.set(Math.sin(c.roll ?? 0), Math.cos(c.roll ?? 0), 0); cam.lookAt(c.look.clone().add(s)); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  return cam;
};
const CamSync: React.FC<{ cam: THREE.PerspectiveCamera }> = ({ cam }) => {
  const c = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  c.position.copy(cam.position); c.quaternion.copy(cam.quaternion); c.fov = cam.fov; c.aspect = cam.aspect; c.near = cam.near; c.far = cam.far; c.updateProjectionMatrix(); c.updateMatrixWorld(true);
  return null;
};

// ------------------------------------------------------------ langit + awan 2D (public/clouds, prosedural buatan sendiri)
const CL = [0, 1, 2, 3, 4, 5].map((i) => `clouds/c${i}.png`);
const LAYERS = [
  { n: 6, par: 0.18, y0: 40, yr: 220, s: 0.32, o: 0.8, seed: 1 },
  { n: 5, par: 0.45, y0: 260, yr: 260, s: 0.55, o: 0.95, seed: 20 },
  { n: 4, par: 1.0, y0: 560, yr: 300, s: 1.0, o: 1, seed: 40 },
];
const Sky: React.FC<{ scroll: number; lift: number; fg: boolean; tone: "day" | "late"; front?: boolean }> = ({ scroll, lift, fg, tone, front }) => {
  const span = W + 1400;
  const ls = front ? (fg ? [{ n: 2, par: 2.2, y0: 900, yr: 80, s: 1.2, o: 1, seed: 70 }] : []) : LAYERS;
  const top = tone === "late" ? "#6d8db0" : "#5b8fc2", mid = tone === "late" ? "#b5c4cf" : "#a6c8e2", low = tone === "late" ? "#efe2c6" : "#e9f0f2";
  return (
    <div style={{ position: "absolute", inset: 0, background: front ? undefined : `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${low} 100%)`, overflow: "hidden", pointerEvents: "none" }}>
      {ls.flatMap((L) => Array.from({ length: L.n }, (_, i) => {
        const w = 1200 * L.s * (0.75 + rnd(i + L.seed) * 0.5);
        const x = ((((rnd(i + L.seed + 3) * span + scroll * L.par) % span) + span) % span) - 700;
        const y = L.y0 + rnd(i + L.seed + 11) * L.yr + (front ? 0 : lift * L.par);
        return <Img key={`${L.seed}-${i}`} src={staticFile(CL[Math.floor(rnd(i + L.seed + 5) * 6)])} style={{ position: "absolute", left: x - w / 2, top: y - w * 0.22, width: w, opacity: L.o, transform: rnd(i + L.seed + 9) > 0.5 ? "scaleX(-1)" : undefined }} />;
      }))}
    </div>
  );
};

// ------------------------------------------------------------ objek 3D pendukung
const fieldTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = c.height = 1024; const g = c.getContext("2d")!;
    const cols = ["#8fa564", "#9fb06d", "#7d9658", "#b5ad6e", "#a7a062", "#6f8a52", "#c2b67a"];
    g.fillStyle = "#86995e"; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 70; i++) {
      const x = rnd(i) * 1024, y = rnd(i + 99) * 1024, w = 90 + rnd(i + 3) * 260, h = 60 + rnd(i + 5) * 200;
      g.save(); g.translate(x, y); g.rotate((rnd(i + 8) - 0.5) * 0.5); g.fillStyle = cols[i % cols.length]; g.fillRect(-w / 2, -h / 2, w, h);
      g.strokeStyle = "rgba(60,70,40,0.35)"; g.lineWidth = 3; g.strokeRect(-w / 2, -h / 2, w, h); g.restore();
    }
    for (let i = 0; i < 26; i++) { g.fillStyle = "rgba(55,75,45,0.55)"; g.beginPath(); g.arc(rnd(i + 300) * 1024, rnd(i + 400) * 1024, 10 + rnd(i + 500) * 22, 0, Math.PI * 2); g.fill(); }
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(24, 24); t.anisotropy = 8; return t;
  };
})();
const Ground: React.FC<{ y: number; scroll: number; rep?: number; tint?: number }> = ({ y, scroll, rep = 24, tint = 0xffffff }) => {
  const tile = 4000 / rep;
  const mat = useMemo(() => { const tx = fieldTex().clone(); tx.repeat.set(rep, rep); tx.needsUpdate = true; return toonMat(tint, { map: tx }); }, [rep, tint]);
  return <mesh position={[((scroll % tile) + tile) % tile, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}><planeGeometry args={[4000, 4000]} /></mesh>;
};

const glowTex = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d")!;
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64); rg.addColorStop(0, "rgba(255,255,230,1)"); rg.addColorStop(0.25, "rgba(255,210,90,0.9)"); rg.addColorStop(0.6, "rgba(255,120,30,0.35)"); rg.addColorStop(1, "rgba(255,90,0,0)");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128); t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
})();
const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
const tracerGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6).rotateZ(Math.PI / 2);
const smokeGeo = new THREE.IcosahedronGeometry(1, 1);

const Chute: React.FC<{ p: V3; sway: number }> = ({ p, sway }) => {
  const g = useMemo(() => {
    const grp = new THREE.Group();
    const hull = (m: THREE.Mesh, k = 1.06) => { const h = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: 0x15100c, side: THREE.BackSide })); h.scale.setScalar(k); m.add(h); return m; };
    const canopy = hull(new THREE.Mesh(new THREE.SphereGeometry(3.4, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), toonMat(0xefe9dc, { side: THREE.DoubleSide })), 1.03);
    canopy.scale.set(1, 0.62, 1); canopy.position.y = 6; grp.add(canopy);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x3a342c });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2; const top = V(Math.cos(a) * 3.15, 6 + 0.55, Math.sin(a) * 3.15); const bot = V(0, 1.1, 0);
      const len = top.distanceTo(bot); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 4), lineMat);
      l.position.copy(top.clone().add(bot).multiplyScalar(0.5)); l.quaternion.setFromUnitVectors(V(0, 1, 0), top.clone().sub(bot).normalize()); grp.add(l);
    }
    const body = hull(new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.0, 6, 12), toonMat(0x4d5257)), 1.12); body.position.y = 0.4; grp.add(body);
    const head = hull(new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), toonMat(0x6b5a48)), 1.12); head.position.y = 1.35; grp.add(head);
    const legs = hull(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.8, 6, 10), toonMat(0x3f4347)), 1.12); legs.position.y = -0.55; grp.add(legs);
    return grp;
  }, []);
  g.position.copy(p); g.rotation.set(0, 0.4, D2R(sway));
  return <primitive object={g} />;
};

// ------------------------------------------------------------ penggambar umum
const Stage: React.FC<{ f: Frame; seed: number }> = ({ f, seed }) => {
  const cam = makeCam(f.cam, f.shake ?? 0, seed);
  const proj = (p: V3) => { const v = p.clone().project(cam); const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H; return { x, y, vis: v.z < 1 && v.z > -1 && x > 40 && x < W - 40 && y > 60 && y < H - 40 }; };
  return (
    <>
      <Sky scroll={f.sky.scroll} lift={f.sky.lift ?? 0} fg={false} tone={f.sky.tone ?? "day"} />
      <ThreeCanvas width={W} height={H} style={{ position: "absolute", inset: 0 }} camera={{ fov: 34, position: [0, 0, 20] }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
        <fog attach="fog" args={[f.sky.tone === "late" ? "#e6e0cf" : "#dbe6ee", 350, 3200]} />
        <ambientLight intensity={1.5} />
        <hemisphereLight args={["#ffffff", "#8a8f99", 0.6]} />
        <directionalLight position={[-6, 12, 14]} intensity={2.4} />
        <directionalLight position={[8, -4, 6]} intensity={0.5} color="#a9cdef" />
        {f.ground && <Ground y={f.ground.y} scroll={f.ground.scroll} rep={f.ground.rep} tint={f.ground.tint} />}
        {f.extras}
        {f.planes.map((pl) => <ToonPlane key={pl.key} {...pl.o} {...pl.p} />)}
        {f.chute && <Chute p={f.chute.p} sway={f.chute.sway} />}
        {(f.tracers ?? []).map((tr, i) => { const m = new THREE.Mesh(tracerGeo, tracerMat); m.position.copy(tr.a); m.quaternion.setFromUnitVectors(V(1, 0, 0), tr.b.clone().sub(tr.a).normalize()); return <primitive key={`t${i}`} object={m} />; })}
        {(f.glows ?? []).map((g, i) => <sprite key={`g${i}`} position={g.p} scale={[g.s, g.s, g.s]}><spriteMaterial map={glowTex()} transparent opacity={g.o} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>)}
        {(f.puffs ?? []).map((pf, i) => <mesh key={`p${i}`} position={pf.p} scale={[pf.s, pf.s * 0.85, pf.s]} geometry={smokeGeo} material={toonMat(pf.tint === "dust" ? new THREE.Color("#a58d68") : new THREE.Color().setHSL(0.08, 0.05, 0.62 - pf.dark * 0.45), { transparent: true, opacity: pf.o, depthWrite: false })} />)}
        <CamSync cam={cam} />
      </ThreeCanvas>
      <Sky scroll={f.sky.scroll} lift={f.sky.lift ?? 0} fg={!!f.sky.fg} tone={f.sky.tone ?? "day"} front />
      {(f.tags ?? []).map((tg, i) => { const q = proj(tg.p); if (!q.vis || tg.o <= 0) return null; return <TagBox key={i} x={q.x} y={q.y - (tg.dy ?? 90)} text={tg.text} color={tg.color} o={tg.o} />; })}
      {(f.white ?? 0) > 0 && <div style={{ position: "absolute", inset: 0, background: "#f6f8fa", opacity: f.white }} />}
    </>
  );
};

// ------------------------------------------------------------ overlay 2D (sama dengan versi siluet)
const TagBox: React.FC<{ x: number; y: number; text: string; color?: string; o?: number }> = ({ x, y, text, color = "#ffd36e", o = 1 }) => (
  <div style={{ position: "absolute", left: Math.max(20, Math.min(W - 360, x - 80)), top: Math.max(150, Math.min(H - 160, y)), opacity: o, padding: "2px 14px", background: "rgba(10,16,22,0.82)", border: `2px solid ${color}`, fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 2, color, whiteSpace: "nowrap" }}>{text}</div>
);
const Hud: React.FC<{ x: number; y: number; title: string; value: string; sub?: string; color?: string }> = ({ x, y, title, value, sub, color = C.gold }) => (
  <div style={{ position: "absolute", left: x, top: y, minWidth: 330, padding: "12px 22px", background: "rgba(10,16,22,0.86)", border: `2px solid ${color}` }}>
    <div style={{ fontFamily: F.type, fontSize: 22, letterSpacing: 4, color }}>{title}</div>
    <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 84, lineHeight: 1.0, color: "#fff" }}>{value}</div>
    {sub && <div style={{ fontFamily: F.type, fontSize: 20, color: "#a9cdef", letterSpacing: 2 }}>{sub}</div>}
  </div>
);
const Caps: React.FC<{ lines?: Line[]; t: number }> = ({ lines, t }) => (
  <div style={{ position: "absolute", left: 60, right: 60, bottom: 34, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    {(lines ?? []).map((l, i) => { const o = rv(t, l.at); return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 12}px)`, marginTop: 8, padding: "4px 16px", background: "rgba(10,16,22,0.78)", fontFamily: F.ui, fontWeight: l.hi ? 700 : 600, fontSize: l.hi ? 56 : 48, color: l.hi ? "#fff" : "#e6ecef", lineHeight: 1.1 }}><div>{l.t}</div></div>; })}
  </div>
);
const Illus: React.FC = () => <div style={{ position: "absolute", right: 24, bottom: 18, padding: "2px 12px", background: "rgba(10,16,22,0.72)", fontFamily: F.type, fontSize: 20, letterSpacing: 3, color: "#a9cdef" }}>ILLUSTRATIVE RECONSTRUCTION</div>;
const Head: React.FC<{ kicker?: string; title?: string }> = ({ kicker, title }) => (
  <div style={{ position: "absolute", left: 50, top: 36 }}>
    {kicker && <div style={{ display: "inline-block", padding: "2px 14px", background: "rgba(10,16,22,0.8)", fontFamily: F.type, fontSize: 28, letterSpacing: 5, color: "#ffb08a" }}>{kicker}</div>}
    {title && <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 74, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,0.6)", lineHeight: 1.05, marginTop: 6 }}>{title}</div>}
  </div>
);
const PANEL: React.CSSProperties = { position: "absolute", width: W, height: H, overflow: "hidden", boxSizing: "border-box", boxShadow: "0 1px 1px rgba(40,24,6,0.18), 0 4px 4px rgba(40,24,6,0.15), 0 16px 16px rgba(40,24,6,0.13), 0 32px 40px rgba(40,24,6,0.16)", filter: "sepia(0.12) saturate(0.95) contrast(1.03)" };
const cutWhite = (t: number, cuts: number[]) => Math.max(0, ...cuts.map((c) => (t >= c && t < c + 0.14 ? 0.55 * (1 - (t - c) / 0.14) : 0)));

// ------------------------------------------------------------ efek tembak & asap (umum)
const burst = (t: number, t0: number, t1: number, from: Pose, guns: V3[], target: (tt: number) => V3, lead = 0.27) => {
  const tr: { a: V3; b: V3 }[] = []; const gl: { p: V3; s: number; o: number }[] = [];
  for (let s0 = t0; s0 <= Math.min(t, t1); s0 += 1 / 15) {
    const age = (t - s0) / lead; if (age > 1) continue;
    guns.forEach((gp, k) => {
      const a = local(from, gp); const b = target(s0 + lead).add(V((rnd(s0 * 31 + k) - 0.5) * 1.4, (rnd(s0 * 17 + k) - 0.5) * 1.0, (rnd(s0 * 7 + k) - 0.5) * 1.0));
      const p = a.clone().lerp(b, age); tr.push({ a: p, b }); gl.push({ p, s: 0.8, o: 0.75 });
    });
  }
  if (t >= t0 && t <= t1 && Math.floor(t * 30) % 2 === 0) guns.forEach((gp) => gl.push({ p: local(from, gp.clone().add(V(-0.4, 0, 0))), s: 1.8, o: 0.9 }));
  return { tr, gl };
};
const trail = (t: number, t0: number, pos: (tt: number) => V3, drift: V3, life = 0.75, step = 1 / 30, size = 0.3, grow = 1.3) => {
  const out: { p: V3; s: number; o: number; dark: number }[] = [];
  for (let e = t0; e <= t; e += step) { const age = t - e; if (age > life) continue; out.push({ p: pos(e).add(drift.clone().multiplyScalar(age)).add(V((rnd(e * 91) - 0.5) * 0.6, (rnd(e * 53) - 0.5) * 0.6, (rnd(e * 37) - 0.5) * 0.6)), s: (size + age * grow) * (0.7 + rnd(e * 13) * 0.6), o: Math.max(0, 0.9 - age / life), dark: Math.min(1, (e - t0) / 0.6) }); }
  return out;
};

// ======================================================================= 1. misi pertama, 14 Okt 1942
const firstFrame = (t: number): Frame => {
  const bob = (k: number) => Math.sin(t * 1.7 + k) * 0.25;
  if (t < 16.4) { // formasi, kamera 3/4 depan menyusur pelan
    const k = u(t, 14.3, 16.4);
    const lead: Pose = { pos: [-4, 1.6 + bob(0), -10], pitch: 1, roll: Math.sin(t) * 3, spin: t * 57 };
    const hk: Pose = { pos: [5, -1 + bob(2), 2], pitch: 1, roll: Math.sin(t + 1) * 4, spin: t * 55 };
    return { cam: { pos: V(mix(-15, -11, k), 2, mix(19, 16.5, k)), look: V(0.5, 0, -3), fov: 32 }, planes: [{ o: BF, p: lead, key: "lead" }, { o: BF, p: hk, key: "hk" }],
      sky: { scroll: t * 260 }, tags: [{ p: V(-4, 1.6, -10), text: "ROßMANN", color: "#e6ecef", o: rv(t, 14.6) }, { p: V(5, -1, 2), text: "HARTMANN", o: rv(t, 14.6) }] };
  }
  if (t < 19.3) { // dari atas-belakang: dua flight Yak rapi (V-echelon) di bawah, arah sama dengan Hartmann
    const k = u(t, 16.4, 19.3);
    const hk: Pose = { pos: [mix(10, 4, k), 5 + bob(1), 9], pitch: -2, roll: 8 + Math.sin(t) * 3, spin: t * 55 };
    // tiap flight: pemimpin + 4 wingman bergeser ke belakang (+x) dan ke samping (±z)
    const flights: [number, number, number][] = [[-30, -30, -10], [-62, -31, 14]]; // [x, y, z] pemimpin
    const slots: [number, number][] = [[0, 0], [10, -9], [10, 9], [20, -18], [20, 18]];
    const yaks: PlaneS[] = flights.flatMap(([fx, fy, fz], fi) => slots.map(([dx, dz], si) => ({
      o: YAK, key: `y${fi}${si}`, p: { pos: [fx + dx + (t - 16.4) * 3, fy + (si % 2) * 0.3, fz + dz], yaw: 0, roll: Math.sin(t * 1.2 + fi * 2 + si) * 2, pitch: 0, spin: t * 50 + si * 3 },
    })));
    return { cam: { pos: V(mix(34, 30, k), 14, 24), look: V(-34, -27, 0), fov: 42 }, planes: [{ o: BF, p: hk, key: "hk" }, ...yaks],
      ground: { y: -260, scroll: t * 10 }, sky: { scroll: t * 160, lift: -300 },
      tags: [{ p: V(-46, -30, 2), text: "10 ENEMY AIRCRAFT BELOW", color: "#ff8a70", o: rv(t, 16.6), dy: 130 }, { p: V(7, 5, 9), text: "HARTMANN", o: rv(t, 16.5) }] };
  }
  if (t < 21.3) { // menukik: fly-by melintas kamera, ease-out
    const k = bz(u(t, 19.3, 21.3));
    const pos = mixV(V(26, 15, -14), V(-6, -3, 3), k);
    const hk: Pose = { pos: [pos.x, pos.y, pos.z], yaw: -18, pitch: mix(-38, -22, k), roll: mix(-70, -25, k), spin: t * 60 };
    return { cam: { pos: V(-8, -4, 22), look: V(0, 0, 0), fov: 34 }, planes: [{ o: BF, p: hk, key: "hk" }], sky: { scroll: t * 420, lift: 120 - k * 220, fg: true },
      tags: [{ p: pos, text: "HARTMANN", o: 1 }] };
  }
  if (t < 22.4) { // hampir tabrakan: Yak head-on dari depan
    const k = u(t, 21.3, 22.25); const ke = Easing.in(Easing.quad)(k);
    const hk: Pose = { pos: [0, 0, 0], pitch: 2, roll: t > 21.75 ? mix(0, 35, u(t, 21.75, 22.1)) : Math.sin(t * 3) * 3, spin: t * 60 };
    const yp = mixV(V(-110, 1.5, -2.5), V(26, 4.2, 3.5), ke);
    return { cam: { pos: V(9, 2.4, 2.6), look: V(-30, 0.5, -1), fov: 38 }, planes: [{ o: BF, p: hk, key: "hk" }, { o: YAK, key: "yk", p: { pos: [yp.x, yp.y, yp.z], yaw: 180, pitch: -3, roll: -20, spin: t * 60 } }],
      sky: { scroll: t * 380 }, shake: t > 21.8 && t < 22.2 ? 0.35 : 0.05,
      tags: t > 21.45 ? [{ p: V(0, 0, 0), text: "NEAR COLLISION", color: "#ff8a70", o: 1, dy: 190 }] : [] };
  }
  if (t < 24.1) { // naik ke awan, bahan bakar habis
    const k = u(t, 22.4, 24.1);
    const hk: Pose = { pos: [mix(4, -6, k), mix(-2, 2, k), 0], pitch: 14, roll: Math.sin(t * 2) * 6, spin: t * 45 };
    return { cam: { pos: V(-4, 0, 24), look: V(0, 0, 0), fov: 32 }, planes: [{ o: BF, p: hk, key: "hk" }], sky: { scroll: t * 300, lift: k * 240, fg: true },
      white: 0.92 * clamp01((t - 23.0) / 0.9), tags: [{ p: V(hk.pos[0], hk.pos[1], 0), text: "HARTMANN", o: 1 - clamp01((t - 23.0) / 0.6) }] };
  }
  // mendarat darurat di ladang (perut), debu
  const touch = 24.9, stop = 26.6;
  const x = t < touch ? mix(24, 6, io(u(t, 24.1, touch))) : mix(6, -9, bz(u(t, touch, stop)));
  const y = t < touch ? mix(4, 0, io(u(t, 24.1, touch))) : 0;
  const hk: Pose = { pos: [x, y, 0], pitch: t < touch ? mix(-4, 7, u(t, 24.1, touch)) : mix(7, 2, u(t, touch, stop)), roll: t < touch ? Math.sin(t * 4) * 3 : 0, spin: t < touch ? t * 30 : touch * 30 };
  const dust = t > touch ? trail(t, touch, (tt) => V(tt < stop ? mix(6, -9, bz(u(tt, touch, stop))) + 2 : -7, -0.4, 0.5), V(1.2, 0.8, 1.5), 1.2, 1 / 20, 0.6, 2.2).map((p) => ({ ...p, tint: "dust" as const, o: p.o * (1 - u(t, stop, stop + 1.6)) })) : [];
  return { cam: { pos: V(-6, 1.2, 24), look: V(0, 0.4, 0), fov: 30 }, planes: [{ o: BF, p: hk, key: "hk" }], ground: { y: -0.95, scroll: 0, rep: 260 }, sky: { scroll: 0, lift: 60 },
    puffs: dust, white: Math.max(0.92 * (1 - u(t, 24.1, 24.5)), 0), tags: [{ p: V(x, y, 0), text: "HARTMANN", o: 1 - clamp01((t - 24.9) / 0.5) }] };
};
const First3D: React.FC<{ t: number }> = ({ t }) => {
  const f = firstFrame(t); f.white = Math.max(f.white ?? 0, cutWhite(t, [16.4, 19.3, 21.3, 22.4]));
  return (
    <div style={PANEL}>
      <Stage f={f} seed={Math.floor(t * 30)} />
      <Head kicker="14 OCTOBER 1942" title="First combat mission" />
      <Illus />
      {t >= 24.1 && <Hud x={W - 380} y={36} title="FUEL" value="EMPTY" color="#ff6a50" />}
    </div>
  );
};

// ======================================================================= 2. serangan jarak dekat
const ambushFrame = (t: number) => {
  const p = bz(clamp01((t - 15.0) / 4.4)); const D = 200 - 180 * p; // meter
  const yakAt = (tt: number) => {
    const pp = bz(clamp01((tt - 15.0) / 4.4)); const dd = 200 - 180 * pp;
    const base = V(-(dd + 9), -1.6 + Math.sin(tt * 0.9) * 0.2, -0.6);
    if (tt > 19.95) { const a = tt - 19.95; base.add(V(a * 4, -a * a * 6, -a * 2)); }
    return base;
  };
  const yRot = (tt: number) => ({ pitch: tt > 19.95 ? -Math.min((tt - 19.95) * 30, 40) : 0, roll: tt > 19.95 ? (tt - 19.95) * 160 : Math.sin(tt) * 5 });
  const bf: Pose = { pos: [0, 0, 0], pitch: -1, roll: 4 + Math.sin(t * 0.8) * 3, spin: t * 57 };
  const yp = yakAt(t);
  const yak: PlaneS = { o: YAK, key: "yk", p: { pos: [yp.x, yp.y, yp.z], ...yRot(t), spin: t * 52 } };
  const smoke = t > 20.0 ? trail(t, 20.0, (tt) => yakAt(tt).add(V(1.2, 0.2, 0)), V(9, 0.6, 0), 0.8) : [];
  let f: Frame;
  if (t < 17.6) f = { cam: { pos: V(12, 4.5, 6), look: V(-60, -3, -1), fov: mix(36, 30, u(t, 14.6, 17.6)) }, planes: [{ o: BF, p: bf, key: "bf" }, yak], sky: { scroll: t * 240 }, ground: { y: -400, scroll: t * 20 } };
  else if (t < 19.6) f = { cam: { pos: V(7.5, 2.4, 3.2), look: V(-25, -1.4, -0.6), fov: 34 }, planes: [{ o: BF, p: bf, key: "bf" }, yak], sky: { scroll: t * 300 }, ground: { y: -400, scroll: t * 20 } };
  else if (t < 21.0) {
    const b = burst(t, 19.6, 20.15, bf, [V(-4.2, 0.62, 0.3), V(-4.2, 0.62, -0.3)], yakAt);
    f = { cam: { pos: V(7.5, 2.4, 3.2), look: V(-25, -1.4, -0.6), fov: 34 }, planes: [{ o: BF, p: bf, key: "bf" }, yak], sky: { scroll: t * 300 }, ground: { y: -400, scroll: t * 20 },
      tracers: b.tr, glows: [...b.gl, ...(t > 19.9 && t < 20.3 ? [{ p: yakAt(19.95).add(V(0.5, 0.3, 0)), s: 4 + (t - 19.9) * 10, o: 1 - (t - 19.9) / 0.4 }] : []), ...(t > 19.95 ? [{ p: yp.clone().add(V(0.9, 0.2, 0)), s: 1.6, o: 0.85 }] : [])],
      puffs: smoke, shake: t < 20.2 ? 0.3 : 0 };
  } else { // dia pergi: kamera samping, Bf naik miring keluar kiri atas, Yak jatuh berasap
    const k = bz(u(t, 21.0, 22.4));
    const bp = mixV(V(-1, -1, 0), V(-13, 6, -8), k);
    const bfL: Pose = { pos: [bp.x, bp.y, bp.z], pitch: mix(5, 28, k), roll: mix(0, -55, k), spin: t * 60 };
    const yk = V(9 + k * 4, -1 - k * k * 9, -8);
    f = { cam: { pos: V(-2, 0, 36), look: V(-1, 0, 0), fov: 34 }, planes: [{ o: BF, p: bfL, key: "bf" }, { o: YAK, key: "yk", p: { pos: [yk.x, yk.y, yk.z], pitch: -40 - k * 20, roll: 200 + k * 300, spin: t * 30 } }],
      puffs: trail(t, 21.0, (tt) => V(9 + bz(u(tt, 21, 22.4)) * 4 + 1.5, -1 - Math.pow(bz(u(tt, 21, 22.4)), 2) * 9 + 0.8, -8), V(0, 2.2, 0), 1.1, 1 / 24, 0.5, 1.8).map((q) => ({ ...q, dark: 1 })), sky: { scroll: t * 220 } };
  }
  f.tags = t < 21.0 ? [{ p: V(0, 0, 0), text: "HARTMANN", o: rv(t, 14.8), dy: 170 }, { p: yp, text: "TARGET", color: "#ff8a70", o: rv(t, 14.8) * (1 - u(t, 20.2, 20.6)) }] : [];
  f.white = Math.max(f.white ?? 0, cutWhite(t, [17.6, 19.6, 21.0]));
  return { f, D };
};
const Ambush3D: React.FC<{ t: number }> = ({ t }) => {
  const { f } = ambushFrame(t);
  return (
    <div style={PANEL}>
      <Stage f={f} seed={Math.floor(t * 30)} />
      <Head kicker="HE HELD HIS FIRE" />
      <Illus />
      {t > 19.4 && <Hud x={W - 400} y={36} title="FIRING RANGE" value="≤ 20 m" sub="HIS OWN ACCOUNT" />}
      <Caps t={t} lines={[{ t: "A short burst at point-blank range", at: 19.6 }, { t: "Then he left", at: 21.2, hi: true }]} />
    </div>
  );
};

// ======================================================================= 3. Goebel melambai (Juni 1944)
const goebelFrame = (t: number): Frame => {
  const sway = Math.sin(t * 1.3) * 6;
  if (t < 15.0) { // lebar: parasut, P-51 kecil mendekat dari jauh
    const k = u(t, 9.9, 15.0);
    const pp = mixV(V(140, 22, -260), V(70, 10, -120), k);
    const chute = V(-9, 3 - (t - 10) * 0.25, 0);
    return { cam: { pos: V(0, 2, 44), look: V(4, 2, 0), fov: 32 }, planes: [{ o: P51, key: "p", p: { pos: [pp.x, pp.y, pp.z], yaw: yawTo(chute.clone().sub(pp)), pitch: -3, roll: 6, spin: t * 60 } }],
      chute: { p: chute, sway }, sky: { scroll: t * 30, tone: "late" },
      tags: [{ p: chute.clone().add(V(0, 8, 0)), text: "HARTMANN", o: rv(t, 10.4) }, { p: pp, text: "LT. GOEBEL · P-51B", color: "#e6ecef", o: rv(t, 13.4), dy: 70 }] };
  }
  if (t < 20.5) { // P-51 mendekat 3/4 depan, membesar (ease-out)
    const k = bz(u(t, 15.0, 20.5));
    const pp = mixV(V(90, 14, -140), V(16, 3, -14), k);
    const chute = V(-8.5, 1 - (t - 15) * 0.2, -4);
    return { cam: { pos: V(-6, 3, 34), look: V(8, 2, -10), fov: 34 }, planes: [{ o: P51, key: "p", p: { pos: [pp.x, pp.y, pp.z], yaw: yawTo(V(-1, 0, 0.55)), pitch: -2, roll: mix(15, 4, k), spin: t * 60 } }],
      chute: { p: chute, sway }, sky: { scroll: t * 40, tone: "late" }, tags: [{ p: pp, text: "LT. GOEBEL · P-51B", color: "#e6ecef", o: 1, dy: 80 }] };
  }
  if (t < 23.2) { // camera pass: lintas dekat di depan parasut
    const k = Easing.out(Easing.quad)(u(t, 20.5, 23.2));
    const pp = mixV(V(26, 0.5, -8), V(-26, 3, 5), k);
    const chute = V(3, 5 - (t - 20.5) * 0.2, -16);
    return { cam: { pos: V(0, 1, 26), look: V(pp.x * 0.4, 2, -4), fov: 36 }, planes: [{ o: P51, key: "p", p: { pos: [pp.x, pp.y, pp.z], yaw: yawTo(V(-1, 0, 0.18)), pitch: 1, roll: -12, spin: t * 60 } }],
      chute: { p: chute, sway }, sky: { scroll: t * 60, tone: "late" }, glows: t > 21.3 && t < 21.55 ? [{ p: pp.clone().add(V(-1, 1.2, 0.5)), s: 3 * (1 - (t - 21.3) / 0.25) + 0.5, o: 0.9 }] : [],
      tags: t > 20.6 ? [{ p: pp, text: "CAMERA PASS", color: "#a9cdef", o: rv(t, 20.6, 0.3) * (1 - u(t, 22.6, 23.0)), dy: 110 }] : [] };
  }
  // menjauh sambil menggoyang sayap (melambai), lalu naik keluar
  const k = u(t, 23.2, 27.0);
  const pp = mixV(V(-2, 1, -4), V(-46, 18, -80), io(k));
  const rock = t > 24.2 && t < 25.8 ? Math.sin((t - 24.2) * 9) * 32 : 0;
  return { cam: { pos: V(12, -3, 22), look: V(-8, 4, -20), fov: 36 }, planes: [{ o: P51, key: "p", p: { pos: [pp.x, pp.y, pp.z], yaw: yawTo(V(-0.6, 0, -1)), pitch: 10, roll: -25 + rock, spin: t * 60 } }],
    chute: { p: V(11, 1 - (t - 23.2) * 0.25, -12), sway }, sky: { scroll: t * 50, tone: "late" } };
};
const Goebel3D: React.FC<{ t: number }> = ({ t }) => {
  const f = goebelFrame(t); f.white = Math.max(f.white ?? 0, cutWhite(t, [15.0, 20.5, 23.2]));
  return (
    <div style={PANEL}>
      <Stage f={f} seed={Math.floor(t * 30)} />
      <Head kicker="JUNE 1944 · ROMANIA" />
      <Illus />
      <Caps t={t} lines={[{ t: "Hartmann bails out, out of fuel and ammunition", at: 10.5 }, { t: "Lt. Robert J. Goebel · P-51B · 31st Fighter Group", at: 13.4, hi: true }, { t: "A camera pass to record the bailout. He banks away, and waves.", at: 19.7 }]} />
    </div>
  );
};

// ======================================================================= 4. Brno, 8 Mei 1945
const HIT = 7.35;
const brnoYak = (tt: number) => {
  const g = tt - 6.2; const v = V(-30 + g * 5.1, -3.2 + Math.sin(g * 2.1) * 0.25, -1.2 + Math.sin(g * 1.5) * 0.4);
  if (tt > HIT) { const a = tt - HIT; v.add(V(a * 3.6, -Math.pow(a * 30, 1.6) * 0.03, 0)); }
  return v;
};
const brnoFrame = (t: number): Frame => {
  if (t < 6.2) { // close-up 3/4: menukik dari atas, miring
    const k = io(u(t, 4.6, 6.2));
    const bf: Pose = { pos: [0, 0, 0], yaw: mix(-14, 6, k), pitch: mix(2, -16, k), roll: mix(14, 40, k), spin: t * 57 };
    return { cam: { pos: V(mix(-9.5, -6.5, k), mix(-2.2, -0.6, k), mix(13, 9.5, k)), look: V(mix(-1, 0.5, k), 0, 0), fov: 34 }, planes: [{ o: BF, p: bf, key: "bf" }], sky: { scroll: t * 780, lift: 300 - k * 200 },
      tags: [{ p: V(0, 1, 0), text: "HARTMANN", o: rv(t, 4.8), dy: 160 }] };
  }
  const bf: Pose = { pos: [0, 0, 0], pitch: -3 + Math.sin(t * 1.5) * 1, roll: 6 + Math.sin(t * 1.2) * 5, spin: t * 57 };
  const yp = brnoYak(t);
  const yr = { pitch: t > HIT ? -Math.min((t - HIT) * 42, 35) : 0, roll: (t > HIT ? (t - HIT) * 150 : 0) + Math.sin((t - 6.2) * 1.8) * 8 };
  const b = burst(t, 6.95, 7.4, bf, [V(-4.2, 0.62, 0.32), V(-4.2, 0.62, -0.32)], brnoYak);
  const glows = [...b.gl, ...(t >= HIT - 0.07 && t < HIT + 0.33 ? [{ p: yp.clone().add(V(0.6, 0.3, 0)), s: 3 + (t - HIT) * 15, o: 1 - Math.max(0, t - HIT) / 0.33 }] : []), ...(t > HIT ? [{ p: yp.clone().add(V(0.9, 0.2, 0)), s: 1.3 + rnd(t * 30) * 0.5, o: 0.85 }] : [])];
  return { cam: { pos: V(10.5, 4.6, 5.4), look: V(-14, -2.6, -1.8), fov: 40 }, planes: [{ o: BF, p: bf, key: "bf" }, { o: YAK, key: "yk", p: { pos: [yp.x, yp.y, yp.z], ...yr, spin: t * 51 } }],
    tracers: b.tr, glows, puffs: t > HIT ? trail(t, HIT, (tt) => brnoYak(tt).add(V(1.2, 0, 0)), V(4.7, 0.9, 0), 0.73) : [],
    ground: { y: -380, scroll: t * 40 }, sky: { scroll: t * 420 }, shake: t >= 6.95 && t <= 7.6 ? 0.35 : 0,
    tags: [{ p: V(0, 0, 0), text: "HARTMANN", o: 1, dy: 170 }, { p: yp, text: "YAK-9", color: "#ff8a70", o: 1 - u(t, HIT + 0.3, HIT + 0.6) }] };
};
const Brno3D: React.FC<{ t: number }> = ({ t }) => {
  const f = brnoFrame(t); f.white = Math.max(f.white ?? 0, cutWhite(t, [6.2]));
  return (
    <div style={PANEL}>
      <Stage f={f} seed={Math.floor(t * 30)} />
      <Head kicker="BRNO · 8 MAY 1945" />
      <Illus />
      <Hud x={W - 380} y={36} title="ALTITUDE" value="3,700 m" sub="AMBUSHED FROM 12,000 FT" />
      <Caps t={t} lines={[{ t: "A Yak-9, ambushed from above", at: 5.0 }, { t: "His 352nd, and last, victory", at: 7.2, hi: true }]} />
    </div>
  );
};

// ======================================================================= adegan pendukung (bab 0 teaser, bab 4 pengganti kartu teks)
const stalkFrame = (t: number): Frame => {
  const u = t + 0.3;
  const L: Pose = { pos: [0, Math.sin(u * 1.1) * 0.25, 0], pitch: -1, roll: 4 + Math.sin(u * 0.9) * 3, spin: t * 57 };
  const Wg: Pose = { pos: [8, -1.2 + Math.sin(u * 1.0 + 1) * 0.25, 7.5], pitch: -1, roll: 6 + Math.sin(u * 0.8) * 3, spin: t * 55 };
  const yk = (x: number, y: number, z: number, i: number): PlaneS => ({ o: YAK, key: `y${i}`, p: { pos: [x + u * 1.2, y + Math.sin(u + i) * 0.3, z], yaw: 0, roll: Math.sin(u * 0.7 + i) * 3, spin: t * 50 + i } });
  return { cam: { pos: V(mix(15, 12, u / 9.5), 3.2, 21), look: V(-16, -4, -1), fov: 38 }, planes: [{ o: BF, p: L, key: "L" }, { o: BF, p: Wg, key: "W" }, yk(-62, -9, -5, 1), yk(-92, -8, 6, 2), yk(-108, -11, -13, 3)],
    sky: { scroll: u * 320 }, ground: { y: -380, scroll: u * 40 } };
};
const flybyFrame = (t: number): Frame => {
  const u = t - 22.4; const k = Easing.inOut(Easing.sin)(clamp01(u / 8));
  const x = mix(16, -16, k);
  return { cam: { pos: V(0, -1.5, 20), look: V(x * 0.45, 2.2, -2), fov: 34 }, planes: [{ o: BF, key: "p", p: { pos: [x, 2 + Math.sin(u * 0.9) * 0.6, -6], pitch: 1, roll: -10 + Math.sin(u * 0.8) * 6, spin: t * 57 } }], sky: { scroll: u * 150, lift: 80 } };
};
const closeupFrame = (t: number): Frame => {
  const u = t - 30.4; const th = D2R(mix(28, 82, clamp01(u / 8.8)));
  return { cam: { pos: V(-15 * Math.cos(th), 2.4, 15 * Math.sin(th)), look: V(-0.5, 0.2, 0), fov: 30 }, planes: [{ o: BF, key: "p", p: { pos: [0, 0, 0], pitch: 0, roll: 3 * Math.sin(u * 0.8), spin: t * 57 } }], sky: { scroll: u * 200, lift: 60 } };
};
const teaserFrame = (t: number): Frame => {
  const u = t - 5.8; const first = u < 3.6;
  const f = first ? brnoFrame(4.6 + u * (1.6 / 3.6)) : firstFrame(19.3 + (u - 3.6) * (2.0 / 3.5));
  f.tags = []; f.white = Math.max(f.white ?? 0, cutWhite(u, [3.6]));
  return f;
};
// ---- pengganti kartu siluet (bab 1, 3, 7, 8)
const hutParts = (u: number, impact: number): React.ReactNode => {
  const m = toonMat(0x9a8760), r = toonMat(0x6d5b3f), hull = new THREE.MeshBasicMaterial({ color: 0x15100c, side: THREE.BackSide });
  const parts: { s: [number, number, number]; p: [number, number, number]; m: THREE.Material; v: [number, number, number]; w: number }[] = [
    { s: [4, 0.2, 4], p: [0, -1.75, 0], m: r, v: [0, 0, 0], w: 0 }, // lantai
    { s: [0.2, 2.4, 4], p: [-2, -0.55, 0], m: m, v: [-2.2, 3.5, -1], w: 3 }, { s: [0.2, 2.4, 4], p: [2, -0.55, 0], m: m, v: [4.5, 4.5, 1], w: -4 },
    { s: [4, 2.4, 0.2], p: [0, -0.55, -2], m: m, v: [0.6, 2.8, -4], w: 2 }, { s: [4, 2.4, 0.2], p: [0, -0.55, 2], m: m, v: [1.2, 3.2, 4.5], w: -2 },
    { s: [4.6, 0.3, 4.6], p: [0, 0.8, 0], m: r, v: [-1, 6, 0.4], w: 4 },
  ];
  return parts.map((q, i) => {
    const a = Math.max(0, u - impact); const g = 9.8 * 1.2;
    const pos: [number, number, number] = [q.p[0] + q.v[0] * a * 1.6, Math.max(-1.75 + q.s[1] / 2, q.p[1] + q.v[1] * a - 0.5 * g * a * a), q.p[2] + q.v[2] * a];
    const rot = q.w * a * 1.5;
    return <mesh key={i} position={pos} rotation={[rot * 0.3, rot * 0.2, rot]} material={q.m}><boxGeometry args={q.s} /><mesh scale={1.03} material={hull}><boxGeometry args={q.s} /></mesh></mesh>;
  });
};
const alfredFrame = (t: number): Frame => {
  const u = t - 34.8; const k = Easing.inOut(Easing.sin)(clamp01(u / 9.2));
  return { cam: { pos: V(0, 0, 21), look: V(mix(6, -6, k) * 0.5, 0.4, 0), fov: 34 }, planes: [{ o: JU87, key: "j", p: { pos: [mix(15, -15, k), Math.sin(u * 0.7) * 0.5, 0], pitch: -4, roll: 8 + Math.sin(u * 0.6) * 3, spin: t * 52 } }],
    ground: { y: -80, scroll: u * 12, tint: 0xe2c68c }, sky: { scroll: u * 120, lift: 120, tone: "late" } };
};
const ferryFrame = (t: number): Frame => {
  const u = t - 5.2; const touch = 2.6, hit = 7.0;
  const gy = -1.75;
  const px = u < touch ? mix(28, 8, u / touch) : u < hit ? mix(8, -9.2, (u - touch) / (hit - touch)) : mix(-9.2, -12.6, 1 - Math.pow(1 - clamp01((u - hit) / 1.8), 2));
  const py = u < touch ? mix(6.2, 0, Easing.in(Easing.quad)(u / touch)) : 0;
  const bounce = u > touch && u < touch + 0.5 ? Math.sin(((u - touch) / 0.5) * Math.PI) * 0.25 : 0;
  const pitch = u < touch ? mix(-3, 6, u / touch) : u < hit ? 3 : mix(3, -4, clamp01((u - hit) / 0.6));
  const dust = u > touch ? trail(u, touch, (tt) => V(tt < hit ? mix(8, -9.2, (tt - touch) / (hit - touch)) + 3 : -10, gy + 0.2, 0.6), V(2.2, 0.9, 1.5), 1.1, 1 / 22, 0.5, 2.0).map((q) => ({ ...q, tint: "dust" as const })) : [];
  const boom = u > hit ? Array.from({ length: 10 }, (_, i) => { const a = u - hit; if (a > 1.8) return null; return { p: V(-12 + (rnd(i) - 0.5) * 4 + a * (rnd(i + 4) - 0.5) * 6, gy + 0.6 + a * 3 * rnd(i + 9), (rnd(i + 2) - 0.5) * 4), s: 0.9 + a * 2.4, o: Math.max(0, 0.95 - a / 1.8), dark: 0.2, tint: "dust" as const }; }).filter(Boolean) as { p: V3; s: number; o: number; dark: number; tint: "dust" }[] : [];
  return { cam: { pos: V(-4, 0.6, 22), look: V(-4, 0, 0), fov: 36 }, shake: u > hit && u < hit + 0.5 ? 0.45 : 0,
    planes: [{ o: JU87, key: "j", p: { pos: [px, py + bounce + gy + 1.75, 0], pitch, roll: 0, spin: u < touch ? t * 52 : t * 30 } }],
    ground: { y: gy, scroll: 0, rep: 260 }, sky: { scroll: u * 8, lift: 40 }, puffs: [...dust, ...boom], extras: <group position={[-12, 0, 0]}>{hutParts(u, hit)}</group> };
};
const mustangFrame = (t: number): Frame => {
  const u = t - 5.5; const k = Easing.inOut(Easing.sin)(clamp01((u + 1.6) / 7.6));
  const mk = (dx: number, dy: number, dz: number, key: string, roll: number): PlaneS => ({ o: P51, key, p: { pos: [mix(46, -46, k) + dx, 2 + dy, dz], pitch: 1, roll, spin: t * 58 } });
  return { cam: { pos: V(0, -0.5, 26), look: V(mix(14, -14, k) * 0.4, 2, 0), fov: 32 }, planes: [mk(0, 0, 0, "a", -8), mk(14, -1.2, -4, "b", -5)],
    ground: { y: -260, scroll: u * 30 }, sky: { scroll: u * 70, lift: 60 } };
};
const staysFrame = (t: number): Frame => {
  const u = t - 37.9; const k = clamp01(u / 8.3);
  const row: PlaneS[] = [0, 1, 2].map((i) => ({ o: BFG, key: `b${i}`, p: { pos: [i * 2.5, -0.75, -i * 10], yaw: 8 - i * 3, pitch: 0, roll: 0, spin: t * 22 + i } }));
  return { cam: { pos: V(mix(15, 9, k), mix(1.6, 1.2, k), mix(15, 12, k)), look: V(-2, 0.2, -8), fov: 38 }, planes: row,
    ground: { y: -2.0, scroll: 0, rep: 200, tint: 0xdfe7c4 }, sky: { scroll: u * 6, lift: 30, tone: "late" } };
};
const EXTRA_FRAMES = { alfred: alfredFrame, ferry: ferryFrame, mustang: mustangFrame, stays: staysFrame, teaser: teaserFrame, stalk: stalkFrame, flyby: flybyFrame, closeup: closeupFrame } as const;

// Jendela tampil kartu (detik VO, dari shots di spec.ts). Di luar jendela ±1,6 s kartu tidak terlihat -> tidak render 3D.
import WINDOWS from "./scene-windows.json";
export const WIN = WINDOWS; // sumber tunggal: src/longform/scene-windows.json (dipakai juga scripts/render-scenes.sh)
export const SCENE_PAD = 1.6;
export const SceneCard3D: React.FC<{ id: keyof typeof WIN; t: number }> = ({ id, t }) => {
  const [a, b] = WIN[id];
  if (id === "teaser" || id === "stalk" || id === "flyby" || id === "closeup" || id === "alfred" || id === "ferry" || id === "mustang" || id === "stays") {
    if (t < a - SCENE_PAD || t > b + SCENE_PAD) return <div style={{ ...PANEL, background: "linear-gradient(180deg, #5b8fc2 0%, #a6c8e2 55%, #e9f0f2 100%)" }} />;
    return <div style={PANEL}><Stage f={EXTRA_FRAMES[id](t)} seed={Math.floor(t * 30)} /><Illus /></div>;
  }
  if (t < a - 1.6 || t > b + 1.6) return <div style={{ ...PANEL, background: "linear-gradient(180deg, #5b8fc2 0%, #a6c8e2 55%, #e9f0f2 100%)" }} />;
  return id === "first" ? <First3D t={t} /> : id === "ambush" ? <Ambush3D t={t} /> : id === "goebel" ? <Goebel3D t={t} /> : <Brno3D t={t} />;
};

// Durasi klip pra-render per adegan (detik). Goebel berlangsung sampai akhir bab c07.
const c07 = timing.chapters.find((c) => c.id === "c07")!;
export const CLIP_SEC: Record<keyof typeof WIN, number> = {
  first: WIN.first[1] - WIN.first[0] + 2 * SCENE_PAD, ambush: WIN.ambush[1] - WIN.ambush[0] + 2 * SCENE_PAD,
  goebel: (c07.frames - timing.pre) / 30 - (WIN.goebel[0] - SCENE_PAD), brno: WIN.brno[1] - WIN.brno[0] + 2 * SCENE_PAD,
  teaser: WIN.teaser[1] - WIN.teaser[0] + 2 * SCENE_PAD, stalk: WIN.stalk[1] - WIN.stalk[0] + 2 * SCENE_PAD,
  flyby: WIN.flyby[1] - WIN.flyby[0] + 2 * SCENE_PAD, closeup: WIN.closeup[1] - WIN.closeup[0] + 2 * SCENE_PAD,
  alfred: WIN.alfred[1] - WIN.alfred[0] + 2 * SCENE_PAD, ferry: WIN.ferry[1] - WIN.ferry[0] + 2 * SCENE_PAD,
  mustang: WIN.mustang[1] - WIN.mustang[0] + 2 * SCENE_PAD, stays: WIN.stays[1] - WIN.stays[0] + 2 * SCENE_PAD,
};
// Di long-form: putar klip public/scenes/<id>.mp4 (dibuat scripts/render-scenes.sh) selaras waktu VO.
export const SceneVideo: React.FC<{ id: keyof typeof WIN; kicker?: string; lines?: Line[]; t?: number }> = ({ id, kicker, lines, t = 0 }) => {
  const from = Math.round(timing.pre + (WIN[id][0] - SCENE_PAD) * 30);
  return (
    <div style={{ ...PANEL, filter: undefined, background: "linear-gradient(180deg, #5b8fc2 0%, #a6c8e2 55%, #e9f0f2 100%)" }}>
      <Sequence from={from} durationInFrames={Math.ceil(CLIP_SEC[id] * 30)} layout="none">
        <OffthreadVideo src={staticFile(`scenes/${id}.mp4`)} muted style={{ position: "absolute", inset: 0, width: W, height: H }} />
      </Sequence>
      {(kicker || lines) && <><Head kicker={kicker} /><Caps t={t} lines={lines} /></>}
    </div>
  );
};
