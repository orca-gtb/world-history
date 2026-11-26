import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Soldier, SKINS, type SkinId } from "./Soldier";
import { Vehicle, Puffs } from "./Vehicles2";
import { solveRig, WD } from "./rig2";
import { ease, hash, mixHex, clamp, type V } from "./math";
import { speedOf, type AnimId } from "./gait";
import EV from "./showcase-events.json";

export const SC_FPS = 30, SC_TOTAL = EV.dur * 30;
const W = 1920, H = 1080, FOC = 1250, CAMH = 1.55, HAZE = "#c2a074", RIDGE = 2.3;
const F = (n: number) => Math.round(n * 10) / 10;
// ---------- kamera & proyeksi perspektif (skala = FOC / jarak; posisi y tanah = horizon + tinggi kamera * skala) ----------
const camAt = (t: number) => { const e = ease(t / EV.dur); return { x: -1.5 + 4.6 * e + 0.25 * Math.sin(t * 0.55), z: 2.1 * e, hor: 500 - 16 * e }; };
const SHAKES: { t: number; a: number; s: number }[] = [...EV.panzer.map((t) => ({ t, a: 7, s: 1 })), ...EV.sherman.map((t) => ({ t, a: 6, s: 2 })), ...EV.impacts.map((i, n) => ({ t: i.t, a: 11 * i.s, s: 3 + n })), ...EV.t34.map((t) => ({ t, a: 2.5, s: 7 }))];
const shake = (t: number): V => { let x = 0, y = 0; for (const e of SHAKES) { const d = t - e.t; if (d >= 0 && d < 0.8) { const k = e.a * Math.exp(-d / 0.17); x += k * Math.sin(d * 58 + e.s); y += k * 0.7 * Math.sin(d * 47 + e.s * 2); } } return [x, y]; };
type Pj = { sx: number; sy: number; k: number; pc: number; haze: number };
const mkProj = (t: number) => { const c = camAt(t), sh = shake(t); return (X: number, Z: number): Pj => { const zr = Math.max(0.6, Z - c.z), k = FOC / zr; return { sx: W / 2 + (X - c.x) * k + sh[0], sy: c.hor + CAMH * k + sh[1], k, pc: k / 100, haze: clamp((zr - 7) / 60, 0, 0.78) }; }; };
const dist = (v: number, t: number, tStop: number, d: number) => (t <= tStop ? v * t : t < tStop + d ? v * (tStop + (t - tStop) - ((t - tStop) ** 2) / (2 * d)) : v * (tStop + d / 2)); // jarak tempuh: berjalan lalu melambat mulus

const SOLDIER_EVENTS = EV as any;
type Item = { z: number; node: React.ReactNode };
export const mgShots = () => { const o: number[] = []; for (const [a, b] of EV.mg) for (let t = a; t < b; t += EV.mgInterval) o.push(+t.toFixed(3)); return o; };
const MG = mgShots();
const muzzleScreen = (skin: SkinId, p: Pj, flip: boolean, anim: AnimId, t: number, extra: any): V => { const sk = SKINS[skin], r = solveRig({ anim, t, phase: 0, wclass: WD[sk.weapon].cls, weapon: sk.weapon, ...extra }); const sg = flip ? -1 : 1; return [p.sx + sg * r.muzzleW[0] * p.pc, p.sy + r.muzzleW[1] * p.pc]; };

