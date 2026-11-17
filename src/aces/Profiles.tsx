import React from "react";
import type { Icon } from "./data";

// Siluet profil SAMPING pesawat (hidung ke kanan), digambar dengan lengkung halus pada skala meter nyata.
// Panjang/bentang dari spesifikasi umum: Bf 109 G ≈ 8,9 m, Fw 190 A ≈ 8,95 m, Me 262 A ≈ 10,6 m.
// Bentuknya DIGAMBAR dari proporsi (bukan dijiplak dari gambar teknik) -> sebelum dipublikasi bandingkan dengan 3-view referensi.
type P = [number, number];

const smooth = (pts: P[]) => {
  const n = pts.length;
  const g = (i: number) => pts[(i + n) % n];
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d + " Z";
};
const poly = (pts: P[]) => "M" + pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" L") + " Z";

// (x = jarak dari ujung hidung ke belakang, z = tinggi)
const BF109: P[] = [
  [0, 0], [0.1, 0.22], [0.35, 0.4], [0.8, 0.5], [1.3, 0.56], [1.9, 0.62], [2.5, 0.62],
  [2.9, 0.7], [3.2, 0.95], [3.6, 1.04], [4.1, 1.0], [4.5, 0.78], [5.3, 0.62], [6.4, 0.5], [7.5, 0.43],
  [7.78, 0.66], [8.08, 1.22], [8.34, 1.58], [8.58, 1.62], [8.76, 1.46], [8.88, 1.05], [8.9, 0.42], [8.8, 0.06],
  [8.4, -0.12], [7.2, -0.22], [5.8, -0.34], [4.6, -0.46], [3.5, -0.56], [2.5, -0.6], [1.8, -0.68], [1.3, -0.74], [0.95, -0.6], [0.6, -0.44], [0.25, -0.27], [0.05, -0.12],
];
const FW190: P[] = [
  [0, 0], [0.07, 0.24], [0.28, 0.5], [0.6, 0.64], [1.1, 0.7], [1.6, 0.68], [2.0, 0.64],
  [2.3, 0.82], [2.65, 1.1], [3.1, 1.24], [3.6, 1.2], [4.1, 1.02], [4.5, 0.84], [5.2, 0.72], [6.2, 0.62], [7.2, 0.55],
  [7.7, 0.74], [8.05, 1.2], [8.4, 1.66], [8.72, 1.8], [8.92, 1.56], [8.96, 0.9], [8.9, 0.38], [8.74, 0.1],
  [8.2, -0.05], [7.2, -0.16], [6.0, -0.27], [5.0, -0.38], [4.0, -0.5], [3.0, -0.6], [2.0, -0.65], [1.5, -0.72], [1.0, -0.74], [0.55, -0.64], [0.26, -0.44], [0.06, -0.2],
];
const ME262: P[] = [
  [0, 0.02], [0.1, 0.22], [0.45, 0.4], [1.0, 0.54], [1.7, 0.66],
  [2.35, 0.86], [2.85, 1.02], [3.35, 1.02], [3.85, 0.9], [4.35, 0.78], [5.1, 0.66], [6.2, 0.6], [7.4, 0.56], [8.5, 0.56],
  [9.0, 1.05], [9.45, 1.62], [9.95, 2.04], [10.36, 1.98], [10.5, 1.6], [10.6, 0.92], [10.52, 0.36], [10.2, 0.1],
  [9.0, -0.08], [8.0, -0.24], [7.0, -0.36], [6.0, -0.46], [5.0, -0.54], [4.0, -0.6], [3.2, -0.6], [2.5, -0.58], [1.8, -0.55], [1.1, -0.5], [0.5, -0.4], [0.12, -0.22],
];

