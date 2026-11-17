import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { F, clamp01, ease, easeOut } from "../kit/theme";
import { Cine, useEnter } from "../kit/Cine";
import { show } from "../episodes/schema";
import { MARKINGS } from "./data";

// Cetak biru teknik 2.5D Bf 109 G (ILUSTRATIF). Geometri dalam meter, digambar dengan skala nyata S px/m.
// Angka di garis ukur: bentang sayap 9.92 m (konsisten di banyak sumber); panjang G-6 bervariasi 8.85–8.95 m -> "≈ 8.9 m".
const S = 88;
const TOP = 372; // tampak atas: hidung di y=TOP, sumbu tengah x=540
const SX = 148; // tampak samping: hidung di x=SX
const SY = 1478; // garis sumbu tampak samping
type P = [number, number];
const tv = ([x, y]: P): P => [540 + y * S, TOP + x * S]; // (stasiun, lateral) -> layar
const sv = ([x, z]: P): P => [SX + x * S, SY - z * S]; // (stasiun, tinggi) -> layar

// Catmull-Rom -> Bezier kubik (garis halus organik)
const smooth = (pts: P[], closed = true) => {
  const n = pts.length;
  const g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (closed ? " Z" : "");
};
const line = (pts: P[]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
const mirror = (pts: P[]): P[] => pts.map(([x, y]) => [x, -y] as P);

// ---------------- geometri tampak atas (x = stasiun dari ujung spinner, y = lateral)
const FUS_HALF: P[] = [[0.12, 0.16], [0.35, 0.3], [0.7, 0.4], [1.2, 0.45], [2.2, 0.47], [3.2, 0.46], [4.3, 0.42], [5.4, 0.33], [6.5, 0.24], [7.6, 0.15], [8.5, 0.08]];
const FUS_TOP: P[] = [[0, 0], ...FUS_HALF, [8.88, 0], ...mirror(FUS_HALF).reverse()];
const WING_R: P[] = [[2.2, 0.47], [2.55, 2.4], [2.92, 4.25], [3.18, 4.82], [3.52, 4.96], [3.86, 4.86], [4.06, 4.5], [4.16, 2.4], [4.25, 0.47]];
const TAIL_R: P[] = [[7.55, 0.15], [7.78, 0.9], [8.0, 1.42], [8.26, 1.56], [8.5, 1.44], [8.63, 0.9], [8.72, 0.15]];

// ---------------- geometri tampak samping kiri (x = stasiun, z = tinggi), hidung di kiri
const PROFILE: P[] = [
  [0, 0], [0.08, 0.2], [0.3, 0.36], [0.7, 0.48], [1.2, 0.55], [1.9, 0.62], [2.1, 0.6], [2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74],
  [5.2, 0.62], [6.4, 0.5], [7.55, 0.42], [7.75, 0.62], [8.05, 1.25], [8.3, 1.55], [8.55, 1.6], [8.75, 1.45], [8.88, 1.05], [8.9, 0.4], [8.8, 0.05], [8.4, -0.12],
  [7.2, -0.22], [5.8, -0.34], [4.6, -0.48], [3.4, -0.58], [2.3, -0.62], [1.7, -0.72], [1.25, -0.78], [0.95, -0.62], [0.6, -0.45], [0.25, -0.28], [0.06, -0.14],
];
const AIRFOIL: P[] = [[2.2, -0.42], [2.5, -0.3], [3.1, -0.27], [3.8, -0.34], [4.25, -0.42], [3.6, -0.5], [2.8, -0.53], [2.35, -0.5]];
const TULIP: P[] = [[0.5, 0.42], [1.1, 0.52], [1.48, 0.36], [1.12, 0.18], [1.58, 0.04], [1.12, -0.12], [1.48, -0.32], [1.05, -0.56], [0.5, -0.43]];
const heart = (cx: number, cz: number, s: number): P[] => [
  [cx, cz - s * 0.9], [cx - s * 0.75, cz - s * 0.1], [cx - s * 0.8, cz + s * 0.45], [cx - s * 0.4, cz + s * 0.7], [cx, cz + s * 0.38], [cx + s * 0.4, cz + s * 0.7], [cx + s * 0.8, cz + s * 0.45], [cx + s * 0.75, cz - s * 0.1],
];

const INK = "#e8f4ff";
const DIM = "#9fd0ff";

// Path yang "digambar" (stroke-dashoffset) — pathLength=1 jadi progres 0..1 langsung.
const Draw: React.FC<{ d: string; p: number; w?: number; dash?: string; fill?: string; fillP?: number; color?: string }> = ({ d, p, w = 2.4, dash, fill, fillP = 0, color = INK }) => {
  if (p <= 0) return null;
  return (
    <>
      {fill && fillP > 0 && <path d={d} fill={fill} opacity={fillP} stroke="none" />}
      {dash ? (
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} opacity={clamp01(p * 1.5)} />
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={w} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} strokeLinejoin="round" strokeLinecap="round" />
      )}
    </>
  );
};

