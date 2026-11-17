import React from "react";
import { clamp01, C } from "./theme";

// Panah/lingkaran kapur yang "tergambar sendiri" (stroke-dashoffset) + sedikit gemetar tangan.
export const ChalkDefs: React.FC = () => (
  <defs>
    <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.7" result="grain" />
      <feComposite in="d" in2="grain" operator="in" />
    </filter>
  </defs>
);

type P = { d: string; len: number; progress: number; color?: string; width?: number; arrow?: boolean };
export const ChalkPath: React.FC<P> = ({ d, len, progress, color = C.chalk, width = 9, arrow }) => {
  const p = clamp01(progress);
  if (p <= 0) return null;
  return (
    <g filter="url(#chalk)">
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      {arrow && p > 0.96 && null}
    </g>
  );
};

// lingkaran kapur sekitar titik
export const ChalkCircle: React.FC<{ cx: number; cy: number; r: number; progress: number; color?: string; width?: number }> = ({ cx, cy, r, progress, color = C.chalk, width = 8 }) => {
  const len = 2 * Math.PI * r * 1.06;
  // mulai sedikit miring + sedikit melewati titik awal, seperti coretan tangan
  const d = `M ${cx - r} ${cy + 4} a ${r} ${r * 0.94} 0 1 1 ${2 * r + 14} ${-8} a ${r * 1.02} ${r * 0.96} 0 0 1 ${-r * 0.4} ${r * 0.5}`;
  return <ChalkPath d={d} len={len} progress={progress} color={color} width={width} />;
};

// panah kapur lurus/melengkung dengan kepala panah yang muncul di ujung
export const ChalkArrow: React.FC<{ from: [number, number]; to: [number, number]; bend?: number; progress: number; color?: string; width?: number }> = ({ from, to, bend = 0, progress, color = C.chalk, width = 9 }) => {
  const mx = (from[0] + to[0]) / 2 + bend * (to[1] - from[1]) * 0.35;
  const my = (from[1] + to[1]) / 2 - bend * (to[0] - from[0]) * 0.35;
  const d = `M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`;
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]) * (1.08 + Math.abs(bend) * 0.25);
  const ang = Math.atan2(to[1] - my, to[0] - mx);
  const hp = clamp01((progress - 0.8) / 0.2);
  const hl = 44 * hp;
  const a1 = ang + 2.6;
  const a2 = ang - 2.6;
  return (
    <g>
      <ChalkPath d={d} len={len} progress={Math.min(1, progress / 0.85)} color={color} width={width} />
      {hp > 0 && (
        <g filter="url(#chalk)">
          <path d={`M ${to[0]} ${to[1]} l ${Math.cos(a1) * hl} ${Math.sin(a1) * hl} M ${to[0]} ${to[1]} l ${Math.cos(a2) * hl} ${Math.sin(a2) * hl}`} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
        </g>
      )}
    </g>
  );
};
