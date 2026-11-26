import React from "react";
import { type V, add, mixHex, rot } from "./math";
import { type AnimId } from "./gait";
import { solveRig, WD, type Rig } from "./rig2";
import { WEAPON_ART, bipod } from "./weapons2";

// SKIN: identitas visual tiap faksi (helm, potongan seragam, perlengkapan, sepatu). Senjata ditukar lewat skin.weapon, rig tetap sama.
export type SkinId = "us_rifleman" | "us_radio" | "de_rifleman" | "de_mg" | "su_smg" | "su_rifleman";
export type Skin = { id: SkinId; faction: "us" | "germany" | "soviet"; label: string; weapon: string; helmet: "m1" | "stahl" | "ssh"; back: "haversack" | "scr300" | "aframe" | "sidor"; profile: [number, number, number][]; thigh: [number, number]; shin: [number, number]; boot: "us" | "de" | "su"; handset?: boolean; tint: string };
const PRO_US: Skin["profile"] = [[-9, -12.2, 13], [0, -11.8, 11.6], [14, -10.8, 11.6], [30, -12.6, 14.2], [44, -13.6, 14.6], [53, -10, 11]];
const PRO_DE: Skin["profile"] = [[-3, -11, 11.6], [14, -10, 11], [30, -12, 13.8], [44, -13, 14.2], [53, -10, 11]];
const PRO_SU: Skin["profile"] = [[-15, -13.6, 14.4], [-4, -12.6, 12.6], [14, -11, 12], [30, -13, 14.6], [44, -13.6, 14.8], [53, -10, 11.2]];
export const SKINS: Record<SkinId, Skin> = {
  us_rifleman: { id: "us_rifleman", faction: "us", label: "US rifleman (M1 Garand)", weapon: "garand", helmet: "m1", back: "haversack", profile: PRO_US, thigh: [9.6, 7], shin: [6.2, 4.9], boot: "us", tint: "#1d2017" },
  us_radio: { id: "us_radio", faction: "us", label: "US radio operator (SCR-300)", weapon: "garand", helmet: "m1", back: "scr300", profile: PRO_US, thigh: [9.6, 7], shin: [6.2, 4.9], boot: "us", handset: true, tint: "#1d2017" },
  de_rifleman: { id: "de_rifleman", faction: "germany", label: "Wehrmacht Schütze (Kar 98k)", weapon: "kar98k", helmet: "stahl", back: "aframe", profile: PRO_DE, thigh: [9.2, 6.7], shin: [5.9, 4.6], boot: "de", tint: "#1b1e22" },
  de_mg: { id: "de_mg", faction: "germany", label: "Wehrmacht MG-Schütze (MG 42)", weapon: "mg42", helmet: "stahl", back: "aframe", profile: PRO_DE, thigh: [9.2, 6.7], shin: [5.9, 4.6], boot: "de", tint: "#1b1e22" },
  su_smg: { id: "su_smg", faction: "soviet", label: "Red Army avtomatchik (PPSh-41)", weapon: "ppsh", helmet: "ssh", back: "sidor", profile: PRO_SU, thigh: [10.2, 7.6], shin: [6.8, 5.8], boot: "su", tint: "#241e17" },
  su_rifleman: { id: "su_rifleman", faction: "soviet", label: "Red Army strelok (Mosin-Nagant)", weapon: "mosin", helmet: "ssh", back: "sidor", profile: PRO_SU, thigh: [10.2, 7.6], shin: [6.8, 5.8], boot: "su", tint: "#241e17" },
};
export type Tone = { fill: string; far: string; hi: string; gear: string };
export const toneOf = (sk: Skin, haze = 0, hazeColor = "#b99a70"): Tone => { const fill = mixHex(sk.tint, hazeColor, haze); return { fill, far: mixHex(fill, "#7f6a4c", 0.22), hi: mixHex("#8d7a5a", hazeColor, haze * 0.7), gear: mixHex(fill, "#6c5f48", 0.16) }; };

