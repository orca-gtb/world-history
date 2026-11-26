import React from "react";
import { hash, mixHex, type V } from "./math";
// KENDARAAN v2: tiap faksi punya hull, turret, suspensi, dan susunan roda sendiri (bukan satu template). Satuan cm, tanah y=0, menghadap +x.
export type VKind = "sherman" | "panzer4" | "t34";
export type VTone = { fill: string; hi: string; gear: string };
export type VState = { t: number; speed: number; fireTimes?: number[]; moving?: boolean; dist?: number };
const F = (n: number) => Math.round(n * 10) / 10;
const poly = (p: V[]) => "M" + p.map((q) => `${F(q[0])},${F(q[1])}`).join(" L") + " Z";
const terr = (x: number) => 3.2 * Math.sin(x / 63) + 1.8 * Math.sin(x / 21 + 1.3) + 1.1 * Math.sin(x / 9.7 + 0.4);
const recoilOf = (t: number, fs?: number[]) => { let r = 0; if (fs) for (const s of fs) { const d = t - s; if (d >= 0 && d < 1.4) r = Math.max(r, (d < 0.08 ? d / 0.08 : Math.exp(-(d - 0.08) / 0.32))); } return r; };
const flashOn = (t: number, fs?: number[]) => !!fs && fs.some((s) => t >= s && t < s + 0.09);

const Wheel: React.FC<{ cx: number; cy: number; r: number; ang: number; c: VTone; spokes?: number; rim?: boolean }> = ({ cx, cy, r, ang, c, spokes = 5, rim = true }) => (
  <g transform={`translate(${F(cx)},${F(cy)})`}><circle r={r} fill={c.fill} />{rim && <circle r={r * 0.86} fill="none" stroke={c.hi} strokeWidth={0.7} opacity={0.35} />}
    <g transform={`rotate(${F(ang)})`}>{Array.from({ length: spokes }).map((_, i) => <rect key={i} x={-1.4} y={-r * 0.78} width={2.8} height={r * 0.5} fill={c.hi} opacity={0.4} transform={`rotate(${(360 / spokes) * i})`} />)}<circle r={r * 0.2} fill={c.hi} opacity={0.4} /></g></g>
);
const Track: React.FC<{ d: string; off: number; c: VTone; w?: number }> = ({ d, off, c, w = 7 }) => (<g fill="none"><path d={d} stroke={c.fill} strokeWidth={w} strokeLinejoin="round" /><path d={d} stroke={c.hi} strokeWidth={w - 1.5} strokeDasharray="7 5" strokeDashoffset={F(-off)} opacity={0.34} /></g>);

