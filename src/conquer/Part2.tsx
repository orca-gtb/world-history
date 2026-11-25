import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import { COUNTRIES } from "../longform/mapdata";
import ops from "./ops-bobruisk.json";
import base from "./basemap-bobruisk.json";
import TL from "./pilot-timeline.json";
import P2 from "./part2-timeline.json";
import { Arrow, Cam, Counter, DE, P, RED, UType, cl, io, keyed, len, makeProj, mixCam, mixP, off, path, rv, smooth, along } from "./mapkit";

// BOBRUISK PILOT (±3:21). Timeline: pilot-timeline.json (dibaca juga oleh scripts/mix_pilot.py).
// Gambar AI dari Angie tampil DIAM (aturan Nanda); variasi lewat potongan dan transisi gelap perlahan.
export const FPS = 30;
export const PART2_TOTAL = Math.round(P2.total * FPS);
const E2 = P2.ev2 as unknown as Record<string, number & number[]>;
const AN = P2.anchors as number[][];
const tauAt = (tn: number) => { let i = 0; for (let j = 0; j < AN.length; j++) { if (AN[j][0] <= tn) i = j; else break; } const a = AN[i], b = AN[i + 1]; if (!b || b[0] <= a[0]) return a[1]; return a[1] + ((b[1] - a[1]) * (tn - a[0])) / (b[0] - a[0]); };
const pj = makeProj(53.1, 29.45, 1080 / 1.1);
const FE = ops.features as Record<string, number[][]>;
const fp = (k: string) => FE[k].map(pj);
const TW = ops.towns as Record<string, number[]>;
const LB = ops.labels_ref as Record<string, number[]>;
const L = (k: string) => pj(LB[k]);
const E = TL.ev;
const pc = (() => { const p = fp("pocket_27jun"); return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length] as P; })();
const BOB = pj(TW["Bobruisk"]), ROG = pj(TW["Rogachev"]), PAR = pj(TW["Parichi"]), SLU = pj(TW["Slutsk"]), MIN = pj(TW["Minsk"]);
const BRK = fp("breakout");

// ---------- kamera (keyframe) ----------
const camW: Cam = { z: 0.95, c: off(BOB, 160, 120) };
const CAM: [number, Cam][] = [
  [E.theatre_in, { z: 0.13, c: pj([29.0, 53.4]) }],
  [E.zoom_sector, { z: 0.13, c: pj([29.0, 53.4]) }],
  [E.zoom_sector + 5.5, camW],
  [E.first_assault - 1, camW],
  [E.first_assault + 1.2, { z: 1.35, c: off(ROG, -60, -40) }],
  [E.guns_again - 1.5, { z: 1.35, c: off(ROG, -60, -40) }],
  [E.guns_again + 0.8, camW],
  [E.n_break + 0.2, { z: 1.25, c: mixP(ROG, pj(TW["Kirovsk"]), 0.5) }],
  [69.4, { z: 1.25, c: mixP(ROG, pj(TW["Kirovsk"]), 0.5) }],
  [E.s_cross, { z: 1.2, c: off(PAR, -120, -20) }],
  [E.kmg + 4, { z: 1.0, c: off(PAR, -260, -60) }],
  [E.jaws_close, { z: 1.2, c: off(BOB, 40, 60) }],
  [E.ring, { z: 1.9, c: pc }],
  [112.7, { z: 1.9, c: pc }],
  [E.breakout_order, { z: 1.45, c: mixP(pc, BRK[BRK.length - 1], 0.45) }],
  [132.7, { z: 1.45, c: mixP(pc, BRK[BRK.length - 1], 0.6) }],
  [158.4, { z: 2.0, c: off(BOB, 30, 20) }],
  [E.falls + 2.5, { z: 2.0, c: off(BOB, 30, 20) }],
  [E.part_out + 2, camW],
  [174.2, camW],
  [E.minsk - 0.5, camW],
  [E.minsk + 2.5, { z: 0.55, c: mixP(BOB, MIN, 0.5) }],
  [E.zoom_out + 4, { z: 0.16, c: pj([28.6, 53.7]) }],
];

