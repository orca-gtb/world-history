import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C } from "./theme";

// Kertas peta tua: gradasi + serat + grid. Noise via SVG data-URI (dirasterisasi sekali, murah).
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.08  0 0 0 0.5 -0.12'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;
const FIBER = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.03' numOctaves='4' seed='9'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.15  0 0 0 0.55 -0.2'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`,
)}")`;

// Tekstur hidup: noise "mendidih" tiap 3 frame (stop-motion), serat bergeser sangat pelan, kilau cahaya bernapas.
export const Paper: React.FC<{ dim?: number }> = ({ dim = 0 }) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 3);
  const nx = Math.floor(random(`pn${k}`) * 420), ny = Math.floor(random(`pm${k}`) * 420);
  const breath = 0.5 + 0.5 * Math.sin(f / 37);
  return (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${C.paper} 0%, #cdb98f 62%, ${C.paperDark} 100%)` }} />
    <AbsoluteFill style={{ backgroundImage: FIBER, backgroundPosition: `${f * 0.12}px ${f * 0.05}px`, opacity: 0.9, mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ backgroundImage: NOISE, backgroundPosition: `${nx}px ${ny}px`, opacity: 0.62 + 0.1 * random(`po${k}`), mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at ${38 + 8 * Math.sin(f / 61)}% ${30 + 6 * Math.cos(f / 73)}%, rgba(255,244,214,${0.1 + 0.08 * breath}) 0%, rgba(255,244,214,0) 70%)`, mixBlendMode: "screen" }} />
    {/* grid peta */}
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={1920} stroke={C.ink} strokeWidth={1} />
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 100} x2={1080} y2={i * 100} stroke={C.ink} strokeWidth={1} />
      ))}
    </svg>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,24,6,0.5) 100%)" }} />
    {dim > 0 && <AbsoluteFill style={{ background: C.night, opacity: dim }} />}
  </AbsoluteFill>
  );
};