/** Sherman: hull tinggi, suspensi VVSS 3 bogie, turret cor membulat, laras 75 mm tanpa rem moncong */
const Sherman: React.FC<{ c: VTone; s: VState }> = ({ c, s }) => {
  const dist = s.dist ?? s.speed * s.t, rr = recoilOf(s.t, s.fireTimes), wx = [-171, -119, -47, 5, 71, 123], bump = wx.map((x) => terr(x + dist) * (s.moving ? 1 : 0));
  const hb = (bump[0] + bump[5]) * 0.18 + (s.moving ? 0 : 0), pitch = (s.moving ? (terr(190 + dist) - terr(-190 + dist)) * 0.07 : 0);
  const ang = (dist / 28) * (180 / Math.PI);
  return (
    <g>
      <g transform={`translate(0,${F(-hb)}) rotate(${F(pitch)} 0 -60)`}>
        <Track d="M-258,-58 L-150,-67 L100,-67 L252,-62 A30 30 0 0 1 252,-3 L-258,-3 A27 27 0 0 1 -258,-58 Z" off={dist} c={c} />
        {[-148, -24, 100].map((x, i) => <g key={i}><rect x={x - 5} y={-79} width={10} height={11} fill={c.gear} /><circle cx={x} cy={-72} r={8.5} fill={c.fill} /></g>)}
        {wx.map((x, i) => <Wheel key={i} cx={x} cy={-29 - bump[i] * 0.5} r={28} ang={ang} c={c} />)}
        <Wheel cx={252} cy={-33} r={30} ang={ang * 0.93} c={c} spokes={10} /><Wheel cx={-258} cy={-30} r={27} ang={ang} c={c} />
        {[-190, -140, -90, -40, 10, 60, 110, 160, 205].map((x, i) => <rect key={i} x={x} y={-88} width={34} height={3} fill={c.hi} opacity={0.18} />)}
        <path d={poly([[-290, -56], [-294, -104], [-282, -127], [-110, -129], [-50, -136], [-22, -150], [118, -150], [150, -149], [282, -88], [294, -80], [294, -56]])} fill={c.fill} />
        <path d={poly([[-286, -128], [-110, -130], [-110, -136], [-286, -135]])} fill={c.gear} />
        <path d="M150,-149 L282,-88 M-110,-130 L-52,-136" stroke={c.hi} strokeWidth={0.8} opacity={0.4} fill="none" />
        <rect x={-300} y={-100} width={12} height={14} fill={c.gear} /><rect x={196} y={-104} width={26} height={8} fill={c.gear} opacity={0.8} />
        <g transform="translate(0,0)">
          <path d={smoothTurret()} fill={c.fill} /><path d="M-86,-222 L-50,-226" stroke={c.hi} strokeWidth={0.9} opacity={0.4} />
          <rect x={-58} y={-244} width={34} height={20} rx={4} fill={c.fill} /><rect x={-54} y={-239} width={26} height={3} fill={c.hi} opacity={0.3} /><path d="M-36,-244 L-36,-262 M-36,-258 L-22,-258" stroke={c.fill} strokeWidth={2.2} fill="none" />
          <g transform={`translate(${F(-rr * 22)},0) rotate(${F(-0.8 - 0.4 * rr)} 100 -186)`}><rect x={96} y={-196} width={26} height={20} rx={6} fill={c.fill} /><rect x={118} y={-190.5} width={228} height={9} fill={c.fill} /><rect x={340} y={-192} width={12} height={12} fill={c.fill} /></g>
        </g>
      </g>
      {flashOn(s.t, s.fireTimes) && <g transform="translate(352,-190)"><circle r={26} fill="#ffcf73" opacity={0.3} /><path d="M0,0 L50,-16 L26,-2 L74,0 L26,3 L50,17 Z" fill="#fff0c0" /></g>}
    </g>
  );
};
const smoothTurret = () => "M-96,-148 L-100,-176 Q-110,-196 -86,-210 Q-62,-228 -10,-230 Q38,-232 70,-222 Q96,-210 100,-196 L100,-150 Z";

/** Panzer IV Ausf. H: bodi kotak, Schürzen (pelat samping tidak rata), turret kotak, laras panjang KwK 40 dengan rem moncong dua sekat */
const Panzer4: React.FC<{ c: VTone; s: VState }> = ({ c, s }) => {
  const dist = s.dist ?? s.speed * s.t, rr = recoilOf(s.t, s.fireTimes), wx = [-217, -183, -115, -81, -13, 21, 89, 123], bump = wx.map((x) => terr(x + dist) * (s.moving ? 1 : 0));
  const pitch = s.moving ? (terr(190 + dist) - terr(-190 + dist)) * 0.07 : 0, ang = (dist / 24) * (180 / Math.PI);
  return (
    <g>
      <g transform={`translate(0,${F(-(bump[0] + bump[7]) * 0.15)}) rotate(${F(pitch)} 0 -60)`}>
        <Track d="M-268,-48 L-150,-56 L90,-56 L262,-60 A29 29 0 0 1 262,-2 L-268,-2 A24 24 0 0 1 -268,-48 Z" off={dist} c={c} />
        {[-160, -90, -20, 52].map((x, i) => <circle key={i} cx={x} cy={-60} r={9} fill={c.fill} />)}
        {wx.map((x, i) => <Wheel key={i} cx={x} cy={-24 - bump[i] * 0.45} r={24} ang={ang} c={c} spokes={6} />)}
        <Wheel cx={262} cy={-30} r={29} ang={ang * 0.8} c={c} spokes={8} /><Wheel cx={-268} cy={-24} r={24} ang={ang} c={c} />
        <path d={poly([[-290, -54], [-292, -122], [-270, -130], [-120, -132], [-86, -140], [-60, -148], [76, -148], [96, -142], [270, -128], [292, -118], [292, -54]])} fill={c.fill} />
        <path d="M96,-142 L270,-128 M-270,-130 L-120,-132" stroke={c.hi} strokeWidth={0.8} opacity={0.35} fill="none" />
        {/* Schürzen: pelat samping, sebagian bengkok/hilang */}
        {Array.from({ length: 8 }).map((_, i) => { if (i === 3) return null; const x = -258 + i * 53, tilt = (hash(i * 3.1) - 0.5) * 3.2, top = -138 + (i % 3) * 1.4; return <g key={i} transform={`rotate(${F(tilt)} ${x + 25} -90)`}><path d={poly([[x, -58], [x, top], [x + 50, top - 2], [x + 50, -60]])} fill={c.gear} /><path d={`M${x + 4},${top + 6} L${x + 46},${top + 4}`} stroke={c.hi} strokeWidth={0.7} opacity={0.32} /></g>; })}
        <path d={poly([[-52, -146], [-56, -190], [-40, -210], [50, -210], [64, -194], [64, -150]])} fill={c.fill} />
        {[-40, -14, 12, 38].map((x, i) => <path key={i} d={poly([[x, -148], [x - 1.4 + hash(i) * 2, -190 + hash(i + 3) * 8], [x + 24, -192], [x + 25, -148]])} fill={c.gear} opacity={0.92} />)}
        <path d={poly([[-76, -170], [-76, -196], [-52, -196], [-52, -170]])} fill={c.gear} />
        <rect x={-36} y={-226} width={30} height={20} rx={3} fill={c.fill} /><rect x={-33} y={-221} width={24} height={3} fill={c.hi} opacity={0.25} /><path d="M-22,-226 L-22,-240 M-28,-240 L-14,-240" stroke={c.fill} strokeWidth={2} fill="none" />
        <g transform={`translate(${F(-rr * 24)},0) rotate(${F(-0.6 - 0.4 * rr)} 66 -178)`}><rect x={58} y={-192} width={22} height={28} rx={5} fill={c.fill} /><rect x={76} y={-182} width={316} height={7.4} fill={c.fill} /><rect x={388} y={-186} width={32} height={15} fill={c.fill} /><rect x={400} y={-188} width={3} height={19} fill={c.gear} /><rect x={412} y={-188} width={3} height={19} fill={c.gear} /></g>
        <g fill={c.gear}><rect x={-296} y={-100} width={12} height={9} /><rect x={-296} y={-86} width={12} height={9} /></g>
      </g>
      {flashOn(s.t, s.fireTimes) && <g transform="translate(424,-178)"><circle r={30} fill="#ffcf73" opacity={0.3} /><path d="M0,0 L56,-20 L30,-3 L84,0 L30,4 L56,21 Z" fill="#fff0c0" /></g>}
    </g>
  );
};

