import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

// Lapisan film layar (bukan elemen dunia): grain 35mm, vignette, debu. Plus tekstur kertas meja.

const svgUrl = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

const GRAIN = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' seed='11'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`);
export const PAPER_NOISE = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='21'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.5 -0.12'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`);
export const PAPER_FIBER = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.03' numOctaves='4' seed='29'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.15  0 0 0 0.55 -0.2'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`);

export const FilmGrain: React.FC<{ strength: number }> = ({ strength }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundPosition: `${Math.floor(random(`x${f}`) * 300)}px ${Math.floor(random(`y${f}`) * 300)}px`, opacity: strength * (0.88 + 0.24 * random(`o${f}`)), mixBlendMode: "overlay", pointerEvents: "none" }} />;
};

export const Vignette: React.FC<{ amount: number }> = ({ amount }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 78% 62% at 50% 48%, rgba(0,0,0,0) 45%, rgba(8,5,2,${amount * 0.55}) 78%, rgba(4,2,0,${amount}) 100%)`, pointerEvents: "none" }} />
);

const MOTES = Array.from({ length: 34 }).map((_, i) => ({ x: random(`mx${i}`) * 1080, y: random(`my${i}`) * 1920, r: 1.2 + random(`mr${i}`) * 3.2, vy: -0.15 - random(`mv${i}`) * 0.4, ph: random(`mp${i}`) * 6.28, soft: random(`ms${i}`) > 0.7 }));
export const Dust: React.FC<{ tint: string }> = ({ tint }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {MOTES.map((m, i) => {
        const x = (((m.x + Math.sin(f / 40 + m.ph) * 14) % 1080) + 1080) % 1080;
        const y = (((m.y + m.vy * f) % 1920) + 1920) % 1920;
        const s = m.soft ? m.r * 2.6 : m.r;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s * 2, height: s * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${tint},${m.soft ? 0.35 : 0.9}) 0%, rgba(${tint},0) 70%)`, opacity: 0.5 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f / 23 + m.ph * 3))) }} />;
      })}
    </AbsoluteFill>
  );
};