const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

// Garis ukur gaya drafting: garis ekstensi, panah, label dengan latar.
const DimLine: React.FC<{ a: P; b: P; ext: [P, P][]; label: string; p: number; tp: number }> = ({ a, b, ext, label, p, tp }) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const arrow = (q: P, dir: number) => {
    const l = 16, w = 6;
    const ca = Math.cos(ang + dir), sa = Math.sin(ang + dir);
    return `M${q[0]},${q[1]} L${q[0] + l * ca - w * sa},${q[1] + l * sa + w * ca} L${q[0] + l * ca + w * sa},${q[1] + l * sa - w * ca} Z`;
  };
  const e = easeOut(p);
  const pa: P = [mx + (a[0] - mx) * e, my + (a[1] - my) * e];
  const pb: P = [mx + (b[0] - mx) * e, my + (b[1] - my) * e];
  return (
    <g>
      {ext.map(([u, v], i) => (
        <path key={i} d={line([u, v])} stroke={DIM} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p * 1.6)} fill="none" />
      ))}
      <path d={line([pa, pb])} stroke={DIM} strokeWidth={2} fill="none" />
      {p > 0.95 && <path d={arrow(a, 0)} fill={DIM} />}
      {p > 0.95 && <path d={arrow(b, Math.PI)} fill={DIM} />}
      <g opacity={tp} transform={`translate(${mx} ${my}) scale(${0.85 + 0.15 * tp})`}>
        <rect x={-92} y={-27} width={184} height={54} fill="#0b2c55" stroke={DIM} strokeWidth={1.5} />
        <text x={0} y={13} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={38} fill="#ffffff" letterSpacing={2}>{label}</text>
      </g>
    </g>
  );
};

const Callout: React.FC<{ anchor: P; box: [number, number, number]; title: string; sub?: string; p: number }> = ({ anchor, box, title, sub, p }) => {
  const [bx, by, bw] = box;
  const H = sub ? 112 : 84;
  const kneeY = by + H + 60;
  const elbow: P = [bx + bw / 2, kneeY];
  const end: P = [bx + bw / 2, by + H];
  return (
    <g opacity={clamp01(p * 2)}>
      <circle cx={anchor[0]} cy={anchor[1]} r={8 + 10 * (1 - clamp01(p))} fill="none" stroke="#ffd36e" strokeWidth={2.5} />
      <circle cx={anchor[0]} cy={anchor[1]} r={4} fill="#ffd36e" />
      <path d={line([anchor, [anchor[0], kneeY], elbow, end])} fill="none" stroke="#ffd36e" strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(p * 1.4)} />
      <g opacity={clamp01((p - 0.45) * 2.5)} transform={`translate(${bx} ${by + (1 - clamp01(p)) * 16})`}>
        <rect width={bw} height={sub ? 112 : 84} fill="rgba(4,18,38,0.88)" stroke="#ffd36e" strokeWidth={2} />
        <rect width={8} height={sub ? 112 : 84} fill="#ffd36e" />
        <text x={26} y={sub ? 46 : 54} fontFamily={F.ui} fontWeight={700} fontSize={36} fill="#fff6dc" letterSpacing={1}>{title}</text>
        {sub && <text x={26} y={88} fontFamily={F.type} fontSize={19} fill="#bcd6ef" letterSpacing={1}>{sub}</text>}
      </g>
    </g>
  );
};

