import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import ops from "./ops-bobruisk.json";
import base from "./basemap-bobruisk.json";

// Potongan tes format B: peta operasional + kotak unit NATO, Bobruisk 24-27 Juni 1944.
// Garis/panah = jiplakan perkiraan dari peta referensi (lihat research/bobruisk). Tanpa VO.
export const FPS = 30;
export const TEST_TOTAL = 32 * FPS;
const W = 1920, H = 1080;
const LAT0 = 53.1, LON0 = 29.45, KX = Math.cos((LAT0 * Math.PI) / 180), S = 1080 / 1.1;
type P = [number, number];
const pj = ([lon, lat]: number[]): P => [W / 2 + (lon - LON0) * KX * S, H / 2 - (lat - LAT0) * S];
const bz = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const rv = (t: number, a: number, d = 0.5) => bz(clamp01((t - a) / d));
const path = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
const smooth = (pts: P[], closed = false) => {
  // Catmull-Rom -> Bezier
  const n = pts.length; if (n < 3) return path(pts);
  const g = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
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

const RED = "#c8261c", RED_FILL = "#f3d3cb", DE = "#2a3038", DE_FILL = "#d6d6cf";

// ---------- jadwal (detik) ----------
const T = { mapIn: 0, title: 0.4, start: 3.0, units: 4.2, d25: 7.0, d26: 13.0, d27: 19.0, zoom: 19.5, fall: 26.0 };
const DATES: [number, string][] = [[0, "24 JUNE 1944 · 04:00"], [T.d25, "25 JUNE 1944 · 21:00"], [T.d26, "26 JUNE 1944 · 21:00"], [T.d27, "27 JUNE 1944 · 21:00"], [T.fall, "29 JUNE 1944"]];
const POPS: [number, number, string, string][] = [
  [3.4, 6.8, "24 JUNE", "The 1st Belorussian Front attacks the German Ninth Army."],
  [7.2, 10.0, "NORTH", "3rd Army breaks through near Rogachev."],
  [10.2, 12.9, "SOUTH", "65th Army crosses the marshes below Bobruisk."],
  [13.3, 18.8, "26 JUNE", "Pliyev's cavalry-mechanised group drives west, cutting the roads."],
  [20.5, 25.8, "27 JUNE", "XXXV Corps and 20th Panzer are trapped east of the Berezina."],
  [26.3, 31.8, "29 JUNE", "Bobruisk falls to 65th Army."],
];

// ---------- unit ----------
type Unit = { id: string; side: "SU" | "DE"; ech: string; type: "inf" | "pz" | "cavmech"; name: string; cmd?: string; path: P[]; t0: number; t1: number; trapped?: boolean };
const pc = (() => { const p = fp("pocket_27jun"); return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length] as P; })();
const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
const L = (k: string) => pj(LB[k]);
const UNITS: Unit[] = [
  // Soviet armies (komandan hanya yang bersumber)
  { id: "3A", side: "SU", ech: "XXXX", type: "inf", name: "3rd ARMY", cmd: "GORBATOV", path: [L("SU 3 A"), ...fp("arrow_3A").slice(1, -1), off(fp("arrow_3A").slice(-1)[0], 70, -70)], t0: T.d25, t1: T.d26 + 2 },
  { id: "48A", side: "SU", ech: "XXXX", type: "inf", name: "48th ARMY", path: [L("SU 48 A"), off(fp("arrow_48A")[1], 0, 0), off(fp("arrow_48A")[2], 150, 70)], t0: T.d25 + 0.6, t1: T.d27 },
  { id: "65A", side: "SU", ech: "XXXX", type: "inf", name: "65th ARMY", cmd: "BATOV", path: [...fp("arrow_65A").slice(0, -1), off(fp("arrow_65A").slice(-1)[0], -150, -40)], t0: T.d25 + 2.5, t1: T.d27 + 1 },
  { id: "28A", side: "SU", ech: "XXXX", type: "inf", name: "28th ARMY", path: [L("SU 28 A"), ...fp("arrow_28A").slice(1)], t0: T.d25 + 3, t1: T.d26 + 4 },
  { id: "KMG", side: "SU", ech: "", type: "cavmech", name: "PLIYEV GROUP", cmd: "PLIYEV", path: fp("arrow_KMG"), t0: T.d26, t1: T.d27 },
  // German (posisi awal dari label peta referensi)
  { id: "35AK", side: "DE", ech: "XXX", type: "inf", name: "XXXV CORPS", path: [L("DE XXXV AK"), off(pc, -70, -50)], t0: T.d26, t1: T.d27 + 0.5, trapped: true },
  { id: "20PZ", side: "DE", ech: "XX", type: "pz", name: "20th PANZER", path: [L("DE 20 PzD"), off(L("DE 20 PzD"), 30, -60), off(pc, 18, 42)], t0: T.d25 + 0.3, t1: T.d27, trapped: true },
  { id: "296", side: "DE", ech: "XX", type: "inf", name: "296 ID", path: [off(L("DE 296 ID"), 0, 25), off(pc, 25, -62)], t0: T.d25 + 1, t1: T.d27, trapped: true },
  { id: "6ID", side: "DE", ech: "XX", type: "inf", name: "6 ID", path: [L("DE 6 ID"), off(pc, -62, 35)], t0: T.d25 + 1.5, t1: T.d27, trapped: true },
  { id: "45ID", side: "DE", ech: "XX", type: "inf", name: "45 ID (part)", path: [off(L("DE 45 ID (part, N)"), 0, -30), off(pc, 75, -5)], t0: T.d25 + 2, t1: T.d27, trapped: true },
  { id: "134", side: "DE", ech: "XX", type: "inf", name: "134 ID", path: [L("DE 134 ID"), pj(TW["Klichev"]).map((v, i) => v + (i ? 40 : 60)) as P], t0: T.d25 + 0.5, t1: T.d26 + 3 },
];