/** T-34 mod. 1943: lambung miring, 5 roda jalan besar Christie tanpa roller balik, turret heksagonal ke depan, sproket di belakang, tangki bahan bakar di fender */
const T34M: React.FC<{ c: VTone; s: VState }> = ({ c, s }) => {
  const dist = s.dist ?? s.speed * s.t, rr = recoilOf(s.t, s.fireTimes), wx = [-196, -102, -8, 86, 180], bump = wx.map((x) => terr(x + dist) * (s.moving ? 1 : 0));
  const pitch = s.moving ? (terr(200 + dist) - terr(-200 + dist)) * 0.08 : 0, ang = (dist / 41) * (180 / Math.PI);
  return (
    <g>
      <g transform={`translate(0,${F(-(bump[0] + bump[4]) * 0.18)}) rotate(${F(pitch)} 0 -60)`}>
        <Track d="M-262,-72 L-190,-84 L120,-84 L262,-78 A38 38 0 0 1 262,-2 L-262,-2 A31 31 0 0 1 -262,-72 Z" off={dist} c={c} w={8} />
        {wx.map((x, i) => <Wheel key={i} cx={x} cy={-41 - bump[i] * 0.6} r={41} ang={ang} c={c} spokes={6} />)}
        <Wheel cx={262} cy={-39} r={37} ang={ang * 0.9} c={c} spokes={8} /><Wheel cx={-264} cy={-33} r={31} ang={ang * 1.1} c={c} spokes={12} />
        <path d={poly([[-300, -74], [-304, -104], [-286, -126], [-130, -128], [-110, -134], [-26, -138], [130, -148], [166, -148], [306, -96], [312, -80], [308, -62]])} fill={c.fill} />
        <path d="M166,-148 L306,-96 M-286,-126 L-130,-128" stroke={c.hi} strokeWidth={0.8} opacity={0.4} fill="none" />
        <rect x={-254} y={-132} width={118} height={7} fill={c.gear} opacity={0.8} />
        {[-244, -184].map((x, i) => <rect key={i} x={x} y={-102} width={52} height={20} rx={9} fill={c.gear} />)}
        <rect x={-22} y={-110} width={40} height={14} rx={2} fill={c.gear} opacity={0.9} />
        <path d={poly([[-22, -146], [-34, -166], [-20, -194], [24, -206], [76, -203], [110, -188], [118, -168], [114, -147]])} fill={c.fill} />
        <path d="M-18,-190 L26,-201 L78,-198" stroke={c.hi} strokeWidth={0.9} opacity={0.4} fill="none" />
        <rect x={-14} y={-222} width={32} height={18} rx={4} fill={c.fill} /><rect x={-10} y={-218} width={24} height={3} fill={c.hi} opacity={0.3} /><path d="M54,-205 L54,-224 M62,-205 L62,-224" stroke={c.fill} strokeWidth={2} fill="none" />
        <g transform={`translate(${F(-rr * 20)},0) rotate(${F(-0.9 - 0.5 * rr)} 112 -176)`}><rect x={104} y={-186} width={20} height={18} rx={5} fill={c.fill} /><rect x={120} y={-179.5} width={292} height={7.6} fill={c.fill} /></g>
      </g>
      {flashOn(s.t, s.fireTimes) && <g transform="translate(414,-176)"><circle r={26} fill="#ffcf73" opacity={0.3} /><path d="M0,0 L48,-16 L24,-2 L72,0 L24,3 L48,17 Z" fill="#fff0c0" /></g>}
    </g>
  );
};
const BODY = { sherman: Sherman, panzer4: Panzer4, t34: T34M };
export const VEH_INFO: Record<VKind, { faction: string; label: string; lenCm: number }> = {
  sherman: { faction: "us", label: "M4 Sherman (US)", lenCm: 700 }, panzer4: { faction: "germany", label: "Panzer IV Ausf. H (Wehrmacht)", lenCm: 700 }, t34: { faction: "soviet", label: "T-34 mod. 1943 (Red Army)", lenCm: 700 },
};
export const VEH_TINT: Record<VKind, string> = { sherman: "#1d2017", panzer4: "#1b1e22", t34: "#241e17" };
/** Smoke/dust: partikel deterministik dari t (tanpa Math.random) */
export const Puffs: React.FC<{ x: number; y: number; px: number; t: number; n?: number; life?: number; dx?: number; rise?: number; r0?: number; grow?: number; color?: string; alpha?: number; seed?: number; flip?: boolean }> = ({ x, y, px, t, n = 8, life = 3, dx = 40, rise = 70, r0 = 5, grow = 16, color = "#8a7a62", alpha = 0.34, seed = 0, flip }) => (
  <g>{Array.from({ length: n }).map((_, i) => { const age = (((t / life) + i / n + hash(i + seed) * 0.07) % 1 + 1) % 1, r = (r0 + grow * age) * px, o = alpha * Math.pow(1 - age, 1.4) * (age < 0.08 ? age / 0.08 : 1), sg = flip ? -1 : 1;
    return <circle key={i} cx={F(x + sg * (dx * age + (hash(i * 5 + seed) - 0.5) * 8) * px)} cy={F(y - rise * age * px)} r={F(r)} fill={color} opacity={F(o * 100) / 100} />; })}</g>
);
export const Vehicle: React.FC<{ kind: VKind; t: number; x: number; y: number; px: number; speed?: number; dist?: number; moving?: boolean; flip?: boolean; haze?: number; hazeColor?: string; fireTimes?: number[]; shadow?: boolean; rim?: boolean; dustColor?: string }> = (p) => {
  const base = VEH_TINT[p.kind], hc = p.hazeColor ?? "#b99a70", fill = mixHex(base, hc, p.haze ?? 0), c: VTone = { fill, hi: mixHex("#8d7a5a", hc, (p.haze ?? 0) * 0.7), gear: mixHex(fill, "#6c5f48", 0.16) };
  const B = BODY[p.kind], st: VState = { t: p.t, speed: p.speed ?? 0, dist: p.dist, fireTimes: p.fireTimes, moving: p.moving }, sg = p.flip ? -1 : 1, s = p.px;
  const black: VTone = { fill: "#0b0906", hi: "#0b0906", gear: "#0b0906" }, rimPx = Math.max(0.9, s * 1.7);
  return (
    <g>
      {p.shadow !== false && <g transform={`translate(${F(p.x)},${F(p.y)}) matrix(${F(s * sg)},0,${F(-s * 0.95)},${F(-s * 0.2)},0,0)`} opacity={0.3}><B c={black} s={{ ...st, fireTimes: undefined }} /></g>}
      {p.rim !== false && <g transform={`translate(${F(p.x - rimPx)},${F(p.y - rimPx * 0.8)}) scale(${F(s * sg)},${F(s)})`}><B c={{ fill: "#d9a860", hi: "#d9a860", gear: "#d9a860" }} s={{ ...st, fireTimes: undefined }} /></g>}
      <g transform={`translate(${F(p.x)},${F(p.y)}) scale(${F(s * sg)},${F(s)})`}><B c={c} s={st} /></g>
    </g>
  );
};
