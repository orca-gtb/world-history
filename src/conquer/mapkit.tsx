// mapkit: mesin peta operasional yang bisa dipakai ulang (proyeksi, kurva, panah, kotak unit NATO, kamera keyframe).
import React from "react";
import { Easing } from "remotion";
import { F, clamp01 } from "../kit/theme";

export const W = 1920, H = 1080;
export type P = [number, number];
export const RED = "#c8261c", RED_FILL = "#f3d3cb", DE = "#2a3038", DE_FILL = "#d6d6cf";
export const bz = Easing.bezier(0.16, 1, 0.3, 1);
export const io = Easing.bezier(0.65, 0, 0.35, 1);
export const cl = (t: number, a: number, d: number) => clamp01((t - a) / d);
export const rv = (t: number, a: number, d = 0.5) => bz(cl(t, a, d));

// proyeksi equirectangular terpusat (skala S px per derajat lintang)
export const makeProj = (lat0: number, lon0: number, S: number) => {
  const KX = Math.cos((lat0 * Math.PI) / 180);
  return ([lon, lat]: number[]): P => [W / 2 + (lon - lon0) * KX * S, H / 2 - (lat - lat0) * S];
};

export const path = (pts: P[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
export const smooth = (pts: P[], closed = false) => {
  const n = pts.length; if (n < 3) return path(pts);
  const g = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += `C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + "Z" : d;
};
export const len = (pts: P[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
export const along = (pts: P[], u: number): P => {
  const L = len(pts) * clamp01(u); let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + s >= L) { const k = (L - acc) / (s || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; }
    acc += s;
  }
  return pts[pts.length - 1];
};
export const off = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];

// interpolasi keyframe [t, nilai] dengan easing io; sebelum/ sesudah = tahan
export function keyed<T>(keys: [number, T][], t: number, mix: (a: T, b: T, u: number) => T): T {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const [ta, a] = keys[i - 1], [tb, b] = keys[i]; return mix(a, b, io(clamp01((t - ta) / (tb - ta || 1)))); }
  }
  return keys[keys.length - 1][1];
}
export const mixP = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
export type Cam = { z: number; c: P };
export const mixCam = (a: Cam, b: Cam, u: number): Cam => ({ z: a.z + (b.z - a.z) * u, c: mixP(a.c, b.c, u) });

export const Arrow: React.FC<{ pts: P[]; a: number; b: number; t: number; k: number; color?: string; upto?: number; width?: number; dash?: boolean }> = ({ pts, a, b, t, k, color = RED, upto = 1, width = 14, dash }) => {
  const u = io(cl(t, a, b - a)) * upto;
  if (u <= 0.001) return null;
  const Lt = len(pts), tip = along(pts, u), pre = along(pts, Math.max(0, u - 8 / Lt));
  const g = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]), hw = (width * 1.85) / k, hl = (width * 2.4) / k;
  const head = [[tip[0] + Math.cos(g) * hl * 0.5, tip[1] + Math.sin(g) * hl * 0.5], [tip[0] - Math.cos(g) * hl * 0.6 - Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 + Math.cos(g) * hw], [tip[0] - Math.cos(g) * hl * 0.6 + Math.sin(g) * hw, tip[1] - Math.sin(g) * hl * 0.6 - Math.cos(g) * hw]];
  const d = smooth(pts);
  const dashArr = dash ? `${(width * 1.6) / k} ${(width * 1.1) / k}` : undefined;
  return (
    <g opacity={0.92}>
      {!dash && <path d={d} fill="none" stroke="rgba(30,8,4,0.5)" strokeWidth={(width + 6) / k} strokeLinecap="round" strokeDasharray={`${Lt * u} ${Lt * 2}`} />}
      <mask id={`m${Math.round(pts[0][0])}${Math.round(pts[0][1])}${Math.round(a * 10)}`}><path d={d} fill="none" stroke="#fff" strokeWidth={(width + 10) / k} strokeDasharray={`${Lt * u} ${Lt * 2}`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={width / k} strokeLinecap="round" strokeDasharray={dash ? dashArr : `${Lt * u} ${Lt * 2}`} mask={dash ? `url(#m${Math.round(pts[0][0])}${Math.round(pts[0][1])}${Math.round(a * 10)})` : undefined} />
      <path d={`M${head.map((h) => h.join(",")).join("L")}Z`} fill={color} />
    </g>
  );
};

export type UType = "inf" | "pz" | "cavmech" | "hq";
export const Counter: React.FC<{ p: P; side: "SU" | "DE"; ech: string; type: UType; name?: string; cmd?: string; k: number; opacity?: number; trapped?: number; scale?: number }> = ({ p, side, ech, type, name, cmd, k, opacity = 1, trapped = 0, scale = 1 }) => {
  if (opacity <= 0.01) return null;
  const su = side === "SU", s = scale;
  const w = (92 * s) / k, h = (60 * s) / k, sw = (3 * s) / k, stroke = su ? RED : DE;
  return (
    <g transform={`translate(${p[0]},${p[1]})`} opacity={opacity}>
      <rect x={-w / 2 + 4 / k} y={-h / 2 + 5 / k} width={w} height={h} fill="rgba(0,0,0,0.25)" />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={su ? RED_FILL : DE_FILL} stroke={stroke} strokeWidth={sw} />
      {trapped > 0 && <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#trap)" opacity={trapped} />}
      {type === "inf" && <path d={`M${-w / 2},${-h / 2}L${w / 2},${h / 2}M${w / 2},${-h / 2}L${-w / 2},${h / 2}`} stroke={stroke} strokeWidth={sw} />}
      {(type === "pz" || type === "cavmech") && <ellipse cx={0} cy={0} rx={w * 0.3} ry={h * 0.22} fill="none" stroke={stroke} strokeWidth={sw} />}
      {type === "cavmech" && <path d={`M${-w / 2},${h / 2}L${w / 2},${-h / 2}`} stroke={stroke} strokeWidth={sw} />}
      {type === "hq" && <path d={`M${-w / 2},${-h / 2}L${-w / 2},${h / 2 + h * 0.9}`} stroke={stroke} strokeWidth={sw * 1.3} />}
      {ech && <text x={0} y={-h / 2 - 6 / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={(20 * s) / k} fill={stroke}>{ech}</text>}
      {name && <text x={0} y={h / 2 + (24 * s) / k} textAnchor="middle" fontFamily={F.ui} fontWeight={700} fontSize={(22 * s) / k} fill={su ? "#7a1610" : "#1d2228"} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{name}</text>}
      {cmd && <text x={0} y={h / 2 + (46 * s) / k} textAnchor="middle" fontFamily={F.type} fontSize={(17 * s) / k} fill={su ? "#7a1610" : "#1d2228"} stroke="rgba(244,239,228,0.85)" strokeWidth={4 / k} paintOrder="stroke">{cmd}</text>}
    </g>
  );
};
