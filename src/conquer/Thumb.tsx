import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import base from "./basemap-theatre.json";
import FR from "../../research/bagration/front-22jun.json";
import { Arrow, Counter, DE, P, RED, makeProj, path, smooth } from "./mapkit";

// COVER / THUMBNAIL Bagration Part 1 "The Trap": vektor dari data peta yang sama dengan videonya (bukan gambar AI).
// Varian A = judul saja; B = judul + angka kerugian (untuk A/B test di Studio).
const pj = makeProj(54.0, 29.0, 270);
const Z = 1.38, CX = 1330, CY = 560, C0: P = pj([28.9, 54.3]);
const g = (lo: number, la: number) => pj([lo, la]);
const gs = (a: number[][]) => a.map((q) => pj(q));
const FRONT = gs(FR.front_22jun);
const AGC = [...gs(FR.front_22jun.slice(0, 37)), g(24.6, 51.8), g(24.6, 53.4), g(25.6, 55.4), g(27.2, 56.2), g(28.4, 56.4)];
const SOVBOX = [g(45, 48.3), g(45, 57.8), g(28.55, 57.8)].map((q) => `L${q[0]},${q[1]}`).join("") + "Z";
const MAJOR = new Set(["Daugava", "Dnipro", "Dnepr", "Byarezina", "Pripyat", "Prypyat", "Neman", "Sozh", "Druts"]);
const k = Math.max(1, Z * 0.82);

const NORTH: P[] = [g(32.0, 55.75), g(30.4, 55.62), g(28.9, 55.15), g(27.9, 54.6), g(27.45, 54.1)];
const SOUTH: P[] = [g(32.0, 52.5), g(30.4, 52.72), g(28.9, 53.05), g(27.9, 53.45), g(27.45, 53.78)];

export const Thumb: React.FC<{ variant: "A" | "B" }> = ({ variant }) => {
  const minsk = g(27.56, 53.9);
  return (
    <AbsoluteFill style={{ background: "#0c1014" }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)"><path d="M28,0 L56,16 L56,48 L28,64 L0,48 L0,16 Z M28,64 L28,97" fill="none" stroke="rgba(60,50,20,0.12)" strokeWidth="1.5" /></pattern>
          <radialGradient id="land" cx="60%" cy="45%" r="80%"><stop offset="0%" stopColor="#d8d0a4" /><stop offset="100%" stopColor="#9d9468" /></radialGradient>
          <pattern id="trap" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="rgba(200,38,28,0.55)" /></pattern>
        </defs>
        <g transform={`translate(${CX},${CY}) scale(${Z}) translate(${-C0[0]},${-C0[1]})`}>
          <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#land)" />
          <rect x={-60000} y={-60000} width={120000} height={120000} fill="url(#hex)" />
          <path d={smooth(FRONT) + SOVBOX} fill={RED} opacity={0.2} />
          <path d={smooth(AGC, true)} fill="rgba(42,48,56,0.2)" />
          {base.rivers.map((r, i) => <path key={i} d={path(r.pts.map(pj))} fill="none" stroke="#4f7fae" strokeWidth={(MAJOR.has(r.name) ? 4.2 : 2) / k} strokeLinejoin="round" opacity={MAJOR.has(r.name) ? 0.95 : 0.55} />)}
          <path d={smooth(FRONT)} fill="none" stroke={RED} strokeWidth={6 / k} strokeLinejoin="round" opacity={0.9} />
          {/* kantong jebakan di sekitar Minsk */}
          <ellipse cx={minsk[0] - 10} cy={minsk[1]} rx={150} ry={118} fill="url(#trap)" opacity={0.7} />
          <ellipse cx={minsk[0] - 10} cy={minsk[1]} rx={150} ry={118} fill="none" stroke={RED} strokeWidth={6 / k} strokeDasharray={`${3 / k} ${9 / k}`} strokeLinecap="round" />
          {/* dua rahang */}
          <Arrow pts={NORTH} a={0} b={1} t={2} k={k} width={34} />
          <Arrow pts={SOUTH} a={0} b={1} t={2} k={k} width={34} />
          <Counter p={g(28.85, 54.38)} side="DE" ech="XXXXX" type="inf" name="ARMY GROUP CENTRE" k={k} scale={2.1} />
          {[["Vitebsk", 30.2, 55.19], ["Bobruisk", 29.23, 53.15], ["Minsk", 27.56, 53.9], ["Orsha", 30.42, 54.51], ["Mogilev", 30.33, 53.9]].map(([n, lo, la]) => { const [x, y] = g(lo as number, la as number); return (
            <g key={n as string}><rect x={x - 9 / k} y={y - 9 / k} width={18 / k} height={18 / k} fill="#2a2418" /><text x={x + 14 / k} y={y - 12 / k} fontFamily={F.ui} fontWeight={700} fontSize={34 / k} fill="#2a2418" stroke="rgba(239,232,205,0.92)" strokeWidth={6 / k} paintOrder="stroke">{n}</text></g>); })}
        </g>
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,11,14,0.96) 0%, rgba(8,11,14,0.88) 30%, rgba(8,11,14,0.35) 52%, rgba(8,11,14,0) 66%)" }} />
      <div style={{ position: "absolute", left: 76, top: 92, fontFamily: F.type, fontSize: 38, letterSpacing: 11, color: C.gold, textShadow: "0 2px 10px #000" }}>OPERATION BAGRATION</div>
      <div style={{ position: "absolute", left: 76, top: 150, width: 150, height: 10, background: RED }} />
      <div style={{ position: "absolute", left: 66, top: 215, fontFamily: F.ui, fontWeight: 800, fontSize: 288, lineHeight: 0.9, letterSpacing: 4, color: C.chalk, textShadow: "0 8px 30px rgba(0,0,0,0.9)" }}>THE<br />TRAP</div>
      {variant === "A" ? (
        <div style={{ position: "absolute", left: 76, bottom: 92, fontFamily: F.type, fontSize: 44, letterSpacing: 10, color: "#ff7a63", textShadow: "0 2px 10px #000" }}>BELARUS · JUNE 1944</div>
      ) : (
        <div style={{ position: "absolute", left: 76, bottom: 78 }}>
          <div style={{ fontFamily: F.ui, fontWeight: 800, fontSize: 112, lineHeight: 1, color: "#ff5a44", textShadow: "0 4px 18px #000" }}>−300,000 MEN</div>
          <div style={{ fontFamily: F.type, fontSize: 36, letterSpacing: 8, color: C.chalk, marginTop: 6, textShadow: "0 2px 10px #000" }}>IN TWO WEEKS · 1944</div>
        </div>
      )}
      <Vignette amount={0.38} />
      <FilmGrain strength={0.1} />
    </AbsoluteFill>
  );
};