// ---------- unit (posisi keyframe, dalam px dunia) ----------
type U = { id: string; side: "SU" | "DE"; ech: string; type: UType; name: string; cmd?: string; keys: [number, P][]; on: number; offT?: number; trap?: number; fade?: [number, number] };
const pz20a = L("DE 20 PzD");
const UNITS: U[] = [
  { id: "9A", side: "DE", ech: "XXXX", type: "hq", name: "9th ARMY", cmd: "JORDAN", keys: [[0, off(BOB, -70, -110)]], on: E.jordan, fade: [121.75, 122.5] },
  { id: "707", side: "DE", ech: "XX", type: "inf", name: "707 ID", keys: [[0, L("DE 707 ID")], [E.jaws_close, L("DE 707 ID")], [E.ring, off(pj(TW["Klichev"]), 70, 40)]], on: E.german_units + 0.2, fade: [E.part_out, E.part_out + 1.5] },
  { id: "57", side: "DE", ech: "XX", type: "inf", name: "57 ID", keys: [[0, L("DE 57 ID")]], on: E.german_units + 0.3, fade: [E.part_out, E.part_out + 1.5] },
  { id: "134", side: "DE", ech: "XX", type: "inf", name: "134 ID", keys: [[0, L("DE 134 ID")], [E.n_break + 1, L("DE 134 ID")], [E.n_break + 6, off(L("DE 134 ID"), -60, -110)]], on: E.german_units + 0.4, fade: [E.part_out, E.part_out + 1.5] },
  { id: "45", side: "DE", ech: "XX", type: "inf", name: "45 ID (part)", keys: [[0, off(L("DE 45 ID (part, N)"), 0, -30)], [E.jaws_close, off(L("DE 45 ID (part, N)"), -40, -20)], [E.ring + 1, off(pc, 75, -5)]], on: E.german_units + 0.5, trap: E.ring + 1.5 },
  { id: "296", side: "DE", ech: "XX", type: "inf", name: "296 ID", keys: [[0, off(L("DE 296 ID"), 0, 25)], [E.jaws_close, off(L("DE 296 ID"), -50, 10)], [E.ring + 1, off(pc, 25, -62)]], on: E.german_units + 0.6, trap: E.ring + 1.5 },
  { id: "6", side: "DE", ech: "XX", type: "inf", name: "6 ID", keys: [[0, L("DE 6 ID")], [E.jaws_close, off(L("DE 6 ID"), -70, -50)], [E.ring + 1, off(pc, -62, 35)]], on: E.german_units + 0.7, trap: E.ring + 1.5 },
  { id: "35AK", side: "DE", ech: "XXX", type: "inf", name: "XXXV CORPS", keys: [[0, L("DE XXXV AK")], [E.jaws_close, L("DE XXXV AK")], [E.ring + 1, off(pc, -70, -50)], [E.breakout + 0.6, off(pc, -70, -50)], [E.breakout + 3.6, along(BRK, 0.6)]], on: E.german_units + 0.8, trap: E.ring + 1.5 },
  { id: "20PZ", side: "DE", ech: "XX", type: "pz", name: "20th PANZER", keys: [[0, pz20a], [E.n_break + 0.5, pz20a], [E.n_break + 4, off(pz20a, 30, -70)], [E.n_break + 7, off(pz20a, 20, 90)], [E.jaws_close, off(pz20a, 20, 90)], [E.ring + 1, off(pc, 18, 42)], [E.breakout, off(pc, 18, 42)], [E.breakout + 3, along(BRK, 0.95)]], on: E.german_units + 0.9, trap: E.ring + 1.5 },
  { id: "55AK", side: "DE", ech: "XXX", type: "inf", name: "LV CORPS", keys: [[0, L("DE LV AK")], [E.kmg, L("DE LV AK")], [E.kmg + 5, off(L("DE LV AK"), -90, -10)]], on: E.german_units + 1.0, fade: [E.part_out, E.part_out + 1.5] },
  { id: "12PZ", side: "DE", ech: "XX", type: "pz", name: "12th PANZER", keys: [[E.pz12, pj([28.35, 53.5])], [E.pz12 + 3.5, off(BRK[BRK.length - 1], -50, -20)]], on: E.pz12, fade: [E.part_out + 2, E.part_out + 3.5] },
  { id: "383", side: "DE", ech: "XX", type: "inf", name: "383 ID", keys: [[0, off(BOB, -60, 40)]], on: 158.4, fade: [E.falls + 0.5, E.falls + 1.8] },
  // Soviet
  { id: "3A", side: "SU", ech: "XXXX", type: "inf", name: "3rd ARMY", cmd: "GORBATOV", keys: [[0, L("SU 3 A")], [E.n_break, L("SU 3 A")], [E.n_break + 6, off(fp("arrow_3A").slice(-1)[0], 70, -70)]], on: E.soviet_units },
  { id: "48A", side: "SU", ech: "XXXX", type: "inf", name: "48th ARMY", cmd: "ROMANENKO", keys: [[0, L("SU 48 A")], [86, L("SU 48 A")], [E.ring, off(fp("arrow_48A")[2], 150, 70)]], on: E.soviet_units + 0.2 },
  { id: "65A", side: "SU", ech: "XXXX", type: "inf", name: "65th ARMY", cmd: "BATOV", keys: [[0, fp("arrow_65A")[0]], [E.s_cross, fp("arrow_65A")[0]], [E.ring, off(fp("arrow_65A").slice(-1)[0], -200, 30)], [158.4, off(fp("arrow_65A").slice(-1)[0], -200, 30)], [E.falls, off(BOB, -110, -10)]], on: E.soviet_units + 0.4 },
  { id: "28A", side: "SU", ech: "XXXX", type: "inf", name: "28th ARMY", cmd: "LUCHINSKY", keys: [[0, L("SU 28 A")], [E.s_cross + 1, L("SU 28 A")], [E.kmg + 1, fp("arrow_28A").slice(-1)[0]]], on: E.soviet_units + 0.6 },
  { id: "KMG", side: "SU", ech: "", type: "cavmech", name: "PLIYEV GROUP", cmd: "PLIYEV", keys: [[E.kmg, fp("arrow_KMG")[0]], [E.kmg + 5, fp("arrow_KMG").slice(-1)[0]], [E.kmg + 9, mixP(fp("arrow_KMG").slice(-1)[0], SLU, 0.5)]], on: E.kmg },
];
const uPos = (u: U, t: number) => keyed(u.keys, t, mixP);