// Latar: kertas cetak biru + grid halus/mayor + radar
const BlueGrid: React.FC<{ f: number }> = ({ f }) => {
  const ap = seg(f, 0, 30);
  return (
    <svg width={1300} height={2200} viewBox="-110 -140 1300 2200" style={{ position: "absolute", left: -110, top: -140 }}>
      <defs>
        <pattern id="fine" width={S / 4} height={S / 4} patternUnits="userSpaceOnUse" x={540 % (S / 4)} y={TOP % (S / 4)}>
          <path d={`M${S / 4} 0 L0 0 0 ${S / 4}`} fill="none" stroke="#8cc4ff" strokeWidth={0.6} opacity={0.18} />
        </pattern>
        <pattern id="major" width={S} height={S} patternUnits="userSpaceOnUse" x={540 % S} y={TOP % S}>
          <rect width={S} height={S} fill="url(#fine)" />
          <path d={`M${S} 0 L0 0 0 ${S}`} fill="none" stroke="#9fd0ff" strokeWidth={1.1} opacity={0.32} />
        </pattern>
      </defs>
      <rect x={-110} y={-140} width={1300} height={2200} fill="url(#major)" opacity={ap} />
    </svg>
  );
};

const Radar: React.FC<{ f: number; cx: number; cy: number }> = ({ f, cx, cy }) => {
  const ap = seg(f, 5, 40);
  return (
    <AbsoluteFill style={{ opacity: ap }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[180, 340, 500, 660].map((r, i) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#7fc0ff" strokeWidth={i === 3 ? 1.8 : 1} opacity={0.22} strokeDasharray={i % 2 ? "6 10" : undefined} />
        ))}
        <line x1={cx - 700} y1={cy} x2={cx + 700} y2={cy} stroke="#7fc0ff" strokeWidth={1} opacity={0.18} />
        <line x1={cx} y1={cy - 700} x2={cx} y2={cy + 700} stroke="#7fc0ff" strokeWidth={1} opacity={0.18} />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r0 = i % 3 === 0 ? 640 : 652;
          return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * 668} y2={cy + Math.sin(a) * 668} stroke="#9fd0ff" strokeWidth={1.4} opacity={0.35} />;
        })}
      </svg>
      {/* sapuan radar */}
      <div style={{ position: "absolute", left: cx - 660, top: cy - 660, width: 1320, height: 1320, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(120,200,255,0.0) 0deg, rgba(120,200,255,0.0) 300deg, rgba(120,200,255,0.16) 352deg, rgba(190,235,255,0.32) 360deg)", transform: `rotate(${f * 1.6}deg)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

export const AceBlueprint: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = 1 - seg(f, 0, 20);
  const fadeOut = seg(f, 340, 360);

  // progres gambar
  const pFus = ease(seg(f, 14, 70));
  const pWing = ease(seg(f, 30, 92));
  const pTail = ease(seg(f, 46, 100));
  const pDet = ease(seg(f, 70, 125));
  const fillTop = seg(f, 95, 140);
  const pProf = ease(seg(f, 88, 160));
  const pSDet = ease(seg(f, 118, 180));
  const fillSide = seg(f, 150, 195);
  const pSpan = seg(f, 120, 150);
  const tSpan = useEnter(146);
  const pLen = seg(f, 186, 214);
  const tLen = useEnter(210);
  const pTulip = seg(f, 214, 246);
  const pHeart = seg(f, 246, 278);

  // kamera 2.5D: tilt lambat + push-in, fokus dari tampak atas ke tampak samping
  const focus = ease(seg(f, 95, 230));
  const rx = 9 - 5 * ease(seg(f, 0, 360));
  const ry = -7 + 12 * ease(seg(f, 0, 360));
  const sc = 1.0 + 0.07 * ease(seg(f, 0, 360));
  const ty = 30 - 80 * focus;

  // rim light: pita sapuan cahaya bergerak kiri -> kanan
  const scanX = -300 + (((f - 90) % 170) + 170) % 170 / 170 * 1700;
  const scanOn = seg(f, 90, 110);

  const topD = {
    fus: smooth(FUS_TOP.map(tv)),
    wingR: smooth(WING_R.map(tv), false),
    wingL: smooth(mirror(WING_R).map(tv), false),
    tailR: smooth(TAIL_R.map(tv), false),
    tailL: smooth(mirror(TAIL_R).map(tv), false),
  };
  const sideD = { prof: smooth(PROFILE.map(sv)), foil: smooth(AIRFOIL.map(sv)) };
  const [cx0, cy0] = tv([3.55, 0]);
  const canopyTop = `M${cx0},${cy0 - 0.72 * S} a${0.27 * S},${0.72 * S} 0 1,0 0.1,0 Z`;
  const spinTop = smooth([[0, 0], [0.12, 0.16], [0.3, 0.24], [0.5, 0.26], [0.5, -0.26], [0.3, -0.24], [0.12, -0.16]].map((p) => tv(p as P)));

  const outlinesTop = (
    <>
      <path d={topD.fus} />
      <path d={topD.wingR} />
      <path d={topD.wingL} />
      <path d={topD.tailR} />
      <path d={topD.tailL} />
    </>
  );
  const outlinesSide = (
    <>
      <path d={sideD.prof} />
      <path d={sideD.foil} />
    </>
  );

  const wheel = sv([2.45, -1.62]);
  const tw = sv([8.35, -0.4]);
  const tulipAnchor = sv([1.0, 0.05]);
  const heartC = sv([2.6, 0.12]);

  return (
    <Cine dark zoom={[1.0, 1.02]} seed={3}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0f3a6e 0%, #0a2a52 55%, #051731 100%)" }} />
      <Radar f={f} cx={540} cy={TOP + 3.9 * S} />
      <AbsoluteFill style={{ perspective: 1900, perspectiveOrigin: "50% 45%" }}>
        <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `translateY(${ty}px) scale(${sc}) rotateX(${rx}deg) rotateY(${ry}deg)`, transformOrigin: "50% 50%" }}>
          <AbsoluteFill style={{ transform: "translateZ(-90px) scale(1.05)" }}>
            <BlueGrid f={f} />
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: "translateZ(0px)" }}>
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs>
                <linearGradient id="skin" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0%" stopColor="#bfe3ff" stopOpacity={0.24} />
                  <stop offset="60%" stopColor="#5aa6e8" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#0a2a52" stopOpacity={0.05} />
                </linearGradient>
                <pattern id="hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1={0} y1={0} x2={0} y2={9} stroke="#d9efff" strokeWidth={2.2} opacity={0.7} />
                </pattern>
                <linearGradient id="scan" gradientUnits="userSpaceOnUse" x1={scanX - 220} y1={0} x2={scanX + 220} y2={0}>
                  <stop offset="0%" stopColor="#000" />
                  <stop offset="50%" stopColor="#fff" />
                  <stop offset="100%" stopColor="#000" />
                </linearGradient>
                <mask id="scanMask" maskUnits="userSpaceOnUse" x={-200} y={0} width={1500} height={1920}>
                  <rect x={-200} y={0} width={1500} height={1920} fill="url(#scan)" />
                </mask>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation={7} />
                </filter>
                <filter id="glowS" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation={2.2} />
                </filter>
              </defs>

              {/* ===== TAMPAK ATAS ===== */}
              <g>
                <Draw d={topD.fus} p={pFus} fill="url(#skin)" fillP={fillTop} w={2.8} />
                <Draw d={topD.wingR} p={pWing} w={2.8} />
                <Draw d={topD.wingL} p={pWing} w={2.8} />
                <Draw d={topD.tailR} p={pTail} w={2.6} />
                <Draw d={topD.tailL} p={pTail} w={2.6} />
                {/* isian sayap/ekor (tertutup dengan garis akar) */}
                <path d={smooth([...WING_R, ...mirror(WING_R).reverse()].map(tv))} fill="url(#skin)" opacity={fillTop * 0.9} />
                <path d={smooth([...TAIL_R, ...mirror(TAIL_R).reverse()].map(tv))} fill="url(#skin)" opacity={fillTop * 0.8} />
                {/* detail: slat, aileron/flap, kanopi, spinner, baling-baling, knalpot, beule */}
                {[1, -1].map((sg) => (
                  <g key={sg}>
                    <Draw d={line([[2.78, 2.6 * sg], [3.08, 4.25 * sg]].map((p) => tv(p as P)))} p={pDet} w={1.4} />
                    <Draw d={line([[3.92, 0.5 * sg], [3.98, 2.55 * sg]].map((p) => tv(p as P)))} p={pDet} w={1.4} />
                    <Draw d={line([[3.98, 2.6 * sg], [3.86, 4.45 * sg]].map((p) => tv(p as P)))} p={pDet} w={1.4} />
                    <Draw d={line([[8.38, 0.18 * sg], [8.42, 1.4 * sg]].map((p) => tv(p as P)))} p={pDet} w={1.2} />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x, y] = tv([1.05 + i * 0.15, 0.46 * sg]);
                      return <rect key={i} x={x - (sg > 0 ? 0 : 7)} y={y - 3} width={7} height={8} fill="none" stroke={INK} strokeWidth={1.1} opacity={pDet} />;
                    })}
                    {(() => { const [x, y] = tv([1.95, 0.36 * sg]); return <ellipse cx={x} cy={y} rx={9} ry={20} fill="none" stroke={INK} strokeWidth={1.3} opacity={pDet} />; })()}
                  </g>
                ))}
                <Draw d={canopyTop} p={pDet} w={2} fill="url(#hatch)" fillP={fillTop * 0.35} />
                <Draw d={spinTop} p={pDet} w={1.8} />
                <Draw d={line([tv([0.36, -1.5]), tv([0.36, 1.5])])} p={pDet} w={1.4} dash="10 8" color={DIM} />
                <Draw d={line([tv([-0.25, 0]), tv([9.1, 0])])} p={pDet} w={1} dash="22 6 4 6" color={DIM} />
              </g>

              {/* ===== TAMPAK SAMPING KIRI ===== */}
              <g>
                <Draw d={sideD.prof} p={pProf} fill="url(#skin)" fillP={fillSide} w={2.8} />
                <Draw d={sideD.foil} p={pSDet} w={1.8} fill="url(#skin)" fillP={fillSide} />
                <Draw d={smooth(TULIP.map(sv))} p={pSDet} w={1.8} fill="url(#hatch)" fillP={fillSide * 0.55} />
                <Draw d={smooth(heart(2.6, 0.12, 0.17).map(sv))} p={pSDet} w={2} fill="#ff8e8e" fillP={fillSide * 0.45} color="#ffd0d0" />
                <Draw d={line([[2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74]].map((p) => sv(p as P)))} p={pSDet} w={1.8} />
                <path d={smooth([[2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74], [4.45, 0.66], [2.85, 0.63]].map((p) => sv(p as P)))} fill="url(#hatch)" opacity={fillSide * 0.3} />
                {[3.18, 3.75, 4.3].map((x) => (
                  <Draw key={x} d={line([sv([x, 0.63]), sv([x, x === 4.3 ? 0.84 : x === 3.18 ? 0.93 : 1.0])])} p={pSDet} w={1.4} />
                ))}
                <Draw d={line([[2.85, 0.63], [4.45, 0.66]].map((p) => sv(p as P)))} p={pSDet} w={1.4} />
                {/* garis frame & panel */}
                {[5.0, 5.8, 6.6, 7.3].map((x) => (
                  <Draw key={x} d={line([sv([x, 0.6 - (x - 5) * 0.09]), sv([x, -0.36 + (x - 5) * 0.06])])} p={pSDet} w={1} dash="5 6" color={DIM} />
                ))}
                <Draw d={line([[0.55, 0.15], [2.75, 0.18]].map((p) => sv(p as P)))} p={pSDet} w={1} dash="5 6" color={DIM} />
                {Array.from({ length: 6 }).map((_, i) => {
                  const [x, y] = sv([1.05 + i * 0.15, 0.3]);
                  return <rect key={i} x={x} y={y - 6} width={8} height={12} rx={2} fill="none" stroke={INK} strokeWidth={1.2} opacity={pSDet} />;
                })}
                {/* ekor: stabilo + strut + engsel rudder */}
                <Draw d={smooth([[7.6, 0.68], [8.1, 0.73], [8.72, 0.69], [8.1, 0.63]].map((p) => sv(p as P)))} p={pSDet} w={1.8} />
                <Draw d={line([sv([7.95, 0.64]), sv([7.75, 0.2])])} p={pSDet} w={1.4} />
                <Draw d={line([sv([8.48, 0.18]), sv([8.5, 1.56])])} p={pSDet} w={1.2} />
                {/* roda pendarat */}
                <Draw d={line([sv([2.75, -0.58]), sv([2.47, -1.45])])} p={pSDet} w={3} />
                <Draw d={`M${wheel[0] + 0.33 * S},${wheel[1]} a${0.33 * S},${0.33 * S} 0 1,0 0.1,0 Z`} p={pSDet} w={2.2} fill="url(#skin)" fillP={fillSide} />
                <circle cx={wheel[0]} cy={wheel[1]} r={7} fill="none" stroke={INK} strokeWidth={1.4} opacity={pSDet} />
                <Draw d={line([sv([8.2, -0.16]), sv([8.33, -0.3])])} p={pSDet} w={2} />
                <Draw d={`M${tw[0] + 0.11 * S},${tw[1]} a${0.11 * S},${0.11 * S} 0 1,0 0.1,0 Z`} p={pSDet} w={1.8} />
                {/* baling-baling: bilah + piringan */}
                <Draw d={smooth([[0.34, 1.5], [0.42, 0.8], [0.4, 0.1], [0.3, 0.1], [0.28, 0.8]].map((p) => sv(p as P)))} p={pSDet} w={1.6} />
                <Draw d={smooth([[0.34, -1.5], [0.42, -0.8], [0.4, -0.1], [0.3, -0.1], [0.28, -0.8]].map((p) => sv(p as P)))} p={pSDet} w={1.6} />
                <Draw d={line([sv([0.36, -1.55]), sv([0.36, 1.55])])} p={pSDet} w={1} dash="10 8" color={DIM} />
                <Draw d={line([sv([-0.25, 0]), sv([9.15, 0])])} p={pSDet} w={1} dash="22 6 4 6" color={DIM} />
              </g>

              {/* ===== RIM LIGHT: glow lembut konstan + pita sapuan ===== */}
              <g fill="none" stroke="#9fdcff" strokeWidth={3} filter="url(#glowS)" opacity={0.45 * Math.min(fillTop + 0.2, 1)}>
                {pFus > 0.98 && outlinesTop}
                {pProf > 0.98 && outlinesSide}
              </g>
              <g mask="url(#scanMask)" opacity={scanOn}>
                <g fill="none" stroke="#e6f7ff" strokeWidth={7} filter="url(#glow)">
                  {pFus > 0.98 && outlinesTop}
                  {pProf > 0.98 && outlinesSide}
                </g>
                <g fill="none" stroke="#ffffff" strokeWidth={2.6}>
                  {pFus > 0.98 && outlinesTop}
                  {pProf > 0.98 && outlinesSide}
                </g>
              </g>

              {/* ===== GARIS UKUR ===== */}
              {(() => {
                const ya = TOP + 9.28 * S;
                const L = tv([3.52, -4.96]), R = tv([3.52, 4.96]);
                return <DimLine a={[L[0], ya]} b={[R[0], ya]} ext={[[[L[0], L[1] + 14], [L[0], ya + 16]], [[R[0], R[1] + 14], [R[0], ya + 16]]]} label="9.92 m" p={pSpan} tp={clamp01(tSpan)} />;
              })()}
              {(() => {
                const ya = SY + 2.25 * S;
                const a = sv([0, 0]), b = sv([8.9, 0]);
                return <DimLine a={[a[0], ya]} b={[b[0], ya]} ext={[[[a[0], a[1] + 30], [a[0], ya + 16]], [[b[0], SY - 0.4 * S], [b[0], ya + 16]]]} label="≈ 8.9 m" p={pLen} tp={clamp01(tLen)} />;
              })()}

              {/* label tampak */}
              <text x={95} y={TOP + 5.6 * S} fontFamily={F.type} fontSize={24} fill={DIM} letterSpacing={3} opacity={seg(f, 20, 40)}>PLAN VIEW</text>
              
              <text x={95} y={SY - 1.9 * S} fontFamily={F.type} fontSize={24} fill={DIM} letterSpacing={3} opacity={seg(f, 95, 115)}>PORT ELEVATION</text>

              {/* ===== CALLOUT MARKING ===== */}
              {show(MARKINGS.tulip.status) && <Callout anchor={tulipAnchor} box={[90, TOP + 7.2 * S, 330]} title="BLACK TULIP NOSE" sub="painted around the cowling" p={pTulip} />}
              {show(MARKINGS.heart.status) && <Callout anchor={heartC} box={[660, TOP + 7.2 * S, 330]} title="BLEEDING HEART" sub="his wife's initials inside" p={pHeart} />}
            </svg>
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* header & title block (terkunci ke layar, di atas 3D) */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 96 }}>
        <div style={{ fontFamily: F.type, fontSize: 30, color: "#ffd36e", letterSpacing: 6, opacity: seg(f, 8, 28) }}>TECHNICAL FILE · FIG. 1</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 92, color: "#f2f8ff", letterSpacing: 3, lineHeight: 1.0, marginTop: 6, opacity: seg(f, 12, 34), transform: `translateY(${(1 - easeOut(seg(f, 12, 34))) * 24}px)`, textShadow: "0 0 30px rgba(120,190,255,0.45)" }}>MESSERSCHMITT Bf 109 G</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 34, color: "#a9cdef", marginTop: 8, opacity: seg(f, 20, 42) }}>Hartmann's mount · general arrangement</div>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 70, height: 96, border: "2px solid rgba(159,208,255,0.6)", display: "flex", opacity: seg(f, 40, 70), background: "rgba(5,23,49,0.6)" }}>
        <div style={{ flex: 1.4, padding: "12px 18px", borderRight: "2px solid rgba(159,208,255,0.45)" }}>
          <div style={{ fontFamily: F.type, fontSize: 18, color: DIM, letterSpacing: 2 }}>DRAWING</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: "#eaf5ff", letterSpacing: 1 }}>ILLUSTRATIVE · NOT A FACTORY PLAN</div>
        </div>
        <div style={{ flex: 1, padding: "12px 18px" }}>
          <div style={{ fontFamily: F.type, fontSize: 18, color: DIM, letterSpacing: 2 }}>GRID</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 30, color: "#eaf5ff", letterSpacing: 1 }}>1 SQUARE = 1 m</div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut) }} />
    </Cine>
  );
};