const F = (n: number) => Math.round(n * 10) / 10, pp = (p: V) => `${F(p[0])},${F(p[1])}`;
const poly = (pts: V[]) => "M" + pts.map(pp).join(" L") + " Z";
const smooth = (p: V[]) => { const n = p.length, m = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let d = "M" + pp(m(p[0], p[1])); for (let i = 1; i <= n; i++) d += ` Q${pp(p[i % n])} ${pp(m(p[i % n], p[(i + 1) % n]))}`; return d + " Z"; };
const cap = (a: V, b: V, r0: number, r1: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n: V = [-dy / l, dx / l]; const A = (p: V, r: number, s: number): V => [p[0] + n[0] * r * s, p[1] + n[1] * r * s]; return `M${pp(A(a, r0, 1))} L${pp(A(b, r1, 1))} A${r1} ${r1} 0 0 0 ${pp(A(b, r1, -1))} L${pp(A(a, r0, -1))} A${r0} ${r0} 0 0 0 ${pp(A(a, r0, 1))} Z`; };
const BOOT: Record<Skin["boot"], V[]> = {
  us: [[-6.9, 8], [-7.2, 2], [-5.8, -14], [5.2, -14], [5.6, -3], [10, -1], [17, 3], [19.2, 6.6], [18.6, 8]],
  de: [[-6.6, 8], [-6.9, 2], [-5.2, -12], [4.6, -12], [5, -2], [11, 0], [18, 4], [20.4, 7], [19.4, 8]],
  su: [[-7.2, 8], [-7.8, 2], [-6.8, -15], [6.4, -15], [6.6, -3], [11, -1], [17, 3], [19.6, 6.6], [19, 8]],
};
const HELM = (k: Skin["helmet"], f: string, hi: string) => k === "m1" ? <g fill={f}><path d={smooth([[-13.8, 0.4], [-12, -7], [-6, -12.4], [2, -14], [9.4, -11.2], [13.2, -5], [14.6, 0.4]])} /><path d={poly([[-15.6, -0.6], [16, -1.2], [15, 1.8], [-14.6, 2.2]])} /><path d="M-9,-8 Q0,-14 10,-9" stroke={hi} strokeWidth={0.7} fill="none" opacity={0.55} /></g>
  : k === "stahl" ? <g fill={f}><path d={smooth([[-14.4, 2], [-14.4, -6], [-7, -12.8], [2, -14.4], [9.6, -11.6], [12.8, -6], [13.8, 0], [12, 2.4]])} /><path d={poly([[-15.6, 3.4], [-18.4, 11.2], [-12.6, 12], [-5, 7], [-3.6, 2]])} /><path d={poly([[10, -1.6], [15.4, 0.6], [13.4, 3.6], [8.6, 2.6]])} /><path d="M-9,-9 Q0,-14.4 10,-9.6" stroke={hi} strokeWidth={0.7} fill="none" opacity={0.55} /></g>
  : <g fill={f}><path d={smooth([[-11.8, 1.4], [-11.8, -5], [-6, -10.8], [1, -12.4], [7.6, -9.4], [11, -4], [12.4, 0.6]])} /><path d={poly([[9, -2.4], [15.4, -0.8], [14.4, 1.6], [8.2, 1.2]])} /><path d="M-7,-8.4 Q0,-12.6 8,-8.4" stroke={hi} strokeWidth={0.7} fill="none" opacity={0.55} /></g>;
const HEAD = [[-8, -4], [-7, -10], [0, -12.6], [7, -10.4], [9.2, -5], [9.8, -1.6], [11.6, 2.2], [9.6, 3.6], [9.2, 5.2], [7.6, 10], [0, 10.4], [-4.6, 7.6], [-8.4, 2.2]] as V[];

