import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { RED, cl, io, rv } from "./mapkit";
import EV from "./dio-events.json";

// DIORAMA 2.5D (Bagration Part 2): adegan animasi vektor buatan sendiri, pengganti still AI.
// Aturan gerak (skill motion-design): kamera meluncur menyamping tanpa zoom, easing in-out, parallax 5 lapis,
// tiap adegan punya 3 lapis gerak (primer: pasukan/kendaraan, sekunder: asap/kilatan, ambien: kabut/rumput/grain).
// Tanpa swastika/SS, tanpa wajah tokoh nyata. Waktu tembakan dibagi dengan mixer lewat dio-events.json.

type Pt = [number, number];
const R = (s: string) => random(s);
const ev = (id: string, k: string): number[] => ((EV as unknown as Record<string, Record<string, number[]>>)[id]?.[k]) ?? [];
const sinw = (t: number, f: number, ph = 0) => Math.sin((t * f + ph) * Math.PI * 2);
const since1 = (lt: number, list: number[]): number | undefined => { let m: number | undefined; for (const a of list) { const q = lt - a; if (q >= 0 && (m === undefined || q < m)) m = q; } return m; };
const decay = (lt: number, list: number[], k: number) => list.reduce((s, a) => (lt >= a ? s + Math.exp(-(lt - a) * k) : s), 0);

type Look = { top: string; mid: string; bot: string; far: string; mid2: string; near: string; ground: string; glow?: string; glowX?: number; glowY?: number; glowR?: number; fog: string };
const LOOK: Record<string, Look> = {
  dusk: { top: "#17171c", mid: "#4a3b33", bot: "#b07a4c", far: "#4b3f37", mid2: "#2e2823", near: "#1a1714", ground: "#231e19", glow: "#e0874a", glowX: 1500, glowY: 640, glowR: 700, fog: "rgba(170,120,90,0.16)" },
  night: { top: "#05070a", mid: "#15171c", bot: "#4a3526", far: "#1d1d1f", mid2: "#141414", near: "#0b0b0b", ground: "#100f0d", glow: "#b8451f", glowX: 1700, glowY: 660, glowR: 520, fog: "rgba(90,80,75,0.12)" },
  dawn: { top: "#232631", mid: "#6b6460", bot: "#d2a878", far: "#6d655a", mid2: "#433d35", near: "#1c1915", ground: "#2a241d", glow: "#f0b47a", glowX: 1450, glowY: 650, glowR: 650, fog: "rgba(210,190,165,0.2)" },
  day: { top: "#6f716f", mid: "#a49e8c", bot: "#d4c9ab", far: "#8b8676", mid2: "#5a5447", near: "#2a261f", ground: "#3b352a", fog: "rgba(220,212,190,0.22)" },
  fog: { top: "#5f6466", mid: "#8b8f8c", bot: "#b7b5a8", far: "#8f918a", mid2: "#6b6c66", near: "#2b2c29", ground: "#3a3a34", fog: "rgba(205,205,198,0.34)" },
  fire: { top: "#0d0b0b", mid: "#2b1a14", bot: "#7a3a1e", far: "#2a1d18", mid2: "#1d1512", near: "#0e0c0a", ground: "#16120f", glow: "#e8662a", glowX: 900, glowY: 620, glowR: 900, fog: "rgba(120,70,45,0.18)" },
};

// ---------------- primitif ----------------
const Trees: React.FC<{ seed: string; y: number; h: number; x0?: number; x1?: number; fill: string; step?: number; gap?: [number, number] }> = ({ seed, y, h, x0 = -600, x1 = 2700, fill, step = 26, gap }) => {
  let d = `M${x0},${y + 900} L${x0},${y}`;
  for (let x = x0, i = 0; x < x1; x += step * (0.6 + R(`${seed}w${i}`) * 0.8), i++) {
    const inGap = gap && x > gap[0] && x < gap[1];
    const hh = inGap ? h * 0.05 : h * (0.55 + R(`${seed}h${i}`) * 0.45);
    const w = step * (0.5 + R(`${seed}b${i}`) * 0.5);
    d += ` L${x},${y - hh * 0.25} L${x + w * 0.5},${y - hh} L${x + w},${y - hh * 0.25}`;
  }
  d += ` L${x1},${y} L${x1},${y + 900} Z`;
  return <path d={d} fill={fill} />;
};
const Ground: React.FC<{ y: number; fill: string; seed: string; amp?: number }> = ({ y, fill, seed, amp = 10 }) => {
  let d = `M-600,${y}`;
  for (let x = -600, i = 0; x <= 2700; x += 120, i++) d += ` Q${x + 60},${y + (R(`${seed}${i}`) - 0.5) * amp * 2} ${x + 120},${y}`;
  return <path d={d + ` L2700,1300 L-600,1300 Z`} fill={fill} />;
};
const Grass: React.FC<{ y: number; t: number; seed: string; fill: string; n?: number; h?: number }> = ({ y, t, seed, fill, n = 140, h = 34 }) => (
  <g stroke={fill} strokeWidth={3} strokeLinecap="round" fill="none">
    {Array.from({ length: n }, (_, i) => { const x = -400 + (i / n) * 3000 + R(`${seed}x${i}`) * 20; const hh = h * (0.5 + R(`${seed}h${i}`)); const sw = sinw(t, 0.25, R(`${seed}p${i}`)) * 7 + 5; return <path key={i} d={`M${x},${y} Q${x + sw * 0.4},${y - hh * 0.6} ${x + sw},${y - hh}`} />; })}
  </g>
);

// prajurit: origin di kaki, menghadap kanan (dir -1 = kiri). Helm Soviet (kubah bulat) vs Jerman (kubah + rok melebar).
type Pose = "walk" | "run" | "crouch" | "stand" | "sit" | "carry" | "wade";
const Soldier: React.FC<{ x: number; y: number; s: number; side: "SU" | "DE"; ph: number; pose: Pose; fill: string; dir?: 1 | -1; rifle?: boolean; shadow?: boolean }> = ({ x, y, s, side, ph, pose, fill, dir = 1, rifle = true, shadow = true }) => {
  const sw = Math.sin(ph), run = pose === "run", walkish = pose === "walk" || run || pose === "carry" || pose === "wade";
  const lean = run ? 16 : pose === "crouch" ? 22 : walkish ? 5 : 0;
  const hipY = pose === "crouch" ? -30 : pose === "sit" ? -14 : -40;
  const amp = run ? 0.65 : walkish ? 0.38 : 0;
  const leg = (a: number, bend: number): Pt[] => { const k: Pt = [Math.sin(a) * 21, hipY + Math.cos(a) * 21]; const f: Pt = [k[0] + Math.sin(a - bend) * 21, k[1] + Math.cos(a - bend) * 21]; return [[0, hipY], k, f]; };
  const legs = pose === "sit" ? [[[0, hipY], [20, hipY], [22, 0]], [[0, hipY], [16, hipY - 2], [20, 0]]] as Pt[][]
    : pose === "crouch" ? [leg(0.9, 1.9), leg(-0.4, -0.2)] : [leg(sw * amp, Math.max(0, -sw) * 0.9), leg(-sw * amp, Math.max(0, sw) * 0.9)];
  const bob = walkish ? Math.abs(Math.cos(ph)) * (run ? 3 : 1.5) : 0;
  const sh: Pt = [lean * 0.7, hipY - 27 - bob], hd: Pt = [sh[0] + 5, sh[1] - 11];
  const coat = side === "SU" ? `M${sh[0] - 7},${sh[1] + 2} L${sh[0] + 8},${sh[1] + 2} L${10},${hipY + 14} L${-11},${hipY + 12} Z` : `M${sh[0] - 7},${sh[1] + 2} L${sh[0] + 8},${sh[1] + 2} L${8},${hipY + 6} L${-8},${hipY + 6} Z`;
  const helmet = side === "SU" ? `M${hd[0] - 8},${hd[1] + 1} A8.5 8.5 0 0 1 ${hd[0] + 9},${hd[1] + 1} L${hd[0] + 10},${hd[1] + 2.5} L${hd[0] - 9},${hd[1] + 2.5} Z`
    : `M${hd[0] - 11},${hd[1] + 5} L${hd[0] - 8},${hd[1] - 1} A8 7.5 0 0 1 ${hd[0] + 8},${hd[1] - 1} L${hd[0] + 10},${hd[1] + 3} L${hd[0] + 4},${hd[1] + 2} L${hd[0] - 4},${hd[1] + 2.5} Z`;
  const gun: [Pt, Pt] = pose === "carry" ? [[sh[0] - 14, sh[1] + 4], [sh[0] - 24, sh[1] - 26]] : run || pose === "crouch" ? [[sh[0] - 4, sh[1] + 14], [sh[0] + 34, sh[1] - 2]] : pose === "sit" ? [[sh[0] + 14, 0], [sh[0] + 22, sh[1] - 18]] : [[sh[0] - 9, sh[1] + 20], [sh[0] + 14, sh[1] - 22]];
  const arm: Pt = pose === "carry" ? [sh[0] + 4, sh[1] - 16] : [gun[0][0] * 0.4 + gun[1][0] * 0.6, gun[0][1] * 0.4 + gun[1][1] * 0.6];
  const br = walkish ? 1 : 1 + 0.014 * Math.sin(ph);
  return (
    <g transform={`translate(${x},${y}) scale(${s * dir},${s * br})`} fill={fill} stroke={fill} strokeLinecap="round" strokeLinejoin="round">
      {shadow && <ellipse cx={4} cy={1} rx={22} ry={3.6} fill="rgba(0,0,0,0.3)" stroke="none" />}
      {legs.map((l, i) => <polyline key={i} points={l.map((p) => p.join(",")).join(" ")} fill="none" strokeWidth={7} />)}
      <path d={coat} strokeWidth={4} />
      <line x1={0} y1={hipY} x2={sh[0]} y2={sh[1]} strokeWidth={11} />
      {side === "DE" && <rect x={sh[0] - 13} y={sh[1] + 3} width={7} height={13} rx={2} strokeWidth={1} />}
      {side === "SU" && <path d={`M${sh[0] - 9},${sh[1] + 2} q-6,8 -1,15`} fill="none" strokeWidth={5} />}
      <line x1={sh[0]} y1={sh[1]} x2={arm[0]} y2={arm[1]} strokeWidth={6} />
      <circle cx={hd[0]} cy={hd[1] + 3} r={6} stroke="none" />
      <path d={helmet} strokeWidth={1} />
      {rifle && <line x1={gun[0][0]} y1={gun[0][1]} x2={gun[1][0]} y2={gun[1][1]} strokeWidth={3.2} />}
    </g>
  );
};