type Spec = { len: number; body: P[]; extra: (c: string) => React.ReactNode; canopy: P[]; fin?: boolean };
const SPECS: Record<Icon, Spec> = {
  bf109: {
    len: 8.9, body: BF109, canopy: [[2.95, 0.72], [3.25, 0.96], [3.6, 1.02], [4.05, 0.98], [4.42, 0.76]],
    extra: (c) => (
      <g fill={c}>
        {/* bilah baling-baling (tampak samping, menyempit di ujung) */}
        <path d={poly([[0.3, 1.5], [0.46, 1.5], [0.5, 0.05], [0.5, -0.05], [0.46, -1.5], [0.3, -1.5], [0.26, -0.05], [0.26, 0.05]])} />
        {/* sayap tampak tepi + penstabil ekor */}
        <path d={smooth([[2.2, -0.4], [2.6, -0.3], [3.2, -0.27], [3.9, -0.32], [4.25, -0.4], [3.7, -0.5], [2.9, -0.53], [2.35, -0.5]])} />
        <path d={poly([[7.5, 0.66], [8.7, 0.7], [8.7, 0.6], [7.6, 0.55]])} />
      </g>
    ),
  },
  fw190: {
    len: 8.95, body: FW190, canopy: [[2.35, 0.82], [2.7, 1.1], [3.1, 1.24], [3.6, 1.2], [4.1, 1.02], [4.45, 0.86]],
    extra: (c) => (
      <g fill={c}>
        <path d={poly([[0.34, 1.65], [0.52, 1.65], [0.56, 0.05], [0.56, -0.05], [0.52, -1.65], [0.34, -1.65], [0.3, -0.05], [0.3, 0.05]])} />
        <path d={smooth([[2.4, -0.42], [3.0, -0.34], [3.8, -0.32], [4.6, -0.38], [4.9, -0.46], [4.2, -0.56], [3.2, -0.6], [2.5, -0.56]])} />
        <path d={poly([[7.4, 0.62], [8.7, 0.68], [8.7, 0.56], [7.5, 0.5]])} />
      </g>
    ),
  },
  me262: {
    len: 10.6, body: ME262, canopy: [[2.4, 0.86], [2.85, 1.02], [3.35, 1.02], [3.85, 0.9], [4.3, 0.78]],
    extra: (c) => (
      <g fill={c}>
        {/* sayap tampak tepi + nasel Jumo 004 (lubang masuk di depan, kerucut knalpot di belakang) */}
        <path d={smooth([[3.0, -0.34], [4.2, -0.3], [5.8, -0.3], [7.0, -0.36], [6.0, -0.5], [4.4, -0.5], [3.2, -0.48]])} />
        <path d={smooth([[3.1, -0.5], [3.2, -0.78], [3.7, -1.0], [4.7, -1.1], [5.8, -1.06], [6.7, -0.94], [7.5, -0.78], [6.6, -0.62], [5.4, -0.5], [4.0, -0.46]])} />
        {/* penstabil ekor tampak tepi */}
        <path d={poly([[9.4, 0.78], [10.55, 0.84], [10.55, 0.72], [9.5, 0.66]])} />
      </g>
    ),
  },
};

export const AircraftProfile: React.FC<{ icon: Icon; width?: number; color?: string; px?: number }> = ({ icon, width = 210, color = "#2a2418" }) => {
  const sp = SPECS[icon];
  // skala TETAP antar pesawat (px/m) supaya ukuran relatif benar: pesawat terpanjang (10,6 m) = lebar penuh
  const pxm = width / 10.8;
  const W = width, H = pxm * 4.4;
  const tx = (sp.len < 10 ? (10.8 - sp.len) / 2 : 0.1) * pxm;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* hidung ke kanan: cerminkan sumbu x; z ke atas */}
      <g transform={`translate(${W - tx} ${pxm * 2.5}) scale(${-pxm} ${-pxm})`}>
        <path d={smooth(sp.body)} fill={color} />
        {sp.extra(color)}
        {/* kaca kanopi: garis terang tipis supaya siluet tidak datar */}
        <path d={poly(sp.canopy.concat([sp.canopy[sp.canopy.length - 1], sp.canopy[0]]).map(([x, z]) => [x, z] as P)).replace(/Z$/, "")} fill="none" stroke="#e9dfc4" strokeWidth={0.05} opacity={0.55} />
        {/* lampu tepi atas (rim) */}
        <path d={smooth(sp.body)} fill="none" stroke="#e9dfc4" strokeWidth={0.03} opacity={0.12} />
      </g>
    </svg>
  );
};
