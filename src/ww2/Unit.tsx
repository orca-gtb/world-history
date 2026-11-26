import React from "react";
import { GEAR, HATS, WEAPONS } from "./gear";
import { solve, type Joints, type V } from "./rig";
import { poseOf, type AnimId } from "./anim";
import type { UnitSpec } from "./units";

const line = (a: V, b: V, w: number, c: string) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />;
const leg = (hip: V, knee: V, foot: V, c: string) => (
  <g>{line(hip, knee, 15, c)}{line(knee, foot, 11, c)}
    <path d={`M${foot[0] - 5},${foot[1] - 3} L${foot[0] + 16},${foot[1] + 1} L${foot[0] + 17},${foot[1] + 6} L${foot[0] - 6},${foot[1] + 6} Z`} fill={c} /></g>
);
export const FIG = { w: 300, h: 270, cx: 118, gy: 246 }; // sel sprite: lebar, tinggi, titik tengah x, garis tanah y
export const UnitFigure: React.FC<{ spec: UnitSpec; anim: AnimId; u: number; fill?: string; far?: string; x?: number; y?: number; s?: number; flip?: boolean }> = ({ spec, anim, u, fill = "#14110e", far = "#2b2723", x = 0, y = 0, s = 1, flip = false }) => {
  const pose = poseOf(spec, anim, u), w = spec.weapon ? WEAPONS[spec.weapon] : null, ws = spec.wscale ?? 1;
  const J: Joints = solve(pose, w ? [w.fore ? w.fore[0] * ws : 0, w.fore ? w.fore[1] * ws : 0] : null, !!w && !pose.hideGun && !!w.fore);
  const showGun = !!w && !pose.hideGun;
  const twoHand = !!w && !!w.fore && !pose.hideGun && !pose.hold.oneHand;
  const gx = J.gun[0], gy = J.gun[1], ga = J.gunAng;
  const skirt = spec.coat === "greatcoat" ? (() => { const mid = (k: V, f: V): V => [k[0] + (f[0] - k[0]) * 0.55, k[1] + (f[1] - k[1]) * 0.55]; const A: V = [J.hip[0] - 11, J.hip[1] - 6], B: V = [J.hip[0] + 12, J.hip[1] - 6], C = mid(J.kneeF, J.footF), D = mid(J.kneeB, J.footB); return <path d={`M${A[0]},${A[1]} L${B[0]},${B[1]} L${C[0] + 10},${C[1]} L${D[0] - 10},${D[1]} Z`} fill={fill} />; })() : null;
  const mount = showGun && w && w.mount && pose.hold.deploy ? (() => { const m: V = [gx + Math.cos((ga * Math.PI) / 180) * w.mount.at - Math.sin((ga * Math.PI) / 180) * 5, gy + Math.sin((ga * Math.PI) / 180) * w.mount.at + Math.cos((ga * Math.PI) / 180) * 5]; return <g stroke={fill} strokeWidth={2.6} strokeLinecap="round">{line(m, [m[0] + 22, 0 - 1], 2.6, fill)}{line(m, [m[0] - 14, 0 - 1], 2.6, fill)}{w.mount.kind === "tripod" && line(m, [m[0] + 4, -1], 2.6, fill)}</g>; })() : null;
  const gearRot = J.lean;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {leg(J.hip, J.kneeB, J.footB, far)}
      {line(J.sh, J.fore.el, 8, far)}{line(J.fore.el, J.fore.hand, 7, far)}
      {skirt}
      {line(J.hip, J.sh, 21, fill)}
      <g transform={`translate(${J.hip[0]},${J.hip[1]}) rotate(${gearRot})`}>{spec.gear.map((g, i) => <React.Fragment key={i}>{GEAR[g](fill)}</React.Fragment>)}</g>
      {leg(J.hip, J.kneeF, J.footF, fill)}
      {line(J.sh, [J.head[0] - (J.head[0] - J.sh[0]) * 0.1, J.head[1] + 4], 9, fill)}
      <circle cx={J.head[0]} cy={J.head[1]} r={10} fill={fill} />
      <g transform={`translate(${J.head[0]},${J.head[1] - 1}) rotate(${J.neckAng})`}>{HATS[spec.hat](fill)}</g>
      {mount}
      {showGun && w && <g transform={`translate(${gx},${gy}) rotate(${ga}) scale(${ws})`}>{w.draw(fill)}{pose.flash && <path d={`M${w.muzzle},-1 L${w.muzzle + 14},-8 L${w.muzzle + 9},-1 L${w.muzzle + 18},0 L${w.muzzle + 9},2 L${w.muzzle + 14},9 Z`} fill="#ffcf6b" />}</g>}
      {line(J.sh, J.rear.el, 9, fill)}{line(J.rear.el, J.rear.hand, 7.5, fill)}
      {twoHand && <><circle cx={J.rear.hand[0]} cy={J.rear.hand[1]} r={4.4} fill={fill} /><circle cx={J.fore.hand[0]} cy={J.fore.hand[1]} r={4} fill={fill} /></>}
      {!twoHand && <><circle cx={J.rear.hand[0]} cy={J.rear.hand[1]} r={4.4} fill={fill} /><circle cx={J.fore.hand[0]} cy={J.fore.hand[1]} r={4} fill={fill} /></>}
    </g>
  );
};