// T-34 model 1943 (76 mm F-34): 5 roda jalan besar (suspensi Christie, tanpa roda penyangga atas), glacis miring ±30°,
// turret heksagonal dengan dua palka "telinga Mickey" + kubah komandan, tangki bahan bakar di fender belakang, laras menjorok ±1,4 m.
// Skala ±2 cm per satuan. shot = detik sejak tembakan terakhir (undefined = belum menembak).
export const T34: React.FC<{ x: number; y: number; s: number; fill: string; rot: number; dir?: 1 | -1; riders?: number; seed?: string; shot?: number }> = ({ x, y, s, fill, rot, dir = 1, riders = 0, seed = "t", shot }) => {
  const rc = shot !== undefined ? 12 * Math.exp(-shot * 9) : 0;
  return (
    <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} fill={fill}>
      <ellipse cx={0} cy={2} rx={170} ry={8} fill="rgba(0,0,0,0.3)" />
      <path d="M-139,-38 L129,-38 A19,19 0 0 1 129,0 L-139,0 A19,19 0 0 1 -139,-38 Z" fill="#241f1a" />
      <path d="M-152,-44 L-152,-61 L-62,-63 L68,-63 L98,-80 L114,-82 L148,-47 L148,-31 L-152,-31 Z" />
      <rect x={-150} y={-47} width={298} height={3.5} />
      <rect x={-146} y={-59} width={50} height={12} rx={5} />
      <path d="M-34,-63 L-44,-78 L-26,-95 L32,-97 L56,-85 L62,-63 Z" />
      <circle cx={-24} cy={-98} r={5.5} /><circle cx={20} cy={-100} r={5.5} /><rect x={-12} y={-104} width={18} height={8} rx={3} />
      <g transform={`translate(${-rc},0)`}><rect x={70} y={-88} width={146} height={5} rx={1.5} /><rect x={56} y={-93} width={15} height={16} rx={3} /></g>
      {[-139, 129].map((wx, i) => <circle key={`d${i}`} cx={wx} cy={-19} r={15} fill="#2f2b24" />)}
      {[-108, -57, -6, 45, 96].map((wx, i) => (
        <g key={i} transform={`translate(${wx},-20) rotate(${(rot * 180) / Math.PI})`}>
          <circle r={19.5} fill="#3a352c" /><circle r={12} fill="none" stroke={fill} strokeWidth={2.5} />
          <line x1={-11} y1={0} x2={11} y2={0} stroke={fill} strokeWidth={2.5} /><line x1={0} y1={-11} x2={0} y2={11} stroke={fill} strokeWidth={2.5} /><circle r={4} fill={fill} />
        </g>))}
      {Array.from({ length: riders }, (_, i) => <Soldier key={i} x={-124 + i * 34} y={-63} s={0.82} side="SU" ph={0} pose="sit" fill={fill} rifle={R(`${seed}r${i}`) > 0.3} shadow={false} />)}
      {shot !== undefined && shot < 0.6 && <Flash x={220 - rc} y={-86} q={shot} r={150} />}
    </g>
  );
};
const Truck: React.FC<{ x: number; y: number; s: number; fill: string; rot: number; dir?: 1 | -1; rails?: number; cover?: boolean }> = ({ x, y, s, fill, rot, dir = 1, rails, cover }) => (
  <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} fill={fill}>
    <ellipse cx={0} cy={2} rx={140} ry={7} fill="rgba(0,0,0,0.28)" />
    <path d="M60,-34 L60,-70 L92,-70 L100,-52 L128,-50 L132,-34 Z" />
    <rect x={-110} y={-40} width={168} height={8} />
    {cover ? <path d="M-110,-40 L-110,-82 Q-30,-96 50,-82 L50,-40 Z" /> : <rect x={-110} y={-58} width={164} height={18} />}
    {rails !== undefined && <g transform={`translate(-60,-60) rotate(${-rails})`}>
      <rect x={-50} y={-10} width={160} height={10} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-46} y={-22 - i * 6} width={152} height={3} />)}
      <rect x={-8} y={0} width={10} height={14} />
    </g>}
    {[105, -40, -82].map((wx, i) => <g key={i} transform={`translate(${wx},-14) rotate(${(rot * 180) / Math.PI})`}><circle r={15} fill="#3a352c" /><line x1={-13} x2={13} y1={0} y2={0} stroke={fill} strokeWidth={3} /><circle r={5} fill={fill} /></g>)}
  </g>
);
const Howitzer: React.FC<{ x: number; y: number; s: number; fill: string; recoil: number; elev?: number }> = ({ x, y, s, fill, recoil, elev = 24 }) => (
  <g transform={`translate(${x},${y}) scale(${s},${s})`} fill={fill} stroke={fill}>
    <ellipse cx={-40} cy={1} rx={100} ry={6} fill="rgba(0,0,0,0.28)" stroke="none" />
    <line x1={0} y1={-24} x2={-120} y2={0} strokeWidth={9} strokeLinecap="round" />
    <path d="M-6,-70 L22,-74 L24,-26 L-4,-22 Z" />
    <g transform={`translate(10,-48) rotate(${-elev})`}><rect x={-40 - recoil * 22} y={-7} width={150} height={14} rx={3} /><rect x={-48 - recoil * 22} y={-9} width={46} height={18} rx={4} /></g>
    <circle cx={6} cy={-24} r={24} fill="#3a352c" stroke="none" /><circle cx={6} cy={-24} r={7} stroke="none" />
  </g>
);
const Horse: React.FC<{ x: number; y: number; s: number; fill: string; ph: number; dir?: 1 | -1 }> = ({ x, y, s, fill, ph, dir = 1 }) => {
  const a = Math.sin(ph) * 0.35, b = -a;
  const L = (hx: number, ang: number) => <polyline points={`${hx},-48 ${hx + Math.sin(ang) * 22},-26 ${hx + Math.sin(ang) * 26},0`} fill="none" stroke={fill} strokeWidth={6} strokeLinecap="round" />;
  return (
    <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} fill={fill}>
      <ellipse cx={0} cy={2} rx={62} ry={5} fill="rgba(0,0,0,0.28)" />
      <path d="M-46,-56 C-48,-72 -16,-76 14,-70 C26,-68 34,-82 42,-98 L56,-96 C62,-90 58,-84 52,-78 C44,-64 38,-56 32,-50 C20,-42 -30,-42 -44,-46 Z" />
      <path d="M-46,-62 Q-60,-50 -58,-30" fill="none" stroke={fill} strokeWidth={4} />
      {L(-36, a)}{L(-26, b)}{L(20, b)}{L(28, a)}
    </g>
  );
};
const Cart: React.FC<{ x: number; y: number; s: number; fill: string; rot: number; dir?: 1 | -1 }> = ({ x, y, s, fill, rot, dir = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s * dir},${s})`} fill={fill} stroke={fill}>
    <ellipse cx={0} cy={2} rx={85} ry={6} fill="rgba(0,0,0,0.28)" stroke="none" />
    <path d="M-60,-62 L60,-62 L54,-34 L-54,-34 Z" strokeWidth={2} />
    <line x1={60} y1={-40} x2={110} y2={-46} strokeWidth={5} />
    {[-30, 34].map((wx, i) => <g key={i} transform={`translate(${wx},-22) rotate(${(rot * 180) / Math.PI})`}><circle r={22} fill="none" strokeWidth={4} />{[0, 45, 90, 135].map((q) => <line key={q} x1={-20} x2={20} y1={0} y2={0} strokeWidth={2} transform={`rotate(${q})`} />)}</g>)}
  </g>
);
const Wreck: React.FC<{ x: number; y: number; s: number; fill: string }> = ({ x, y, s, fill }) => (
  <g transform={`translate(${x},${y}) scale(${s},${s}) rotate(4)`} fill={fill}>
    <path d="M-120,-10 L-118,-52 L-40,-58 L-30,-74 L30,-74 L60,-50 L120,-46 L128,-10 Z" />
    <path d="M-40,-58 L-20,-92 L10,-86" fill="none" stroke={fill} strokeWidth={5} />
    {[-90, -50, 30, 80].map((wx, i) => <circle key={i} cx={wx} cy={-10} r={14} fill="#3a352c" />)}
  </g>
);
// Il-2 profil samping (menghadap kanan)
const Il2: React.FC<{ x: number; y: number; s: number; fill: string; ang: number }> = ({ x, y, s, fill, ang }) => (
  <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s},${s})`} fill={fill}>
    <path d="M-120,-4 C-100,-10 -40,-16 20,-18 L40,-30 L70,-28 L84,-16 C96,-14 104,-8 106,-2 C104,4 96,8 80,9 C20,12 -60,8 -120,4 Z" />
    <path d="M-118,-2 L-130,-36 L-110,-36 L-98,-6 Z" />
    <ellipse cx={10} cy={2} rx={46} ry={6} />
    <rect x={106} y={-26} width={4} height={50} rx={2} opacity={0.5} />
  </g>
);
const Smoke: React.FC<{ x: number; y: number; t: number; seed: string; n?: number; rise?: number; drift?: number; r0?: number; r1?: number; color?: string; a?: number; rate?: number }> = ({ x, y, t, seed, n = 10, rise = 420, drift = 160, r0 = 20, r1 = 120, color = "smk", a = 0.55, rate = 0.07 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const age = ((t * rate + i / n + R(`${seed}o`)) % 1); const wob = Math.sin((age * 3 + R(`${seed}${i}`)) * 6) * 18; return <circle key={i} cx={x + drift * age + wob} cy={y - rise * age} r={r0 + r1 * age} fill={`url(#${color})`} opacity={a * Math.sin(Math.PI * Math.min(1, age * 1.15))} />; })}</g>
);
const Embers: React.FC<{ x: number; y: number; t: number; seed: string; n?: number; rise?: number; drift?: number; r?: number }> = ({ x, y, t, seed, n = 8, rise = 240, drift = 60, r = 2.6 }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const age = (t * 0.35 + i / n + R(`${seed}e${i}`)) % 1;
    const px = x + (R(`${seed}x${i}`) - 0.5) * 50 + Math.sin((age * 4 + i) * 2) * drift * age, py = y - rise * age;
    const o = Math.sin(Math.PI * age) * (0.6 + 0.4 * Math.sin(t * 20 + i * 3));
    return <circle key={i} cx={px} cy={py} r={r * (1 - age * 0.5)} fill="#ffb347" opacity={Math.max(0, o)} />;
  })}</g>
);
const Fire: React.FC<{ x: number; y: number; t: number; seed: string; s?: number }> = ({ x, y, t, seed, s = 1 }) => {
  const f = 0.75 + 0.25 * Math.sin(t * 13 + R(seed) * 9) * Math.sin(t * 7.3 + R(seed + "b") * 5);
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    <circle r={150 * f} fill="url(#glow)" opacity={0.75} style={{ mixBlendMode: "screen" }} />
    {[-26, -13, 0, 13, 26].map((tx, i) => {
      const h = (46 + 34 * R(`${seed}f${i}`)) * (0.8 + 0.3 * Math.sin(t * (9 + i) + i)), sw = Math.sin(t * (5 + i) + i * 1.7) * 7, w = 11 + 4 * R(`${seed}w${i}`);
      const d = `M${tx - w},0 C${tx - w},${-h * 0.45} ${tx + sw * 0.4 - w * 0.3},${-h * 0.6} ${tx + sw},${-h} C${tx + sw * 0.6 + w * 0.3},${-h * 0.6} ${tx + w},${-h * 0.4} ${tx + w},0 Z`;
      return <g key={i}><path d={d} fill={i % 2 ? "#ff9a3c" : "#e8552a"} opacity={0.92} /><path d={d} fill="#ffd98a" opacity={0.85} transform={`translate(${tx},0) scale(0.5,0.6) translate(${-tx},0)`} /></g>;
    })}
    <Embers x={0} y={-40} t={t} seed={seed} />
  </g>);
};
const Ash: React.FC<{ t: number; seed: string; n?: number; fill?: string }> = ({ t, seed, n = 36, fill = "rgba(70,64,58,0.55)" }) => (
  <g>{Array.from({ length: n }, (_, i) => {
    const age = (t * 0.04 * (0.6 + R(`${seed}v${i}`)) + R(`${seed}a${i}`)) % 1;
    const px = ((R(`${seed}x${i}`) * 2100 + t * (14 + 8 * R(`${seed}w${i}`))) % 2100) - 90 + Math.sin(t * 0.9 + i) * 14, py = age * 1150 - 50;
    return <ellipse key={i} cx={px} cy={py} rx={2.6 + 2 * R(`${seed}r${i}`)} ry={1.6} fill={fill} transform={`rotate(${(t * 60 + i * 40) % 360} ${px} ${py})`} />;
  })}</g>
);
const Pine: React.FC<{ x: number; y: number; h: number; fill: string; t: number; seed: string }> = ({ x, y, h, fill, t, seed }) => {
  const w = h * 0.2, sway = Math.sin(t * 0.5 + R(seed) * 6) * 5;
  return (<g fill={fill}>
    <rect x={x - h * 0.018} y={y - h * 0.16} width={h * 0.036} height={h * 0.16} />
    {[0, 1, 2, 3, 4].map((k) => { const yb = y - h * 0.1 - k * h * 0.17, wk = w * (1 - k * 0.17), xa = x + sway * (k / 4); return <path key={k} d={`M${x - wk},${yb} L${xa},${yb - h * 0.36} L${x + wk},${yb} Z`} />; })}
  </g>);
};
// kilatan: q = waktu sejak kejadian
const Flash: React.FC<{ x: number; y: number; q: number; r?: number }> = ({ x, y, q, r = 220 }) => {
  if (q < 0 || q > 1.2) return null; const o = Math.exp(-q * 5);
  return <circle cx={x} cy={y} r={r * (0.6 + q)} fill="url(#flash)" opacity={o} style={{ mixBlendMode: "screen" }} />;
};
// ledakan tanah: semburan tanah + asap
const Blast: React.FC<{ x: number; y: number; q: number; s?: number; seed: string; fill: string }> = ({ x, y, q, s = 1, seed, fill }) => {
  if (q < 0 || q > 4) return null;
  const up = io(clamp01(q / 0.5)) * (1 - io(clamp01((q - 0.4) / 1.4)) * 0.6);
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    <Flash x={0} y={-30} q={q} r={200} />
    {Array.from({ length: 9 }, (_, i) => { const a = -Math.PI / 2 + (R(`${seed}a${i}`) - 0.5) * 1.4; const d = 140 * (0.5 + R(`${seed}d${i}`)) * up; const g = q > 0.4 ? (q - 0.4) * (q - 0.4) * 90 : 0; return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d + g} r={9 + 8 * R(`${seed}r${i}`)} fill={fill} opacity={1 - clamp01((q - 1.2) / 0.8)} />; })}
    {Array.from({ length: 6 }, (_, i) => { const qq = clamp01(q / 4); return <circle key={`s${i}`} cx={(i - 2.5) * 30 * (0.4 + qq) + qq * 60} cy={-40 - qq * 160 - i * 12} r={50 + qq * 110} fill="url(#smk)" opacity={0.7 * (1 - qq) * clamp01(q / 0.3)} />; })}
  </g>);
};
const Flare: React.FC<{ x: number; y: number; q: number }> = ({ x, y, q }) => {
  if (q < 0 || q > 7) return null; const up = io(clamp01(q / 0.8)); const fy = y - 380 * up + Math.max(0, q - 0.8) * 30; const o = clamp01(q / 0.6) * (1 - clamp01((q - 5.8) / 1.2));
  return (<g opacity={o}>
    <circle cx={x + Math.sin(q * 1.3) * 12} cy={fy} r={760} fill="url(#flarelight)" style={{ mixBlendMode: "screen" }} />
    <circle cx={x + Math.sin(q * 1.3) * 12} cy={fy} r={7} fill="#fffbe8" />
    {q > 0.8 && <path d={`M${x},${y - 380} Q${x + 10},${(fy + y - 380) / 2} ${x + Math.sin(q * 1.3) * 12},${fy}`} stroke="rgba(230,230,220,0.25)" strokeWidth={3} fill="none" />}
  </g>);
};
const Tracers: React.FC<{ t: number; seed: string; from: Pt; to: Pt; n?: number; color?: string; rate?: number; on?: number }> = ({ t, seed, from, to, n = 6, color = "#ffcf6b", rate = 1.6, on = 1 }) => (
  <g stroke={color} strokeWidth={3} strokeLinecap="round" opacity={on}>{Array.from({ length: n }, (_, i) => {
    const u = (t * rate + i / n + R(`${seed}${i}`)) % 1; const jx = (R(`${seed}j${i}`) - 0.5) * 160, jy = (R(`${seed}k${i}`) - 0.5) * 70;
    const p = (v: number): Pt => [from[0] + (to[0] + jx - from[0]) * v, from[1] + (to[1] + jy - from[1]) * v];
    const a = p(u), b = p(Math.min(1, u + 0.05)); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} opacity={0.9} />; })}</g>
);
const Rocket: React.FC<{ from: Pt; q: number; seed: string }> = ({ from, q, seed }) => {
  if (q < 0 || q > 2.2) return null;
  const pos = (u: number): Pt => { const v = clamp01(u / 1.6); return [from[0] + v * (1500 + R(seed) * 400), from[1] - Math.sin(v * Math.PI * 0.62) * (520 + R(seed + "h") * 140)]; };
  const a = pos(q), b = pos(Math.max(0, q - 0.28));
  return (<g>
    <line x1={b[0]} y1={b[1]} x2={a[0]} y2={a[1]} stroke="url(#trail)" strokeWidth={5} strokeLinecap="round" opacity={1 - clamp01((q - 1.6) / 0.6)} />
    <circle cx={a[0]} cy={a[1]} r={12} fill="url(#flash)" opacity={q < 1.6 ? 0.9 : 0} style={{ mixBlendMode: "screen" }} />
  </g>);
};
const Reeds: React.FC<{ y: number; t: number; seed: string; fill: string; n?: number; h?: number }> = ({ y, t, seed, fill, n = 90, h = 140 }) => (
  <g stroke={fill} fill="none" strokeLinecap="round">{Array.from({ length: n }, (_, i) => {
    const x = -400 + (i / n) * 3000 + R(`${seed}x${i}`) * 30; const hh = h * (0.5 + R(`${seed}h${i}`) * 0.8); const sw = sinw(t, 0.18, R(`${seed}p${i}`)) * 9 + 6;
    return <g key={i}><path d={`M${x},${y} Q${x + sw * 0.3},${y - hh * 0.6} ${x + sw},${y - hh}`} strokeWidth={3} />{R(`${seed}c${i}`) > 0.6 && <ellipse cx={x + sw} cy={y - hh - 10} rx={4} ry={14} fill={fill} />}</g>;
  })}</g>
);
const Wire: React.FC<{ y: number; fill: string; x0?: number; x1?: number; h?: number }> = ({ y, fill, x0 = -500, x1 = 2700, h = 130 }) => {
  const posts: number[] = []; for (let x = x0; x <= x1; x += 150) posts.push(x);
  return (<g stroke={fill} fill="none">
    {posts.map((x) => <line key={x} x1={x} y1={y} x2={x + 4} y2={y - h - 10} strokeWidth={8} />)}
    {[0.18, 0.45, 0.72, 0.95].map((f) => posts.slice(1).map((x, i) => { const yy = y - h * f; return <g key={`${f}${x}`}><path d={`M${posts[i]},${yy} Q${(posts[i] + x) / 2},${yy + 10} ${x},${yy}`} strokeWidth={2} />{[0.25, 0.5, 0.75].map((u) => { const bx = posts[i] + (x - posts[i]) * u, by = yy + 10 * 4 * u * (1 - u) * 0.5; return <path key={u} d={`M${bx - 5},${by - 5} L${bx + 5},${by + 5} M${bx + 5},${by - 5} L${bx - 5},${by + 5}`} strokeWidth={2} />; })}</g>; }))}
  </g>);
};
const Ruins: React.FC<{ seed: string; y: number; fill: string; win: string; n?: number; x0?: number; hmax?: number; t?: number; burn?: boolean }> = ({ seed, y, fill, win, n = 9, x0 = -300, hmax = 380, t = 0, burn }) => {
  let x = x0; const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const w = 170 + R(`${seed}w${i}`) * 180, h = hmax * (0.45 + R(`${seed}h${i}`) * 0.55);
    let top = `M${x},${y} L${x},${y - h * (0.6 + R(`${seed}a${i}`) * 0.4)}`;
    for (let k = 1; k <= 6; k++) top += ` L${x + (w * k) / 6},${y - h * (0.35 + R(`${seed}t${i}${k}`) * 0.65)}`;
    const wins: React.ReactNode[] = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const wy = y - h * 0.25 - r * 62, wx = x + 26 + c * (w - 60) / 2; if (wy < y - h * 0.4 || R(`${seed}g${i}${r}${c}`) < 0.3) continue; const fl = burn ? 0.55 + 0.45 * Math.sin(t * (6 + r) + i + c) : 1; wins.push(<rect key={`${r}${c}`} x={wx} y={wy - 40} width={24} height={40} fill={win} opacity={fl} />); }
    out.push(<g key={i}><path d={top + ` L${x + w},${y} Z`} fill={fill} />{wins}</g>);
    if (R(`${seed}ch${i}`) > 0.55) out.push(<rect key={`c${i}`} x={x + w + 20} y={y - h * 0.9} width={26} height={h * 0.9} fill={fill} />);
    x += w + 40 + R(`${seed}s${i}`) * 120;
  }
  return <g>{out}</g>;
};
const Wall: React.FC<{ y: number; fill: string; dark: string }> = ({ y, fill, dark }) => (
  <g>
    <path d={`M-500,${y} L-500,${y - 210} ${Array.from({ length: 40 }, (_, i) => `L${-500 + i * 80},${y - 210} L${-500 + i * 80},${y - 230} L${-460 + i * 80},${y - 230} L${-460 + i * 80},${y - 210}`).join(" ")} L2700,${y - 210} L2700,${y} Z`} fill={fill} />
    {[200, 620, 1040, 1460, 1880, 2300].map((x) => <path key={x} d={`M${x},${y} L${x},${y - 90} A42 42 0 0 1 ${x + 84},${y - 90} L${x + 84},${y} Z`} fill={dark} />)}
    <path d={`M760,${y} L760,${y - 300} L1000,${y - 300} L1000,${y} Z`} fill={fill} />
    <path d={`M820,${y} L820,${y - 150} A60 60 0 0 1 940,${y - 150} L940,${y} Z`} fill={dark} />
    {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-500} x2={2700} y1={y - 20 - i * 6.6} y2={y - 20 - i * 6.6} stroke={dark} strokeWidth={0.8} opacity={0.25} />)}
  </g>
);
const Tower: React.FC<{ x: number; y: number; fill: string }> = ({ x, y, fill }) => (
  <g stroke={fill} fill={fill}>
    <line x1={x - 40} y1={y} x2={x - 26} y2={y - 260} strokeWidth={9} /><line x1={x + 40} y1={y} x2={x + 26} y2={y - 260} strokeWidth={9} />
    <path d={`M${x - 36},${y - 30} L${x + 30},${y - 140} M${x + 36},${y - 30} L${x - 30},${y - 140}`} strokeWidth={5} fill="none" />
    <rect x={x - 46} y={y - 310} width={92} height={56} /><path d={`M${x - 60},${y - 310} L${x},${y - 356} L${x + 60},${y - 310} Z`} />
  </g>
);
const Birds: React.FC<{ t: number; seed: string; fill: string; n?: number }> = ({ t, seed, fill, n = 7 }) => (
  <g stroke={fill} fill="none" strokeWidth={3} strokeLinecap="round">{Array.from({ length: n }, (_, i) => {
    const x = 200 + R(`${seed}x${i}`) * 900 + t * (30 + R(`${seed}v${i}`) * 25), y = 200 + R(`${seed}y${i}`) * 180 + Math.sin(t * 0.8 + i) * 12; const f = Math.sin(t * 7 + i * 2) * 7;
    return <path key={i} d={`M${x - 14},${y - f} Q${x - 6},${y - 4} ${x},${y} Q${x + 6},${y - 4} ${x + 14},${y - f}`} />;
  })}</g>
);
const LogEnds: React.FC<{ y: number; x0: number; x1: number; fill: string; ring: string }> = ({ y, x0, x1, fill, ring }) => (
  <g>{Array.from({ length: Math.max(0, Math.floor((x1 - x0) / 26)) }, (_, i) => { const x = x0 + i * 26 + 13; return <g key={i}><circle cx={x} cy={y - 12} r={13} fill={fill} /><circle cx={x} cy={y - 12} r={7} fill="none" stroke={ring} strokeWidth={1.5} /></g>; })}</g>
);

