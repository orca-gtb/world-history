import React from "react";
import { AbsoluteFill, Easing, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import ops from "./ops-bobruisk.json";
import base from "./basemap-bobruisk.json";

// PROTOTYPE pilot v2 (33 dtk): peta 25→26 Jun → kantong 27 Jun + serangan udara → dorong ke arah terobosan → still retreat (Angie) → peta 28-29 Jun.
export const FPS = 30;
export const PROTO2_TOTAL = 33 * FPS;
const W = 1920, H = 1080;
const LAT0 = 53.1, LON0 = 29.45, KX = Math.cos((LAT0 * Math.PI) / 180), S = 1080 / 1.1;
type P = [number, number];
const pj = ([lon, lat]: number[]): P => [W / 2 + (lon - LON0) * KX * S, H / 2 - (lat - LAT0) * S];
const bz = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const cl = (t: number, a: number, d: number) => clamp01((t - a) / d);
const rv = (t: number, a: number, d = 0.5) => bz(cl(t, a, d));
const path = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
const smooth = (pts: P[], closed = false) => {
  const n = pts.length; if (n < 3) return path(pts);
  const g = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + "Z" : d;
};
const len = (pts: P[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const along = (pts: P[], u: number): P => {
  const L = len(pts) * clamp01(u); let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + s >= L) { const k = (L - acc) / (s || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; }
    acc += s;
  }
  return pts[pts.length - 1];
};
const FE = ops.features as Record<string, number[][]>;
const fp = (k: string) => FE[k].map(pj);
const TW = ops.towns as Record<string, number[]>;
const LB = ops.labels_ref as Record<string, number[]>;
const L = (k: string) => pj(LB[k]);
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
const RED = "#c8261c", RED_FILL = "#f3d3cb", DE = "#2a3038", DE_FILL = "#d6d6cf";

// ---------- jadwal (detik) — juga dipakai scripts/mix_proto.py ----------
export const PT = { d26: 1.2, map27: 5.6, ring: 6.0, toStill: 12.4, still: 13.6, back: 25.6, map28: 26.6, fall: 29.6, end: 31.8 };
export const AIR = [7.6, 8.5, 9.1, 10.2, 11.0]; // kilatan serangan udara
const pc = (() => { const p = fp("pocket_27jun"); return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length] as P; })();
const parichi = pj(TW["Parichi"]), rog = pj(TW["Rogachev"]);
const marsh: P = off(parichi, -60, 40);

type Unit = { id: string; side: "SU" | "DE"; ech: string; type: "inf" | "pz" | "cavmech"; name: string; cmd?: string; path: P[]; t0: number; t1: number; u1?: number; trapped?: boolean; t2?: number; path2?: P[] };
const UNITS: Unit[] = [
  { id: "3A", side: "SU", ech: "XXXX", type: "inf", name: "3rd ARMY", cmd: "GORBATOV", path: [L("SU 3 A"), ...fp("arrow_3A").slice(1, -1), off(fp("arrow_3A").slice(-1)[0], 70, -70)], t0: 1.4, t1: 5.2, u1: 0.55 },
  { id: "48A", side: "SU", ech: "XXXX", type: "inf", name: "48th ARMY", path: [L("SU 48 A"), fp("arrow_48A")[1], off(fp("arrow_48A")[2], 150, 70)], t0: 1.4, t1: 5.2, u1: 0.6 },
  { id: "65A", side: "SU", ech: "XXXX", type: "inf", name: "65th ARMY", cmd: "BATOV", path: [...fp("arrow_65A").slice(0, -1), off(fp("arrow_65A").slice(-1)[0], -200, 30)], t0: 0.6, t1: 5.2, u1: 0.45 },
  { id: "28A", side: "SU", ech: "XXXX", type: "inf", name: "28th ARMY", path: [L("SU 28 A"), ...fp("arrow_28A").slice(1)], t0: 1.0, t1: 5.0, u1: 0.8 },
  { id: "35AK", side: "DE", ech: "XXX", type: "inf", name: "XXXV CORPS", path: [L("DE XXXV AK"), off(L("DE XXXV AK"), -10, -40)], t0: 1.5, t1: 5 },
  { id: "20PZ", side: "DE", ech: "XX", type: "pz", name: "20th PANZER", path: [L("DE 20 PzD"), off(L("DE 20 PzD"), 20, 90)], t0: 0.8, t1: 4.8 },
  { id: "296", side: "DE", ech: "XX", type: "inf", name: "296 ID", path: [off(L("DE 296 ID"), 0, 25), off(L("DE 296 ID"), -50, 10)], t0: 1.8, t1: 5.2 },
  { id: "6ID", side: "DE", ech: "XX", type: "inf", name: "6 ID", path: [L("DE 6 ID"), off(L("DE 6 ID"), -70, -50)], t0: 1.8, t1: 5.2 },
  { id: "45ID", side: "DE", ech: "XX", type: "inf", name: "45 ID (part)", path: [off(L("DE 45 ID (part, N)"), 0, -30), off(L("DE 45 ID (part, N)"), -40, -20)], t0: 1.8, t1: 5.2 },
  { id: "134", side: "DE", ech: "XX", type: "inf", name: "134 ID", path: [L("DE 134 ID"), off(L("DE 134 ID"), -40, -60)], t0: 1.6, t1: 5.2 },
];
// posisi 27 Jun (bagian kedua, kontinu dari posisi akhir fase pertama)
const P27: Record<string, P> = {
  "3A": off(fp("arrow_3A").slice(-1)[0], 70, -70), "48A": off(fp("arrow_48A")[2], 150, 70), "65A": off(fp("arrow_65A").slice(-1)[0], -200, 30), "28A": fp("arrow_28A").slice(-1)[0],
  "35AK": off(pc, -70, -50), "20PZ": off(pc, 18, 42), "296": off(pc, 25, -62), "6ID": off(pc, -62, 35), "45ID": off(pc, 75, -5), "134": off(L("DE 134 ID"), -60, -110),
};
const TRAPPED = new Set(["35AK", "20PZ", "296", "6ID", "45ID"]);
const unitPos = (u: Unit, t: number): P => {
  const a = along(u.path, io(cl(t, u.t0, u.t1 - u.t0)) * (u.u1 ?? 1));
  const b = P27[u.id];
  const k = io(cl(t, PT.map27 - 0.2, 2.4));
  const q: P = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  // 28 Jun: 20th Panzer memimpin terobosan ke barat laut (V: Wikipedia + peta ref 2); sisanya tertinggal
  if (u.id === "20PZ" || u.id === "35AK") { const m = io(cl(t, PT.map28 + (u.id === "20PZ" ? 0.3 : 0.9), 3.0)); const br = fp("breakout"); const e = along(br, m * (u.id === "20PZ" ? 0.95 : 0.7)); return m > 0 ? [q[0] + (e[0] - q[0]) * Math.min(1, m * 3), q[1] + (e[1] - q[1]) * Math.min(1, m * 3)] : q; }
  return q;
};

const Counter: React.FC<{ u: Unit; t: number; k: number }> = ({ u, t, k }) => {
  const p = unitPos(u, t); const su = u.side === "SU";
  const trapped = TRAPPED.has(u.id) && t > PT.ring + 1.0;
  const w = 92 / k, h = 60 / k, sw = 3 / k, stroke = su ? RED : DE;
  const hit = AIR.some((a) => t > a && t < a + 0.25) && trapped ? 1 : 0;
  const left = TRAPPED.has(u.id) && u.id !== "20PZ" && u.id !== "35AK" ? 1 - 0.7 * cl(t, PT.fall + 0.3, 1.2) : 1;
  return (
    <g transform={`translate(${p[0] + hit * 3},${p[1]})`} opacity={left}>
      <rect x={-w / 2 + 4 / k} y={-h / 2 + 5 / k} width={w} height={h} fill="rgba(0,0,0,0.25)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={su ? RED_FILL : DE_FILL} stroke={stroke} strokeWidth={sw} />
      {trapped && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#trap)" opacity={cl(t, PT.ring + 1, 0.6)} />}
      {u.type === "inf" && <path d={`M${-w / 2},${-h / 2}L${w / 2},${h / 2}M${w / 2},${-h / 2}L${-w / 2},${h / 2}`} stroke={stroke} strokeWidth={sw} />}
      {u.type !== "inf" && <ellipse cx={0} cy={0} rx={w * 0.3} ry={h * 0.22} fill="none" stroke={stroke} strokeWidth={sw} />}
      <text x={0} y={-h / 2 - 6 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={20 / k} fill={stroke}>{u.ech}</text>
      <text x={0} y={h / 2 + 24 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={22 / k} fill={su ? "#7a1610" : "#1d2228"} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{u.name}</text>
      {u.cmd && <text x={0} y={h / 2 + 46 / k} textAnchor="middle" fontFamily={F.type} fontSize={17 / k} fill="#7a1610" stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{u.cmd}</text>}
    </g>
  );
};

const Arrow: React.FC<{ pts: P[]; a: number; b: number; t: number; k: number; upto?: number }> = ({ pts, a, b, t, k, upto = 1 }) => {
  const u = io(cl(t, a, b - a)) * upto;
  if (u <= 0.001) return null;
  const Lt = len(pts), tip = along(pts, u), pre = along(pts, Math.max(0, u - 8 / Lt));
  const g = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]), hw = 26 / k, hl = 34 / k;
  const head = [[tip[0] + Math.cos(g) * hl * 0.5, tip[1] + Math.sin(g) * hl * 0.5], [tip[0] - Math.cos(g) * hl * 0.6 - Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 + Math.cos(g) * hw], [tip[0] - Math.cos(g) * hl * 0.6 + Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 - Math.cos(g) * hw]];
  const d = smooth(pts);
  return (
    <g opacity={0.92}>
      <path d={d} fill="none" stroke="rgba(60,8,4,0.55)" strokeWidth={20 / k} strokeLinecap="round" strokeDasharray={`${Lt * u} ${Lt * 2}`} />
      <path d={d} fill="none" stroke={RED} strokeWidth={14 / k} strokeLinecap="round" strokeDasharray={`${Lt * u} ${Lt * 2}`} />
      <path d={`M${head.map((h) => h.join(",")).join("L")}Z`} fill={RED} />
    </g>
  );
};

// ---------- STILL: rekonstruksi AI (Angie v1, digrading ke palet peta) ----------
const Still: React.FC<{ t: number }> = ({ t }) => {
  const drift = (t - PT.still) * 5; // geser lateral pelan, skala tetap
  return (
    <AbsoluteFill style={{ background: "#2a2722" }}>
      <Img src={staticFile("stills/retreat.jpg")} style={{ position: "absolute", width: 2016, height: 1134, left: -48 - drift + 30, top: -27 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(12,16,20,0.55) 0%, rgba(12,16,20,0) 30%)" }} />
      <div style={{ position: "absolute", left: 60, top: 54, opacity: rv(t, PT.still + 0.8) }}>
        <div style={{ fontFamily: F.type, fontSize: 24, letterSpacing: 6, color: C.gold, textShadow: "0 2px 8px #000" }}>28 JUNE 1944 · WEST OF BOBRUISK</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 58, color: C.chalk, textShadow: "0 3px 14px rgba(0,0,0,0.85)", marginTop: 6 }}>The trapped divisions try to break out.</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 40, color: "#e8e1cf", textShadow: "0 2px 10px rgba(0,0,0,0.85)", marginTop: 6, opacity: rv(t, PT.still + 6.0) }}>Only part of them get through.</div>
      </div>
      <div style={{ position: "absolute", right: 40, bottom: 34, padding: "8px 14px", background: "rgba(14,20,26,0.75)", fontFamily: F.type, fontSize: 18, letterSpacing: 3, color: "#e8e1cf" }}>AI RECONSTRUCTION</div>
    </AbsoluteFill>
  );
};