export const Showcase: React.FC<{ still?: number }> = ({ still }) => {
  const fr = useCurrentFrame(), t = still ?? fr / SC_FPS, pj = mkProj(t), cam = camAt(t), items: Item[] = [];
  const push = (z: number, node: React.ReactNode) => items.push({ z, node });
  const fade = Math.min(1, t / 0.6) * Math.min(1, (EV.dur - t) / 0.6);

  // ---- latar: langit, matahari rendah, bukit, tanah berperspektif ----
  const sky = (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a4f42" /><stop offset="0.55" stopColor="#a98b62" /><stop offset="1" stopColor="#e3c58f" /></linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff1cf" stopOpacity="0.95" /><stop offset="0.25" stopColor="#f5d9a2" stopOpacity="0.55" /><stop offset="1" stopColor="#f5d9a2" stopOpacity="0" /></radialGradient>
        <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b79a68" /><stop offset="0.28" stopColor="#7d6644" /><stop offset="1" stopColor="#2c2217" /></linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={HAZE} stopOpacity="0" /><stop offset="0.7" stopColor={HAZE} stopOpacity="0.35" /><stop offset="1" stopColor={HAZE} stopOpacity="0" /></linearGradient>
        <radialGradient id="vig" cx="0.5" cy="0.52" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0c0904" stopOpacity="0.55" /></radialGradient>
      </defs>
      <rect width={W} height={cam.hor + 4} fill="url(#sky)" />
      <circle cx={430 - (cam.x + 1.5) * 8} cy={cam.hor - 150} r={420} fill="url(#sun)" />
      {[[0.55, 0.9, "#7a6850"], [0.3, 0.8, "#8c7858"]].map(([amp, hazeK, col], i) => <path key={i} fill={mixHex(col as string, HAZE, hazeK as number * 0.7)} d={"M0," + (cam.hor + 2) + Array.from({ length: 25 }).map((_, j) => ` L${j * 80},${F(cam.hor - (28 + i * -14) * (amp as number) * (0.6 + 0.8 * hash(j * 2.3 + i * 9 - Math.floor(cam.x * (0.4 + i * 0.2) / 0.3 * 0.0))) - 8 * Math.sin(j * 0.7 + i + cam.x * 0.05 * (i + 1)))}`).join("") + ` L${W},${cam.hor + 2} Z`} />)}
      <rect y={cam.hor} width={W} height={H - cam.hor} fill="url(#gnd)" />
    </g>
  );
  // alur ladang yang menuju titik hilang + pita kedalaman
  const furrows = Array.from({ length: 30 }).map((_, i) => { const X = -45 + i * 3.2, a = pj(X, 200), b = pj(X, 3.2); return <line key={i} x1={F(a.sx)} y1={F(a.sy)} x2={F(b.sx)} y2={F(b.sy)} stroke="#2a2014" strokeOpacity={0.16 + (i % 3) * 0.04} strokeWidth={1 + (i % 4) * 0.7} />; });
  const bands = [5, 7.5, 10.5, 14.5, 19, 25, 34, 50, 80].map((z, i, a) => { if (i === a.length - 1) return null; const y0 = pj(0, a[i + 1]).sy, y1 = pj(0, z).sy; return <rect key={i} x={0} y={F(y0)} width={W} height={F(y1 - y0)} fill={i % 2 ? "#3a2c1c" : "#d8bd88"} opacity={0.07} />; });
  const road = (() => { const a = pj(0, 21.5), b = pj(0, 28.5); return <g><rect x={0} y={F(a.sy)} width={W} height={F(b.sy - a.sy)} fill="#b69a6c" opacity={0.5} /><rect x={0} y={F(a.sy)} width={W} height={2} fill="#6d583a" opacity={0.5} /></g>; })();

  // ---- BACKGROUND: pepohonan, reruntuhan, asap, pasukan jauh ----
  for (let i = 0; i < 22; i++) { const X = -36 + i * 4.1 + hash(i) * 2.5, Z = 36 + hash(i * 3) * 6, p = pj(X, Z), h = (9 + hash(i * 7) * 6) * p.k; const c = mixHex("#2f2a1f", HAZE, p.haze + 0.1); push(Z, <g key={"tr" + i}><rect x={F(p.sx - 0.1 * p.k)} y={F(p.sy - h * 0.5)} width={F(0.22 * p.k)} height={F(h * 0.5)} fill={c} /><ellipse cx={F(p.sx)} cy={F(p.sy - h * 0.62)} rx={F(0.8 * p.k)} ry={F(h * 0.42)} fill={c} /></g>); }
  for (let i = 0; i < 16; i++) { const X = -30 + i * 6.3 + hash(i + 40) * 3, Z = 62 + hash(i * 5) * 12, p = pj(X, Z), c = mixHex("#4c4231", HAZE, p.haze + 0.15); push(Z, <ellipse key={"bg" + i} cx={F(p.sx)} cy={F(p.sy - 3 * p.k)} rx={F(3.4 * p.k)} ry={F(3.3 * p.k)} fill={c} />); }
  push(38, (() => { const Z = 38, pts: [number, number][] = [[11, 0], [11, 4.6], [12.3, 6.2], [13.4, 4.6], [14.6, 6.4], [15.7, 5], [17, 5.6], [18, 3.6], [18, 0]], pp = pts.map(([X, y]) => { const p = pj(X, Z); return [p.sx, p.sy - y * p.k] as V; }), p0 = pj(0, Z), c = mixHex("#241e16", HAZE, p0.haze + 0.12);
    const roof = pts.slice(0, 0); void roof; return <g key="ruin"><path d={"M" + pp.map((q) => `${F(q[0])},${F(q[1])}`).join(" L") + " Z"} fill={c} /><path d={`M${F(pj(11.8, Z).sx)},${F(p0.sy - 1.3 * p0.k)} h${F(0.8 * p0.k)} v${F(1.1 * p0.k)} h${F(-0.8 * p0.k)} Z M${F(pj(15, Z).sx)},${F(p0.sy - 1.3 * p0.k)} h${F(0.8 * p0.k)} v${F(1.1 * p0.k)} h${F(-0.8 * p0.k)} Z`} fill="#e5c58e" opacity={0.28} /></g>; })());
  push(46, (() => { const p = pj(-8, 46), px = p.pc; return <g key="smoke1"><Puffs x={p.sx} y={p.sy} px={px} t={t} n={14} life={9} dx={160} rise={2300} r0={50} grow={240} color="#5d5242" alpha={0.42} seed={4} /><ellipse cx={p.sx} cy={p.sy - 8} rx={F(110 * px)} ry={F(24 * px)} fill="#e07a2c" opacity={0.28 + 0.1 * Math.sin(t * 9)} /></g>; })());
  push(30, (() => { const p = pj(22, 30), px = p.pc; return <g key="smoke2"><Puffs x={p.sx} y={p.sy} px={px} t={t} n={10} life={8} dx={-200} rise={1500} r0={45} grow={180} color="#6b5f4e" alpha={0.34} seed={9} /></g>; })());
  push(31.5, (() => { const pts = Array.from({ length: 33 }).map((_, i) => { const X = -40 + i * 2.8, p = pj(X, 31.5); return [p.sx, p.sy - (RIDGE + 0.5 * Math.sin(i * 0.8) + 0.3 * hash(i)) * p.k] as V; }), g = pj(0, 31.5), c = mixHex("#4a3d2a", HAZE, 0.45);
    return <g key="ridge"><path d={"M" + pts.map((q) => `${F(q[0])},${F(q[1])}`).join(" L") + ` L${pts[pts.length - 1][0]},${F(g.sy + 4)} L${pts[0][0]},${F(g.sy + 4)} Z`} fill={c} /><path d={"M" + pts.map((q) => `${F(q[0])},${F(q[1])}`).join(" L")} fill="none" stroke="#e5c58e" strokeOpacity={0.4} strokeWidth={2} /></g>; })());
  // ---- MIDGROUND-JAUH: Soviet (unit tambahan) berlari + T-34 di jalan ----
  const SU: { skin: SkinId; X0: number; Z: number; ph: number; tp: number }[] = [
    { skin: "su_smg", X0: -23, Z: 25.2, ph: 0.0, tp: 1.0 }, { skin: "su_rifleman", X0: -25.6, Z: 26.4, ph: 0.4, tp: 0.96 }, { skin: "su_smg", X0: -21, Z: 27.0, ph: 0.72, tp: 1.05 }, { skin: "su_rifleman", X0: -27.4, Z: 25.8, ph: 0.15, tp: 1.02 }, { skin: "su_smg", X0: -24.2, Z: 28.0, ph: 0.55, tp: 0.98 }, { skin: "su_rifleman", X0: -29.5, Z: 26.8, ph: 0.86, tp: 1.0 },
  ];
  SU.forEach((s, i) => { const x = s.X0 + (speedOf("run") / 100) * s.tp * t * (1 + 0), p = pj(x, s.Z + 3.4); push(s.Z + 3.4, <Soldier key={"su" + i} skin={s.skin} anim="run" t={t} phase={s.ph} tempo={s.tp} x={p.sx} y={F(p.sy - RIDGE * p.k)} px={p.pc} haze={p.haze * 0.6} hazeColor={HAZE} />); });
  { const v = 2.4, X = -27 + v * t, p0 = pj(X, 26.9), p = { ...p0, sy: p0.sy - RIDGE * p0.k }, n = Math.round(t * 30);
    push(26.9, <g key="t34"><Puffs x={F(p.sx - 3 * p.k)} y={F(p.sy)} px={p.pc} t={t} n={9} life={2.6} dx={-70} rise={60} r0={20} grow={50} color="#8a7456" alpha={0.28} seed={21} /><Puffs x={F(p.sx - 3.0 * p.k)} y={F(p.sy - 1.0 * p.k)} px={p.pc} t={t} n={6} life={2.2} dx={-50} rise={170} r0={6} grow={22} color="#4b4033" alpha={0.32} seed={22} /><Vehicle kind="t34" t={t} x={p.sx} y={p.sy} px={p.pc} dist={v * 100 * t} moving fireTimes={EV.t34} haze={p.haze * 0.6} hazeColor={HAZE} /></g>); void n; }
  // ---- MIDGROUND: Panzer IV + parapet + pembela Wehrmacht ----
  { const p = pj(12.8, 16.7), mz = [p.sx - 4.2 * p.k, p.sy - 1.78 * p.k] as V;
    push(16.7, <g key="pz"><Puffs x={F(p.sx + 2.7 * p.k)} y={F(p.sy - 0.9 * p.k)} px={p.pc} t={t} n={7} life={3} dx={60} rise={120} r0={6} grow={24} color="#4b4033" alpha={0.26} seed={30} /><Vehicle kind="panzer4" t={t} x={p.sx} y={p.sy} px={p.pc} flip fireTimes={EV.panzer} haze={p.haze * 0.6} hazeColor={HAZE} />
      {EV.panzer.map((s, i) => t > s && t < s + 4 ? <Puffs key={i} x={F(mz[0])} y={F(mz[1])} px={p.pc} t={t - s} n={9} life={3.6} dx={-170} rise={40} r0={18} grow={86} color="#b6a68a" alpha={0.5} seed={33 + i} flip={false} /> : null)}</g>); }
  const par = pj(0, 13.6);
  const DE: { skin: SkinId; X: number; shots: number[]; key: string }[] = [{ skin: "de_rifleman", X: 6.4, shots: SOLDIER_EVENTS.de_shots.d0, key: "d0" }, { skin: "de_mg", X: 8.7, shots: MG, key: "mg" }, { skin: "de_rifleman", X: 11.0, shots: SOLDIER_EVENTS.de_shots.d2, key: "d2" }];
  DE.forEach((d, i) => { const p = pj(d.X, 14.1), aimK = clamp((t - 6.7) / 0.7, 0, 1), anim: AnimId = t < 6.7 ? "idle" : t < 8.2 ? "aim" : "fire";
    push(14.1, <Soldier key={d.key} skin={d.skin} anim={anim} t={t} phase={i * 0.31} x={p.sx} y={p.sy} px={p.pc} flip kneel aimK={aimK} shots={d.shots} bipodY={d.skin === "de_mg" ? -70 : undefined} haze={p.haze * 0.6} hazeColor={HAZE} />); });
  push(13.6, (() => { const row = (yo: number, off: number) => Array.from({ length: 12 }).map((_, i) => { const X = 4.9 + i * 0.62 + off, a = pj(X, 13.6), b = pj(X + 0.6, 13.6); return <rect key={`${yo}-${i}`} x={F(a.sx)} y={F(a.sy - (yo + 0.24) * a.k)} width={F(b.sx - a.sx + 0.8)} height={F(0.3 * a.k)} rx={F(0.1 * a.k)} fill={mixHex("#28211a", HAZE, par.haze)} stroke="#d9a860" strokeOpacity={0.22} strokeWidth={0.8} />; }); return <g key="parapet">{[0, 0.24, 0.47].map((y, n) => row(y, n % 2 ? 0.3 : 0))}</g>; })());
  // ---- MIDGROUND: Sherman + infanteri US ----
  { const dS = dist(190, t, 7.3, 1.4), X = -15.2 + dS / 100, p = pj(X, 11.6), mv = t < 8.7, mz = [p.sx + 3.52 * p.k, p.sy - 1.9 * p.k] as V;
    push(11.6, <g key="sh"><Puffs x={F(p.sx - 2.9 * p.k)} y={F(p.sy - 1.0 * p.k)} px={p.pc} t={t} n={7} life={2.6} dx={-60} rise={150} r0={6} grow={24} color="#4b4033" alpha={0.3} seed={50} /><Puffs x={F(p.sx - 3.1 * p.k)} y={F(p.sy)} px={p.pc} t={t} n={9} life={2.4} dx={-80} rise={55} r0={22} grow={60} color="#8a7456" alpha={mv ? 0.34 : 0.1} seed={51} /><Vehicle kind="sherman" t={t} x={p.sx} y={p.sy} px={p.pc} dist={dS} moving={mv} fireTimes={EV.sherman} haze={p.haze * 0.6} hazeColor={HAZE} />
      {EV.sherman.map((s, i) => t > s && t < s + 4 ? <Puffs key={i} x={F(mz[0])} y={F(mz[1])} px={p.pc} t={t - s} n={9} life={3.4} dx={150} rise={40} r0={16} grow={80} color="#b6a68a" alpha={0.5} seed={60 + i} /> : null)}</g>); }
  const US: { X0: number; Z: number; ph: number; tp: number; key: string }[] = [{ X0: -9.6, Z: 9.5, ph: 0.0, tp: 1.0, key: "u0" }, { X0: -11.8, Z: 10.3, ph: 0.37, tp: 1.04, key: "u1" }, { X0: -8.2, Z: 10.7, ph: 0.71, tp: 0.96, key: "u2" }, { X0: -13.4, Z: 9.2, ph: 0.18, tp: 1.02, key: "u3" }];
  US.forEach((u) => { const v = (speedOf("walk") / 100) * u.tp, X = u.X0 + dist(v, t, EV.stop, EV.blend), p = pj(X, u.Z), k = clamp((t - EV.stop) / EV.blend, 0, 1), aimK = clamp((t - EV.stop) / 0.9, 0, 1), after = t >= EV.stop;
    push(u.Z, <Soldier key={u.key} skin="us_rifleman" anim={after ? (t > 8.3 ? "fire" : "aim") : "walk"} from={after && k < 1 ? { anim: "walk", phase: u.ph } : undefined} k={k} t={t} tempo={u.tp} phase={u.ph} x={p.sx} y={p.sy} px={p.pc} aimK={aimK} shots={(SOLDIER_EVENTS.us_shots as any)[u.key]} haze={p.haze * 0.6} hazeColor={HAZE} />); });
  // ---- FOREGROUND: operator radio US + penembak berlutut ----
  { const p = pj(-3.1, 7.0), talking = t > EV.radio[0].t0 - 0.3 && t < EV.radio[0].t0 + EV.radio[0].dur + 0.5; push(7.0, <Soldier key="radio" skin="us_radio" anim="idle" t={t} phase={0.2} x={p.sx} y={p.sy} px={p.pc} haze={p.haze * 0.6} hazeColor={HAZE} />); void talking; }
  { const p = pj(2.4, 5.2), anim: AnimId = t < 8.1 ? "aim" : "fire"; push(5.2, <Soldier key="kneel" skin="us_rifleman" anim={anim} t={t} phase={0.6} x={p.sx} y={p.sy} px={p.pc} kneel aimK={1} shots={SOLDIER_EVENTS.us_shots.kneel} haze={0} />); }
  // ---- efek: ledakan, tracer, debu melayang ----
  EV.impacts.forEach((im, n) => { const a = t - im.t; if (a < -0.05 || a > 4.5) return; const p = pj(im.X, im.Z), px = p.pc * im.s, parts = Array.from({ length: 26 }).map((_, i) => { const ang = -Math.PI / 2 + (hash(i * 3 + n) - 0.5) * 2.1, sp = 380 + hash(i * 7 + n) * 560, tt = Math.max(0, a); return { x: p.sx + Math.cos(ang) * sp * tt * px * 0.01 * 1.6, y: p.sy + (Math.sin(ang) * sp * tt - 900 * tt * tt * -0.5 * -1) * px * 0.01 * 1.6 * 1, r: (4 + hash(i * 11) * 9) * px * 0.1 * 1.6 }; });
    push(im.Z - 0.4, <g key={"im" + n}>{a < 0.14 && <circle cx={p.sx} cy={F(p.sy - 60 * px)} r={F((60 + a * 900) * px)} fill="#ffd9a0" opacity={0.85 * (1 - a / 0.14)} />}
      {parts.map((q, i) => <circle key={i} cx={F(q.x)} cy={F(q.y)} r={F(q.r)} fill="#2c2217" opacity={clamp(1 - a / 1.3, 0, 1)} />)}
      <Puffs x={p.sx} y={F(p.sy - 20 * px)} px={px} t={Math.max(0, a)} n={10} life={4.6} dx={80} rise={380} r0={34} grow={170} color="#6b5c46" alpha={a > 0 ? 0.5 : 0} seed={70 + n} /></g>); });
  const burst = EV.mg.find(([a, b]) => t >= a && t <= b + 0.3);
  const mgP = pj(8.7, 14.1), mgM = muzzleScreen("de_mg", mgP, true, t < 8.2 ? "aim" : "fire", t, { aimK: 1, shots: MG, kneel: true });
  if (burst) { const tgt: V = [pj(-0.3, 9.8).sx, pj(-0.3, 9.8).sy - 0.9 * pj(-0.3, 9.8).k]; for (let r = 0; r < 14; r++) { const t0 = burst[0] + r * 0.09 + hash(r) * 0.03, p = (t - t0) / 0.2; if (p > 0 && p < 1) { const a: V = [mgM[0] + (tgt[0] - mgM[0]) * Math.max(0, p - 0.15), mgM[1] + (tgt[1] - mgM[1]) * Math.max(0, p - 0.15)], b: V = [mgM[0] + (tgt[0] - mgM[0]) * p, mgM[1] + (tgt[1] - mgM[1]) * p]; push(9.0, <g key={"tr" + r}><line x1={F(a[0])} y1={F(a[1])} x2={F(b[0])} y2={F(b[1])} stroke="#ffcf73" strokeWidth={5} opacity={0.35} strokeLinecap="round" /><line x1={F(a[0])} y1={F(a[1])} x2={F(b[0])} y2={F(b[1])} stroke="#fff3cf" strokeWidth={2} strokeLinecap="round" /></g>); } } }
  push(4.4, <g key="motes">{Array.from({ length: 34 }).map((_, i) => { const x = ((hash(i) * W + t * (8 + hash(i + 2) * 14) - cam.x * 55) % W + W) % W, y = 120 + hash(i * 3) * 760 + 14 * Math.sin(t * 0.7 + i); return <circle key={i} cx={F(x)} cy={F(y)} r={1 + hash(i * 5) * 2.2} fill="#ffe9bd" opacity={0.18 + 0.2 * hash(i * 9)} />; })}</g>);
  // foreground occlusion (Z dekat, paralaks besar): gundukan tanah, tiang pagar & kawat berduri, rumput
  push(3.2, (() => { const a = pj(-5.2, 3.2), px = a.k; return <g key="fg1"><path d={`M${F(a.sx - 1.9 * px)},${H + 2} Q${F(a.sx - 1.2 * px)},${F(a.sy - 0.4 * px)} ${F(a.sx)},${F(a.sy - 0.15 * px)} Q${F(a.sx + 1.1 * px)},${F(a.sy + 0.05 * px)} ${F(a.sx + 1.9 * px)},${H + 2} Z`} fill="#0f0b07" />{Array.from({ length: 22 }).map((_, i) => { const x = a.sx + (hash(i) - 0.5) * 3.2 * px, h = (0.25 + hash(i * 3) * 0.55) * px; return <path key={i} d={`M${F(x)},${F(a.sy + 0.1 * px)} q${F(2 + 6 * Math.sin(t * 1.3 + i))},${F(-h * 0.5)} ${F(hash(i) * 14 - 4)},${F(-h)}`} stroke="#0f0b07" strokeWidth={3} fill="none" strokeLinecap="round" />; })}</g>; })());
  push(3.0, (() => { const posts = [0.3, 1.5].map((o) => pj(5.0 + o, 3.0)), pk = posts[0].k; const wire = (dy: number, i: number) => `M${posts.map((q) => `${F(q.sx)},${F(q.sy - dy * pk + 4 * Math.sin(i))}`).join(" Q")}`; void wire; return <g key="fg2">{posts.map((q, i) => <g key={i}><rect x={F(q.sx - 0.045 * pk)} y={F(q.sy - 1.25 * pk)} width={F(0.09 * pk)} height={F(1.25 * pk + 8)} fill="#0d0905" transform={`rotate(${(i - 1.5) * 3} ${F(q.sx)} ${F(q.sy)})`} /></g>)}{[0.45, 0.85, 1.15].map((dy, i) => <path key={i} d={`M${posts.map((q, j) => `${j ? "L" : ""}${F(q.sx)},${F(q.sy - dy * pk + (j % 2) * 7)}`).join(" ")}`} stroke="#0d0905" strokeWidth={2.2} fill="none" />)}</g>; })());

  push(2.5, (() => { const base = H + 8; return <g key="fg3">{Array.from({ length: 70 }).map((_, i) => { const x0 = ((i * 31 - cam.x * 360) % 2100 + 2100) % 2100 - 90, h = 70 + hash(i * 2.7) * 120, sw = 14 * Math.sin(t * 1.2 + i * 0.9) + (hash(i) - 0.5) * 30; return <path key={i} d={`M${F(x0)},${base} Q${F(x0 + sw * 0.4)},${F(base - h * 0.6)} ${F(x0 + sw)},${F(base - h)} Q${F(x0 + sw * 0.5 + 8)},${F(base - h * 0.55)} ${F(x0 + 12)},${base} Z`} fill="#0d0905" />; })}<rect y={H - 26} width={W} height={30} fill="#0d0905" />{[0, 1].map((i) => { const x = ((i * 1100 + 300 - cam.x * 340) % 2300 + 2300) % 2300 - 200; return <path key={"r" + i} d={`M${F(x)},${H + 4} Q${F(x + 40)},${F(H - 90)} ${F(x + 150)},${F(H - 100)} Q${F(x + 260)},${F(H - 80)} ${F(x + 300)},${H + 4} Z`} fill="#0d0905" />; })}</g>; })());
  items.sort((a, b) => b.z - a.z);
  // kabut atmosfer di antara lapisan: lapisan haze disisipkan menurut kedalaman
  const hazeLayers: Item[] = [60, 36, 24, 15].map((z, i) => ({ z: z - 0.01, node: <rect key={"hz" + i} x={0} y={F(pj(0, z).sy - 140 * (1 - i * 0.12))} width={W} height={F(190 * (1 - i * 0.1))} fill="url(#haze)" opacity={0.55 - i * 0.1} /> }));
  const all = [...items, ...hazeLayers].sort((a, b) => b.z - a.z);
  return (
    <AbsoluteFill style={{ background: "#0c0904" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ opacity: fade }}>
        {sky}{furrows}{bands}{road}
        {all.map((it, i) => <g key={i}>{it.node}</g>)}
        <rect width={W} height={H} fill="url(#vig)" />
      </svg>
      <RadioPanel t={t} fade={fade} />
    </AbsoluteFill>
  );
};

