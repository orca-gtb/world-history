import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import { COUNTRIES } from "../longform/mapdata";
import base from "./basemap-theatre.json";
import FR from "../../research/bagration/front-22jun.json";
import TL from "./part1-timeline.json";
import { Arrow, Cam, Counter, DE, P, RED, UType, cl, io, keyed, len, makeProj, mixCam, mixP, path, rv, smooth, along } from "./mapkit";

// OPERATION BAGRATION · PART 1: THE TRAP (±7:26). Timeline: part1-timeline.json (juga dibaca scripts/mix_part1.py).
// Gambar Angie tampil DIAM; transisi peta<->gambar = gelap perlahan (dips).
export const FPS = 30;
export const PART1_TOTAL = Math.round(TL.total * FPS);
const pj = makeProj(54.0, 29.0, 270);
const E = TL.ev;
const g = (lo: number, la: number) => pj([lo, la]);
const gs = (a: number[][]) => a.map((q) => pj(q));

const TOWNS: Record<string, [number, number, number]> = { // lon, lat, tingkat (1 besar, 2 sedang, 3 kecil)
  Minsk: [27.56, 53.9, 1], Vitebsk: [30.2, 55.19, 1], Orsha: [30.42, 54.51, 1], Mogilev: [30.33, 53.9, 1], Bobruisk: [29.23, 53.15, 1],
  Polotsk: [28.8, 55.49, 2], Borisov: [28.5, 54.23, 2], Smolensk: [32.05, 54.78, 2], Gomel: [30.98, 52.44, 2], Vilnius: [25.28, 54.69, 2],
  "L'vov": [24.03, 49.84, 2], Kiev: [30.52, 50.45, 2], Kovel: [24.71, 51.21, 3], Bogushevsk: [30.22, 54.84, 3], Senno: [29.7, 54.81, 3],
  Beshenkovichi: [29.46, 55.05, 3], Tolochin: [29.7, 54.41, 3], Shklov: [30.29, 54.21, 3], Bykhov: [30.25, 53.52, 3], Berezino: [28.99, 53.84, 3],
  Chausy: [30.97, 53.81, 3], Rogachev: [30.05, 53.09, 3], Krupki: [29.14, 54.32, 3], Lepel: [28.69, 54.88, 3],
};
const T = (n: string) => g(TOWNS[n][0], TOWNS[n][1]);
const FRONT = gs(FR.front_22jun);
const SOV = [...FRONT, g(45, 48.3), g(45, 57.8), g(28.55, 57.8)];
const AGC = [...gs(FR.front_22jun.slice(0, 37)), g(24.6, 51.8), g(24.6, 53.4), g(25.6, 55.4), g(27.2, 56.2), g(28.4, 56.4)];
const MAJOR = new Set(["Daugava", "Dnipro", "Dnepr", "Byarezina", "Pripyat", "Prypyat", "Neman", "Sozh", "Druts", "Vistula", "Zakhidnyy Buh"]);
const HWY = gs([[32.05, 54.78], [31.4, 54.62], [30.95, 54.56], [30.42, 54.51], [29.7, 54.41], [29.14, 54.32], [28.5, 54.23], [28.15, 54.08], [27.56, 53.9]]);

// ---------- kamera ----------
const V = {
  wide: { z: 0.5, c: g(28.6, 52.9) } as Cam,
  th: { z: 0.85, c: g(29.6, 54.2) } as Cam,
  th2: { z: 0.78, c: g(29.6, 54.15) } as Cam,
  rail: { z: 1.15, c: g(29.0, 54.25) } as Cam,
  vit: { z: 3.0, c: g(29.98, 55.15) } as Cam,
  ors: { z: 2.0, c: g(29.75, 54.5) } as Cam,
  mog: { z: 2.8, c: g(30.55, 53.95) } as Cam,
  ber: { z: 1.35, c: g(29.35, 53.85) } as Cam,
  end: { z: 1.05, c: g(28.9, 53.65) } as Cam,
};
const CAM: [number, Cam][] = [
  [13.9, { z: 0.95, c: g(29.6, 54.2) }], [29.3, V.th],
  [35.0, V.wide], [E.moved - 0.5, V.wide], [E.moved + 3, { z: 0.62, c: g(28.0, 53.2) }], [67.2, { z: 0.62, c: g(28.0, 53.2) }],
  [75.3, V.th], [104, V.th],
  [113.0, V.wide], [144.6, V.wide], [E.buildup - 0.5, V.wide], [E.buildup + 2.5, V.th],
  [E.name, V.th], [E.name + 2, V.th2], [234.5, V.th2],
  [246.5, V.rail], [255.0, V.rail], [257.5, V.th], [E.broken + 3, V.th],
  [E.vit + 3.5, V.vit], [315.3, V.vit], [322.8, V.vit], [330.5, V.vit], [E.hwy + 3, V.ors], [359.3, V.ors],
  [359.3, V.mog], [410.7, V.mog], [E.roads + 3, V.ber], [E.jaw - 1, V.ber], [E.jaw + 3, V.end],
];

