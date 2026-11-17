import React from "react";
import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Lapisan sinematik gaya dokumenter: kamera mikro (slow push + drift), vignette, grain 35mm, debu melayang.
// Pakai: <Cine dark?> <Paper/> ...konten... </Cine>. Overlay di luar transform supaya grain/vignette tetap terkunci ke layar.

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch' seed='7'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

export const Grain: React.FC<{ strength?: number }> = ({ strength = 0.16 }) => {
  const f = useCurrentFrame();
  // grain asli 35mm berubah tiap frame: geser tile secara acak (deterministik per frame)
  const x = Math.floor(random(`gx${f}`) * 300);
  const y = Math.floor(random(`gy${f}`) * 300);
  const flicker = 1 + (random(`fl${f}`) - 0.5) * 0.25;
  return <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundPosition: `${x}px ${y}px`, opacity: strength * flicker, mixBlendMode: "overlay", pointerEvents: "none" }} />;
};

export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.72 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 78% 62% at 50% 48%, rgba(0,0,0,0) 45%, rgba(8,5,2,${amount * 0.55}) 78%, rgba(4,2,0,${amount}) 100%)`, pointerEvents: "none" }} />
);

const DUST = Array.from({ length: 38 }).map((_, i) => ({
  x: random(`dx${i}`) * 1080,
  y: random(`dy${i}`) * 1920,
  r: 1.2 + random(`dr${i}`) * 3.4,
  vx: (random(`dvx${i}`) - 0.5) * 0.5,
  vy: -0.15 - random(`dvy${i}`) * 0.45,
  ph: random(`dp${i}`) * Math.PI * 2,
  blur: random(`db${i}`) > 0.7,
}));

export const Dust: React.FC<{ color?: string; opacity?: number }> = ({ color = "255,246,226", opacity = 0.55 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {DUST.map((d, i) => {
        const x = (((d.x + d.vx * f + Math.sin(f / 40 + d.ph) * 14) % 1080) + 1080) % 1080;
        const y = (((d.y + d.vy * f) % 1920) + 1920) % 1920;
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f / 23 + d.ph * 3));
        const s = d.blur ? d.r * 2.6 : d.r;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: s * 2, height: s * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${color},${d.blur ? 0.35 : 0.9}) 0%, rgba(${color},0) 70%)`, opacity: opacity * tw }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Kamera mikro: zoom 1.025 -> 1.065 sepanjang scene + drift sinus lambat (tak pernah diam total).
export const Cine: React.FC<{ children: React.ReactNode; dark?: boolean; zoom?: [number, number]; seed?: number }> = ({ children, dark = false, zoom = [1.025, 1.065], seed = 0 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = Math.min(1, f / Math.max(1, durationInFrames));
  const s = zoom[0] + (zoom[1] - zoom[0]) * (1 - Math.pow(1 - t, 2));
  const dx = Math.sin(f / 97 + seed) * 9 + Math.sin(f / 41 + seed * 2) * 2.5;
  const dy = Math.cos(f / 113 + seed) * 7 + Math.sin(f / 53 + seed) * 2;
  const rot = Math.sin(f / 151 + seed) * 0.18;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: dark ? "#05080c" : "#bfa97c" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(${rot}deg)`, transformOrigin: "50% 46%" }}>{children}</AbsoluteFill>
      <Dust color={dark ? "200,225,255" : "255,246,226"} opacity={dark ? 0.4 : 0.5} />
      <Vignette amount={dark ? 0.85 : 0.68} />
      <Grain strength={dark ? 0.2 : 0.17} />
    </AbsoluteFill>
  );
};

// Spring organik untuk elemen yang masuk (overshoot ringan). Nilai bisa sedikit >1.
export const useEnter = (delay: number, cfg?: { damping?: number; stiffness?: number; mass?: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 13, stiffness: 115, mass: 0.95, ...cfg } });
};

// Bayangan berlapis (ambient + kontak + jatuh) — kertas yang benar-benar terangkat dari meja.
export const SHADOW = [
  "0 1px 1px rgba(40,24,6,0.18)",
  "0 2px 2px rgba(40,24,6,0.16)",
  "0 4px 4px rgba(40,24,6,0.15)",
  "0 8px 8px rgba(40,24,6,0.14)",
  "0 16px 16px rgba(40,24,6,0.13)",
  "0 32px 40px rgba(40,24,6,0.16)",
].join(", ");
export const SHADOW_GOLD = SHADOW + ", 0 0 0 1px rgba(200,150,43,0.4), 0 0 40px rgba(200,150,43,0.18)";

// Light leak film: bocoran cahaya oranye-magenta menyapu layar saat pergantian scene.
// Taruh di dalam <Sequence durationInFrames={dur}> yang berpusat di titik potong.
export const LightLeak: React.FC<{ dur?: number; dir?: 1 | -1; seed?: number }> = ({ dur = 32, dir = 1, seed = 0 }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, Math.max(0, f / dur));
  const env = Math.sin(Math.PI * t) ** 1.6;
  const x = dir > 0 ? -40 + 180 * t : 140 - 180 * t;
  const y = 30 + 25 * Math.sin(t * 3 + seed);
  const flick = 0.9 + 0.1 * random(`lk${seed}-${f}`);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: env * flick }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 75% at ${x}% ${y}%, rgba(255,170,70,0.95) 0%, rgba(255,90,40,0.55) 35%, rgba(200,40,80,0.18) 60%, rgba(0,0,0,0) 80%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 45% at ${x + 18 * dir}% ${y + 20}%, rgba(255,236,190,0.8) 0%, rgba(255,200,120,0) 70%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(${100 * dir}deg, rgba(0,0,0,0) ${x - 30}%, rgba(255,210,150,0.35) ${x}%, rgba(0,0,0,0) ${x + 30}%)` }} />
    </AbsoluteFill>
  );
};