// ---------------- kartu teks (gaya BEATS2) ----------------
export type Cap = { a: number; b: number; kick: string; head: string; pos?: "bl" | "tl" };
const CAPS: Record<string, Cap[]> = {
  trench: [
    { a: 1.0, b: 7.6, kick: "GERMAN NINTH ARMY · JULY 1943", head: "THE NORTHERN SPEARHEAD AT KURSK" },
    { a: 8.2, b: 15.2, kick: "JUNE 1944", head: "WORN DOWN, HOLDING BOBRUISK WITH FEW REINFORCEMENTS" },
  ],
  barrage: [{ a: 1.0, b: 10.8, kick: "ROGACHEV SECTOR", head: "THE ARTILLERY PREPARATION IS REPEATED" }],
  armorB: [{ a: 1.0, b: 8.8, kick: "26 JUNE 1944", head: "9th TANK CORPS GOES THROUGH THE GAP" }],
  marshB: [{ a: 1.0, b: 10.8, kick: "25–26 JUNE 1944 · 65th ARMY", head: "THROUGH THE MARSH, ON LOG ROADS" }],
  pocketB: [{ a: 1.0, b: 9.6, kick: "27 JUNE 1944", head: "SOVIET BOMBERS OVER THE POCKET" }],
  citadel: [
    { a: 1.2, b: 7.8, kick: "THREE YEARS EARLIER · 28 JUNE 1941", head: "GERMAN TROOPS TAKE BOBRUISK" },
    { a: 8.4, b: 15.6, kick: "DULAG 131 · IN THE OLD CITADEL", head: "AN ESTIMATED 30,000–40,000 SOVIET PRISONERS OF WAR DIED HERE" },
    { a: 16.2, b: 23.2, kick: "THE JEWS OF BOBRUISK", head: "SOME 20,000 WERE SHOT AND BURIED IN MASS GRAVES" },
  ],
  ruins: [{ a: 0.8, b: 12.2, kick: "BOBRUISK · 29 JUNE 1944", head: "THE RED ARMY ENTERS A CITY IN RUINS", pos: "tl" }],
  aftermathB: [
    { a: 1.0, b: 7.0, kick: "GERMAN NINTH ARMY · SUMMER 1944", head: "ABOUT 40% DESTROYED" },
    { a: 7.6, b: 13.4, kick: "BY THE AUTUMN", head: "REBUILT WITH UNITS FROM ITALY, DEFENDING WARSAW" },
  ],
};
const Caps: React.FC<{ id: string; lt: number }> = ({ id, lt }) => (
  <>{(CAPS[id] ?? []).map(({ a, b, kick, head, pos }) => {
    const o = cl(lt, a, 0.35) * (1 - cl(lt, b - 0.35, 0.35)); if (o <= 0) return null;
    return (<div key={a} style={{ position: "absolute", left: 48, ...(pos === "tl" ? { top: 150 } : { bottom: 60 }), maxWidth: 1250, padding: "18px 26px", background: "rgba(14,20,26,0.86)", borderLeft: `6px solid ${RED}`, opacity: o, transform: `translateY(${(1 - rv(lt, a, 0.5)) * 14}px)` }}>
      <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 5, color: "#ff7a63" }}>{kick}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 46, letterSpacing: 1.5, lineHeight: 1.05, color: C.chalk, marginTop: 6 }}>{head}</div>
    </div>);
  })}</>
);

