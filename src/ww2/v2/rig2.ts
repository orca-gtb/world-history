// Rig lengkap v2: tubuh + lengan IK + senjata TERPISAH (data pegangan per senjata). Murni data, tanpa React (bisa dites di node).
import { type V, add, D2R, ik2, len, rot, sub } from "./math";
import { ARM, type AnimId, type Pose, type PoseIn, type WClass, blendPose, solvePose, TORSO } from "./gait";
export type WData = { id: string; cls: WClass; len: number; rear: V; fore: V; muzzle: V; bipod?: number };
export const WD: Record<string, WData> = {
  garand: { id: "garand", cls: "rifle", len: 110, rear: [28, 3.5], fore: [64, 2.5], muzzle: [111, 0] },
  kar98k: { id: "kar98k", cls: "rifle", len: 111, rear: [28, 3.5], fore: [66, 2.5], muzzle: [112, 0] },
  mosin: { id: "mosin", cls: "rifle", len: 123, rear: [30, 3.5], fore: [70, 2.5], muzzle: [124, 0] },
  ppsh: { id: "ppsh", cls: "smg", len: 84, rear: [22, 5], fore: [50, 6], muzzle: [85, 0] },
  thompson: { id: "thompson", cls: "smg", len: 82, rear: [24, 4.5], fore: [50, 5], muzzle: [83, 0] },
  mg42: { id: "mg42", cls: "mg", len: 122, rear: [19, 7], fore: [6, 2], muzzle: [124, 0], bipod: 100 },
};
export type RigIn = PoseIn & { weapon: string; handset?: boolean };
export type Rig = {
  pose: Pose; P: (t: number, o: number) => V; S: V; Sf: V; neck: V; head: V; headAng: number;
  butt: V; wAng: number; rearHand: V; foreHand: V; nearElbow: V; farElbow: V; nearHand: V; farHand: V; armOver: number; foreX: number; W: (p: V) => V; muzzleW: V; handsetUsed: boolean;
};
export function solveRig(ri: RigIn, blend?: { from: Partial<PoseIn>; k: number }): Rig {
  const wd = WD[ri.weapon], pB = solvePose({ ...ri, wclass: wd.cls }), pose = blend && blend.k < 1 ? blendPose(solvePose({ ...ri, ...blend.from, wclass: wd.cls }), pB, blend.k) : pB, lam = pose.lean * D2R;
  const P = (t: number, o: number): V => [pose.hip[0] + t * Math.sin(lam) + o * Math.cos(lam), pose.hip[1] - t * Math.cos(lam) + o * Math.sin(lam)];
  const S = add(P(TORSO - 3, 0), [0, -pose.shoulderLift]), Sf: V = add(S, [-2.2, -0.4]), neck = P(TORSO + 1, 1);
  const headAng = -pose.lean * 0.62 + pose.headTilt, head = add(neck, rot([3.2, -12.2], headAng));
  let wAng = pose.lean - pose.elev, butt = P(pose.butt[0], pose.butt[1]);
  let handsetUsed = false, nearHand: V, farHand: V, nearElbow: V, farElbow: V, rearHand: V, foreHand: V, foreX = wd.fore[0], armOver = 0;
  const W = (p: V): V => add(butt, rot(p, wAng));
  if (ri.handset) { // operator radio: tangan dekat memegang handset di telinga, tangan jauh menahan senjata tegak di sisi
    handsetUsed = true; const ear: V = add(S, [13, -3]), F = P(26, 24); wAng = pose.lean - 64; butt = sub(F, rot(wd.fore, wAng));
    const a = ik2(S, ear, ARM.upper, ARM.fore, 1), b = ik2(Sf, F, ARM.upper, ARM.fore, 1);
    nearHand = a.end; nearElbow = a.mid; farHand = b.end; farElbow = b.mid; armOver = Math.max(a.over, b.over); rearHand = nearHand; foreHand = farHand;
  } else {
    rearHand = W(wd.rear); const rr = ik2(S, rearHand, ARM.upper, ARM.fore, 1); nearHand = rr.end; nearElbow = rr.mid; armOver = rr.over;
    // tangan jauh selalu di senjata: geser titik pegang ke arah popor sampai terjangkau
    let fx = wd.fore[0]; const fy = wd.fore[1];
    for (; fx > wd.rear[0] + 4; fx -= 1.5) { const q = W([fx, fy]); if (len(sub(q, Sf)) <= (ARM.upper + ARM.fore) * 0.975) break; }
    foreHand = W([fx, fy]); foreX = fx; const ff = ik2(Sf, foreHand, ARM.upper, ARM.fore, 1); farHand = ff.end; farElbow = ff.mid; armOver = Math.max(armOver, ff.over);
  }
  return { pose, P, S, Sf, neck, head, headAng, butt, wAng, rearHand, foreHand, nearElbow, farElbow, nearHand, farHand, armOver, foreX, W, muzzleW: W(wd.muzzle), handsetUsed };
}
export const ANIMS_V2: AnimId[] = ["idle", "walk", "run", "aim", "fire"];
