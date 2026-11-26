import { WEAPONS, type WClass } from "./gear";
import type { Hold, Pose, V } from "./rig";
import type { UnitSpec } from "./units";
// 10 animasi bersama. u = fase 0..1 (siklik kecuali hit & fall). Pose dihitung dari parameter sendi, bukan gambar → tiap unit unik dan reusable.
export type AnimId = "idle" | "walk" | "run" | "advance" | "crouch" | "aim" | "fire" | "reload" | "hit" | "fall";
export const ANIMS: { id: AnimId; frames: number; loop: boolean; fps: number }[] = [
  { id: "idle", frames: 4, loop: true, fps: 4 }, { id: "walk", frames: 8, loop: true, fps: 10 }, { id: "run", frames: 8, loop: true, fps: 14 }, { id: "advance", frames: 8, loop: true, fps: 10 },
  { id: "crouch", frames: 4, loop: true, fps: 4 }, { id: "aim", frames: 4, loop: true, fps: 4 }, { id: "fire", frames: 6, loop: true, fps: 12 }, { id: "reload", frames: 8, loop: false, fps: 8 },
  { id: "hit", frames: 6, loop: false, fps: 12 }, { id: "fall", frames: 8, loop: false, fps: 10 },
];
type Mode = "carry" | "run" | "ready" | "aim" | "reload";
const H: Record<WClass, Record<Mode, [number, number, number]>> = {
  rifle: { carry: [8, 50, -12], run: [12, 18, -34], ready: [12, 22, -8], aim: [16, 5, 0], reload: [10, 26, 38] },
  smg: { carry: [8, 48, 8], run: [12, 20, -12], ready: [12, 24, 2], aim: [17, 7, 0], reload: [10, 28, 40] },
  lmg: { carry: [10, 50, 2], run: [14, 24, -6], ready: [14, 26, 2], aim: [20, 8, 0], reload: [12, 30, 40] },
  mg: { carry: [12, 40, 0], run: [14, 26, -4], ready: [14, 28, 4], aim: [30, 40, 0], reload: [30, 40, 0] },
  ptr: { carry: [12, 42, -4], run: [12, 22, -24], ready: [12, 24, -6], aim: [34, 46, 0], reload: [34, 46, 0] },
  tube: { carry: [0, -2, -6], run: [0, -2, -6], ready: [0, -2, -6], aim: [4, -1, 0], reload: [2, 14, 10] },
  pistol: { carry: [8, 36, 80], run: [8, 36, 80], ready: [24, 18, -10], aim: [32, 4, 0], reload: [14, 26, -30] },
};
const sm = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
export const wclass = (s: UnitSpec): WClass | null => (s.weapon ? WEAPONS[s.weapon].cls : null);
const hold = (s: UnitSpec, mode: Mode): Hold => { const c = wclass(s); if (!c) return { a: [8, 30] as V, ang: 0 }; const [x, y, a] = H[c][mode]; return { a: [x, y], ang: a, deploy: (c === "mg" || c === "ptr") && (mode === "aim" || mode === "reload"), oneHand: mode === "carry" && (c === "rifle" || c === "smg" || c === "lmg") }; };
const heavy = (s: UnitSpec) => s.stance === "deploy" || s.stance === "tube";
export function poseOf(s: UnitSpec, anim: AnimId, u: number): Pose {
  const p = u * 2 * Math.PI, c = wclass(s), pistol = c === "pistol", none = !c;
  const base: Pose = { lean: 2, neck: 0, rot: 0, legF: [5, 5], legB: [-5, 5], hold: hold(s, "carry"), recoil: 0, flash: false, armFree: [8, 12], hideGun: pistol };
  const swing = (amp: number, b0: number, b1: number, lean: number, mode: Mode, thighBias = 0, bendBias = 0): Pose => ({
    ...base, lean, legF: [amp * Math.sin(p) + thighBias, b0 + b1 * Math.max(0, Math.cos(p)) + bendBias], legB: [-amp * Math.sin(p) + thighBias, b0 + b1 * Math.max(0, -Math.cos(p)) + bendBias],
    hold: hold(s, mode), armFree: [(pistol || none || mode === "carry" ? 1 : 0.0) * amp * 0.9 * -Math.sin(p) + 6, 14 + (amp > 40 ? 50 : 6)],
  });
  switch (anim) {
    case "idle": return { ...base, lean: 2 + 1.4 * Math.sin(p), legF: [7, 5], legB: [-6, 4], armFree: [8 + 2 * Math.sin(p), 12], neck: Math.sin(p) };
    case "walk": return swing(26, 8, 38, 3, "carry");
    case "run": return swing(50, 22, 78, 14, "run");
    case "advance": return swing(30, 20, 40, 26, "ready", 12, 22);
    case "crouch": return { ...base, lean: 22 + 2 * Math.sin(p), legF: [62, 112], legB: [34, 104], hold: hold(s, "ready"), armFree: [20, 50] };
    case "aim": case "fire": {
      const k = anim === "fire" ? Math.exp(-u * 6) : 0;
      const kneel = heavy(s), base2: Pose = kneel ? { ...base, lean: s.stance === "tube" ? 12 : 30, legF: [62, 112], legB: [-12, 118] } : { ...base, lean: 5, legF: [15, 10], legB: [-17, 6] };
      return { ...base2, hold: hold(s, "aim"), recoil: 5 * k, flash: anim === "fire" && u < 0.2, lean: base2.lean - 1.5 * k, hideGun: false, armFree: [10, 22] };
    }
    case "reload": {
      const dep = c === "mg" || c === "ptr";
      const b: Pose = dep ? { ...base, lean: 30, legF: [62, 112], legB: [-12, 118] } : { ...base, lean: 22, legF: [62, 112], legB: [34, 104] };
      const t = u < 0.25 ? sm(u / 0.25) : u < 0.5 ? 1 : u < 0.75 ? 1 - sm((u - 0.5) / 0.25) * 0.15 : 0.85 * (1 - sm((u - 0.75) / 0.25));
      const pouch: V = [12, 48];
      const hd = hold(s, "reload");
      return { ...b, hold: { ...hd, fore: c === "pistol" || !c ? null : [pouch[0] + (hd.a[0] + 40 - pouch[0]) * (1 - t), pouch[1] + (hd.a[1] - pouch[1]) * (1 - t)] }, hideGun: false, armFree: [10, 30] };
    }
    case "hit": {
      const f = Math.sin(Math.PI * u), h = hold(s, "carry");
      return { ...base, lean: 4 - 30 * f, rot: -7 * f, legF: [6 - 6 * f, 10 + 20 * f], legB: [-5 - 16 * f, 8 + 36 * f], hold: { ...h, ang: h.ang - 45 * f, a: [h.a[0] - 4 * f, h.a[1] - 10 * f] }, hideGun: false, armFree: [8 - 30 * f, 30 * f + 12] };
    }
    case "fall": {
      const v = Math.pow(u, 1.25), h = hold(s, "carry");
      return { ...base, lean: 4 - 20 * v, neck: -8 * v, rot: -92 * sm(v), legF: [6 + 36 * v, 14 + 70 * v], legB: [-5 + 14 * v, 10 + 80 * v], hold: { a: [h.a[0] - 20 * v, h.a[1] - 22 * v], ang: h.ang - 70 * v }, hideGun: false, armFree: [8 - 55 * v, 20 + 40 * v] };
    }
  }
}