// ---------------- adegan ----------------
const Defs: React.FC<{ L: Look }> = ({ L }) => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={L.top} /><stop offset="55%" stopColor={L.mid} /><stop offset="100%" stopColor={L.bot} /></linearGradient>
    <radialGradient id="smk"><stop offset="0%" stopColor="rgba(40,36,32,0.85)" /><stop offset="60%" stopColor="rgba(40,36,32,0.35)" /><stop offset="100%" stopColor="rgba(40,36,32,0)" /></radialGradient>
    <radialGradient id="smkL"><stop offset="0%" stopColor="rgba(170,160,140,0.7)" /><stop offset="60%" stopColor="rgba(170,160,140,0.25)" /><stop offset="100%" stopColor="rgba(170,160,140,0)" /></radialGradient>
    <radialGradient id="glow"><stop offset="0%" stopColor="rgba(255,150,70,0.9)" /><stop offset="40%" stopColor="rgba(230,90,40,0.35)" /><stop offset="100%" stopColor="rgba(200,60,20,0)" /></radialGradient>
    <radialGradient id="flash"><stop offset="0%" stopColor="rgba(255,250,220,1)" /><stop offset="30%" stopColor="rgba(255,200,110,0.7)" /><stop offset="100%" stopColor="rgba(255,140,60,0)" /></radialGradient>
    <radialGradient id="flarelight"><stop offset="0%" stopColor="rgba(240,240,225,0.55)" /><stop offset="35%" stopColor="rgba(200,205,200,0.18)" /><stop offset="100%" stopColor="rgba(200,205,200,0)" /></radialGradient>
    <radialGradient id="horizon" cx={(L.glowX ?? 960) / 1920} cy={(L.glowY ?? 640) / 1080} r={(L.glowR ?? 600) / 1920}><stop offset="0%" stopColor={L.glow ?? "transparent"} stopOpacity={0.55} /><stop offset="100%" stopColor={L.glow ?? "transparent"} stopOpacity={0} /></radialGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(230,220,200,0)" /><stop offset="100%" stopColor="rgba(255,220,150,0.95)" /></linearGradient>
    <linearGradient id="fogband" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={L.fog} stopOpacity={0} /><stop offset="50%" stopColor={L.fog} /><stop offset="100%" stopColor={L.fog} stopOpacity={0} /></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9a9d98" /><stop offset="100%" stopColor="#4c4f4c" /></linearGradient>
  </defs>
);
const Fog: React.FC<{ t: number; y: number; h: number; speed?: number }> = ({ t, y, h, speed = 14 }) => (
  <g>{[0, 1].map((i) => <rect key={i} x={-600 + ((t * speed * (i ? 0.6 : 1)) % 600) - (i ? 300 : 0)} y={y - h / 2 + i * h * 0.3} width={3600} height={h} fill="url(#fogband)" />)}</g>
);