// ---------- unit ----------
type U = { id: string; side: "SU" | "DE"; ech: string; type: UType; name: string; cmd?: string; keys: [number, P][]; on: number; off: number; trap?: number; sc?: number; dash?: boolean };
const UNITS: U[] = [
  // tank army Soviet di selatan (yang sengaja dibiarkan terlihat)
  ...[[26.1, 50.4], [26.7, 49.85], [27.3, 50.55], [26.4, 49.3]].map((q, i) => ({ id: `ta${i}`, side: "SU" as const, ech: "XXXX", type: "pz" as UType, name: "TANK ARMY", keys: [[0, g(q[0], q[1])]] as [number, P][], on: E.tankarmies + i * 0.35, off: 128.9, sc: 0.8 })),
  ...[[23.9, 50.95], [23.5, 50.25]].map((q, i) => ({ id: `rz${i}`, side: "DE" as const, ech: "XX", type: "pz" as UType, name: "RESERVES", keys: [[0, g(q[0], q[1])]] as [number, P][], on: E.reserves + 0.6 + i * 0.3, off: 144.6, sc: 0.8 })),
  { id: "res5", side: "SU", ech: "XXXX", type: "pz", name: "5th GDS TANK ARMY", keys: [[0, g(32.6, 54.55)]], on: E.undetected + 0.5, off: E.name, sc: 0.8, dash: true },
  // front dan army
  { id: "f1b", side: "SU", ech: "XXXXX", type: "inf", name: "1st BALTIC", cmd: "BAGRAMYAN", keys: [[0, g(30.75, 55.85)]], on: E.name + 2, off: 234.5, sc: 0.8 },
  { id: "f3b", side: "SU", ech: "XXXXX", type: "inf", name: "3rd BELORUSSIAN", cmd: "CHERNYAKHOVSKY", keys: [[0, g(31.75, 54.85)]], on: E.name + 2.5, off: 234.5, sc: 0.8 },
  { id: "f2b", side: "SU", ech: "XXXXX", type: "inf", name: "2nd BELORUSSIAN", cmd: "ZAKHAROV", keys: [[0, g(31.8, 53.95)]], on: E.name + 3, off: 234.5, sc: 0.8 },
  { id: "f1bl", side: "SU", ech: "XXXXX", type: "inf", name: "1st BELORUSSIAN", cmd: "ROKOSSOVSKY", keys: [[0, g(31.0, 52.75)]], on: E.name + 3.5, off: 234.5, sc: 0.8 },
  { id: "pz3", side: "DE", ech: "XXXX", type: "pz", name: "3rd PANZER ARMY", cmd: "REINHARDT", keys: [[0, g(29.15, 55.1)]], on: E.name + 4.5, off: 234.5, sc: 0.8 },
  { id: "a4", side: "DE", ech: "XXXX", type: "inf", name: "4th ARMY", cmd: "TIPPELSKIRCH", keys: [[0, g(29.55, 54.1)]], on: E.name + 5, off: 234.5, sc: 0.8 },
  { id: "a9", side: "DE", ech: "XXXX", type: "inf", name: "9th ARMY", cmd: "JORDAN", keys: [[0, g(28.5, 53.4)]], on: E.jordan, off: 234.5, sc: 0.8 },
  { id: "a2", side: "DE", ech: "XXXX", type: "inf", name: "2nd ARMY", keys: [[0, g(27.2, 52.35)]], on: E.name + 5.5, off: 234.5, sc: 0.8 },
  // Vitebsk
  { id: "53ak", side: "DE", ech: "XXX", type: "inf", name: "LIII CORPS", cmd: "GOLLWITZER", keys: [[0, g(30.08, 55.27)], [E.bo, g(30.08, 55.27)], [E.bo + 3, g(29.95, 55.2)]], on: E.pz3, off: E.gone + 4, trap: E.surr + 1, sc: 0.7 },
  { id: "206", side: "DE", ech: "XX", type: "inf", name: "206 ID", keys: [[0, g(30.24, 55.13)]], on: E.d206, off: E.gone + 4, trap: E.surr + 1, sc: 0.7 },
  { id: "4lw", side: "DE", ech: "XX", type: "inf", name: "4 LW FIELD DIV", keys: [[0, g(29.9, 55.14)], [E.bo, g(29.9, 55.14)], [E.bo + 3.5, g(29.68, 55.06)]], on: E.pz3 + 0.8, off: E.gone + 4, trap: E.surr + 1, sc: 0.7 },
  { id: "43a", side: "SU", ech: "XXXX", type: "inf", name: "43rd ARMY", keys: [[0, g(29.95, 55.5)], [E.fronts, g(29.95, 55.5)], [E.surr, g(29.7, 55.17)]], on: E.fronts - 0.5, off: 331, sc: 0.9 },
  { id: "39a", side: "SU", ech: "XXXX", type: "inf", name: "39th ARMY", keys: [[0, g(30.55, 54.95)], [E.fronts, g(30.55, 54.95)], [E.surr, g(30.05, 54.97)]], on: E.fronts - 0.3, off: 331, sc: 0.9 },
  // Orsha
  { id: "11g", side: "SU", ech: "XXXX", type: "inf", name: "11th GUARDS ARMY", keys: [[0, g(31.15, 54.66)], [348, g(31.15, 54.66)], [E.orsha + 1, g(30.6, 54.6)]], on: E.depth + 1, off: 359.3, sc: 0.9 },
  { id: "5gta", side: "SU", ech: "XXXX", type: "pz", name: "5th GDS TANK ARMY", cmd: "ROTMISTROV", keys: [[0, g(30.75, 54.92)], [E.berez, g(30.75, 54.92)], [E.berez + 4, g(28.85, 54.38)]], on: E.berez - 0.5, off: 359.3, sc: 0.9 },
  { id: "o4", side: "DE", ech: "XXXX", type: "inf", name: "4th ARMY", keys: [[0, g(30.15, 54.2)]], on: E.hwy + 1, off: 359.3, sc: 0.9 },
  // Mogilev
  { id: "m4", side: "DE", ech: "XXXX", type: "hq", name: "4th ARMY", cmd: "TIPPELSKIRCH", keys: [[0, g(30.05, 54.15)]], on: E.a4, off: 413, sc: 0.9 },
  { id: "39pz", side: "DE", ech: "XXX", type: "pz", name: "XXXIX PANZER CORPS", keys: [[0, g(30.68, 53.86)], [E.anyway, g(30.68, 53.86)], [E.anyway + 1.5, g(30.5, 53.88)], [E.back, g(30.5, 53.88)], [E.back + 1.5, g(30.62, 53.87)], [E.hitler + 1, g(30.62, 53.87)], [413, g(30.4, 53.95)], [E.reach, g(28.8, 53.82)]], on: E.pz39, off: 435.6, sc: 0.9 },
  { id: "12ak", side: "DE", ech: "XXX", type: "inf", name: "XII CORPS", keys: [[0, g(30.7, 54.18)], [E.hitler + 1, g(30.7, 54.18)], [413, g(30.45, 54.18)], [E.reach, g(28.85, 54.05)]], on: E.a4 + 0.6, off: 435.6, sc: 0.9 },
  { id: "49a", side: "SU", ech: "XXXX", type: "inf", name: "49th ARMY", keys: [[0, g(31.12, 53.9)], [E.cross - 2, g(31.12, 53.9)], [410.7, g(30.75, 53.92)], [413, g(30.45, 53.92)]], on: E.a49 - 0.5, off: 413.5, sc: 0.9 },
];
const uPos = (u: U, t: number) => keyed(u.keys, t, mixP);

const FORTS = ["Vitebsk", "Orsha", "Mogilev", "Bobruisk", "Minsk"];