export function figure(rig: Rig, sk: Skin, c: Tone, anim: AnimId, opt: { bipodY?: number; flash?: boolean } = {}): React.ReactNode {
  const { pose, P, S, Sf, head, headAng } = rig, wd = WD[sk.weapon], k = anim === "run" ? 2.3 : anim === "walk" ? 1 : 0.35, sw = pose.wob * k, swg = pose.swing * k;
  const G = (pts: V[], pivot: V | null, deg: number) => poly(pts.map((q): V => { let v = q; if (pivot && deg) { const r = rot([q[0] - pivot[0], q[1] - pivot[1]], deg); v = [pivot[0] + r[0], pivot[1] + r[1]]; } return P(v[0], v[1]); }));
  const out: React.ReactNode[] = [];
  const leg = (knee: V, foot: { ankle: V; psi: number }, col: string, hiL: boolean) => (
    <g key={"leg" + (hiL ? "n" : "f")} fill={col}>
      <path d={cap(pose.hip, knee, sk.thigh[0], sk.thigh[1])} /><path d={cap(knee, foot.ankle, sk.shin[0], sk.shin[1])} />
      <g transform={`translate(${F(foot.ankle[0])},${F(foot.ankle[1])}) rotate(${F(-foot.psi)})`}><path d={poly(BOOT[sk.boot])} />
        {hiL && <path d="M-5.6,-6 L5,-6 M-5.4,-1 L5,-1" stroke={c.hi} strokeWidth={0.5} opacity={0.35} />}</g>
    </g>);
  // 1) kaki jauh, lengan jauh
  out.push(leg(pose.farKnee, pose.farFoot, c.far, false));
  // 2) torso + seragam
  const prof = sk.profile.map(([t, b, f]) => [t, b - (t < 0 ? 0.9 * swg * (t < -6 ? 1 : 0.4) : 0), f] as [number, number, number]);
  const torso = smooth([...prof.map(([t, b]) => P(t, b)), ...prof.slice().reverse().map(([t, , f]) => P(t, f))]);
  // belakang: ransel/perlengkapan punggung (digambar sebelum torso agar tonjolan terbaca di siluet)
  if (sk.back === "haversack") {
    out.push(<g key="bk" fill={c.gear} stroke={c.gear} strokeWidth={1.2} strokeLinejoin="round"><path d={G([[22, -10.5], [47, -11], [48.5, -20], [46, -24.2], [30, -25.4], [22, -23]], [47, -11], 1.6 * sw)} /><path d={G([[47, -12], [54, -14], [55, -20], [48, -23]], [47, -11], 1.6 * sw)} />
      <path d={G([[5, -13], [28, -14.2], [29, -16.6], [5, -15.4]], [28, -14], 1.2 * sw)} fill={c.fill} stroke="none" /><path d={G([[24, -14], [45, -15], [45, -20]], null, 0)} fill="none" stroke={c.hi} strokeWidth={0.6} opacity={0.45} /></g>);
  } else if (sk.back === "scr300") {
    const ant = [0, 1, 2, 3, 4, 5].map((i): V => P(52 + i * 17, -21 - 3 - i * i * 0.5 - sw * i * i * 0.55));
    out.push(<g key="bk"><path d={G([[7, -10.8], [50, -11.6], [53, -15], [53, -22], [50, -24.5], [8, -24.5], [5, -20], [5, -14]], [50, -11], 1.0 * sw)} fill={c.gear} stroke={c.gear} strokeWidth={1.2} strokeLinejoin="round" />
      <path d={G([[12, -12], [46, -12.6], [47, -22], [12, -23]], [50, -11], 1.0 * sw)} fill="none" stroke={c.hi} strokeWidth={0.6} opacity={0.4} />
      <path d={"M" + ant.map(pp).join(" L")} fill="none" stroke={c.fill} strokeWidth={1} strokeLinecap="round" /></g>);
  } else if (sk.back === "aframe") {
    out.push(<g key="bk" fill={c.gear} stroke={c.gear} strokeWidth={1.2} strokeLinejoin="round"><path d={G([[26, -11], [41, -11.4], [42, -19], [27, -19.6]], [41, -11], 1.2 * sw)} /><path d={G([[40, -11], [49, -12], [51, -17], [47, -22], [41, -21.4]], [41, -11], 1.2 * sw)} /><ellipse cx={P(33, -17)[0]} cy={P(33, -17)[1]} rx={6.4} ry={3.2} transform={`rotate(${F(pose.lean - 90)} ${pp(P(33, -17))})`} fill={c.fill} />
      <path d={G([[-3, -9.5], [-3, -15], [10, -16], [11, -9.5]], [10, -9], 5 * swg)} /></g>);
  } else {
    out.push(<g key="bk" fill={c.gear} stroke={c.gear} strokeWidth={1.2} strokeLinejoin="round"><path d={G([[19, -10.4], [40, -11], [43, -17], [39, -21.6], [24, -21.6], [18.6, -16]], [40, -11], 1.8 * sw)} />
      <path d={G([[-1, -10.6], [8, -10.6], [9, -16], [-1, -16]], [8, -10], 5 * swg)} fill={c.gear} /></g>);
  }
  out.push(<path key="torso" d={torso} fill={c.fill} />);
  out.push(<circle key="pelvis" cx={F(pose.hip[0])} cy={F(pose.hip[1])} r={9.6} fill={c.fill} />);
  // depan: perlengkapan khas faksi
  if (sk.faction === "us") {
    out.push(<g key="gu" fill={c.gear} stroke={c.gear} strokeWidth={1} strokeLinejoin="round"><path d={G([[6, 8.6], [15, 8.8], [15, 13.6], [6, 13.4]], null, 0)} /><path d={G([[-2, 8.6], [5, 8.8], [5, 12.8], [-2, 12.6]], null, 0)} /><path d={G([[3, -9], [14, -10], [14.4, -4], [3.6, -3.4]], [14, -8], 6 * swg)} /></g>);
    out.push(<path key="us-s" d={`M${pp(P(51, 1))} L${pp(P(2, 10.4))} M${pp(P(51, -4))} L${pp(P(2, -9))}`} stroke={c.hi} strokeWidth={0.6} opacity={0.4} fill="none" />);
  } else if (sk.faction === "germany") {
    out.push(<g key="gd" fill={c.gear} stroke={c.gear} strokeWidth={1} strokeLinejoin="round"><path d={G([[3, 8.6], [15.6, 9], [15.6, 15.4], [3, 15.2]], null, 0)} /><path d={G([[-5.6, -4], [4, -4.6], [5, -15], [-5.6, -16]], [5, -5], 7 * swg)} /><path d={G([[-2, 9.4], [-2, 13.4], [3, 13.2], [3, 9.2]], null, 0)} /></g>);
    out.push(<path key="de-s" d={`M${pp(P(51, 2))} L${pp(P(3, 9))} M${pp(P(51, -4))} L${pp(P(3, -8))}`} stroke={c.hi} strokeWidth={0.6} opacity={0.4} fill="none" />);
  } else {
    const roll = [[51, -3.5], [47, 8.4], [35, 14.6], [21, 12.4], [11, 2.4], [8.5, -6]] as V[];
    out.push(<g key="gs"><path d={"M" + roll.map((q) => pp(P(q[0], q[1]))).join(" L")} fill="none" stroke={c.gear} strokeWidth={8.2} strokeLinecap="round" strokeLinejoin="round" /><path d={"M" + roll.map((q) => pp(P(q[0] + 1.2, q[1] + 0.6))).join(" L")} fill="none" stroke={c.hi} strokeWidth={0.6} opacity={0.4} />
      <g fill={c.gear} stroke={c.gear} strokeWidth={1} strokeLinejoin="round"><path d={G([[1, 9], [9, 9.2], [9, 14], [1, 13.8]], null, 0)} /><path d={G([[-7, -3.4], [3, -4], [4, -11], [-6.6, -11.6]], [3, -5], 6 * swg)} /></g></g>);
  }
  // belt
  out.push(<path key="belt" d={`M${pp(P(0.5, prof[1][1] + 0.4))} L${pp(P(0.5, prof[1][2] - 0.2))}`} stroke={c.hi} strokeWidth={1.6} opacity={0.5} />);
  // 3) leher + kepala
  const nb = rig.neck;
  out.push(<path key="neck" d={cap(add(nb, [-2, -2]), add(head, rot([-1.2, 6.4], headAng)), 7, 5.8)} fill={c.fill} />);
  out.push(<g key="head" transform={`translate(${pp(head)}) rotate(${F(headAng)})`} fill={c.fill}><path d={smooth(HEAD)} />{HELM(sk.helmet, c.fill, c.hi)}<path d="M-5,2.4 Q2,9 8,6" stroke={c.hi} strokeWidth={0.6} fill="none" opacity={0.4} /></g>);
  // 4) lengan jauh -> senjata -> kaki dekat -> lengan dekat
  out.push(<g key="farArm" fill={c.far}><path d={cap(Sf, rig.farElbow, 5, 4.2)} /><path d={cap(rig.farElbow, rig.farHand, 4.2, 3.2)} /></g>);
  out.push(leg(pose.nearKnee, pose.nearFoot, c.fill, true));
  const wm = rig.muzzleW;
  out.push(<g key="weapon">
    <g transform={`translate(${pp(rig.butt)}) rotate(${F(rig.wAng)})`}>{WEAPON_ART[sk.weapon](c.fill, c.hi)}{wd.bipod && opt.bipodY !== undefined ? (() => { const piv = rig.W([wd.bipod, 3]); const loc = rot([0, 0], 0); void loc; const ang = rig.wAng * Math.PI / 180; const dy = (opt.bipodY - piv[1]); const dxl = Math.sin(ang) * 0; void dxl; return bipod(c.fill, wd.bipod, 0, dy / Math.cos(ang) * 1.0 + 0); })() : null}</g></g>);
  out.push(<g key="nearArm" fill={c.fill}><path d={cap(S, rig.nearElbow, 5.4, 4.4)} /><path d={cap(rig.nearElbow, rig.nearHand, 4.4, 3.3)} /><circle cx={F(rig.nearHand[0])} cy={F(rig.nearHand[1])} r={3.6} /></g>);
  out.push(<circle key="fh" cx={F(rig.farHand[0])} cy={F(rig.farHand[1])} r={3.4} fill={c.far} />);
  out.push(<circle key="shoulder" cx={F(S[0])} cy={F(S[1])} r={5.9} fill={c.fill} />);
  if (opt.flash && pose.flash) out.push(<g key="flash" transform={`translate(${pp(wm)}) rotate(${F(rig.wAng)})`}><circle r={11} fill="#ffcf73" opacity={0.28} /><path d="M0,0 L16,-6 L9,-1 L26,0 L9,1.4 L16,6 Z" fill="#fff0c0" /><path d="M0,0 L10,-3 L6,0 L10,3 Z" fill="#fffbe6" /></g>);
  return <g>{out}</g>;
}