type SP = { lt: number; dur: number; id: string };
const panOf = (lt: number, dur: number, px: number) => io(clamp01(lt / Math.max(1, dur))) * px;
const Lay: React.FC<{ d: number; pan: number; children: React.ReactNode }> = ({ d, pan, children }) => <g transform={`translate(${-pan * d},0)`}>{children}</g>;
const since = (lt: number, list: number[]) => list.map((a) => lt - a);

const Scene: React.FC<SP> = ({ lt, dur, id }) => {
  const base = id.replace(/[AB]$/, "");
  const lk = ({ trench: "dusk", barrage: "night", assault: "dawn", armor: id === "armorB" ? "dusk" : "day", marsh: "fog", pocket: "dusk", breakout: "night", city: "fire", citadel: "fog", ruins: "day", aftermath: "day", road: "dawn" } as Record<string, string>)[base] ?? "day";
  const L = LOOK[lk];
  const pan = panOf(lt, dur, base === "citadel" ? 160 : base === "road" ? 120 : 240);
  const t = lt;
  const heavy = [...ev(id, "blast"), ...ev(id, "salvo"), ...ev(id, "impact"), ...ev(id, "fire")], light = [...ev(id, "gun"), ...ev(id, "flash"), ...ev(id, "flare")];
  const hv = Math.min(1.4, decay(lt, heavy, 6)), lg = Math.min(1, decay(lt, light, 10));
  const shk = hv * 5 + lg * 1.8, sx = Math.sin(lt * 83.1) * shk, sy = Math.cos(lt * 67.7) * shk * 0.7;
  const pulse = Math.min(0.28, hv * 0.14 + lg * 0.07);
  const ashN = ({ ruins: 40, aftermath: 40, city: 26, pocket: 24, breakout: 22 } as Record<string, number>)[base] ?? 0;
  const sky = (<><rect x={-30} y={-30} width={1980} height={1140} fill="url(#sky)" />{L.glow && <rect x={-30} y={-30} width={1980} height={1140} fill="url(#horizon)" />}</>);
  let body: React.ReactNode = null;

  if (base === "trench") {
    const fl = since(t, ev("trench", "flare")), fx = since(t, ev("trench", "flash"));
    body = (<>
      {sky}
      <Lay d={0.08} pan={pan}>{fx.map((q, i) => <Flash key={i} x={1200 + i * 230} y={730} q={q} r={160} />)}</Lay>
      <Lay d={0.15} pan={pan}><Trees seed="tf" y={735} h={50} fill={L.far} /><Smoke x={1480} y={725} t={t} seed="ts" n={8} rise={300} drift={220} r0={20} r1={90} a={0.5} /></Lay>
      <Lay d={0.35} pan={pan}><Ground y={775} fill={L.mid2} seed="tg" amp={6} />{fl.map((q, i) => <Flare key={i} x={1300} y={770} q={q} />)}</Lay>
      <Fog t={t} y={770} h={110} />
      <Lay d={0.9} pan={pan}>
        <Soldier x={560} y={905} s={2.7} side="DE" ph={t * 2.1} pose="stand" fill={L.near} />
        <Soldier x={900} y={960} s={2.6} side="DE" ph={t * 1.7 + 1} pose="sit" fill={L.near} />
        <Soldier x={1250} y={910} s={2.7} side="DE" ph={t * 1.9 + 2} pose="stand" fill={L.near} rifle={false} />
        <g fill={L.near}><path d="M1360,780 L1560,770 L1566,778 L1364,790 Z" /><line x1={1510} y1={776} x2={1540} y2={820} stroke={L.near} strokeWidth={6} /><line x1={1510} y1={776} x2={1488} y2={820} stroke={L.near} strokeWidth={6} /></g>
        <path d={`M-400,820 ${Array.from({ length: 34 }, (_, i) => `Q${-400 + i * 100 + 50},${800 - (i % 3) * 6} ${-400 + (i + 1) * 100},820`).join(" ")} L2900,1100 L-400,1100 Z`} fill={L.near} />
        <Grass y={812} t={t} seed="tgr" fill={L.near} h={40} />
      </Lay>
    </>);
  } else if (base === "barrage") {
    const sv = since(t, ev(id, "salvo")), gn = since(t, ev(id, "gun")), im = since(t, ev(id, "impact"));
    const trucks = [260, 640, 1020, 1400];
    body = (<>
      {sky}
      <Lay d={0.08} pan={pan}>{im.map((q, i) => <Flash key={i} x={1650 + (i % 3) * 120} y={650} q={q} r={260} />)}</Lay>
      <Lay d={0.15} pan={pan}><Trees seed="bf" y={745} h={34} fill={L.far} /></Lay>
      <Lay d={0.45} pan={pan}>
        <Ground y={772} fill="#1c1916" seed="bg" amp={4} />
        {trucks.map((x, i) => <Truck key={i} x={x} y={784} s={1.0} fill="#221e1a" rot={0} rails={24} cover={false} />)}
        {sv.map((q, si) => trucks.map((x, i) => { const qq = q - i * 0.22; return <g key={`${si}${i}`}>
          {Array.from({ length: 4 }, (_, k) => <Rocket key={k} from={[x - 40, 712]} q={qq - k * 0.09} seed={`r${si}${i}${k}`} />)}
          <Flash x={x - 60} y={712} q={qq} r={200} />
          {qq > 0 && qq < 6 && <Smoke x={x - 120} y={740} t={qq * 12} seed={`bs${si}${i}`} n={6} rise={180} drift={-160} r0={40} r1={110} color="smkL" a={0.6 * (1 - clamp01((qq - 3) / 3))} rate={0.08} />}
        </g>; }))}
      </Lay>
      <Lay d={1.0} pan={pan}>
        <Ground y={900} fill={L.near} seed="bn" amp={10} />
        {[420, 1300].map((x, i) => { const q = Math.min(...gn.map((g) => (g >= -0.001 ? g : 99)).map((g, j) => (j % 2 === i ? g : 99))); const rc = q < 0.6 ? Math.exp(-q * 6) : 0; return <g key={i}>
          <Howitzer x={x} y={910} s={1.45} fill={L.near} recoil={rc} />
          <Flash x={x + 200} y={760} q={q} r={240} />
          <Soldier x={x - 150} y={912} s={1.6} side="SU" ph={0} pose="crouch" fill={L.near} rifle={false} />
          <Soldier x={x - 250} y={912} s={1.6} side="SU" ph={0} pose="stand" fill={L.near} rifle={false} />
        </g>; })}
      </Lay>
      <Fog t={t} y={800} h={160} />
    </>);
  } else if (base === "assault") {
    const bl = since(t, ev("assault", "blast"));
    body = (<>
      {sky}
      <Lay d={0.15} pan={pan}><Trees seed="af" y={640} h={55} fill={L.far} /><Smoke x={1300} y={640} t={t} seed="as" n={10} rise={320} drift={260} r0={30} r1={140} color="smkL" a={0.5} /></Lay>
      <Lay d={0.4} pan={pan}>
        <Ground y={690} fill={L.mid2} seed="ag" amp={5} />
        {Array.from({ length: 14 }, (_, i) => <Soldier key={i} x={-100 + i * 150 + t * 70 + R(`am${i}`) * 60} y={700 + R(`amy${i}`) * 8} s={0.75} side="SU" ph={t * 9 + i} pose="run" fill={L.mid2} />)}
        {bl.map((q, i) => <Blast key={i} x={500 + i * 330} y={712} q={q} s={0.7} seed={`ab${i}`} fill={L.mid2} />)}
        <Tracers t={t} seed="at" from={[2300, 640]} to={[400, 690]} n={7} on={ev("assault", "mg").some((a) => lt >= a && lt < a + 1.0) ? 1 : 0} />
      </Lay>
      <Fog t={t} y={760} h={180} />
      <Lay d={0.95} pan={pan}>
        <Ground y={930} fill={L.near} seed="an" amp={14} />
        {Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={-200 + i * 380 + t * 120 + R(`an${i}`) * 80} y={940 + R(`any${i}`) * 20} s={2.0} side="SU" ph={t * 8 + i * 1.7} pose={i % 3 === 1 ? "crouch" : "run"} fill={L.near} />)}
        <Grass y={940} t={t} seed="ag2" fill={L.near} h={50} />
      </Lay>
    </>);
  } else if (base === "armor") {
    const B = id === "armorB"; const bl = since(t, ev(id, "blast")); const fires = ev(id, "fire");
    const v = 95, xs = [-200, 330, 860, 1390];
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Trees seed={B ? "kf2" : "kf"} y={640} h={70} fill={L.far} gap={B ? [700, 1300] : undefined} /></Lay>
      <Lay d={0.45} pan={pan}>
        <Ground y={760} fill={L.mid2} seed="kg" amp={4} />
        {xs.map((x0, i) => { const x = x0 + t * v; return <g key={i}>
          <Smoke x={x - 190} y={752} t={t} seed={`kd${i}`} n={6} rise={90} drift={-260} r0={30} r1={90} color="smkL" a={0.55} rate={0.25} />
          <T34 x={x} y={772} s={0.9} fill={L.mid2} rot={x / 17} riders={i % 2 ? 3 : 2} seed={`k${i}`} shot={since1(t, fires.filter((_, k) => k % xs.length === i))} />
        </g>; })}
        {bl.map((q, i) => <Blast key={i} x={1650} y={770} q={q} s={0.8} seed={`kb${i}`} fill={L.mid2} />)}
      </Lay>
      {B ? <Lay d={1.0} pan={pan}>{[[90, 900], [330, 640], [1700, 700], [1900, 920], [2150, 620]].map(([px, ph], i) => <Pine key={i} x={px} y={1110} h={ph} fill={L.near} t={t} seed={`kp${i}`} />)}<Ground y={1000} fill={L.near} seed="kng" amp={8} /></Lay>
        : <Lay d={1.0} pan={pan}><Ground y={960} fill={L.near} seed="kn" amp={10} /><Wreck x={300} y={975} s={1.5} fill={L.near} /><Smoke x={330} y={880} t={t} seed="kw" n={7} rise={400} drift={140} r0={20} r1={100} a={0.55} /><Grass y={965} t={t} seed="kgr" fill={L.near} h={46} /></Lay>}
      <Fog t={t} y={780} h={140} />
    </>);
  } else if (base === "marsh") {
    const B = id === "marshB";
    const lay = B ? 300 + io(clamp01(t / Math.max(1, dur))) * 900 : 2600;
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Trees seed="mf" y={620} h={80} fill={L.far} /></Lay>
      <Lay d={0.3} pan={pan}>
        <rect x={-600} y={690} width={3600} height={400} fill="url(#water)" opacity={0.8} />
        <g transform="translate(0,1380) scale(1,-1)" opacity={0.18}><Trees seed="mf" y={690} h={80} fill={L.far} /></g>
        {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-300 + R(`mw${i}`) * 2600 + Math.sin(t * 0.5 + i) * 20} x2={-220 + R(`mw${i}`) * 2600 + Math.sin(t * 0.5 + i) * 20} y1={720 + R(`mwy${i}`) * 160} y2={720 + R(`mwy${i}`) * 160} stroke="rgba(230,230,220,0.35)" strokeWidth={2} />)}
      </Lay>
      <Fog t={t} y={700} h={200} speed={10} />
      <Lay d={0.6} pan={pan}>
        {B ? <>
          <LogEnds y={814} x0={-300} x1={lay} fill={L.mid2} ring="rgba(200,190,170,0.5)" />
          {[0, 1, 2].map((i) => { const x = lay - 60 - i * 330 + Math.sin(t * 0.7 + i) * 20; return <g key={i}><Soldier x={x - 90} y={800} s={1.5} side="SU" ph={t * 4 + i} pose="carry" fill={L.mid2} rifle={false} /><Soldier x={x + 90} y={800} s={1.5} side="SU" ph={t * 4 + i + 3} pose="carry" fill={L.mid2} rifle={false} /><rect x={x - 140} y={704} width={280} height={14} rx={7} fill={L.mid2} /></g>; })}
          {[0, 1, 2, 3].map((i) => <Soldier key={`w${i}`} x={-400 + i * 150 + t * 45} y={800} s={1.45} side="SU" ph={t * 5 + i} pose="walk" fill={L.mid2} />)}
        </> : Array.from({ length: 6 }, (_, i) => <Soldier key={i} x={150 + i * 170 + t * 40} y={830} s={1.6} side="SU" ph={t * 4 + i * 1.3} pose="wade" fill="#3d3e39" />)}
        {!B && <rect x={-600} y={806} width={3600} height={34} fill="url(#water)" opacity={0.75} />}
      </Lay>
      <Lay d={1.05} pan={pan}><Reeds y={1090} t={t} seed="mr" fill={L.near} n={110} h={260} /></Lay>
    </>);
  } else if (base === "pocket") {
    const B = id === "pocketB"; const bl = since(t, ev(id, "blast")), pl = since(t, ev(id, "plane"));
    const col = [[-300, "truck"], [40, "cart"], [380, "truck"], [740, "gun"], [1060, "cart"], [1400, "truck"], [1760, "cart"], [2100, "truck"]] as [number, string][];
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Trees seed="pf" y={640} h={70} fill={L.far} />{[300, 1100, 1750].map((x, i) => <Smoke key={i} x={x} y={640} t={t} seed={`ps${i}`} n={9} rise={500} drift={180} r0={30} r1={150} a={0.6} />)}</Lay>
      <Lay d={0.5} pan={pan}>
        <Ground y={790} fill={L.mid2} seed="pg" amp={5} />
        {col.map(([x, k], i) => <g key={i}>{k === "truck" ? <Truck x={x} y={800} s={0.95} fill={L.mid2} rot={0} dir={-1} cover /> : k === "cart" ? <><Cart x={x} y={800} s={0.9} fill={L.mid2} rot={0} dir={-1} /><Horse x={x - 150} y={800} s={0.9} fill={L.mid2} ph={0} dir={-1} /></> : <Howitzer x={x} y={800} s={0.9} fill={L.mid2} recoil={0} elev={4} />}</g>)}
        {[380, 1400].map((x, i) => <g key={i}><Fire x={x} y={760} t={t} seed={`pfi${i}`} s={1.1} /><Smoke x={x} y={720} t={t} seed={`pfs${i}`} n={9} rise={480} drift={140} r0={25} r1={130} a={0.7} rate={0.09} /></g>)}
        {Array.from({ length: 10 }, (_, i) => <Soldier key={i} x={2000 - i * 230 - t * 30 + R(`pw${i}`) * 80} y={812} s={0.95} side="DE" ph={t * 3.2 + i} pose="walk" fill={L.mid2} dir={-1} />)}
        {bl.map((q, i) => <Blast key={i} x={300 + ((i * 397) % 1500)} y={808} q={q} s={0.9} seed={`pb${i}${id}`} fill={L.mid2} />)}
      </Lay>
      {B && pl.map((q, i) => { if (q < 0 || q > 4) return null; const u = q / 4; return <Il2 key={i} x={-300 + u * 2600} y={470 + Math.sin(u * Math.PI) * 90 + i * 50} s={1.0 - i * 0.2} fill="#0a0907" ang={Math.cos(u * Math.PI) * 9} />; })}
      {B && <Tracers t={t} seed="pft" from={[900, 820]} to={[1300, 200]} n={5} color="#ffd27a" rate={1.2} />}
      <Fog t={t} y={840} h={160} />
      <Lay d={1.0} pan={pan}><Ground y={985} fill={L.near} seed="pn" amp={12} /><Grass y={985} t={t} seed="pgr" fill={L.near} h={50} /></Lay>
    </>);
  } else if (base === "breakout") {
    const fl = since(t, ev("breakout", "flare")), bl = since(t, ev("breakout", "blast"));
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Trees seed="of" y={650} h={70} fill={L.far} /></Lay>
      <Lay d={0.3} pan={pan}>{fl.map((q, i) => <Flare key={i} x={500 + i * 520} y={690} q={q} />)}</Lay>
      <Lay d={0.5} pan={pan}>
        <Ground y={760} fill={L.mid2} seed="og" amp={6} />
        {Array.from({ length: 16 }, (_, i) => <Soldier key={i} x={2300 - i * 150 - t * 85 + R(`om${i}`) * 70} y={770 + R(`omy${i}`) * 10} s={0.9} side="DE" ph={t * 9 + i} pose="run" fill={L.mid2} dir={-1} />)}
        {bl.map((q, i) => <Blast key={i} x={700 + i * 420} y={780} q={q} s={0.85} seed={`ob${i}`} fill={L.mid2} />)}
        <Tracers t={t} seed="ot1" from={[2400, 730]} to={[200, 770]} n={9} color="#ffb85c" rate={1.4} />
        <Tracers t={t} seed="ot2" from={[2400, 700]} to={[600, 760]} n={6} color="#ffd27a" rate={1.9} />
      </Lay>
      <Fog t={t} y={800} h={150} />
      <Lay d={1.0} pan={pan}>
        <Ground y={960} fill={L.near} seed="on" amp={14} />
        {Array.from({ length: 5 }, (_, i) => <Soldier key={i} x={2300 - i * 420 - t * 150 + R(`on${i}`) * 90} y={975} s={2.1} side="DE" ph={t * 8 + i * 2} pose="run" fill={L.near} dir={-1} />)}
        <Grass y={970} t={t} seed="ogr" fill={L.near} h={52} />
      </Lay>
    </>);
  } else if (base === "city") {
    const B = id === "cityB"; const bl = since(t, ev(id, "blast"));
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Ruins seed="cf" y={700} fill={L.far} win="#c4552a" n={12} x0={-500} hmax={300} t={t} burn /><Smoke x={600} y={500} t={t} seed="cs1" n={10} rise={500} drift={240} r0={50} r1={180} a={0.7} /><Smoke x={1500} y={520} t={t} seed="cs2" n={10} rise={500} drift={200} r0={50} r1={180} a={0.7} /></Lay>
      <Lay d={0.45} pan={pan}>
        <Ruins seed="cm" y={830} fill={L.mid2} win="#e07a3a" n={8} x0={-400} hmax={460} t={t} burn />
        {[200, 1200].map((x, i) => <Fire key={i} x={x} y={640} t={t} seed={`cfi${i}`} s={1.3} />)}
        {!B && <T34 x={-150 + t * 110} y={860} s={0.95} fill={L.mid2} rot={(t * 110) / 17} shot={since1(t, ev(id, "fire"))} />}
        {bl.map((q, i) => <Blast key={i} x={900 + i * 500} y={850} q={q} s={0.9} seed={`cb${i}${id}`} fill={L.mid2} />)}
      </Lay>
      <Lay d={1.0} pan={pan}>
        <Ground y={1000} fill={L.near} seed="cn" amp={16} />
        {(B ? [0, 1, 2, 3] : [0, 1, 2]).map((i) => B
          ? <Soldier key={i} x={2100 - i * 300 - t * 120} y={1010} s={2.0} side="DE" ph={t * 7 + i * 2} pose="run" fill={L.near} dir={-1} />
          : <Soldier key={i} x={-300 + i * 380 + t * 160} y={1010} s={2.1} side="SU" ph={t * 8 + i * 2} pose={i === 1 ? "crouch" : "run"} fill={L.near} />)}
        <path d="M-400,1000 L-300,930 L-200,960 L-80,910 L40,1000 Z M1500,1000 L1600,940 L1720,960 L1800,1000 Z" fill={L.near} />
      </Lay>
    </>);
  } else if (base === "citadel") {
    body = (<>
      {sky}
      <Lay d={0.1} pan={pan}><Trees seed="zf" y={620} h={60} fill={L.far} /></Lay>
      <Birds t={t} seed="zb" fill="rgba(40,40,40,0.55)" />
      <Lay d={0.35} pan={pan}><Ground y={760} fill={L.mid2} seed="zg" amp={3} /><Wall y={770} fill={L.mid2} dark="#2b2c29" /></Lay>
      <Fog t={t} y={760} h={260} speed={8} />
      <Lay d={0.7} pan={pan}><Tower x={1500} y={900} fill={L.near} /><Ground y={900} fill="#34352f" seed="zn" amp={6} /></Lay>
      <Lay d={1.05} pan={pan}><Wire y={1040} fill={L.near} h={150} /><Ground y={1035} fill={L.near} seed="zw" amp={8} /></Lay>
      <Fog t={t + 30} y={980} h={200} speed={6} />
    </>);
  } else if (base === "ruins") {
    body = (<>
      {sky}
      <Lay d={0.12} pan={pan}><Ruins seed="rf" y={710} fill={L.far} win={L.bot} n={12} x0={-500} hmax={280} /><Smoke x={900} y={560} t={t} seed="rs" n={8} rise={460} drift={200} r0={30} r1={140} a={0.4} /></Lay>
      <Lay d={0.45} pan={pan}><Ruins seed="rm" y={860} fill={L.mid2} win={L.bot} n={8} x0={-300} hmax={420} /><Ground y={850} fill={L.mid2} seed="rg" amp={8} />
        {[0, 1, 2, 3].map((i) => <Soldier key={i} x={-200 + i * 140 + t * 55} y={870} s={1.15} side="SU" ph={t * 4 + i} pose="walk" fill={L.mid2} />)}</Lay>
      <Fog t={t} y={820} h={200} />
      <Lay d={1.0} pan={pan}><Ground y={1010} fill={L.near} seed="rn" amp={20} /><path d="M1300,1010 L1380,900 L1440,930 L1520,860 L1600,1010 Z" fill={L.near} /></Lay>
    </>);
  } else if (base === "aftermath") {
    const B = id === "aftermathB";
    body = (<>
      {sky}
      <Lay d={0.1} pan={pan}><Trees seed="ff" y={650} h={50} fill={L.far} />
        {Array.from({ length: 46 }, (_, i) => <Soldier key={i} x={-300 + i * 52 + t * 18} y={668} s={0.38} side="DE" ph={t * 3 + i * 0.7} pose="walk" fill={L.far} rifle={false} />)}
      </Lay>
      <Lay d={0.4} pan={pan}><Ground y={740} fill={L.mid2} seed="fg" amp={5} />
        <Truck x={300} y={760} s={0.9} fill={L.mid2} rot={0} dir={-1} cover /><Cart x={980} y={756} s={0.85} fill={L.mid2} rot={0} /><Howitzer x={1500} y={756} s={0.85} fill={L.mid2} recoil={0} elev={-3} />
        <Smoke x={320} y={690} t={t} seed="fs" n={7} rise={380} drift={160} r0={15} r1={90} a={0.45} /></Lay>
      <Fog t={t} y={760} h={160} />
      <Lay d={1.0} pan={pan}><Ground y={980} fill={L.near} seed="fn" amp={12} />{!B && <Wreck x={1450} y={990} s={1.6} fill={L.near} />}<Grass y={985} t={t} seed="fgr" fill={L.near} h={48} /></Lay>
    </>);
  } else {
    // road: kolom tank menuju barat (kiri), dipakai layar akhir
    body = (<>
      {sky}
      <Lay d={0.1} pan={pan}><Trees seed="wf" y={660} h={60} fill={L.far} /></Lay>
      <Lay d={0.45} pan={pan}><Ground y={760} fill={L.mid2} seed="wg" amp={4} />
        {[1900, 2350, 2800].map((x0, i) => { const x = x0 - t * 80; return <g key={i}><Smoke x={x + 180} y={752} t={t} seed={`wd${i}`} n={6} rise={90} drift={260} r0={30} r1={90} color="smkL" a={0.5} rate={0.25} /><T34 x={x} y={772} s={0.75} fill={L.mid2} rot={-x / 17} dir={-1} riders={2} seed={`w${i}`} /></g>; })}</Lay>
      <Fog t={t} y={760} h={160} />
      <Lay d={1.0} pan={pan}><Ground y={990} fill={L.near} seed="wn" amp={12} /><Grass y={990} t={t} seed="wgr" fill={L.near} h={50} /></Lay>
    </>);
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
      <Defs L={L} />
      <g transform={`translate(${sx.toFixed(2)},${sy.toFixed(2)})`}>{body}</g>
      {ashN > 0 && <Ash t={lt} seed={`ash${base}`} n={ashN} fill={lk === "day" ? "rgba(70,64,58,0.5)" : "rgba(210,150,100,0.55)"} />}
      {pulse > 0.004 && <rect width={1920} height={1080} fill={L.glow ?? "#fff0cf"} opacity={pulse} style={{ mixBlendMode: "screen" }} />}
      <rect width={1920} height={1080} fill="rgba(90,70,45,0.10)" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
};