const DATES: [number, string, string][] = [
  [0, "22 JUNE 1944", "BELARUS"], [35, "SUMMER 1944", "THE EASTERN FRONT"], [75.3, "SPRING 1944", "ARMY GROUP CENTRE"], [113, "MAY–JUNE 1944", "THE DECEPTION"],
  [145, "JUNE 1944", "THE WARNINGS"], [181, "JUNE 1944", "THE ODDS"], [206.5, "JUNE 1944", "THE PLAN"], [246.5, "19–20 JUNE 1944", "THE RAIL WAR"], [256, "21–22 JUNE 1944", "THE ASSAULT"],
  [275, "23–24 JUNE 1944", "VITEBSK"], [E.late, "25–27 JUNE 1944", "VITEBSK"], [331, "23–26 JUNE 1944", "ORSHA"], [E.berez, "28 JUNE 1944", "THE BEREZINA"],
  [359.3, "23–25 JUNE 1944", "MOGILEV"], [E.hitler, "26 JUNE 1944", "MOGILEV"], [410.7, "27–28 JUNE 1944", "MOGILEV"], [413, "28 JUNE – 2 JULY 1944", "THE BEREZINA"],
];
const BEATS: [number, number, string, string][] = [
  [E.losses + 0.4, E.trap_set - 0.5, "22 JUNE – 4 JULY 1944", "25 DIVISIONS · ~300,000 MEN LOST"],
  [E.moved + 0.4, E.sectors + 0.3, "MOVED SOUTH", "⅓ OF ITS ARTILLERY · 88% OF ITS TANKS"],
  [E.forts + 0.3, E.jordan - 0.3, "HITLER'S ORDER", "FESTE PLÄTZE: HOLD AT ALL COSTS"],
  [E.mask, E.tankarmies - 0.3, "SOVIET METHOD", "MASKIROVKA: DECEPTION ON A STRATEGIC SCALE"],
  [E.tankarmies + 1, 128.6, "LEFT IN PLAIN SIGHT", "FOUR SOVIET TANK ARMIES IN THE SOUTH"],
  [E.bluff + 0.3, 144.3, "THE PLAN", "A DOUBLE BLUFF"],
  [E.warn14, E.air19 - 0.3, "14 JUNE", "WARNING: ATTACK ON BOTH WINGS"],
  [E.air19, E.noreason - 0.3, "19 JUNE", "4,500 OF 11,000 SOVIET AIRCRAFT FACE ARMY GROUP CENTRE"],
  [E.noreason, E.undetected - 0.2, "GERMAN HIGH COMMAND", "NO CHANGE OF PLAN"],
  [E.undetected + 0.3, 178.5, "SOVIET STRATEGIC RESERVES", "NEVER DETECTED"],
  [E.name, E.odds - 0.3, "THE NAME", "PYOTR BAGRATION (1765–1812)"],
  [E.deep, E.pinc - 0.3, "SOVIET DOCTRINE", "DEEP BATTLE"],
  [E.pinc, 232.2, "THE PLAN FOR BELARUS", "TWO PINCERS · HOLD THE CENTRE"],
  [E.rail - 4, E.trains + 4, "FROM 19 JUNE", "THE RAIL WAR"],
  [E.probe, E.dawn - 0.3, "NIGHT OF 21–22 JUNE", "PROBES AND BOMBING"],
  [E.dawn, 274.0, "22 JUNE 1944", "THREE YEARS AFTER BARBAROSSA"],
  [E.surr, 294.3, "24 JUNE", "VITEBSK IS SURROUNDED"],
  [E.late, E.bo - 0.3, "TOO LATE", "BREAKOUT ORDERED · HEAVY GUNS ABANDONED"],
  [E.bo, 315.0, "26 JUNE", "THE BREAKOUT HITS SOVIET ROADBLOCKS"],
  [323.5, 330.5, "VITEBSK", "LIII CORPS · ALMOST 30,000 MEN · DESTROYED"],
  [E.depth + 0.3, 341.2, "THE MOSCOW–MINSK HIGHWAY", "DEFENCES IN DEPTH"],
  [E.orsha + 0.1, E.berez - 0.2, "26 JUNE", "ORSHA FALLS"],
  [E.berez, 354.7, "28 JUNE", "SOVIET TANKS ON THE BEREZINA"],
  [E.task, E.tipp - 0.3, "SOVIET TASK", "HOLD THE 4th ARMY IN PLACE"],
  [E.tipp, E.hitler - 0.3, "25 JUNE", "WITHDRAWAL REFUSED"],
  [E.hitler, 402.7, "26 JUNE", "RETREAT TO THE BEREZINA ALLOWED"],
  [411.0, 412.8, "27–28 JUNE", "MOGILEV FALLS"],
  [E.reach, E.trap - 0.3, "30 JUNE – 2 JULY", "THE 4th ARMY CROSSES THE BEREZINA"],
  [E.trap, E.jaw - 0.3, "", "RETREATING INTO A TRAP"],
  [E.jaw + 0.3, 435.3, "SOUTH", "THE SECOND JAW: BOBRUISK"],
];
const rnd = (s: string) => random(s);
const ARTY = Array.from({ length: 40 }, (_, i) => ({ u: rnd(`p1a${i}`), d: rnd(`p1d${i}`) * 3.0 }));
const RAILHITS = Array.from({ length: 22 }, (_, i) => ({ r: Math.floor(rnd(`rr${i}`) * 1000), u: rnd(`ru${i}`), d: rnd(`rd${i}`) * 3.5 }));
const flash = (p: P, q: number, k: number, s = 1) => <g><circle cx={p[0]} cy={p[1]} r={((8 + 26 * q) / k) * s} fill="none" stroke="#ffd27a" strokeWidth={3 / k} opacity={1 - q} /><circle cx={p[0]} cy={p[1]} r={((10 * (1 - q)) / k) * s} fill="#fff1c4" opacity={1 - q} /></g>;
const Xm = ({ p, k, o }: { p: P; k: number; o: number }) => <path d={`M${p[0] - 18 / k},${p[1] - 18 / k}L${p[0] + 18 / k},${p[1] + 18 / k}M${p[0] + 18 / k},${p[1] - 18 / k}L${p[0] - 18 / k},${p[1] + 18 / k}`} stroke={RED} strokeWidth={7 / k} opacity={o} />;

