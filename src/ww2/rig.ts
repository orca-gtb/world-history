// RIG PRAJURIT 2D (tampak samping, menghadap +x, y ke bawah, tanah y=0). 1 satuan ≈ 1 cm. Tinggi berdiri ≈ 172.
// Kerangka: pinggul → torso → leher/kepala; dua kaki (paha+betis); dua lengan diselesaikan IK ke pegangan senjata.
export type V = [number, number];
export const rad = (d: number) => (d * Math.PI) / 180;
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const rot = (v: V, d: number): V => { const r = rad(d), c = Math.cos(r), s = Math.sin(r); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
export const dirDown = (a: number, l: number): V => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l]; // 0 = lurus ke bawah, + = maju
export const dirUp = (a: number, l: number): V => [Math.sin(rad(a)) * l, -Math.cos(rad(a)) * l];
export const BONE = { thigh: 44, shin: 43, torso: 54, up: 29, fore: 27 };

export type Hold = { a: V; ang: number; fore?: V | null; deploy?: boolean; oneHand?: boolean };
export type Pose = { lean: number; neck: number; rot: number; legF: [number, number]; legB: [number, number]; hold: Hold; recoil: number; flash: boolean; armFree: [number, number]; hideGun?: boolean };
export type Arm = { el: V; hand: V };
export type Joints = { hip: V; sh: V; head: V; kneeF: V; footF: V; kneeB: V; footB: V; rear: Arm; fore: Arm; gun: V; gunAng: number; lean: number; neckAng: number; rotAll: number };

// IK 2-tulang: siku ditekuk ke bawah.
export function ik2(S: V, T: V, l1: number, l2: number): { el: V; hand: V } {
  const dx = T[0] - S[0], dy = T[1] - S[1]; let d = Math.hypot(dx, dy); const mx = l1 + l2 - 0.5;
  if (d > mx) d = mx; if (d < 10) d = 10;
  const a = Math.atan2(dy, dx), aa = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
  const e1: V = [S[0] + aa * Math.cos(a) - h * Math.sin(a), S[1] + aa * Math.sin(a) + h * Math.cos(a)];
  const e2: V = [S[0] + aa * Math.cos(a) + h * Math.sin(a), S[1] + aa * Math.sin(a) - h * Math.cos(a)];
  return { el: e1[1] >= e2[1] ? e1 : e2, hand: [S[0] + Math.cos(a) * d, S[1] + Math.sin(a) * d] };
}

export function solve(p: Pose, foreLocal: V | null, hasGun: boolean): Joints {
  const hip: V = [0, 0];
  const sh = add(hip, dirUp(p.lean, BONE.torso));
  const nb = add(sh, dirUp(p.lean, 5)), head = add(nb, dirUp(p.lean + p.neck, 13));
  const kneeF = add(hip, dirDown(p.legF[0], BONE.thigh)), footF = add(kneeF, dirDown(p.legF[0] - p.legF[1], BONE.shin));
  const kneeB = add(hip, dirDown(p.legB[0], BONE.thigh)), footB = add(kneeB, dirDown(p.legB[0] - p.legB[1], BONE.shin));
  let gun = add(sh, p.hold.a); const ga = p.hold.ang;
  if (p.recoil) gun = sub(gun, rot([p.recoil, 0], ga));
  let rear: Arm, fore: Arm;
  const free = (ang: number, bend: number): Arm => { const el = add(sh, dirDown(ang, BONE.up)); const hand = add(el, dirDown(ang + bend, BONE.fore)); return { el, hand }; };
  if (hasGun) {
    rear = ik2(sh, gun, BONE.up, BONE.fore);
    if (!p.hold.oneHand && (foreLocal || p.hold.fore)) { const T = p.hold.fore ? add(sh, p.hold.fore) : add(gun, rot(foreLocal as V, ga)); fore = ik2(sh, T, BONE.up, BONE.fore); }
    else fore = free(p.armFree[0], p.armFree[1]);
  } else { rear = free(p.armFree[0], p.armFree[1]); fore = free(-p.armFree[0] * 0.8, p.armFree[1] * 0.8); }
  const all = { hip, sh, head, kneeF, footF, kneeB, footB, gun, rear, fore };
  const R = (v: V): V => rot(v, p.rot);
  const out: Joints = { hip: R(all.hip), sh: R(all.sh), head: R(all.head), kneeF: R(kneeF), footF: R(footF), kneeB: R(kneeB), footB: R(footB), rear: { el: R(rear.el), hand: R(rear.hand) }, fore: { el: R(fore.el), hand: R(fore.hand) }, gun: R(gun), gunAng: ga + p.rot, lean: p.lean + p.rot, neckAng: p.lean + p.neck + p.rot, rotAll: p.rot };
  const pts = [out.footF, out.footB, out.kneeF, out.kneeB, out.hip, out.sh, out.head, out.rear.hand, out.fore.hand, out.rear.el, out.fore.el];
  const maxY = Math.max(...pts.map((q) => q[1])), dy = -maxY - (p.rot !== 0 && Math.abs(p.rot) > 40 ? 9 : 5);
  const S = (v: V): V => [v[0], v[1] + dy];
  return { ...out, hip: S(out.hip), sh: S(out.sh), head: S(out.head), kneeF: S(out.kneeF), footF: S(out.footF), kneeB: S(out.kneeB), footB: S(out.footB), rear: { el: S(out.rear.el), hand: S(out.rear.hand) }, fore: { el: S(out.fore.el), hand: S(out.fore.hand) }, gun: S(out.gun) };
}