const BreakArrow: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const pts = fp("breakout"); const u = io(cl(t, PT.map28 + 0.2, 2.8)); if (u <= 0.001) return null;
  const Lt = len(pts), tip = along(pts, u), pre = along(pts, Math.max(0, u - 8 / Lt)); const g = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]); const hw = 22 / k, hl = 30 / k;
  const head = [[tip[0] + Math.cos(g) * hl * 0.5, tip[1] + Math.sin(g) * hl * 0.5], [tip[0] - Math.cos(g) * hl * 0.6 - Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 + Math.cos(g) * hw], [tip[0] - Math.cos(g) * hl * 0.6 + Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 - Math.cos(g) * hw]];
  return (<g opacity={0.95}>
    <path d={smooth(pts)} fill="none" stroke={DE} strokeWidth={12 / k} strokeLinecap="round" strokeDasharray={`${Lt * u} ${Lt * 2}`} />
    <path d={`M${head.map((h) => h.join(",")).join("L")}Z`} fill={DE} />
  </g>);
};

export const ProtoV2: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  // kamera: A) sektor → E) kantong → B) dorong ke arah terobosan (transisi) → still → F) ikhtisar 28-29 Jun
  const camA = { z: 1.15, c: off(pj(TW["Bobruisk"]), 80, 120) as P };
  const camE = { z: 1.75, c: pc };
  const brk = fp("breakout"); const camB = { z: 2.6, c: along(brk, 0.35) };
  const camF = { z: 1.3, c: [(pc[0] + brk[brk.length - 1][0]) / 2, (pc[1] + brk[brk.length - 1][1]) / 2] as P };
  const seg = (a: { z: number; c: P }, b: { z: number; c: P }, u: number) => ({ z: a.z + (b.z - a.z) * u, c: [a.c[0] + (b.c[0] - a.c[0]) * u, a.c[1] + (b.c[1] - a.c[1]) * u] as P });
  let cam = seg(camA, camE, io(cl(t, PT.map27 - 0.4, 1.8)));
  if (t >= PT.toStill) cam = seg(camE, camB, io(cl(t, PT.toStill, 1.4)));
  if (t >= PT.back) cam = seg({ z: 2.6, c: camB.c }, camF, io(cl(t, PT.back, 1.8)));
  const z = cam.z, cx = cam.c[0], cy = cam.c[1];
  const k = Math.max(1, z * 0.82);
  const start = fp("start_24jun");
  const sov = [...start, pj([31.6, 51.8]), pj([31.6, 54.2])];
  const r26S = io(cl(t, PT.d26, 4.0)) * 900, r26N = io(cl(t, PT.d26 + 1.0, 3.6)) * 600;
  const p26 = fp("pocket_26jun"), p27 = fp("pocket_27jun");
  const o26 = cl(t, 3.0, 0.8) * (1 - cl(t, PT.ring, 0.6));
  const ring = io(cl(t, PT.ring, 1.4));
  const stillO = cl(t, PT.still - 0.6, 0.8) * (1 - cl(t, PT.back, 0.9));
  const date = t < PT.d26 ? "25 JUNE 1944 · 21:00" : t < PT.map27 ? "26 JUNE 1944 · 21:00" : t < PT.map28 ? "27 JUNE 1944 · 21:00" : t < PT.fall ? "28 JUNE 1944" : "29 JUNE 1944";
  const fadeOut = 1 - cl(t, PT.end, 1.0);
  return (
    <AbsoluteFill style={{ background: "#0c1014" }}>
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <svg width={W} height={H} style={{ position: "absolute" }}>
          <defs>
            <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)"><path d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,64 L28,97" fill="none" stroke="rgba(60,50,20,0.10)" strokeWidth="1.5" /></pattern>
            <pattern id="trap" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="rgba(200,38,28,0.45)" /></pattern>
            <radialGradient id="land" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#cfc79c" /><stop offset="100%" stopColor="#a89f72" /></radialGradient>
            <clipPath id="c26S"><circle cx={parichi[0]} cy={parichi[1]} r={r26S} /></clipPath>
            <clipPath id="c26N"><circle cx={rog[0]} cy={rog[1] - 60} r={r26N} /></clipPath>
          </defs>
          <g transform={`translate(${W / 2},${H / 2}) scale(${z}) translate(${-cx},${-cy})`}>
            <rect x={-2000} y={-2000} width={6000} height={5000} fill="url(#land)" />
            <rect x={-2000} y={-2000} width={6000} height={5000} fill="url(#hex)" />
            {/* wilayah Soviet: satu grup, transparansi sekali (tanpa tumpuk) */}
            <g opacity={0.17}>
              <path d={path(sov) + "Z"} fill={RED} />
              <path d={smooth(fp("zone_25N"), true)} fill={RED} />
              <path d={smooth(fp("zone_25S"), true)} fill={RED} />
              <path d={smooth(fp("zone_26S"), true)} fill={RED} clipPath="url(#c26S)" />
              <path d={smooth(fp("zone_26N"), true)} fill={RED} clipPath="url(#c26N)" />
            </g>
            {base.rivers.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke="#4f7fae" strokeWidth={(r.name === "Byarezina" || r.name === "Dnipro" ? 4 : 2.4) / k} strokeLinejoin="round" opacity={0.9} />)}
            <text x={pj([29.02, 53.42])[0]} y={pj([29.02, 53.42])[1]} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={26 / k} fill="#3a6a99">Berezina</text>
            {/* rawa: arsir tipis di selatan Bobruisk (penanda medan, posisi umum) */}
            <ellipse cx={marsh[0]} cy={marsh[1]} rx={170} ry={90} fill="rgba(70,110,90,0.18)" stroke="rgba(70,110,90,0.35)" strokeDasharray="6 8" />
            <text x={marsh[0] - 70} y={marsh[1] + 110} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={20 / k} fill="#3f6b55">marshes</text>
            {Object.entries(TW).map(([n, ll]) => { const [x, y] = pj(ll); const big = n === "Bobruisk"; return (
              <g key={n}><rect x={x - (big ? 9 : 6) / k} y={y - (big ? 9 : 6) / k} width={(big ? 18 : 12) / k} height={(big ? 18 : 12) / k} fill="#2a2418" />
                <text x={x + 12 / k} y={y - 10 / k} fontFamily={F.ui} fontWeight={700} fontSize={(big ? 36 : 24) / k} fill="#2a2418" stroke="rgba(239,232,205,0.9)" strokeWidth={5 / k} paintOrder="stroke">{n}</text></g>); })}
            <path d={smooth(start)} fill="none" stroke={RED} strokeWidth={5 / k} opacity={0.55} strokeDasharray={`${16 / k} ${8 / k}`} />
            <path d={smooth(p26, true)} fill="rgba(42,48,56,0.10)" stroke={DE} strokeWidth={4 / k} strokeDasharray={`${14 / k} ${8 / k}`} opacity={o26} />
            {/* kantong 27 Jun: cincin digambar, isi abu */}
            <g opacity={cl(t, PT.ring, 0.3)}>
              <path d={smooth(p27, true)} fill={`rgba(42,48,56,${0.3 * ring * (1 - cl(t, PT.fall, 1.2))})`} stroke={DE} strokeWidth={4 / k} />
              <path d={smooth(p27, true)} fill="rgba(200,38,28,0.22)" opacity={cl(t, PT.fall, 1.2)} />
              <path d={smooth(p27, true)} fill="none" stroke={RED} strokeWidth={7 / k} strokeLinecap="round" strokeDasharray={`${3 / k} ${9 / k}`} pathLength={1000} style={{ strokeDashoffset: 0 }} transform={`translate(${pc[0]},${pc[1]}) scale(1.12) translate(${-pc[0]},${-pc[1]})`} opacity={ring} />
            </g>
            {/* panah fase 26 Jun (sebagian, berlanjut di 27 Jun) */}
            <Arrow pts={fp("arrow_65A")} a={0.6} b={PT.ring + 0.8} t={t} k={k} upto={t < PT.map27 ? 0.55 : 1} />
            <Arrow pts={fp("arrow_28A")} a={1.0} b={5.0} t={t} k={k} />
            <Arrow pts={fp("arrow_48A")} a={1.4} b={PT.ring} t={t} k={k} />
            <Arrow pts={fp("arrow_3A")} a={1.4} b={PT.ring} t={t} k={k} />
            {/* terobosan Jerman 28 Jun (panah gelap putus-putus) */}
            <BreakArrow t={t} k={k} />
            {/* serangan udara di kantong */}
            {AIR.map((a, i) => { const q = cl(t, a, 0.9); if (q <= 0 || q >= 1) return null; const p = off(pc, (random(`ax${i}`) - 0.5) * 130, (random(`ay${i}`) - 0.5) * 80); return (
              <g key={i}><circle cx={p[0]} cy={p[1]} r={(10 + 40 * q) / k * 1.4} fill="none" stroke="#ffd27a" strokeWidth={4 / k} opacity={1 - q} /><circle cx={p[0]} cy={p[1]} r={(14 * (1 - q)) / k * 1.4} fill="#fff1c4" opacity={1 - q} /></g>); })}
            {UNITS.map((u) => <Counter key={u.id} u={u} t={t} k={k} />)}
          </g>
        </svg>
        {/* HUD peta */}
        <div style={{ position: "absolute", left: 48, top: 40, padding: "18px 26px", background: "rgba(14,20,26,0.82)", borderLeft: `6px solid ${C.gold}`, opacity: 1 - stillO }}>
          <div style={{ fontFamily: F.type, fontSize: 22, letterSpacing: 6, color: C.gold }}>OPERATION BAGRATION · BOBRUISK</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 52, color: C.chalk, marginTop: 4 }}>{date}</div>
        </div>
        {([[0.6, 5.2, "26 JUNE", "In the south, 65th and 28th Armies push through the marshes."], [PT.ring + 0.6, PT.toStill - 0.2, "27 JUNE", "XXXV Corps is trapped east of the Berezina, under constant air attack."], [PT.map28 + 0.8, PT.fall - 0.1, "28 JUNE", "Led by the remnants of 20th Panzer, part of the trapped force breaks out to the north-west."], [PT.fall + 0.2, PT.end + 0.9, "29 JUNE", "Bobruisk falls to 65th Army."]] as [number, number, string, string][]).map(([a, b, kick, txt]) => { const o = cl(t, a, 0.3) * (1 - cl(t, b - 0.3, 0.3)); if (o <= 0) return null; return (
          <div key={a} style={{ position: "absolute", left: 48, bottom: 70, maxWidth: 860, padding: "18px 26px", background: "rgba(14,20,26,0.86)", opacity: o * (1 - stillO) }}>
            <div style={{ fontFamily: F.type, fontSize: 20, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>
            <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 40, lineHeight: 1.1, color: C.chalk, marginTop: 6 }}>{txt}</div>
          </div>); })}
        {/* still */}
        {stillO > 0 && <AbsoluteFill style={{ opacity: stillO }}><Still t={t} /></AbsoluteFill>}
      </AbsoluteFill>
      <Vignette amount={0.45} />
      <FilmGrain strength={0.16} />
    </AbsoluteFill>
  );
};
