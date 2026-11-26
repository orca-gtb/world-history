// Pemecah pose v2: gait berbasis KONTAK TELAPAK KAKI (tumit -> telapak -> ujung kaki), tanpa foot sliding.
// Kaki tumpu bergerak ke belakang relatif pinggul tepat sebesar kecepatan badan; scene memakai speedOf(anim) untuk menggerakkan badan.
import { type V, add, clamp, ease, frac, ik2, lerp, lerpV, rot, sm, softmin, D2R, hash } from "./math";

export type AnimId = "idle" | "walk" | "run" | "aim" | "fire";
export type WClass = "rifle" | "smg" | "mg";
export const LEG = { thigh: 44, shin: 43, ankle: 8 };
export const ARM = { upper: 30, fore: 27 };
export const TORSO = 52;
const HEEL: V = [-6, 8], BALL: V = [14, 8];
export type Gait = { T: number; S: number; duty: number; lift: number; hipH: number; bob: number; lean: number; psi0: number; psi1: number; fwd: number };
export const GAITS: Record<"walk" | "run", Gait> = {
  walk: { T: 1.08, S: 120, duty: 0.62, lift: 11, hipH: 86, bob: 2.1, lean: 4, psi0: 16, psi1: 36, fwd: 4 },
  run: { T: 0.64, S: 215, duty: 0.37, lift: 30, hipH: 79, bob: 6, lean: 15, psi0: 12, psi1: 46, fwd: 2 },
};
/** kecepatan maju badan (cm/s) untuk animasi; scene harus menggerakkan x dengan nilai ini agar kaki tidak sliding */
export const speedOf = (a: AnimId) => (a === "walk" ? GAITS.walk.S / GAITS.walk.T : a === "run" ? GAITS.run.S / GAITS.run.T : 0);