// counter populasi (B3)
const PopCard: React.FC<{ lt: number }> = ({ lt }) => {
  const o = cl(lt, 1.6, 0.5) * (1 - cl(lt, 12.4, 0.5)); if (o <= 0) return null;
  const a = Math.round(84000 * rv(lt, 1.8, 1.4)), b = Math.round(84000 - 56000 * io(cl(lt, 5.2, 2.6)));
  return (<div style={{ position: "absolute", left: 48, bottom: 60, padding: "22px 30px", background: "rgba(14,20,26,0.9)", borderLeft: `6px solid ${RED}`, opacity: o }}>
    <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 4, color: "#ff7a63" }}>POPULATION · 1939</div>
    <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 64, color: C.chalk }}>{a.toLocaleString("en-US")}</div>
    <div style={{ fontFamily: F.type, fontSize: 18, letterSpacing: 4, color: "#ff7a63", marginTop: 14, opacity: rv(lt, 5.0, 0.5) }}>AFTER THE WAR</div>
    <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 64, color: C.chalk, opacity: rv(lt, 5.0, 0.5) }}>{(lt < 5.2 ? 84000 : b).toLocaleString("en-US")}</div>
  </div>);
};
// layar akhir: teks kiri atas, area kanan dikosongkan untuk elemen layar akhir YouTube
const EndCard: React.FC<{ lt: number; dur: number }> = ({ lt, dur }) => {
  const o = rv(lt, 0.6, 1.0) * (1 - cl(lt, dur - 1.4, 1.2));
  return (<div style={{ position: "absolute", left: 90, top: 110, opacity: o }}>
    <div style={{ fontFamily: F.type, fontSize: 26, letterSpacing: 10, color: "#a9a290" }}>NEXT</div>
    <div style={{ fontFamily: F.type, fontSize: 28, letterSpacing: 10, color: C.gold, marginTop: 14 }}>OPERATION BAGRATION · PART 3</div>
    <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 120, letterSpacing: 6, color: C.chalk, lineHeight: 1, marginTop: 6 }}>THE CAULDRON</div>
    <div style={{ fontFamily: F.type, fontSize: 32, letterSpacing: 14, color: C.chalk, marginTop: 8 }}>MINSK · JULY 1944</div>
  </div>);
};

export const Diorama: React.FC<{ id: string; lt: number; dur: number; quote?: React.ReactNode; bare?: boolean }> = ({ id, lt, dur, quote, bare = false }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Scene id={id} lt={lt} dur={dur} />
    {!bare && <Caps id={id} lt={lt} />}
    {!bare && id === "ruins" && <PopCard lt={lt} />}
    {!bare && id === "road" && <EndCard lt={lt} dur={dur} />}
    {quote}
    {!bare && id !== "road" && <div style={{ position: "absolute", right: 28, bottom: 22, padding: "4px 10px", background: "rgba(10,12,14,0.55)", fontFamily: F.type, fontSize: 14, letterSpacing: 2, color: "rgba(232,225,207,0.8)" }}>ILLUSTRATIVE RECONSTRUCTION</div>}
  </AbsoluteFill>
);