// ---------- still ----------
const STILL = (P2.scenes as { t0: number; t1: number; kind: string; id: string }[]);
const Still: React.FC<{ id: string; t: number }> = ({ id, t }) => {
  const q = TL.quotes.find((x) => t >= x.t0 - 0.5 && t <= x.t1 + 0.5);
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <Img src={staticFile(`stills/bobruisk/${id}.jpg`)} style={{ position: "absolute", width: 1920, height: 1080 }} />
      {q && (() => { const o = cl(t, q.t0, 0.5) * (1 - cl(t, q.t1 - 0.4, 0.4)); return (
        <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 120px 120px 120px", background: `linear-gradient(0deg, rgba(0,0,0,${0.65 * o}) 0%, rgba(0,0,0,0) 45%)` }}>
          <div style={{ opacity: o, fontFamily: F.ui, fontWeight: 600, fontSize: 58, lineHeight: 1.12, color: C.chalk, textShadow: "0 3px 14px rgba(0,0,0,0.9)" }}>{q.text}</div>
          <div style={{ opacity: o * rv(t, q.t0 + 0.8), fontFamily: F.type, fontSize: 22, letterSpacing: 3, color: "#d9d2c0", marginTop: 14 }}>{q.by.toUpperCase()}</div>
        </AbsoluteFill>); })()}
      <div style={{ position: "absolute", right: 28, bottom: 22, padding: "4px 10px", background: "rgba(10,12,14,0.6)", fontFamily: F.type, fontSize: 15, letterSpacing: 2, color: "rgba(232,225,207,0.85)" }}>AI ILLUSTRATION</div>
    </AbsoluteFill>
  );
};

const DATES: [number, string][] = [[0, "JUNE 1944"], [E.soviet_units, "24 JUNE 1944"], [E.n_break, "24–25 JUNE 1944"], [E.s_cross, "25–26 JUNE 1944"], [E.jaws_close, "27 JUNE 1944"], [E.breakout_order, "28 JUNE 1944"], [158.4, "29 JUNE 1944"], [182.5, "JULY 1944"]];
const BEATS: [number, number, string, string][] = [
  [E.plan_arrows, E.first_assault - 0.3, "24 JUNE", "TWO ATTACKS, ONE TARGET"],
  [E.ring + 0.5, 108.5, "27 JUNE", "XXXV CORPS IS ENCIRCLED"],
  [E.breakout, 131.5, "28 JUNE", "THE BREAKOUT"],
  [E.falls, 163.4, "29 JUNE", "BOBRUISK FALLS"],
  [E.minsk + 0.5, 190.0, "JULY 1944", "THE ROAD TO MINSK IS OPEN"],
];
const BEATS2: [number, number, string, string][] = [
  [E2.hook_sil[0], E2.hook_sil[1] - 0.2, "BY ONE ACCOUNT", "NEARLY 80,000 MEN LOST"],
  [E2.hook_sil[1], 17.0, "BOBRUISK", "THE SOUTHERN JAW"],
  [E2.p2_1 + 0.2, E2.p2_1 + 4.7, "THE USUAL ACCOUNT", "STALIN WANTED ONE MAIN ATTACK"],
  [E2.p2_2 + 0.2, E2.p2_2 + 11.0, "23 JUNE", "FIRST ASSAULT AT ROGACHEV THROWN BACK"],
  [E2.p2_3 + 0.2, E2.p2_3_sil[0] - 0.2, "NORTH", "3rd ARMY PUSHES TOWARDS THE BEREZINA"],
  [E2.p2_3_sil[0], E2.p2_3 + 13.2, "26 JUNE", "48th ARMY TAKES ZHLOBIN · 9th TANK CORPS THROUGH THE GAP"],
  [E2.p2_4 + 0.3, E2.p2_4_sil[1] - 0.2, "65th ARMY · BATOV", "LOG ROADS AND MARSH SHOES"],
  [E2.p2_4_sil[1] + 0.2, E2.p2_4_sil[2] - 0.2, "ON THE FLANK", "28th ARMY"],
  [E2.p2_4_sil[2] + 0.2, E2.p2_4_sil[3] - 0.1, "PLIYEV GROUP", "1st MECH CORPS · 4th GUARDS CAVALRY CORPS"],
  [E2.p2_6 + 0.3, E2.p2_6_sil[1] - 0.2, "27 JUNE", "THE POCKET: 35th CORPS · PART OF 41st PZ CORPS · 20th PZ"],
  [E2.p2_6_sil[1], E2.p2_6 + 12.7, "AIR ATTACK", "NINTH ARMY COMMUNICATIONS HEADQUARTERS"],
  [E2.p2_7 + 0.1, E2.p2_7 + 6.6, "28 JUNE", "THE BREAKOUT HITS THE 356th RIFLE DIVISION"],
  [E2.p2_9 + 0.1, E2.p2_9_sil[0], "NORTH", "VITEBSK: LIII CORPS GONE"],
  [E2.p2_9_sil[0], E2.p2_9_sil[1] - 0.1, "SOUTH", "BOBRUISK: 9th ARMY BROKEN"],
  [E2.p2_9_sil[1], E2.p2_9_sil[2] - 0.1, "CENTRE", "4th ARMY STILL MOVING WEST"],
  [E2.p2_9_sil[2], E2.p2_9 + 10.0, "NEXT", "MINSK"],
];
const ARTY = Array.from({ length: 26 }, (_, i) => ({ u: random(`au${i}`), d: random(`ad${i}`) * 2.2 }));