const Counter: React.FC<{ u: Unit; t: number; k: number }> = ({ u, t, k }) => {
  const appear = rv(t, T.units + (u.side === "DE" ? 0 : 0.6) + (UNITS.indexOf(u) % 5) * 0.12, 0.45);
  if (appear <= 0) return null;
  const p = along(u.path, io(clamp01((t - u.t0) / (u.t1 - u.t0))));
  const su = u.side === "SU";
  const trapped = u.trapped && t > T.d27 + 0.6;
  const gone = u.trapped ? 1 - 0.7 * clamp01((t - T.fall - 0.4) / 1.2) : 1;
  const w = 92 / k, h = 60 / k, sw = 3 / k;
  const fill = su ? RED_FILL : DE_FILL, stroke = su ? RED : DE;
  return (
    <g transform={`translate(${p[0]},${p[1]}) scale(${0.6 + 0.4 * appear})`} opacity={appear * gone}>
      <rect x={-w / 2 + 4 / k} y={-h / 2 + 5 / k} width={w} height={h} fill="rgba(0,0,0,0.25)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw} />
      {trapped && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#trap)" />}
      {/* ikon tipe */}
      {(u.type === "inf") && <path d={`M${-w / 2},${-h / 2}L${w / 2},${h / 2}M${w / 2},${-h / 2}L${-w / 2},${h / 2}`} stroke={stroke} strokeWidth={sw} />}
      {(u.type === "pz" || u.type === "cavmech") && <ellipse cx={0} cy={0} rx={w * 0.3} ry={h * 0.22} fill="none" stroke={stroke} strokeWidth={sw} />}
      {u.type === "cavmech" && <path d={`M${-w / 2},${h / 2}L${w / 2},${-h / 2}`} stroke={stroke} strokeWidth={sw} />}
      {u.ech && <text x={0} y={-h / 2 - 6 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={20 / k} fill={stroke} letterSpacing={1 / k}>{u.ech}</text>}
      <text x={0} y={h / 2 + 24 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={22 / k} fill={su ? "#7a1610" : "#1d2228"} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{u.name}</text>
      {u.cmd && <text x={0} y={h / 2 + 46 / k} textAnchor="middle" fontFamily={F.type} fontSize={17 / k} fill={su ? "#7a1610" : "#1d2228"} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{u.cmd}</text>}
    </g>
  );
};

const Arrow: React.FC<{ pts: P[]; a: number; b: number; t: number; k: number }> = ({ pts, a, b, t, k }) => {
  const u = io(clamp01((t - a) / (b - a)));
  if (u <= 0) return null;
  const Ltot = len(pts);
  const tip = along(pts, u), pre = along(pts, Math.max(0, u - 8 / Ltot));
  const ang = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
  const hw = 26 / k, hl = 34 / k;
  const head = [[tip[0] + Math.cos(ang) * hl * 0.5, tip[1] + Math.sin(ang) * hl * 0.5], [tip[0] - Math.cos(ang) * hl * 0.6 - Math.sin(ang) * hw, tip[1] - Math.sin(ang) * hl * 0.6 + Math.cos(ang) * hw], [tip[0] - Math.cos(ang) * hl * 0.6 + Math.sin(ang) * hw, tip[1] - Math.sin(ang) * hl * 0.6 - Math.cos(ang) * hw]];
  const d = smooth(pts);
  return (
    <g opacity={0.92}>
      <path d={d} fill="none" stroke="rgba(60,8,4,0.55)" strokeWidth={20 / k} strokeLinecap="round" strokeDasharray={`${Ltot * u} ${Ltot * 2}`} />
      <path d={d} fill="none" stroke={RED} strokeWidth={14 / k} strokeLinecap="round" strokeDasharray={`${Ltot * u} ${Ltot * 2}`} />
      <path d={`M${head.map((h) => h.join(",")).join("L")}Z`} fill={RED} stroke="rgba(60,8,4,0.55)" strokeWidth={3 / k} />
    </g>
  );
};

export const BobruiskTest: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  // kamera: diam, zoom hanya untuk momen penting (kantong)
  const z = 1 + 0.75 * io(clamp01((t - T.zoom) / 2.2));
  const [cx, cy] = [W / 2 + (pc[0] - W / 2) * io(clamp01((t - T.zoom) / 2.2)), H / 2 + (pc[1] - H / 2) * io(clamp01((t - T.zoom) / 2.2))];
  const k = 1 + 0.55 * io(clamp01((t - T.zoom) / 2.2)); // label tidak ikut membesar penuh
  const start = fp("start_24jun");
  const sovietArea = [...start, pj([31.6, 51.8]), pj([31.6, 54.2])];
  const startU = io(clamp01((t - T.start) / 1.6));
  const p26 = fp("pocket_26jun"), p27 = fp("pocket_27jun");
  const o26 = clamp01((t - T.d26) / 0.8) * (1 - clamp01((t - T.d27) / 0.8));
  const o27 = clamp01((t - T.d27) / 0.8);
  const date = [...DATES].reverse().find(([a]) => t >= a)![1];
  return (
    <AbsoluteFill style={{ background: "#16202a" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: rv(t, T.mapIn, 1.2) }}>
        <defs>
          <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
            <path d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,64 L28,97" fill="none" stroke="rgba(60,50,20,0.10)" strokeWidth="1.5" />
          </pattern>
          <pattern id="trap" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="14" fill="rgba(200,38,28,0.45)" />
          </pattern>
          <radialGradient id="land" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#cfc79c" /><stop offset="100%" stopColor="#a89f72" />
          </radialGradient>
        </defs>
        <g transform={`translate(${W / 2},${H / 2}) scale(${z}) translate(${-cx},${-cy})`}>
          <rect x={-2000} y={-2000} width={6000} height={5000} fill="url(#land)" />
          <rect x={-2000} y={-2000} width={6000} height={5000} fill="url(#hex)" />
          {/* wilayah Soviet (awal) */}
          <path d={path(sovietArea) + "Z"} fill="rgba(200,38,28,0.15)" opacity={startU} />
          {/* sungai */}
          {base.rivers.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke="#4f7fae" strokeWidth={(r.name === "Byarezina" || r.name === "Dnipro" ? 4 : 2.4) / k} strokeLinejoin="round" opacity={0.9} />)}
          <text x={pj([29.02, 53.42])[0]} y={pj([29.02, 53.42])[1]} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={26 / k} fill="#3a6a99">Berezina</text>
          <text x={pj([30.18, 52.98])[0]} y={pj([30.18, 52.98])[1]} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={26 / k} fill="#3a6a99">Dnieper</text>
          {/* kota */}
          {Object.entries(TW).map(([n, ll]) => { const [x, y] = pj(ll); const big = n === "Bobruisk"; return (
            <g key={n}>
              <rect x={x - (big ? 9 : 6) / k} y={y - (big ? 9 : 6) / k} width={(big ? 18 : 12) / k} height={(big ? 18 : 12) / k} fill="#2a2418" />
              <text x={x + 12 / k} y={y - 10 / k} fontFamily={F.ui} fontWeight={700} fontSize={(big ? 36 : 24) / k} fill="#2a2418" stroke="rgba(239,232,205,0.9)" strokeWidth={5 / k} paintOrder="stroke">{n}</text>
            </g>); })}
          {/* garis awal 24 Juni */}
          <path d={smooth(start)} fill="none" stroke={RED} strokeWidth={6 / k} strokeDasharray={`${len(start) * startU} ${len(start) * 2}`} />
          {/* garis Jerman 26 Juni */}
          <path d={smooth(p26, true)} fill="rgba(42,48,56,0.10)" stroke={DE} strokeWidth={4 / k} strokeDasharray={`${14 / k} ${8 / k}`} opacity={o26} />
          {/* kantong 27 Juni */}
          <g opacity={o27}>
            <path d={smooth(p27, true)} fill="rgba(42,48,56,0.28)" stroke={DE} strokeWidth={4 / k} opacity={1 - clamp01((t - T.fall) / 1.2)} />
            <path d={smooth(p27, true)} fill="rgba(200,38,28,0.22)" opacity={clamp01((t - T.fall) / 1.2)} />
            <path d={smooth(p27, true)} fill="none" stroke={RED} strokeWidth={7 / k} strokeDasharray={`${3 / k} ${9 / k}`} strokeLinecap="round" transform={`translate(${pc[0]},${pc[1]}) scale(1.12) translate(${-pc[0]},${-pc[1]})`} />
          </g>
          {/* panah */}
          <Arrow pts={fp("arrow_3A")} a={T.d25} b={T.d25 + 2.6} t={t} k={k} />
          <Arrow pts={fp("arrow_48A_b")} a={T.d25 + 0.6} b={T.d25 + 3} t={t} k={k} />
          <Arrow pts={fp("arrow_48A")} a={T.d25 + 1.2} b={T.d26} t={t} k={k} />
          <Arrow pts={fp("arrow_65A")} a={T.d25 + 2.5} b={T.d27 + 0.5} t={t} k={k} />
          <Arrow pts={fp("arrow_28A")} a={T.d25 + 3} b={T.d26 + 2} t={t} k={k} />
          <Arrow pts={fp("arrow_KMG")} a={T.d26} b={T.d27} t={t} k={k} />
          {/* unit */}
          {UNITS.map((u) => <Counter key={u.id} u={u} t={t} k={k} />)}
        </g>
      </svg>
      {/* HUD */}
      <div style={{ position: "absolute", left: 48, top: 40, padding: "18px 26px", background: "rgba(14,20,26,0.82)", borderLeft: `6px solid ${C.gold}`, opacity: rv(t, T.title + 1.2) }}>
        <div style={{ fontFamily: F.type, fontSize: 22, letterSpacing: 6, color: C.gold }}>OPERATION BAGRATION · BOBRUISK</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 52, color: C.chalk, marginTop: 4 }}>{date}</div>
      </div>
      {POPS.map(([a, b, kick, txt]) => { const o = clamp01((t - a) / 0.3) * clamp01((b - t) / 0.3); if (o <= 0) return null; return (
        <div key={a} style={{ position: "absolute", left: 48, bottom: 70, maxWidth: 820, padding: "18px 26px", background: "rgba(14,20,26,0.86)", opacity: o, transform: `translateY(${(1 - rv(t, a, 0.4)) * 16}px)` }}>
          <div style={{ fontFamily: F.type, fontSize: 20, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 40, lineHeight: 1.1, color: C.chalk, marginTop: 6 }}>{txt}</div>
        </div>); })}
      {/* legenda */}
      <div style={{ position: "absolute", right: 40, bottom: 34, display: "flex", gap: 22, alignItems: "center", padding: "10px 18px", background: "rgba(14,20,26,0.75)", fontFamily: F.ui, fontWeight: 600, fontSize: 22, color: C.chalk, opacity: rv(t, T.units) }}>
        <span><span style={{ display: "inline-block", width: 22, height: 15, background: RED_FILL, border: `3px solid ${RED}`, verticalAlign: "middle", marginRight: 8 }} />Soviet</span>
        <span><span style={{ display: "inline-block", width: 22, height: 15, background: DE_FILL, border: `3px solid ${DE}`, verticalAlign: "middle", marginRight: 8 }} />German</span>
        <span style={{ fontFamily: F.type, fontSize: 16, letterSpacing: 3, opacity: 0.7 }}>ILLUSTRATIVE RECONSTRUCTION</span>
      </div>
      {/* judul pembuka */}
      {t < 3.2 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: clamp01((3.0 - t) / 0.5) * rv(t, T.title, 0.6) }}>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 10, color: C.gold, textShadow: "0 2px 10px #000" }}>JUNE 1944</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 130, color: C.chalk, textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}>THE BOBRUISK POCKET</div>
        </AbsoluteFill>
      )}
      <Vignette amount={0.45} />
      <FilmGrain strength={0.15} />
    </AbsoluteFill>
  );
};