export const Soldier: React.FC<{ skin: SkinId; anim: AnimId; t: number; phase?: number; x: number; y: number; px: number; flip?: boolean; haze?: number; hazeColor?: string; aimK?: number; shots?: number[]; kneel?: boolean; bipodY?: number; shadow?: boolean; rim?: boolean; rimColor?: string; opacity?: number; tempo?: number; from?: { anim: AnimId; phase?: number; kneel?: boolean }; k?: number }> = (p) => {
  const sk = SKINS[p.skin], tt = p.t * (p.tempo ?? 1), rig = solveRig({ anim: p.anim, t: tt, phase: p.phase ?? 0, wclass: WD[sk.weapon].cls, weapon: sk.weapon, aimK: p.aimK, shots: p.shots, kneel: p.kneel, handset: sk.handset && (p.anim === "idle") }, p.from ? { from: { ...p.from, t: tt }, k: p.k ?? 1 } : undefined);
  const c = toneOf(sk, p.haze ?? 0, p.hazeColor), s = p.px, sg = p.flip ? -1 : 1, opt = { bipodY: p.bipodY, flash: true };
  const rimPx = Math.max(0.9, s * 1.5);
  return (
    <g opacity={p.opacity ?? 1}>
      {p.shadow !== false && <g transform={`translate(${F(p.x)},${F(p.y)}) matrix(${F(s * sg)},0,${F(-s * 0.95)},${F(-s * 0.26)},0,0)`} opacity={0.3}>{figure(rig, sk, { fill: "#0b0906", far: "#0b0906", hi: "#0b0906", gear: "#0b0906" }, p.anim, {})}</g>}
      {p.rim !== false && <g transform={`translate(${F(p.x - rimPx)},${F(p.y - rimPx * 0.8)}) scale(${F(s * sg)},${F(s)})`}>{figure(rig, sk, { fill: p.rimColor ?? "#d9a860", far: p.rimColor ?? "#d9a860", hi: "#d9a860", gear: p.rimColor ?? "#d9a860" }, p.anim, {})}</g>}
      <g transform={`translate(${F(p.x)},${F(p.y)}) scale(${F(s * sg)},${F(s)})`}>{figure(rig, sk, c, p.anim, opt)}</g>
    </g>
  );
};