export const Part2: React.FC = () => {
  const tn = useCurrentFrame() / FPS;
  const t = tauAt(tn);
  const seg = STILL.find((s) => tn >= s.t0 && tn < s.t1) ?? STILL[STILL.length - 1];
  const cam = keyed(CAM, t, mixCam);
  const z = cam.z, k = z < 1 ? z : Math.max(1, z * 0.82);
  const theatre = 1 - clamp01((z - 0.3) / 0.35); // 1 saat sangat jauh
  const start = fp("start_24jun");
  const sov = [...start, pj([31.8, 51.6]), pj([31.8, 54.4])];
  const r25N = io(cl(t, E.n_break, 6)) * 700, r26N = io(cl(t, E.n_break + 4, 6)) * 700;
  const r25S = io(cl(t, E.s_cross, 5)) * 800, r26S = io(cl(t, E.kmg - 2, 6)) * 1000;
  const p26 = fp("pocket_26jun"), p27 = fp("pocket_27jun");
  const o26 = cl(t, 95, 0.8) * (1 - cl(t, E.ring, 0.6));
  const ring = io(cl(t, E.ring, 1.4)), fallen = cl(t, E.falls, 1.2);
  const dip = Math.max(0, ...P2.dips.map((b: number) => cl(tn, b - 0.8, 0.7) * (1 - cl(tn, b + 0.1, 0.7))));
  const b2 = Math.max(0, ...BEATS2.map(([a, b]) => cl(tn, a, 0.35) * (1 - cl(tn, b - 0.35, 0.35))));
  const date = [...DATES].reverse().find(([a]) => t >= a)![1];
  const DATE_OV: [number, number, string][] = [[E2.p2_2, E2.p2_2 + 11.5, "23 JUNE 1944"], [E2.p2_3, E2.p2_3 + 13.6, "24–26 JUNE 1944"], [E2.p2_9, E2.p2_9 + 10.4, "28 JUNE – 2 JULY 1944"]];
  const dateShown = DATE_OV.find(([x, y]) => tn >= x && tn < y)?.[2] ?? date;
  const arrowsOn = 1 - cl(t, E.part_out, 2.0) * 0.6;
  // "serangan pertama dipukul mundur": panah pendek maju lalu mundur
  const fa = t < E.thrown_back ? io(cl(t, E.first_assault, 2.5)) : 1 - io(cl(t, E.thrown_back, 1.5));
  const faPts: P[] = [off(ROG, 40, -10), off(ROG, -40, -30), off(ROG, -110, -40)];
  return (
    <AbsoluteFill style={{ background: "#0c1014" }}>
      {/* ================= PETA ================= */}
      {(seg.kind === "map" || dip > 0) && seg.kind === "map" && (
        <AbsoluteFill style={{ display: seg.kind === "map" ? "block" : "none" }}>
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <defs>
              <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)"><path d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,64 L28,97" fill="none" stroke="rgba(60,50,20,0.10)" strokeWidth="1.5" /></pattern>
              <pattern id="trap" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="rgba(200,38,28,0.45)" /></pattern>
              <radialGradient id="land" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#cfc79c" /><stop offset="100%" stopColor="#a89f72" /></radialGradient>
              <clipPath id="c25N"><circle cx={ROG[0]} cy={ROG[1] - 60} r={r25N} /></clipPath>
              <clipPath id="c26N"><circle cx={ROG[0]} cy={ROG[1] - 60} r={r26N} /></clipPath>
              <clipPath id="c25S"><circle cx={PAR[0]} cy={PAR[1]} r={r25S} /></clipPath>
              <clipPath id="c26S"><circle cx={PAR[0]} cy={PAR[1]} r={r26S} /></clipPath>
            </defs>
            <g transform={`translate(960,540) scale(${z}) translate(${-cam.c[0]},${-cam.c[1]})`}>
              <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#land)" />
              <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#hex)" opacity={1 - theatre} />
              {/* batas negara modern (hanya saat sangat jauh) */}
              {theatre > 0 && COUNTRIES.map((c, i) => c.r.map((r, j) => { const pts: P[] = []; for (let q = 0; q < r.length; q += 2) pts.push(pj([r[q], r[q + 1]])); return <path key={`${i}-${j}`} d={path(pts) + "Z"} fill="none" stroke="rgba(60,50,30,0.55)" strokeWidth={1.4 / z} opacity={theatre} />; }))}
              {theatre > 0 && (
                <g opacity={theatre}>
                  {[["BELARUS", 27.6, 54.2], ["UKRAINE", 31.0, 50.2], ["POLAND", 20.0, 52.4], ["RUSSIA", 35.0, 55.6], ["LITHUANIA", 23.7, 55.4]].map(([n, lo, la]) => { const [x, y] = pj([lo as number, la as number]); return <text key={n as string} x={x} y={y} textAnchor="middle" fontFamily={F.type} fontSize={20 / z} letterSpacing={6 / z} fill="rgba(60,50,30,0.6)">{n}</text>; })}
                  <text x={pj([28.3, 52.0])[0]} y={pj([28.3, 52.0])[1]} textAnchor="middle" fontFamily={F.type} fontSize={15 / z} fill="rgba(60,50,30,0.55)">MODERN BORDERS</text>
                  <ellipse cx={pj([28.6, 54.0])[0]} cy={pj([28.6, 54.0])[1]} rx={260 / (z * 0.95)} ry={150 / (z * 0.95)} fill="rgba(42,48,56,0.12)" stroke={DE} strokeWidth={2.5 / z} strokeDasharray={`${12 / z} ${8 / z}`} opacity={rv(t, E.theatre_in + 1.5, 0.8)} />
                  <text x={pj([28.6, 54.0])[0]} y={pj([28.6, 54.0])[1]} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={30 / z} fill="#1d2228" opacity={rv(t, E.theatre_in + 1.8, 0.8)}>ARMY GROUP CENTRE</text>
                  <circle cx={BOB[0]} cy={BOB[1]} r={(14 + 6 * Math.sin(t * 4)) / z} fill="none" stroke={RED} strokeWidth={3 / z} opacity={rv(t, E.theatre_in + 4, 0.6)} />
                </g>
              )}
              {/* wilayah Soviet */}
              <g opacity={0.17 * (1 - theatre)}>
                {t >= E.soviet_units && <path d={path(sov) + "Z"} fill={RED} opacity={cl(t, E.soviet_units, 1.5)} />}
                <path d={smooth(fp("zone_25N"), true)} fill={RED} clipPath="url(#c25N)" />
                <path d={smooth(fp("zone_26N"), true)} fill={RED} clipPath="url(#c26N)" />
                <path d={smooth(fp("zone_25S"), true)} fill={RED} clipPath="url(#c25S)" />
                <path d={smooth(fp("zone_26S"), true)} fill={RED} clipPath="url(#c26S)" />
                {fallen > 0 && <path d={smooth(p27, true)} fill={RED} opacity={fallen} />}
              </g>
              {base.rivers.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke="#4f7fae" strokeWidth={(r.name === "Byarezina" || r.name === "Dnipro" ? 4 : 2.4) / k} strokeLinejoin="round" opacity={0.9 * (1 - theatre)} />)}
              <g opacity={1 - theatre}>
                <text x={pj([29.02, 53.42])[0]} y={pj([29.02, 53.42])[1]} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={26 / k} fill="#3a6a99">Berezina</text>
                <text x={pj([30.18, 52.98])[0]} y={pj([30.18, 52.98])[1]} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={26 / k} fill="#3a6a99">Dnieper</text>
                {t > 77 && t < 104 && <g opacity={cl(t, 77, 1) * (1 - cl(t, 102, 1.5))}><ellipse cx={PAR[0] - 60} cy={PAR[1] + 40} rx={190} ry={95} fill="rgba(70,110,90,0.18)" stroke="rgba(70,110,90,0.4)" strokeDasharray="6 8" /><text x={PAR[0] - 140} y={PAR[1] + 160} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={22 / k} fill="#3f6b55">marshes</text></g>}
              </g>
              {["Bobruisk", "Rogachev", "Zhlobin", "Parichi", "Osipovichi", "Glusk", "Starye Dorogi", "Kirovsk", "Bykhov", "Klichev", "Svetlogorsk", "Slutsk", "Minsk", "Mogilev"].map((n) => { const [x, y] = pj(TW[n]); const big = n === "Bobruisk" || n === "Minsk"; const ks = z < 1 ? Math.max(z, 0.3) : k; return (
                <g key={n} opacity={n === "Minsk" || n === "Mogilev" ? 1 : 1 - theatre * 0.8}>
                  <rect x={x - (big ? 9 : 6) / ks} y={y - (big ? 9 : 6) / ks} width={(big ? 18 : 12) / ks} height={(big ? 18 : 12) / ks} fill="#2a2418" />
                  <text x={x + 12 / ks} y={y - 10 / ks} fontFamily={F.ui} fontWeight={700} fontSize={(big ? 36 : 24) / ks} fill="#2a2418" stroke="rgba(239,232,205,0.9)" strokeWidth={5 / ks} paintOrder="stroke">{n}</text>
                </g>); })}
              {/* garis awal 24 Juni */}
              {t >= E.soviet_units && <path d={smooth(start)} fill="none" stroke={RED} strokeWidth={5 / k} strokeDasharray={`${len(start) * io(cl(t, E.soviet_units, 2.2))} ${len(start) * 2}`} opacity={0.75 * (1 - cl(t, E.n_break + 8, 2) * 0.5)} />}
              {/* kilatan artileri (pembuka + "the guns fire again") */}
              {[E.soviet_units + 0.6, E.guns_again].map((t0, gi) => ARTY.map((a, i) => { const q = cl(t, t0 + a.d, 0.7); if (q <= 0 || q >= 1) return null; const p = off(along(start, 0.25 + a.u * 0.55), -25, -10); return <g key={`${gi}-${i}`}><circle cx={p[0]} cy={p[1]} r={(8 + 26 * q) / k} fill="none" stroke="#ffd27a" strokeWidth={3 / k} opacity={1 - q} /><circle cx={p[0]} cy={p[1]} r={(10 * (1 - q)) / k} fill="#fff1c4" opacity={1 - q} /></g>; }))}
              {/* rencana "dua rahang" */}
              {t >= E.plan_arrows && t < E.n_break + 2 && <g opacity={1 - cl(t, E.n_break, 1.5)}>
                <Arrow pts={[off(ROG, 30, -40), off(BOB, 120, -110), off(BOB, 30, -50)]} a={E.plan_arrows} b={E.plan_arrows + 2} t={t} k={k} dash width={9} />
                <Arrow pts={[off(PAR, 60, 60), off(PAR, -120, -20), off(BOB, -30, 60)]} a={E.plan_arrows + 1} b={E.plan_arrows + 3} t={t} k={k} dash width={9} />
              </g>}
              {/* serangan pertama utara: maju lalu dipukul mundur */}
              {t >= E.first_assault && t < E.thrown_back + 1.6 && fa > 0.01 && <g>
                <Arrow pts={faPts} a={E.first_assault - 1} b={E.first_assault - 0.99} t={t} k={k} upto={fa} width={11} />
                {t > E.thrown_back && <g transform={`translate(${along(faPts, 0.55)[0]},${along(faPts, 0.55)[1]})`} opacity={1 - cl(t, E.thrown_back + 1, 0.5)}><path d={`M${-22 / k},${-22 / k}L${22 / k},${22 / k}M${22 / k},${-22 / k}L${-22 / k},${22 / k}`} stroke={DE} strokeWidth={7 / k} /></g>}
              </g>}
              <g opacity={arrowsOn}>
                <Arrow pts={fp("arrow_3A")} a={E.n_break} b={E.n_break + 5} t={t} k={k} />
                <Arrow pts={fp("arrow_48A_b")} a={E.n_break + 1.5} b={E.n_break + 6} t={t} k={k} />
                <Arrow pts={fp("arrow_65A")} a={E.s_cross} b={E.ring} t={t} k={k} />
                <Arrow pts={fp("arrow_28A")} a={E.s_cross + 1} b={E.kmg + 1} t={t} k={k} />
                <Arrow pts={[...fp("arrow_KMG"), mixP(fp("arrow_KMG").slice(-1)[0], SLU, 0.6)]} a={E.kmg} b={E.kmg + 7} t={t} k={k} />
                <Arrow pts={fp("arrow_48A")} a={-1} b={0.001} t={tn} k={k} upto={tn < E2.p2_3 ? 1 : io(cl(tn, E2.p2_3_sil[0], 5))} />
              </g>
              {/* garis Jerman 26 Jun, kantong 27 Jun */}
              <path d={smooth(p26, true)} fill="rgba(42,48,56,0.10)" stroke={DE} strokeWidth={4 / k} strokeDasharray={`${14 / k} ${8 / k}`} opacity={o26} />
              {t >= E.ring && <g opacity={cl(t, E.ring, 0.3) * arrowsOn}>
                <path d={smooth(p27, true)} fill={`rgba(42,48,56,${0.3 * ring * (1 - fallen)})`} stroke={DE} strokeWidth={4 / k} />
                <path d={smooth(p27, true)} fill="none" stroke={RED} strokeWidth={7 / k} strokeLinecap="round" strokeDasharray={`${3 / k} ${9 / k}`} transform={`translate(${pc[0]},${pc[1]}) scale(1.12) translate(${-pc[0]},${-pc[1]})`} opacity={ring} />
              </g>}
              {/* serangan udara */}
              {E.air.map((a: number, i: number) => { const q = cl(t, a, 0.9); if (q <= 0 || q >= 1) return null; const p = off(pc, (random(`ax${i}`) - 0.5) * 130, (random(`ay${i}`) - 0.5) * 80); return <g key={i}><circle cx={p[0]} cy={p[1]} r={((10 + 40 * q) / k) * 1.4} fill="none" stroke="#ffd27a" strokeWidth={4 / k} opacity={1 - q} /><circle cx={p[0]} cy={p[1]} r={((14 * (1 - q)) / k) * 1.4} fill="#fff1c4" opacity={1 - q} /></g>; })}
              {/* terobosan Jerman 28 Jun */}
              <g opacity={arrowsOn}><Arrow pts={BRK} a={E.breakout} b={E.breakout + 3} t={t} k={k} color={DE} width={12} /></g>
              {/* jalan ke Minsk */}
              <Arrow pts={[off(BOB, -20, -30), mixP(BOB, MIN, 0.55), off(MIN, 40, 40)]} a={E.minsk} b={E.minsk + 3} t={t} k={k} dash width={10} />
              {/* unit */}
              {UNITS.map((u) => { if (t < u.on) return null; const o = rv(t, u.on, 0.5) * (u.fade ? 1 - cl(t, u.fade[0], u.fade[1] - u.fade[0]) : 1) * (1 - theatre) * (u.trap && fallen > 0 ? 1 - 0.75 * fallen : 1); return <Counter key={u.id} p={uPos(u, t)} side={u.side} ech={u.ech} type={u.type} name={u.name} cmd={u.cmd} k={k} opacity={o} trapped={u.trap ? cl(t, u.trap, 0.6) : 0} />; })}
              {(() => {
                const w = (a: number, b: number) => cl(tn, a, 0.4) * (1 - cl(tn, b - 0.4, 0.4)), pulse = 0.5 + 0.5 * Math.sin(tn * 5);
                const ring = (p: P, o: number, r = 70) => (o > 0.01 ? <circle cx={p[0]} cy={p[1]} r={(r + 10 * pulse) / k} fill="none" stroke="#ffd27a" strokeWidth={5 / k} opacity={o} /> : null);
                const up = (id: string) => uPos(UNITS.find((u) => u.id === id)!, t);
                const zh = pj(TW["Zhlobin"]), pk = E2.p2_4_sil, vit = pj([30.2, 55.19]);
                const hq = off(BOB, -70, -110);
                return (
                  <g>
                    {ring(zh, w(E2.p2_3_sil[0], E2.p2_3 + 13.4), 60)}
                    {ring(up("65A"), w(E2.p2_4 + 0.3, pk[1] - 0.3), 80)}
                    {ring(up("28A"), w(pk[1] + 0.2, pk[2] - 0.2), 80)}
                    {ring(up("KMG"), w(pk[2] + 0.2, pk[3] + 0.2), 80)}
                    {ring(hq, w(E2.p2_6_sil[1], E2.p2_6 + 12.7), 70)}
                    {ring(pc, w(E2.p2_6 + 0.3, E2.p2_6_sil[1] - 0.2), 100)}
                    {tn > E2.p2_7 - 0.3 && tn < E2.p2_7 + 6.9 && <Counter p={off(along(BRK, 0.78), 10, -80)} side="SU" ech="XX" type="inf" name="356th RIFLE DIV" k={k} scale={0.85} opacity={w(E2.p2_7, E2.p2_7 + 6.6)} />}
                    {tn > E2.p2_9 && tn < E2.p2_9 + 10.6 && (
                      <g opacity={w(E2.p2_9_sil[0] - 2, E2.p2_9 + 10.5)}>
                        <circle cx={vit[0]} cy={vit[1]} r={(20 + 6 * pulse) / cam.z} fill="none" stroke={RED} strokeWidth={4 / cam.z} />
                        <text x={vit[0] + 26 / cam.z} y={vit[1] + 6 / cam.z} fontFamily={F.ui} fontWeight={700} fontSize={26 / cam.z} fill="#1d2228" stroke="rgba(239,232,205,0.9)" strokeWidth={5 / cam.z} paintOrder="stroke">VITEBSK</text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </g>
          </svg>
          {/* HUD */}
          <div style={{ position: "absolute", left: 48, top: 40, padding: "16px 24px", background: "rgba(14,20,26,0.82)", borderLeft: `6px solid ${C.gold}` }}>
            <div style={{ fontFamily: F.type, fontSize: 20, letterSpacing: 6, color: C.gold }}>OPERATION BAGRATION · BOBRUISK</div>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 48, color: C.chalk, marginTop: 2 }}>{dateShown}</div>
          </div>
          {BEATS.map(([a, b, kick, head]) => { const o = cl(t, a, 0.35) * (1 - cl(t, b - 0.35, 0.35)) * (1 - b2); if (o <= 0.01) return null; return (
            <div key={a} style={{ position: "absolute", left: 48, bottom: 60, padding: "18px 26px", background: "rgba(14,20,26,0.86)", borderLeft: "6px solid #c8261c", opacity: o, transform: `translateY(${(1 - rv(t, a, 0.5)) * 14}px)` }}>
              <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 50, letterSpacing: 1.5, lineHeight: 1.0, color: C.chalk, marginTop: 6 }}>{head}</div>
            </div>); })}
          {BEATS2.map(([a, b, kick, head]) => { const o = cl(tn, a, 0.35) * (1 - cl(tn, b - 0.35, 0.35)); if (o <= 0) return null; return (
            <div key={a} style={{ position: "absolute", left: 48, bottom: 60, maxWidth: 1250, padding: "18px 26px", background: "rgba(14,20,26,0.86)", borderLeft: "6px solid #c8261c", opacity: o, transform: `translateY(${(1 - rv(tn, a, 0.5)) * 14}px)` }}>
              {kick && <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>}
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 46, letterSpacing: 1.5, lineHeight: 1.05, color: C.chalk, marginTop: 6 }}>{head}</div>
            </div>); })}
          {(() => { const o = cl(tn, E2.p2_4_sil[3] + 0.2, 0.5) * (1 - cl(tn, E2.p2_4_sil[4] + 0.3, 0.5)); if (o <= 0) return null; return (
            <div style={{ position: "absolute", right: 60, top: 190, width: 660, padding: "24px 30px", background: "rgba(14,20,26,0.88)", borderLeft: `6px solid ${C.gold}`, opacity: o }}>
              <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 38, lineHeight: 1.16, color: C.chalk }}>“A great practitioner of cavalry operations in adverse terrain.”</div>
              <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 3, color: "#d9d2c0", marginTop: 14 }}>GLANTZ &amp; HOUSE ON ISSA PLIYEV (AS QUOTED ON WIKIPEDIA)</div>
            </div>); })()}
          {(() => { const o = cl(tn, E2.p2_8 + 0.3, 0.5) * (1 - cl(tn, E2.p2_8 + 12.6, 0.5)); if (o <= 0) return null; const r2 = rv(tn, E2.p2_8_sil[1] + 0.1, 0.5); return (
            <div style={{ position: "absolute", left: 48, top: 190, padding: "26px 32px", background: "rgba(14,20,26,0.9)", borderLeft: "6px solid #c8261c", opacity: o }}>
              <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 4, color: "#ff7a63" }}>GERMAN NINTH ARMY · ONE ACCOUNT</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 56, color: C.chalk, marginTop: 6 }}>≈ 80,000 CASUALTIES</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 40, color: "#d9d2c0" }}>65,000 OF THEM PRISONERS</div>
              <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 4, color: "#ff7a63", marginTop: 22, opacity: r2 }}>SOVIET · RUSSIAN ARCHIVE FIGURE</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 56, color: C.chalk, marginTop: 4, opacity: r2 }}>7,061 KILLED OR MISSING</div>
              <div style={{ fontFamily: F.type, fontSize: 14, letterSpacing: 2, color: "#a9a290", marginTop: 16 }}>ESTIMATES DIFFER · SOURCES IN DESCRIPTION</div>
            </div>); })()}
          <div style={{ position: "absolute", right: 28, bottom: 22, padding: "4px 10px", background: "rgba(10,12,14,0.55)", fontFamily: F.type, fontSize: 14, letterSpacing: 2, color: "rgba(232,225,207,0.8)" }}>POSITIONS APPROXIMATE · AFTER PERIOD MAPS</div>
        </AbsoluteFill>
      )}
      {/* ================= STILL ================= */}
      {seg.kind === "still" && <Still id={seg.id} t={t} />}
      {seg.kind === "title" && <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: rv(tn, seg.t0 + 0.6, 1.0) * (1 - cl(tn, seg.t1 - 0.9, 0.8)), textAlign: "center" }}>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 120, letterSpacing: 8, color: C.chalk }}>BOBRUISK</div>
          <div style={{ fontFamily: F.type, fontSize: 34, letterSpacing: 12, color: C.gold, marginTop: 8 }}>JUNE 1944</div>
        </div>
      </AbsoluteFill>}
      {seg.kind === "title2" && <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: rv(tn, seg.t0 + 0.3, 1.0) * (1 - cl(tn, seg.t1 - 1.0, 0.8)), textAlign: "center" }}>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 12, color: C.gold }}>OPERATION BAGRATION · PART 2</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 130, letterSpacing: 8, color: C.chalk, marginTop: 6 }}>THE SOUTHERN JAW</div>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 10, color: "#ff7a63", marginTop: 8 }}>BOBRUISK · 24–29 JUNE 1944</div>
        </div>
      </AbsoluteFill>}
      {seg.kind === "end2" && <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: rv(tn, seg.t0 + 0.4, 1.0) * (1 - cl(tn, seg.t1 - 1.4, 1.2)), textAlign: "center" }}>
          <div style={{ fontFamily: F.type, fontSize: 26, letterSpacing: 10, color: "#a9a290" }}>NEXT</div>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 12, color: C.gold, marginTop: 18 }}>OPERATION BAGRATION · PART 3</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 130, letterSpacing: 8, color: C.chalk, marginTop: 6 }}>THE CAULDRON</div>
          <div style={{ fontFamily: F.type, fontSize: 34, letterSpacing: 14, color: C.chalk, marginTop: 6 }}>MINSK</div>
        </div>
      </AbsoluteFill>}
      <AbsoluteFill style={{ background: "#000", opacity: 1 - cl(tn, 1.8, 1.4), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "#000", opacity: dip, pointerEvents: "none" }} />
      <Vignette amount={0.42} />
      <FilmGrain strength={0.14} />
    </AbsoluteFill>
  );
};