const Still: React.FC<{ id: string }> = ({ id }) => (
  <AbsoluteFill style={{ background: "#111" }}>
    <Img src={staticFile(`stills/bagration/${id}.jpg`)} style={{ position: "absolute", width: 1920, height: 1080 }} />
    {id !== "P1-01" && <div style={{ position: "absolute", right: 28, bottom: 22, padding: "4px 10px", background: "rgba(10,12,14,0.6)", fontFamily: F.type, fontSize: 15, letterSpacing: 2, color: "rgba(232,225,207,0.85)" }}>AI ILLUSTRATION</div>}
  </AbsoluteFill>
);

const on = (t: number, a: number, b: number, f = 0.6) => cl(t, a, f) * (1 - cl(t, b - f, f));

export const Part1: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const SEGS = TL.segments as { t0: number; t1: number; kind: string; id: string }[];
  const seg = SEGS.find((s) => t >= s.t0 && t < s.t1) ?? SEGS[SEGS.length - 1];
  const cam = keyed(CAM, t, mixCam);
  const z = cam.z, k = z < 1 ? z : Math.max(1, z * 0.82);
  const wide = 1 - clamp01((z - 0.55) / 0.25);
  const dip = Math.max(0, ...TL.dips.map((b: number) => cl(t, b - 0.8, 0.7) * (1 - cl(t, b + 0.1, 0.7))));
  const d = [...DATES].reverse().find(([a]) => t >= a)!;
  const frontDraw = io(cl(t, 13.9, 3.5));
  const frontO = t < E.broken ? 1 : 1 - 0.55 * cl(t, E.broken, 3);
  const night = t > 255 && t < 268 ? cl(t, 255.3, 1.2) * (1 - cl(t, E.dawn, 3.5)) : 0;
  const vitRing = io(cl(t, E.surr, 1.4));
  const vc = g(30.05, 55.18);
  const mogFall = cl(t, 411, 1);
  return (
    <AbsoluteFill style={{ background: "#0c1014" }}>
      {seg.kind === "map" && (
        <AbsoluteFill>
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <defs>
              <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)"><path d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,64 L28,97" fill="none" stroke="rgba(60,50,20,0.10)" strokeWidth="1.5" /></pattern>
              <pattern id="trap" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="rgba(200,38,28,0.45)" /></pattern>
              <radialGradient id="land" cx="50%" cy="45%" r="75%"><stop offset="0%" stopColor="#cfc79c" /><stop offset="100%" stopColor="#a89f72" /></radialGradient>
            </defs>
            <g transform={`translate(960,540) scale(${z}) translate(${-cam.c[0]},${-cam.c[1]})`}>
              <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#land)" />
              <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#hex)" opacity={0.6} />
              {/* batas negara modern (hanya saat jauh) */}
              {wide > 0 && COUNTRIES.map((c, i) => c.r.map((r, j) => { const pts: P[] = []; for (let q = 0; q < r.length; q += 2) pts.push(pj([r[q], r[q + 1]])); return <path key={`${i}-${j}`} d={path(pts) + "Z"} fill="none" stroke="rgba(60,50,30,0.45)" strokeWidth={1.3 / z} opacity={wide} />; }))}
              {wide > 0 && <g opacity={wide}>
                {[["BELARUS", 27.9, 53.0], ["UKRAINE", 29.5, 49.7], ["POLAND", 22.6, 52.3], ["RUSSIA", 34.0, 55.9], ["LITHUANIA", 24.0, 55.5], ["LATVIA", 25.5, 56.9]].map(([n, lo, la]) => { const [x, y] = pj([lo as number, la as number]); return <text key={n as string} x={x} y={y} textAnchor="middle" fontFamily={F.type} fontSize={18 / z} letterSpacing={6 / z} fill="rgba(60,50,30,0.5)">{n}</text>; })}
                <text x={g(25.0, 49.2)[0]} y={g(25.0, 49.2)[1]} textAnchor="middle" fontFamily={F.type} fontSize={14 / z} fill="rgba(60,50,30,0.5)">MODERN BORDERS</text>
              </g>}
              {/* wilayah Soviet (sebelum 22 Juni) */}
              <path d={path(SOV) + "Z"} fill={RED} opacity={0.13 * frontDraw} />
              {/* Army Group Centre disorot */}
              <path d={smooth(AGC, true)} fill={`rgba(42,48,56,${0.16 * on(t, E.between, E.strong + 5, 0.8)})`} stroke={DE} strokeWidth={3 / k} strokeDasharray={`${12 / k} ${8 / k}`} opacity={on(t, E.between, 67.2, 0.8)} />
              {/* sungai */}
              {base.rivers.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke="#4f7fae" strokeWidth={(MAJOR.has(r.name) ? 3.4 : 1.8) / k} strokeLinejoin="round" opacity={MAJOR.has(r.name) ? 0.9 : 0.6} />)}
              <g opacity={1 - wide}>
                {[["W. Dvina", 29.45, 55.33], ["Dnieper", 30.5, 54.12], ["Berezina", 28.62, 53.55], ["Pripyat", 27.6, 52.05], ["Drut", 29.6, 53.75], ["Sozh", 31.2, 53.2]].map(([n, lo, la]) => { const [x, y] = pj([lo as number, la as number]); return <text key={n as string} x={x} y={y} fontFamily={F.ui} fontStyle="italic" fontWeight={600} fontSize={20 / k} fill="#3a6a99">{n}</text>; })}
              </g>
              {/* rel kereta (Rail War) */}
              {t > 245 && t < 257 && <g opacity={on(t, 246.6, 256.5, 0.8)}>
                {base.rail.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke={t > E.trains ? "#7a1610" : "#2a2418"} strokeWidth={2.2 / k} strokeDasharray={t > E.trains ? `${6 / k} ${6 / k}` : `${14 / k} ${3 / k}`} opacity={0.85} />)}
                {RAILHITS.map((h, i) => { const r = base.rail[h.r % base.rail.length]; const p = along(r.pts.map(pj), h.u); const q = cl(t, E.rail + 1.2 + h.d, 0.9); return q > 0 && q < 1 ? <g key={i}>{flash(p, q, k)}</g> : null; })}
                {RAILHITS.map((h, i) => { const r = base.rail[h.r % base.rail.length]; const p = along(r.pts.map(pj), h.u); return t > E.enough + h.d * 0.3 ? <Xm key={`x${i}`} p={p} k={k * 1.6} o={0.8} /> : null; })}
              </g>}
              {/* jalan raya Moskow–Minsk */}
              {t > E.hwy - 1 && t < 359.3 && <g opacity={on(t, E.hwy, 359.3, 0.8)}>
                <path d={path(HWY)} fill="none" stroke="#5a4a30" strokeWidth={7 / k} strokeDasharray={`${len(HWY) * io(cl(t, E.hwy, 3))} ${len(HWY) * 2}`} opacity={0.75} />
                <text x={g(31.0, 54.47)[0]} y={g(31.0, 54.47)[1]} fontFamily={F.type} fontSize={17 / k} letterSpacing={2 / k} fill="#4a3a20" opacity={cl(t, E.hwy + 2, 0.6)}>MOSCOW–MINSK HIGHWAY</text>
                {[30.62, 30.74, 30.86].map((lo, i) => <path key={lo} d={path([g(lo, 54.38), g(lo + 0.03, 54.52), g(lo, 54.68)])} fill="none" stroke={DE} strokeWidth={4 / k} strokeDasharray={`${4 / k} ${7 / k}`} opacity={cl(t, E.depth + 0.3 + i * 0.4, 0.5) * (1 - 0.6 * cl(t, E.orsha, 1))} />)}
              </g>}
              {/* kota */}
              {Object.entries(TOWNS).map(([n, [lo, la, lvl]]) => {
                const vis = lvl === 1 ? 1 : lvl === 2 ? (n === "L'vov" || n === "Kiev" ? wide : 1) : clamp01((z - 1.1) / 0.4);
                if (vis <= 0.01) return null;
                const [x, y] = pj([lo, la]); const ks = k, big = lvl === 1; const fi = FORTS.indexOf(n);
                const fo = fi >= 0 ? on(t, E.forts + fi * 1.35, 104, 0.4) : 0;
                return (
                  <g key={n} opacity={vis}>
                    {fo > 0 && <><circle cx={x} cy={y} r={(22 + 4 * Math.sin(t * 4)) / ks} fill="none" stroke={DE} strokeWidth={4 / ks} opacity={fo} /><text x={x} y={y + 44 / ks} textAnchor="middle" fontFamily={F.type} fontSize={14 / ks} letterSpacing={2 / ks} fill="#1d2228" opacity={fo}>FESTER PLATZ</text></>}
                    <rect x={x - (big ? 8 : 5) / ks} y={y - (big ? 8 : 5) / ks} width={(big ? 16 : 10) / ks} height={(big ? 16 : 10) / ks} fill="#2a2418" />
                    <text x={x + 12 / ks} y={y - 10 / ks} fontFamily={F.ui} fontWeight={700} fontSize={(big ? 30 : lvl === 2 ? 22 : 18) / ks} fill="#2a2418" stroke="rgba(239,232,205,0.9)" strokeWidth={5 / ks} paintOrder="stroke">{n}</text>
                  </g>);
              })}
              {/* label kelompok tentara */}
              <g opacity={on(t, E.south - 0.5, 67.2) + on(t, 113, 144.6)}>
                {[["ARMY GROUP NORTH", 26.4, 56.6], ["ARMY GROUP CENTRE", 26.5, 54.25], ["ARMY GROUP NORTH UKRAINE", 22.9, 51.55]].map(([n, lo, la]) => { const [x, y] = pj([lo as number, la as number]); return <text key={n as string} x={x} y={y} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={26 / k} fill="#1d2228" stroke="rgba(239,232,205,0.85)" strokeWidth={5 / k} paintOrder="stroke">{n}</text>; })}
                <text x={g(26.5, 54.0)[0]} y={g(26.5, 54.0)[1]} textAnchor="middle" fontFamily={F.type} fontSize={16 / k} fill="#1d2228" opacity={cl(t, E.between, 0.6)}>FIELD MARSHAL BUSCH</text>
              </g>
              {/* tonjolan menghadap Moskow */}
              {t > E.between && t < 67.2 && <Arrow pts={[g(31.2, 54.5), g(33.2, 54.9), g(35.0, 55.3)]} a={E.between + 2} b={E.between + 4.5} t={t} k={k} color="#5a5040" dash width={9} />}
              {t > E.between + 4 && t < 67.2 && <text x={g(34.5, 55.6)[0]} y={g(34.5, 55.6)[1]} textAnchor="middle" fontFamily={F.type} fontSize={18 / k} letterSpacing={3 / k} fill="#4a3a20" opacity={cl(t, E.between + 4, 0.6)}>TO MOSCOW</text>}
              {/* kekuatan dipindah ke selatan */}
              {t > E.moved && t < 67.2 && <Arrow pts={[g(28.6, 53.4), g(27.3, 52.2), g(25.7, 51.1)]} a={E.moved + 0.6} b={E.moved + 3} t={t} k={k} color={DE} dash width={11} />}
              {/* garis depan 22 Juni */}
              <path d={path(FRONT)} fill="none" stroke={RED} strokeWidth={5 / k} strokeDasharray={`${len(FRONT) * frontDraw} ${len(FRONT) * 2}`} opacity={0.85 * frontO} />
              <path d={path(FRONT)} fill="none" stroke={DE} strokeWidth={2 / k} strokeDasharray={`${len(FRONT) * frontDraw} ${len(FRONT) * 2}`} transform={`translate(${-5 / k},0)`} opacity={0.6 * frontO} />
              {/* pembuka: kilatan artileri sepanjang front */}
              {[15.0, E.dawn].map((t0, gi) => ARTY.map((a, i) => { const q = cl(t, t0 + a.d * (gi ? 1.2 : 1), 0.8); if (q <= 0 || q >= 1) return null; const p = along(FRONT.slice(0, 36), 0.02 + a.u * 0.96); return <g key={`${gi}-${i}`}>{flash([p[0] - 14 / k, p[1]], q, k)}</g>; }))}
              {/* OKH memperkirakan serangan di selatan */}
              {t > 113 && t < 128.9 && <g opacity={on(t, 113.5, 128.9)}>
                <Arrow pts={[g(29.8, 49.5), g(27.8, 49.3), g(25.7, 49.4)]} a={113.8} b={116} t={t} k={k} dash width={11} />
                <text x={g(27.8, 48.9)[0]} y={g(27.8, 48.9)[1]} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={56 / k} fill={RED} opacity={cl(t, 115.5, 0.5)}>?</text>
                <text x={g(28.0, 51.4)[0]} y={g(28.0, 51.4)[1]} textAnchor="middle" fontFamily={F.type} fontSize={17 / k} letterSpacing={2 / k} fill="#1d2228" opacity={cl(t, 114.5, 0.5)}>EXPECTED BY GERMAN HIGH COMMAND</text>
              </g>}
              {/* double bluff */}
              {t > E.bluff && t < 144.6 && <g opacity={1 - cl(t, 143.8, 0.7)}>
                <Arrow pts={[g(31.6, 54.4), g(30.6, 54.3), g(29.6, 54.2)]} a={E.centre} b={E.centre + 1.8} t={t} k={k} width={13} />
                <Arrow pts={[g(24.2, 50.8), g(25.6, 52.1), g(27.4, 53.0)]} a={E.rush} b={E.rush + 1.8} t={t} k={k} color={DE} dash width={11} />
                <Arrow pts={[g(27.0, 50.1), g(25.9, 50.0), g(24.6, 49.9)]} a={E.south2} b={E.south2 + 1.8} t={t} k={k} width={13} />
                {[[E.centre, 31.0, 54.75, "1"], [E.rush, 24.6, 52.0, "2"], [E.south2, 26.0, 49.55, "3"]].map(([a, lo, la, s]) => { const p = g(lo as number, la as number); return <g key={s as string} opacity={cl(t, a as number, 0.4)}><circle cx={p[0]} cy={p[1]} r={26 / k} fill="#14181d" /><text x={p[0]} y={p[1] + 10 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={30 / k} fill={C.chalk}>{s as string}</text></g>; })}
              </g>}
              {/* penumpukan Soviet yang terlihat */}
              {t > E.buildup && t < E.name + 1 && <g opacity={on(t, E.buildup, E.name + 1)}>
                {[[30.9, 55.6], [31.0, 55.0], [31.3, 54.6], [31.35, 54.2], [31.3, 53.8], [30.8, 53.35], [30.5, 52.95], [30.1, 52.5]].map(([lo, la], i) => { const p = g(lo, la); return <rect key={i} x={p[0] - 30 / k} y={p[1] - 18 / k} width={60 / k} height={36 / k} fill="rgba(200,38,28,0.35)" stroke={RED} strokeWidth={2 / k} opacity={cl(t, E.buildup + i * 0.25, 0.4)} />; })}
                {[[30.1, 55.6], [29.6, 52.8]].map(([lo, la], i) => { const p = g(lo, la); return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={64 / k} fill={RED} opacity={on(t, E.warn14 + 0.5, E.air19)}>!</text>; })}
              </g>}
              {/* skema dua capit */}
              {t > E.brk && t < 234.5 && <g opacity={1 - cl(t, 233.6, 0.8)}>
                {[0.15, 0.35, 0.55, 0.78].map((u, i) => { const p = along(FRONT.slice(0, 36), u); return <g key={i} opacity={cl(t, E.brk + i * 0.2, 0.3)}><Xm p={[p[0] - 10 / k, p[1]]} k={k} o={1 - cl(t, E.exploit + 3, 1) * 0.6} /></g>; })}
                <Arrow pts={[g(30.4, 55.75), g(29.9, 55.4), g(29.75, 55.1)]} a={E.pincV} b={E.pincV + 1.6} t={t} k={k} dash width={10} />
                <Arrow pts={[g(30.85, 54.85), g(30.2, 54.9), g(29.85, 55.05)]} a={E.pincV + 0.4} b={E.pincV + 2} t={t} k={k} dash width={10} />
                <Arrow pts={[g(30.15, 53.45), g(29.7, 53.35), g(29.3, 53.25)]} a={E.pincB} b={E.pincB + 1.6} t={t} k={k} dash width={10} />
                <Arrow pts={[g(29.7, 52.65), g(29.2, 52.85), g(29.15, 53.05)]} a={E.pincB + 0.4} b={E.pincB + 2} t={t} k={k} dash width={10} />
                <Arrow pts={[g(31.4, 53.95), g(31.0, 53.95)]} a={E.hold} b={E.hold + 1} t={t} k={k} width={16} />
                <text x={g(31.2, 54.12)[0]} y={g(31.2, 54.12)[1]} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={22 / k} fill="#7a1610" opacity={cl(t, E.hold + 0.6, 0.5)} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">HOLD</text>
              </g>}
              {/* 21–22 Juni: patroli, bom, lalu front jebol */}
              {t > 256 && t < 276 && <g>
                {[0.08, 0.2, 0.33, 0.45, 0.58, 0.7, 0.82, 0.93].map((u, i) => { const p = along(FRONT.slice(0, 36), u); return <Arrow key={i} pts={[[p[0] + 30 / k, p[1]], [p[0] - 30 / k, p[1] + 4 / k]]} a={E.probe + 0.3 + i * 0.25} b={E.probe + 1.2 + i * 0.25} t={t} k={k} width={6} upto={1 - cl(t, E.probe + 3 + i * 0.2, 1)} />; })}
                {Array.from({ length: 14 }, (_, i) => { const p = g(27.8 + rnd(`bx${i}`) * 2.2, 52.9 + rnd(`by${i}`) * 2.4); const q = cl(t, E.probe + 3 + rnd(`bt${i}`) * 4, 0.9); return q > 0 && q < 1 ? <g key={i}>{flash(p, q, k, 1.2)}</g> : null; })}
                {[0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.8, 0.9].map((u, i) => { const p = along(FRONT.slice(0, 36), u); return <Arrow key={`b${i}`} pts={[[p[0] + 30 / k, p[1]], [p[0] - 70 / k, p[1] + 8 / k]]} a={E.broken + i * 0.15} b={E.broken + 1.5 + i * 0.15} t={t} k={k} width={9} />; })}
              </g>}
              {/* VITEBSK */}
              {t > 274 && t < 331 && <g opacity={on(t, 274.5, 331, 0.8)}>
                <Arrow pts={[g(29.95, 55.47), g(29.68, 55.3), g(29.75, 55.07)]} a={E.fronts} b={E.surr} t={t} k={k} />
                <Arrow pts={[g(30.6, 54.97), g(30.25, 54.93), g(29.82, 55.04)]} a={E.fronts + 0.4} b={E.surr} t={t} k={k} />
                {t > E.surr && <g>
                  <ellipse cx={vc[0]} cy={vc[1]} rx={(1.15 - 0.15 * vitRing) * 56} ry={(1.15 - 0.15 * vitRing) * 38} fill={`rgba(42,48,56,${0.15 * vitRing})`} stroke={RED} strokeWidth={7 / k} strokeDasharray={`${3 / k} ${9 / k}`} strokeLinecap="round" opacity={vitRing} />
                </g>}
                <Arrow pts={[g(30.05, 55.17), g(29.88, 55.1), g(29.72, 55.05)]} a={E.bo} b={E.bo + 2.5} t={t} k={k} color={DE} width={11} />
                {[[29.86, 55.11], [29.73, 55.05]].map(([lo, la], i) => <Xm key={i} p={g(lo, la)} k={k} o={cl(t, E.bo + 2 + i * 0.6, 0.3)} />)}
                <text x={g(29.55, 54.97)[0]} y={g(29.55, 54.97)[1]} fontFamily={F.type} fontSize={15 / k} letterSpacing={2 / k} fill="#1d2228" opacity={cl(t, E.lw4, 0.6) * (1 - cl(t, 330, 0.8))}>FORESTS WEST OF VITEBSK</text>
              </g>}
              {/* ORSHA */}
              {t > 331 && t < 359.3 && <g>
                <Arrow pts={[g(31.15, 54.62), g(30.85, 54.58), g(30.5, 54.53)]} a={347.8} b={E.orsha + 0.5} t={t} k={k} />
                <Arrow pts={[g(30.75, 54.88), g(30.25, 54.72), g(29.7, 54.52), g(29.15, 54.4), g(28.6, 54.27)]} a={E.berez} b={E.berez + 4} t={t} k={k} />
              </g>}
              {/* MOGILEV */}
              {t > 359.3 && t < 436 && <g>
                <path d={path([g(30.9, 54.35), g(30.85, 54.05), g(30.88, 53.75), g(30.8, 53.5)])} fill="none" stroke={DE} strokeWidth={4 / k} strokeDasharray={`${12 / k} ${7 / k}`} opacity={cl(t, E.a4, 1) * (1 - cl(t, E.anyway, 1))} />
                {t < 413 && <Arrow pts={[g(31.12, 53.9), g(30.95, 53.89)]} a={E.a49} b={E.a49 + 1.2} t={t} k={k} upto={t < E.a49 + 2 ? 1 : 0.7} width={13} />}
                <Xm p={g(30.93, 53.89)} k={k} o={cl(t, E.a49 + 1.5, 0.3) * (1 - cl(t, E.task, 0.6))} />
                <Arrow pts={[g(30.68, 53.86), g(30.48, 53.88)]} a={E.anyway} b={E.anyway + 1.3} t={t} k={k} color={DE} width={9} upto={1 - cl(t, E.back, 1)} />
                {t < 416 && <g opacity={1 - cl(t, 414.5, 1.2)}><Arrow pts={[g(30.75, 53.92), g(30.52, 53.92), g(30.36, 53.9)]} a={410.8} b={412.6} t={t} k={k} /></g>}
                <g opacity={mogFall}><circle cx={T("Mogilev")[0]} cy={T("Mogilev")[1]} r={26 / k} fill="none" stroke={RED} strokeWidth={5 / k} /></g>
              </g>}
              {/* KE BEREZINA: mundur ke dalam perangkap */}
              {t > 412.5 && <g>
                <Arrow pts={[g(30.25, 53.95), g(29.6, 53.88), g(28.85, 53.83)]} a={E.roads} b={E.reach} t={t} k={k} color={DE} width={12} />
                <Arrow pts={[g(30.35, 54.2), g(29.7, 54.1), g(28.95, 54.03)]} a={E.roads + 0.5} b={E.reach + 0.5} t={t} k={k} color={DE} width={12} />
                {Array.from({ length: 10 }, (_, i) => { const p = along(i % 2 ? [g(30.25, 53.95), g(29.7, 53.9), g(29.05, 53.85)] : [g(30.35, 54.2), g(29.8, 54.1), g(29.15, 54.0)], 0.15 + rnd(`ra${i}`) * 0.7); const q = cl(t, E.roads + 0.5 + i * 0.55, 0.9); return q > 0 && q < 1 ? <g key={i}>{flash(p, q, k, 1.3)}</g> : null; })}
                <Arrow pts={[g(29.75, 54.4), g(29.45, 54.2), g(29.3, 54.05)]} a={E.cut} b={E.cut + 1.8} t={t} k={k} width={11} />
                <Arrow pts={[g(28.6, 54.27), g(28.1, 54.08), g(27.75, 53.97)]} a={E.trap} b={E.trap + 2} t={t} k={k} dash width={11} />
                <Arrow pts={[g(29.2, 53.15), g(28.4, 53.45), g(27.8, 53.8)]} a={E.jaw + 0.3} b={E.jaw + 2.6} t={t} k={k} dash width={11} />
                <circle cx={T("Bobruisk")[0]} cy={T("Bobruisk")[1]} r={(26 + 8 * Math.sin(t * 5)) / k} fill="none" stroke={RED} strokeWidth={4 / k} opacity={cl(t, E.jaw, 0.5)} />
              </g>}
              {/* unit */}
              {UNITS.map((u) => { if (t < u.on || t > u.off + 0.6) return null; const o = rv(t, u.on, 0.5) * (1 - cl(t, u.off - 0.6, 0.6)) * (u.dash ? 0.55 : 1) * (u.id === "53ak" || u.id === "206" || u.id === "4lw" ? 1 - 0.7 * cl(t, E.gone, 2) : 1); return <Counter key={u.id} p={uPos(u, t)} side={u.side} ech={u.ech} type={u.type} name={u.name} cmd={u.cmd} k={k} opacity={o} trapped={u.trap ? cl(t, u.trap, 0.6) : 0} scale={u.sc ?? 1} />; })}
              {t > E.undetected && t < E.name + 1 && (() => { const p = g(32.6, 54.55); return <text x={p[0]} y={p[1] - 48 / k} textAnchor="middle" fontFamily={F.type} fontSize={15 / k} letterSpacing={2 / k} fill="#7a1610" opacity={on(t, E.undetected + 0.8, E.name + 1)}>UNDETECTED</text>; })()}
              {t > E.d206 && t < E.gone + 4 && (() => { const p = g(30.24, 55.13); return <text x={p[0]} y={p[1] + 56 / k} textAnchor="middle" fontFamily={F.type} fontSize={14 / k} letterSpacing={1.5 / k} fill="#1d2228" stroke="rgba(244,239,228,0.85)" strokeWidth={3 / k} paintOrder="stroke" opacity={rv(t, E.d206 + 0.5)}>TO THE LAST MAN</text>; })()}
            </g>
            {/* malam */}
            {night > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#0b1630" opacity={0.55 * night} />}
          </svg>
          {/* HUD */}
          <div style={{ position: "absolute", left: 48, top: 40, padding: "16px 24px", background: "rgba(14,20,26,0.82)", borderLeft: `6px solid ${C.gold}` }}>
            <div style={{ fontFamily: F.type, fontSize: 20, letterSpacing: 6, color: C.gold }}>OPERATION BAGRATION · {d[2]}</div>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 48, color: C.chalk, marginTop: 2 }}>{d[1]}</div>
          </div>
          {BEATS.map(([a, b, kick, head]) => { const o = cl(t, a, 0.35) * (1 - cl(t, b - 0.35, 0.35)); if (o <= 0) return null; return (
            <div key={a} style={{ position: "absolute", left: 48, bottom: 60, maxWidth: 1250, padding: "18px 26px", background: "rgba(14,20,26,0.86)", borderLeft: "6px solid #c8261c", opacity: o, transform: `translateY(${(1 - rv(t, a, 0.5)) * 14}px)` }}>
              {kick && <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>}
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 46, letterSpacing: 1.5, lineHeight: 1.05, color: C.chalk, marginTop: 6 }}>{head}</div>
            </div>); })}
          {/* kutipan Jordan */}
          {(() => { const o = on(t, E.jquote, 103.6, 0.5); if (o <= 0) return null; return (
            <div style={{ position: "absolute", right: 60, top: 190, width: 640, padding: "24px 30px", background: "rgba(14,20,26,0.88)", borderLeft: `6px solid ${C.gold}`, opacity: o }}>
              <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 36, lineHeight: 1.18, color: C.chalk }}>“…the Army will either have to go over to a mobile defence or see its front smashed.”</div>
              <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 3, color: "#d9d2c0", marginTop: 14 }}>GEN. HANS JORDAN, 9th ARMY, 1944</div>
            </div>); })()}
          {/* panel perbandingan kekuatan */}
          {(() => { const o = on(t, E.odds, E.deep, 0.5); if (o <= 0) return null; const row = (lbl: string, su: string, de: string, i: number) => (
            <div key={lbl} style={{ display: "flex", alignItems: "baseline", marginTop: 14, opacity: rv(t, E.odds + 0.4 + i * 0.5) }}>
              <div style={{ width: 230, fontFamily: F.type, fontSize: 19, letterSpacing: 3, color: "#d9d2c0" }}>{lbl}</div>
              <div style={{ width: 230, fontFamily: F.ui, fontWeight: 700, fontSize: 44, color: "#ff7a63" }}>{su}</div>
              <div style={{ width: 200, fontFamily: F.ui, fontWeight: 700, fontSize: 44, color: C.chalk, opacity: cl(t, E.facing + i * 0.4, 0.4) }}>{de}</div>
            </div>);
            return (
              <div style={{ position: "absolute", left: 48, top: 190, padding: "26px 32px", background: "rgba(14,20,26,0.9)", borderLeft: "6px solid #c8261c", opacity: o }}>
                <div style={{ display: "flex", fontFamily: F.type, fontSize: 18, letterSpacing: 4 }}><div style={{ width: 230 }} /><div style={{ width: 230, color: "#ff7a63" }}>SOVIET</div><div style={{ width: 200, color: C.chalk, opacity: cl(t, E.facing, 0.4) }}>GERMAN (AGC)</div></div>
                {row("MEN", "1,670,000", "486,000*", 0)}{row("TANKS & GUNS", "5,818", "495", 1)}{row("AIRCRAFT", "7,799", "—", 2)}
                <div style={{ fontFamily: F.type, fontSize: 14, letterSpacing: 2, color: "#a9a290", marginTop: 16, opacity: cl(t, E.facing + 1.5, 0.5) }}>*COMBAT TROOPS · TANKS & ASSAULT GUNS OPERATIONAL</div>
              </div>); })()}
          <div style={{ position: "absolute", right: 28, bottom: 22, padding: "4px 10px", background: "rgba(10,12,14,0.55)", fontFamily: F.type, fontSize: 14, letterSpacing: 2, color: "rgba(232,225,207,0.8)" }}>POSITIONS APPROXIMATE · AFTER PERIOD MAPS</div>
        </AbsoluteFill>
      )}
      {seg.kind === "still" && <Still id={seg.id} />}
      {t < 13.5 && <div style={{ position: "absolute", left: 60, bottom: 60, fontFamily: F.type, fontSize: 26, letterSpacing: 8, color: C.gold, textShadow: "0 2px 10px #000", opacity: rv(t, 1.0, 0.8) * (1 - cl(t, 6.5, 0.8)) }}>BELARUS · 22 JUNE 1944</div>}
      {seg.kind === "title" && <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: rv(t, seg.t0 + 0.3, 1.0) * (1 - cl(t, seg.t1 - 1.0, 0.8)), textAlign: "center" }}>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 12, color: C.gold }}>OPERATION BAGRATION · PART 1</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 150, letterSpacing: 10, color: C.chalk, marginTop: 6 }}>THE TRAP</div>
        </div>
      </AbsoluteFill>}
      {seg.kind === "card" && <AbsoluteFill style={{ background: "#000", justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: rv(t, seg.t0 + 0.5, 1.0) * (1 - cl(t, TL.total - 1.6, 1.4)), textAlign: "center" }}>
          <div style={{ fontFamily: F.type, fontSize: 26, letterSpacing: 10, color: "#a9a290" }}>NEXT</div>
          <div style={{ fontFamily: F.type, fontSize: 30, letterSpacing: 12, color: C.gold, marginTop: 18 }}>OPERATION BAGRATION · PART 2</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, letterSpacing: 6, color: C.chalk, marginTop: 6 }}>THE SOUTHERN JAW</div>
          <div style={{ fontFamily: F.type, fontSize: 34, letterSpacing: 14, color: C.chalk, marginTop: 6 }}>BOBRUISK</div>
        </div>
      </AbsoluteFill>}
      <AbsoluteFill style={{ background: "#000", opacity: dip, pointerEvents: "none" }} />
      <Vignette amount={0.42} />
      <FilmGrain strength={0.14} />
    </AbsoluteFill>
  );
};
