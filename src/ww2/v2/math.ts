// Matematika dasar rig v2. Satuan: cm, sumbu y ke bawah, tanah di y=0, tubuh menghadap +x.
export type V = [number, number];
export const D2R = Math.PI / 180;
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const len = (a: V) => Math.hypot(a[0], a[1]);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const lerpV = (a: V, b: V, k: number): V => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const sm = (x: number) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };
export const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x, 0, 1));
export const frac = (x: number) => x - Math.floor(x);
export const rot = (a: V, deg: number): V => { const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; };
/** IK dua tulang. bend=-1: sendi menekuk ke depan (lutut); bend=+1: sendi menekuk ke bawah/belakang (siku). */
export function ik2(a: V, b: V, l1: number, l2: number, bend: 1 | -1) {
  let d = len(sub(b, a)); const raw = d; const reach = l1 + l2 - 0.01;
  d = clamp(d, Math.abs(l1 - l2) + 0.01, reach);
  const base = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const m: V = [a[0] + l1 * Math.cos(base + bend * A), a[1] + l1 * Math.sin(base + bend * A)];
  const tip: V = [a[0] + d * Math.cos(base), a[1] + d * Math.sin(base)];
  return { mid: m, end: tip, over: raw - reach }; // over>0: target di luar jangkauan
}
export const softmin = (a: number, b: number, k = 2.5) => -k * Math.log(Math.exp(-a / k) + Math.exp(-b / k));
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