type Foot = { ankle: V; psi: number }; // ankle: relatif pinggul (x), y = -tinggi dari tanah
const R2 = (p: V, psiDeg: number): V => { const c = Math.cos(psiDeg * D2R), s = Math.sin(psiDeg * D2R); return [p[0] * c + p[1] * s, -p[0] * s + p[1] * c]; };
function stance(u: number, g: Gait): Foot {
  const b = g.duty, S = g.S, a = (S * b) / 2 + g.fwd, xa = (q: number) => a - S * q, u1 = 0.14 * b, u2 = 0.78 * b;
  if (u < u1) { const psi = g.psi0 * Math.pow(1 - u / u1, 1.3), cx = xa(u1) + HEEL[0] - S * (u - u1), r = R2(HEEL, psi); return { ankle: [cx - r[0], -r[1]], psi }; }
  if (u <= u2) return { ankle: [xa(u), -8], psi: 0 };
  const k = (u - u2) / (b - u2), psi = -g.psi1 * Math.pow(k, 1.4), cx = xa(u2) + BALL[0] - S * (u - u2), r = R2(BALL, psi);
  return { ankle: [cx - r[0], -r[1]], psi };
}
export function foot(u: number, g: Gait): Foot {
  u = frac(u); const b = g.duty;
  if (u < b) return stance(u, g);
  const A0 = stance(b - 1e-6, g), A1 = stance(0, g), s = (u - b) / (1 - b), e = ease(s);
  const lift = g.lift * Math.pow(Math.sin(Math.PI * s), 1.15);
  return { ankle: [lerp(A0.ankle[0], A1.ankle[0], e), lerp(A0.ankle[1], A1.ankle[1], e) - lift], psi: lerp(A0.psi, A1.psi, sm(s * 1.1)) };
}
export type Hold = { butt: V; elev: number }; // butt dalam bingkai badan (t sepanjang tulang punggung, o ke depan); elev = sudut moncong naik (derajat) relatif badan
export const HOLDS: Record<WClass, Record<"carry" | "port" | "aim", Hold>> = {
  rifle: { carry: { butt: [13, 2], elev: 34 }, port: { butt: [22, 0], elev: 52 }, aim: { butt: [49, 7], elev: 1 } },
  smg: { carry: { butt: [22, 6], elev: 22 }, port: { butt: [25, 4], elev: 40 }, aim: { butt: [49, 7], elev: 2 } },
  mg: { carry: { butt: [18, 2], elev: 30 }, port: { butt: [22, 0], elev: 48 }, aim: { butt: [45, 6], elev: -2 } },
};
export type PoseIn = { anim: AnimId; t: number; phase: number; wclass: WClass; aimK?: number; shots?: number[]; kneel?: boolean; handset?: boolean };
export type Pose = {
  hip: V; lean: number; headTilt: number; shoulderLift: number;
  nearFoot: Foot; farFoot: Foot; nearKnee: V; farKnee: V;
  butt: V; elev: number; recoil: number; flash: boolean; bob: number; swing: number; wob: number; mode: string; u: number; legOver: number;
};
const shotKick = (t: number, shots: number[] | undefined) => { let r = 0; if (shots) for (const s of shots) { const d = t - s; if (d >= 0 && d < 0.35) r += Math.exp(-d / 0.055); } return Math.min(1.4, r); };
export function solvePose(pi: PoseIn): Pose {
  const { anim, wclass } = pi; const t = pi.t, ph = pi.phase;
  let hipX = 0, hipH = 90, lean = 3, headTilt = 0, nf: Foot, ff: Foot, hold: Hold, mode = "carry", u = 0, bob = 0, swing = 0, shLift = 0;
  const g = anim === "walk" ? GAITS.walk : anim === "run" ? GAITS.run : null;
  const aimK = anim === "aim" || anim === "fire" ? clamp(pi.aimK ?? 1, 0, 1) : 0;
  if (g) {
    u = frac(t / g.T + ph); nf = foot(u, g); ff = foot(u + 0.5, g);
    const peak = anim === "walk" ? 0.31 : 0.43;
    bob = g.bob * Math.cos(4 * Math.PI * (u - peak));
    const reach = (f: Foot) => { const dx = f.ankle[0] - hipX; const c = (LEG.thigh + LEG.shin) * 0.992; return -f.ankle[1] + Math.sqrt(Math.max(1, c * c - dx * dx)); };
    hipH = g.hipH + bob; const inSt = (q: number) => frac(q) < g.duty; if (inSt(u)) hipH = softmin(hipH, reach(nf), 2.2); if (inSt(u + 0.5)) hipH = softmin(hipH, reach(ff), 2.2);
    lean = g.lean + (anim === "run" ? 2.2 : 1.1) * Math.cos(4 * Math.PI * (u - peak) + 0.9);
    hold = HOLDS[wclass][anim === "run" ? "port" : "carry"]; mode = anim; swing = Math.sin(2 * Math.PI * u);
    headTilt = -lean * 0.7;
  } else {
    const br = Math.sin((2 * Math.PI * (t + ph * 4.2)) / 4.2), sx = 2.4 * Math.sin((2 * Math.PI * (t + ph * 6.8)) / 6.8);
    const k = aimK, stanceKneel = !!pi.kneel;
    // idle: kaki menapak, berat badan berpindah; aim: kaki depan maju, badan condong
    const nfx = lerp(-6, -22, k), ffx = lerp(8, 24, k);
    hipX = -sx * (1 - 0.6 * k); hipH = lerp(91 + 0.35 * sx * 0 - 0.5, 84, k) + 0.5 * br - (stanceKneel ? 30 : 0);
    nf = { ankle: [nfx - hipX + (stanceKneel ? -26 : 0), -8], psi: 0 }; ff = { ankle: [ffx - hipX, stanceKneel ? -8 : -8], psi: 0 };
    if (stanceKneel) { nf = { ankle: [-52 - hipX, -8], psi: -75 }; ff = { ankle: [22 - hipX, -8], psi: 0 }; hipH = 56 + 0.5 * br; }
    lean = lerp(3 + 0.9 * br, 9, k); headTilt = lerp(0, 5, k); shLift = 0.8 * br;
    const cA = HOLDS[wclass].carry, aA = HOLDS[wclass].aim, e = ease(k), ov = k > 0 && k < 1 ? 1.0 + 0.07 * Math.sin(Math.PI * k) : 1;
    hold = { butt: lerpV(cA.butt, aA.butt, e), elev: lerp(cA.elev, aA.elev, e) * ov };
    mode = k > 0.5 ? "aim" : "idle"; u = frac(t / 4.2 + ph); swing = br;
  }
  const kick = anim === "fire" ? shotKick(t, pi.shots) : 0;
  const hip: V = [hipX, -hipH];
  const nk = ik2(hip, nf.ankle, LEG.thigh, LEG.shin, -1), fk = ik2(hip, ff.ankle, LEG.thigh, LEG.shin, -1);
  return {
    hip, lean: lean - kick * 1.6, headTilt, shoulderLift: shLift, nearFoot: { ankle: nk.end, psi: nf.psi }, farFoot: { ankle: fk.end, psi: ff.psi }, nearKnee: nk.mid, farKnee: fk.mid,
    butt: [hold.butt[0], hold.butt[1] - kick * 0.4], elev: hold.elev + kick * 2.6, recoil: kick, flash: kick > 0.75, bob, swing, wob: Math.sin(2 * Math.PI * (u * 2) - 0.9), mode, u, legOver: Math.max(nk.over, fk.over),
  };
}
/** Campur dua pose (mis. walk -> aim) tanpa teleportasi; lutut dihitung ulang lewat IK dari pinggul dan pergelangan hasil campuran */
export function blendPose(a: Pose, b: Pose, k: number): Pose {
  const L = (x: number, y: number) => lerp(x, y, k), LV = (p: V, q: V): V => lerpV(p, q, k);
  const hip = LV(a.hip, b.hip), an = LV(a.nearFoot.ankle, b.nearFoot.ankle), af = LV(a.farFoot.ankle, b.farFoot.ankle);
  const nk = ik2(hip, an, LEG.thigh, LEG.shin, -1), fk = ik2(hip, af, LEG.thigh, LEG.shin, -1);
  return { hip, lean: L(a.lean, b.lean), headTilt: L(a.headTilt, b.headTilt), shoulderLift: L(a.shoulderLift, b.shoulderLift), nearFoot: { ankle: nk.end, psi: L(a.nearFoot.psi, b.nearFoot.psi) }, farFoot: { ankle: fk.end, psi: L(a.farFoot.psi, b.farFoot.psi) }, nearKnee: nk.mid, farKnee: fk.mid,
    butt: LV(a.butt, b.butt), elev: L(a.elev, b.elev), recoil: L(a.recoil, b.recoil), flash: b.flash, bob: L(a.bob, b.bob), swing: L(a.swing, b.swing), wob: L(a.wob, b.wob), mode: b.mode, u: b.u, legOver: Math.max(a.legOver, b.legOver) };
}
export { hash, add, rot };