// ---------- panel komunikasi radio (gaya dokumenter; di kiri-atas supaya area subtitle/VO tetap kosong) ----------
const LINES: Record<string, { name: string; band: string; col: string; text: string; en?: string }> = {
  us: { name: "UNITED STATES", band: "SCR-300 · FM", col: "#7fa26a", text: "Able-One to Command, radio check. How do you read me? Over." },
  de: { name: "WEHRMACHT", band: "Torn.Fu · AM", col: "#9aa0a8", text: "Gefechtsstand, hier Falke Eins. Funkprobe. Wie hören Sie mich? Kommen.", en: "Command post, this is Falcon One. Radio check. How do you read me? Over." },
};
export const RadioPanel: React.FC<{ t: number; fade: number }> = ({ t, fade }) => {
  const cur = EV.radio.find((r) => t >= r.t0 - 0.5 && t <= r.t0 + r.dur + 0.9);
  if (!cur) return null;
  const silence = t < cur.t0 || t > cur.t0 + cur.dur, L = LINES[cur.f], live = !silence, prog = clamp((t - cur.t0) / cur.dur, 0, 1), o = clamp(Math.min((t - (cur.t0 - 0.5)) / 0.3, (cur.t0 + cur.dur + 0.9 - t) / 0.3), 0, 1) * fade, n = Math.floor(prog * L.text.length), fr = Math.floor(t * 30);
  const env = clamp(0.3 + 0.7 * Math.abs(Math.sin(t * 9.1) * Math.sin(t * 2.6 + 1)), 0, 1);
  return (
    <div style={{ position: "absolute", left: 48, top: 44, width: 640, opacity: o, fontFamily: "Georgia, 'Times New Roman', serif", color: "#efe3c8", background: "rgba(14,11,7,.84)", borderLeft: `6px solid ${L.col}`, padding: "14px 20px 16px", boxShadow: "0 6px 24px rgba(0,0,0,.45)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, letterSpacing: 3, color: "#c9a85b" }}><span>RADIO · {L.name}</span><span>{L.band}</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40, margin: "8px 0 6px" }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: live ? "#d9432f" : "#5a5040", marginRight: 10, boxShadow: live ? "0 0 10px #d9432f" : "none" }} />
        {Array.from({ length: 46 }).map((_, i) => <span key={i} style={{ width: 6, background: live ? L.col : "#4a4033", height: live ? 4 + 34 * env * (0.25 + 0.75 * hash(i * 7.3 + fr * 0.9)) : 3 + 2 * hash(i + fr * 0.3) }} />)}
      </div>
      <div style={{ fontSize: 15, letterSpacing: 2, color: live ? "#d9432f" : "#8d7e62", marginBottom: 6 }}>{live ? "● TRANSMITTING" : "○ RADIO SILENCE — carrier hiss only"}</div>
      <div style={{ fontSize: 25, lineHeight: 1.28, minHeight: 64 }}>{live ? L.text.slice(0, n) : ""}</div>
      {L.en && live && <div style={{ fontSize: 17, color: "#bfae88", marginTop: 4, fontStyle: "italic" }}>{L.en.slice(0, Math.floor(prog * L.en.length))}</div>}
    </div>
  );
};
