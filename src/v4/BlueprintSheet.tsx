import React from "react";
import { F } from "../kit/theme";

// Lembar cetak biru Bf 109 G — STATIS (tidak ada elemen bergerak; kamera yang menjelajah).
// Ilustratif. Bentang 9.92 m (konsisten antar sumber); panjang G-6 8.85–8.95 m -> "≈ 8.9 m".
export const BP_W = 1200, BP_H = 2200;
export const BP_PAD = { x: 60, y: 140 }; // offset gambar di dalam lembar
export const S = 88; // px per meter
export const TOP = 372, SX = 148, SY = 1478; // koordinat lokal gambar (sebelum offset)
type P = [number, number];
export const tv = ([x, y]: P): P => [540 + y * S, TOP + x * S];
export const sv = ([x, z]: P): P => [SX + x * S, SY - z * S];

const smooth = (pts: P[], closed = true) => {
  const n = pts.length;
  const g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + (closed ? " Z" : "");
};
const line = (pts: P[]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
const mir = (pts: P[]): P[] => pts.map(([x, y]) => [x, -y] as P);

const FUS_HALF: P[] = [[0.12, 0.16], [0.35, 0.3], [0.7, 0.4], [1.2, 0.45], [2.2, 0.47], [3.2, 0.46], [4.3, 0.42], [5.4, 0.33], [6.5, 0.24], [7.6, 0.15], [8.5, 0.08]];
const FUS: P[] = [[0, 0], ...FUS_HALF, [8.88, 0], ...mir(FUS_HALF).reverse()];
const WING: P[] = [[2.2, 0.47], [2.55, 2.4], [2.92, 4.25], [3.18, 4.82], [3.52, 4.96], [3.86, 4.86], [4.06, 4.5], [4.16, 2.4], [4.25, 0.47]];
const TAIL: P[] = [[7.55, 0.15], [7.78, 0.9], [8.0, 1.42], [8.26, 1.56], [8.5, 1.44], [8.63, 0.9], [8.72, 0.15]];
const PROFILE: P[] = [
  [0, 0], [0.08, 0.2], [0.3, 0.36], [0.7, 0.48], [1.2, 0.55], [1.9, 0.62], [2.1, 0.6], [2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74],
  [5.2, 0.62], [6.4, 0.5], [7.55, 0.42], [7.75, 0.62], [8.05, 1.25], [8.3, 1.55], [8.55, 1.6], [8.75, 1.45], [8.88, 1.05], [8.9, 0.4], [8.8, 0.05], [8.4, -0.12],
  [7.2, -0.22], [5.8, -0.34], [4.6, -0.48], [3.4, -0.58], [2.3, -0.62], [1.7, -0.72], [1.25, -0.78], [0.95, -0.62], [0.6, -0.45], [0.25, -0.28], [0.06, -0.14],
];
const FOIL: P[] = [[2.2, -0.42], [2.5, -0.3], [3.1, -0.27], [3.8, -0.34], [4.25, -0.42], [3.6, -0.5], [2.8, -0.53], [2.35, -0.5]];
const TULIP: P[] = [[0.5, 0.42], [1.1, 0.52], [1.48, 0.36], [1.12, 0.18], [1.58, 0.04], [1.12, -0.12], [1.48, -0.32], [1.05, -0.56], [0.5, -0.43]];
const HEART = (cx: number, cz: number, s: number): P[] => [[cx, cz - s * 0.9], [cx - s * 0.75, cz - s * 0.1], [cx - s * 0.8, cz + s * 0.45], [cx - s * 0.4, cz + s * 0.7], [cx, cz + s * 0.38], [cx + s * 0.4, cz + s * 0.7], [cx + s * 0.8, cz + s * 0.45], [cx + s * 0.75, cz - s * 0.1]];

const INK = "#e8f4ff", DIM = "#9fd0ff", GOLD = "#ffd36e";
const p = (pts: P[], f: (q: P) => P) => pts.map(f);

const Dim: React.FC<{ a: P; b: P; ext: [P, P][]; label: string }> = ({ a, b, ext, label }) => {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const arrow = (q: P, dir: number) => `M${q[0]},${q[1]} L${q[0] + 16 * dir},${q[1] - 6} L${q[0] + 16 * dir},${q[1] + 6} Z`;
  return (
    <g>
      {ext.map(([u, v], i) => <path key={i} d={line([u, v])} stroke={DIM} strokeWidth={1.4} fill="none" />)}
      <path d={line([a, b])} stroke={DIM} strokeWidth={2} />
      <path d={arrow(a, 1)} fill={DIM} />
      <path d={arrow(b, -1)} fill={DIM} />
      <rect x={mx - 92} y={my - 27} width={184} height={54} fill="#0b2c55" stroke={DIM} strokeWidth={1.5} />
      <text x={mx} y={my + 13} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={38} fill="#fff" letterSpacing={2}>{label}</text>
    </g>
  );
};

const Label: React.FC<{ anchor: P; box: [number, number, number]; title: string; sub: string }> = ({ anchor, box, title, sub }) => {
  const [bx, by, bw] = box;
  const tx = bx + bw / 2, ty = anchor[1] < by ? by : by + 96;
  return (
    <g>
      <circle cx={anchor[0]} cy={anchor[1]} r={11} fill="none" stroke={GOLD} strokeWidth={2.5} />
      <circle cx={anchor[0]} cy={anchor[1]} r={4} fill={GOLD} />
      <path d={line([anchor, [tx, anchor[1] + (ty - anchor[1]) * 0.55], [tx, ty]])} stroke={GOLD} strokeWidth={2} fill="none" />
      <rect x={bx} y={by} width={bw} height={96} fill="rgba(4,18,38,0.9)" stroke={GOLD} strokeWidth={2} />
      <rect x={bx} y={by} width={7} height={96} fill={GOLD} />
      <text x={bx + 22} y={by + 42} fontFamily={F.ui} fontWeight={700} fontSize={31} fill="#fff6dc" letterSpacing={1}>{title}</text>
      <text x={bx + 22} y={by + 76} fontFamily={F.type} fontSize={18} fill="#bcd6ef">{sub}</text>
    </g>
  );
};

export const TULIP_AT = sv([1.0, 0.05]);
export const HEART_AT = sv([2.6, 0.12]);

export const BlueprintSheet: React.FC = () => {
  const outlines = (
    <>
      <path d={smooth(p(FUS, tv))} />
      <path d={smooth([...WING, ...mir(WING).reverse()].map(tv))} />
      <path d={smooth([...TAIL, ...mir(TAIL).reverse()].map(tv))} />
      <path d={smooth(p(PROFILE, sv))} />
      <path d={smooth(p(FOIL, sv))} />
    </>
  );
  const [cx0, cy0] = tv([3.55, 0]);
  const wheel = sv([2.45, -1.62]);
  const tw = sv([8.35, -0.4]);
  const L = tv([3.52, -4.96]), R = tv([3.52, 4.96]);
  const spanY = TOP + 9.28 * S;
  const n0 = sv([0, 0]), n1 = sv([8.9, 0]);
  const lenY = SY + 2.25 * S;
  const rc: P = [540, TOP + 3.9 * S];
  return (
    <div style={{ position: "absolute", width: BP_W, height: BP_H, background: "radial-gradient(ellipse 90% 70% at 50% 45%, #0f3a6e 0%, #0a2a52 55%, #051731 100%)", boxShadow: "0 2px 3px rgba(0,0,0,0.3), 0 12px 20px rgba(0,0,0,0.3), 0 40px 70px rgba(0,0,0,0.35)" }}>
      <svg width={BP_W} height={BP_H}>
        <defs>
          <pattern id="bpf" width={S / 4} height={S / 4} patternUnits="userSpaceOnUse" x={(540 + BP_PAD.x) % (S / 4)} y={(TOP + BP_PAD.y) % (S / 4)}>
            <path d={`M${S / 4} 0 L0 0 0 ${S / 4}`} fill="none" stroke="#8cc4ff" strokeWidth={0.6} opacity={0.18} />
          </pattern>
          <pattern id="bpm" width={S} height={S} patternUnits="userSpaceOnUse" x={(540 + BP_PAD.x) % S} y={(TOP + BP_PAD.y) % S}>
            <rect width={S} height={S} fill="url(#bpf)" />
            <path d={`M${S} 0 L0 0 0 ${S}`} fill="none" stroke="#9fd0ff" strokeWidth={1.1} opacity={0.32} />
          </pattern>
          <linearGradient id="skin" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#bfe3ff" stopOpacity={0.24} />
            <stop offset="60%" stopColor="#5aa6e8" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#0a2a52" stopOpacity={0.05} />
          </linearGradient>
          <pattern id="hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={9} stroke="#d9efff" strokeWidth={2.2} opacity={0.7} />
          </pattern>
          <filter id="rim" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={6} /></filter>
          <linearGradient id="key" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity={1} />
            <stop offset="55%" stopColor="#fff" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id="keyMask"><rect width={BP_W} height={BP_H} fill="url(#key)" /></mask>
        </defs>
        <rect width={BP_W} height={BP_H} fill="url(#bpm)" />
        <g transform={`translate(${BP_PAD.x} ${BP_PAD.y})`}>
          {/* radar */}
          {[180, 340, 500, 660].map((r, i) => <circle key={r} cx={rc[0]} cy={rc[1]} r={r} fill="none" stroke="#7fc0ff" strokeWidth={i === 3 ? 1.8 : 1} opacity={0.22} strokeDasharray={i % 2 ? "6 10" : undefined} />)}
          {Array.from({ length: 36 }).map((_, i) => { const a = (i / 36) * Math.PI * 2, r0 = i % 3 ? 652 : 640; return <line key={i} x1={rc[0] + Math.cos(a) * r0} y1={rc[1] + Math.sin(a) * r0} x2={rc[0] + Math.cos(a) * 668} y2={rc[1] + Math.sin(a) * 668} stroke="#9fd0ff" strokeWidth={1.4} opacity={0.35} />; })}

          {/* isian kulit */}
          <g fill="url(#skin)" stroke="none">{outlines}</g>
          {/* rim light: glow lembut + kunci cahaya kiri-atas */}
          <g fill="none" stroke="#9fdcff" strokeWidth={4} filter="url(#rim)" opacity={0.55}>{outlines}</g>
          <g fill="none" stroke="#ffffff" strokeWidth={6} filter="url(#rim)" mask="url(#keyMask)" opacity={0.7}>{outlines}</g>
          <g fill="none" stroke={INK} strokeWidth={2.8} strokeLinejoin="round">{outlines}</g>

          {/* detail tampak atas */}
          <g fill="none" stroke={INK} strokeWidth={1.4}>
            {[1, -1].map((g) => (
              <g key={g}>
                <path d={line([tv([2.78, 2.6 * g]), tv([3.08, 4.25 * g])])} />
                <path d={line([tv([3.92, 0.5 * g]), tv([3.98, 2.55 * g])])} />
                <path d={line([tv([3.98, 2.6 * g]), tv([3.86, 4.45 * g])])} />
                <path d={line([tv([8.38, 0.18 * g]), tv([8.42, 1.4 * g])])} />
                {Array.from({ length: 6 }).map((_, i) => { const [x, y] = tv([1.05 + i * 0.15, 0.46 * g]); return <rect key={i} x={x - (g > 0 ? 0 : 7)} y={y - 3} width={7} height={8} />; })}
                {(() => { const [x, y] = tv([1.95, 0.36 * g]); return <ellipse cx={x} cy={y} rx={9} ry={20} />; })()}
              </g>
            ))}
            <path d={`M${cx0},${cy0 - 0.72 * S} a${0.27 * S},${0.72 * S} 0 1,0 0.1,0 Z`} fill="url(#hatch)" fillOpacity={0.35} strokeWidth={2} />
            <path d={smooth(([[0, 0], [0.12, 0.16], [0.3, 0.24], [0.5, 0.26], [0.5, -0.26], [0.3, -0.24], [0.12, -0.16]] as P[]).map(tv))} strokeWidth={1.8} />
          </g>
          <path d={line([tv([0.36, -1.5]), tv([0.36, 1.5])])} stroke={DIM} strokeWidth={1.4} strokeDasharray="10 8" />
          <path d={line([tv([-0.25, 0]), tv([9.1, 0])])} stroke={DIM} strokeWidth={1} strokeDasharray="22 6 4 6" />

          {/* detail tampak samping */}
          <path d={smooth(p(TULIP, sv))} fill="url(#hatch)" fillOpacity={0.55} stroke={INK} strokeWidth={1.8} />
          <path d={smooth(HEART(2.6, 0.12, 0.17).map(sv))} fill="#ff8e8e" fillOpacity={0.45} stroke="#ffd0d0" strokeWidth={2} />
          <g fill="none" stroke={INK} strokeWidth={1.5}>
            <path d={line(([[2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74]] as P[]).map(sv))} />
            <path d={smooth(([[2.85, 0.62], [3.15, 0.92], [3.5, 1.0], [4.1, 0.98], [4.45, 0.74], [4.45, 0.66], [2.85, 0.63]] as P[]).map(sv))} fill="url(#hatch)" fillOpacity={0.3} stroke="none" />
            {[[3.18, 0.93], [3.75, 1.0], [4.3, 0.84]].map(([x, z]) => <path key={x} d={line([sv([x, 0.63]), sv([x, z])])} />)}
            <path d={line([sv([2.85, 0.63]), sv([4.45, 0.66])])} />
            {Array.from({ length: 6 }).map((_, i) => { const [x, y] = sv([1.05 + i * 0.15, 0.3]); return <rect key={i} x={x} y={y - 6} width={8} height={12} rx={2} />; })}
            <path d={smooth(([[7.6, 0.68], [8.1, 0.73], [8.72, 0.69], [8.1, 0.63]] as P[]).map(sv))} />
            <path d={line([sv([7.95, 0.64]), sv([7.75, 0.2])])} />
            <path d={line([sv([8.48, 0.18]), sv([8.5, 1.56])])} />
            <path d={line([sv([2.75, -0.58]), sv([2.47, -1.45])])} strokeWidth={3} />
            <circle cx={wheel[0]} cy={wheel[1]} r={0.33 * S} fill="url(#skin)" strokeWidth={2.2} />
            <circle cx={wheel[0]} cy={wheel[1]} r={7} />
            <path d={line([sv([8.2, -0.16]), sv([8.33, -0.3])])} strokeWidth={2} />
            <circle cx={tw[0]} cy={tw[1]} r={0.11 * S} />
            <path d={smooth(([[0.34, 1.5], [0.42, 0.8], [0.4, 0.1], [0.3, 0.1], [0.28, 0.8]] as P[]).map(sv))} />
            <path d={smooth(([[0.34, -1.5], [0.42, -0.8], [0.4, -0.1], [0.3, -0.1], [0.28, -0.8]] as P[]).map(sv))} />
          </g>
          <g stroke={DIM} strokeWidth={1} fill="none" strokeDasharray="5 6">
            {[5.0, 5.8, 6.6, 7.3].map((x) => <path key={x} d={line([sv([x, 0.6 - (x - 5) * 0.09]), sv([x, -0.36 + (x - 5) * 0.06])])} />)}
            <path d={line([sv([0.55, 0.15]), sv([2.75, 0.18])])} />
          </g>
          <path d={line([sv([0.36, -1.55]), sv([0.36, 1.55])])} stroke={DIM} strokeWidth={1} strokeDasharray="10 8" />
          <path d={line([sv([-0.25, 0]), sv([9.15, 0])])} stroke={DIM} strokeWidth={1} strokeDasharray="22 6 4 6" />

          {/* garis ukur */}
          <Dim a={[L[0], spanY]} b={[R[0], spanY]} ext={[[[L[0], L[1] + 14], [L[0], spanY + 16]], [[R[0], R[1] + 14], [R[0], spanY + 16]]]} label="9.92 m" />
          <Dim a={[n0[0], lenY]} b={[n1[0], lenY]} ext={[[[n0[0], n0[1] + 30], [n0[0], lenY + 16]], [[n1[0], SY - 0.4 * S], [n1[0], lenY + 16]]]} label="≈ 8.9 m" />

          {/* label */}
          <text x={95} y={TOP + 5.6 * S} fontFamily={F.type} fontSize={24} fill={DIM} letterSpacing={3}>PLAN VIEW</text>
          <text x={95} y={SY - 1.9 * S} fontFamily={F.type} fontSize={24} fill={DIM} letterSpacing={3}>PORT ELEVATION</text>
          <Label anchor={TULIP_AT} box={[70, SY - 2.75 * S, 330]} title="BLACK TULIP NOSE" sub="painted around the cowling" />
          <Label anchor={HEART_AT} box={[300, SY + 0.75 * S, 330]} title="BLEEDING HEART" sub="his wife's initials inside" />

          {/* judul & title block */}
          <text x={0} y={-20} fontFamily={F.type} fontSize={30} fill={GOLD} letterSpacing={6}>TECHNICAL FILE · FIG. 1</text>
          <text x={0} y={70} fontFamily={F.ui} fontWeight={700} fontSize={92} fill="#f2f8ff" letterSpacing={3}>MESSERSCHMITT Bf 109 G</text>
          <text x={0} y={120} fontFamily={F.ui} fontWeight={600} fontSize={34} fill="#a9cdef">Hartmann's mount · general arrangement</text>
          <g transform={`translate(-10 ${SY + 3.2 * S})`}>
            <rect width={1100} height={96} fill="rgba(5,23,49,0.6)" stroke="rgba(159,208,255,0.6)" strokeWidth={2} />
            <line x1={640} y1={0} x2={640} y2={96} stroke="rgba(159,208,255,0.45)" strokeWidth={2} />
            <text x={18} y={30} fontFamily={F.type} fontSize={18} fill={DIM} letterSpacing={2}>DRAWING</text>
            <text x={18} y={70} fontFamily={F.ui} fontWeight={700} fontSize={30} fill="#eaf5ff">ILLUSTRATIVE · NOT A FACTORY PLAN</text>
            <text x={658} y={30} fontFamily={F.type} fontSize={18} fill={DIM} letterSpacing={2}>GRID</text>
            <text x={658} y={70} fontFamily={F.ui} fontWeight={700} fontSize={30} fill="#eaf5ff">1 SQUARE = 1 m</text>
          </g>
        </g>
      </svg>
    </div>
  );
};
