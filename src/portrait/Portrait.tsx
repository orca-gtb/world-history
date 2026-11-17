import React from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";
import { F } from "../kit/theme";

// ============================================================================
// Dua cara menampilkan TOKOH di video World History:
//  1) <IllustratedFigure/>  — ilustrasi vektor beranimasi (napas, kedip, goyang kepala). BUKAN kemiripan wajah.
//  2) <PhotoPortrait/>      — foto asli (domain publik/berlisensi) diberi perlakuan 2D: duotone + halftone + Ken Burns.
// Tanpa simbol/insignia apa pun. Selalu beri label "ILLUSTRATION" pada ilustrasi.
// ============================================================================

const INK = "#2a2418";
const svgUrl = (s: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
const HALFTONE = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='9' height='9'><circle cx='4.5' cy='4.5' r='1.5' fill='black'/></svg>`);
const GRAIN = svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='5'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.6'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`);

export type FigureLook = {
  skin?: string;
  hair?: string;
  uniform?: string;
  collar?: string;
  hairStyle?: "short" | "parted" | "slick" | "bald";
  cap?: boolean;
  brows?: number; // ketebalan alis 1..3
};

// idle: napas ~3 dtk, goyang kepala ~5 dtk, kedip tiap ~3 dtk (6 frame), mata melirik pelan
const idle = (f: number, seed: number) => {
  const breath = Math.sin((f + seed * 17) / 28);
  const sway = Math.sin((f + seed * 31) / 62);
  const bp = (f + seed * 23) % 96;
  const blink = bp < 6 ? Math.sin((bp / 6) * Math.PI) : 0;
  const look = Math.sin((f + seed * 11) / 53);
  return { breath, sway, blink, look, nod: Math.sin((f + seed * 7) / 85) };
};

export const IllustratedFigure: React.FC<{ look?: FigureLook; width?: number; seed?: number; label?: string; tone?: "sepia" | "color" }> = ({ look = {}, width = 520, seed = 1, label = "ILLUSTRATION", tone = "sepia" }) => {
  const f = useCurrentFrame();
  const L = { skin: "#d6b494", hair: "#3a281c", uniform: "#56606a", collar: "#2e353c", hairStyle: "short" as const, cap: false, brows: 2, ...look };
  const { breath, sway, blink, look: lk, nod } = idle(f, seed);
  const lid = blink; // 0 terbuka .. 1 tertutup
  const eyeY = 218, eyeDX = 44;
  return (
    <div style={{ position: "relative", width, height: width * 1.25, background: "radial-gradient(ellipse at 38% 30%, #efe5c9 0%, #d7c7a1 70%, #bfae86 100%)", overflow: "hidden", filter: tone === "sepia" ? "sepia(0.55) contrast(1.06) saturate(0.85)" : undefined }}>
      <svg viewBox="0 0 400 500" width="100%" height="100%">
        <defs>
          <linearGradient id={`sh${seed}`} x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </linearGradient>
          <pattern id={`dots${seed}`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <circle cx="4.5" cy="4.5" r="1.7" fill={INK} opacity="0.5" />
          </pattern>
          <clipPath id={`head${seed}`}><path d="M142 196 C142 128 176 98 200 98 C224 98 258 128 258 196 C258 252 232 296 200 298 C168 296 142 252 142 196 Z" /></clipPath>
        </defs>

        {/* bahu & seragam (naik-turun saat napas) */}
        <g transform={`translate(0 ${breath * 3.5})`}>
          <path d="M20 500 C26 410 84 360 150 346 L250 346 C316 360 374 410 380 500 Z" fill={L.uniform} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M20 500 C26 410 84 360 150 346 L250 346 C316 360 374 410 380 500 Z" fill={`url(#sh${seed})`} />
          {/* kerah */}
          <path d="M150 346 L200 410 L250 346 L236 338 L200 376 L164 338 Z" fill={L.collar} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M186 410 L200 470 L214 410 L200 396 Z" fill="#d9d2c0" stroke={INK} strokeWidth="3" />
          {/* kancing & saku — tanpa insignia */}
          <circle cx="104" cy="440" r="5" fill={INK} opacity="0.7" />
          <circle cx="296" cy="440" r="5" fill={INK} opacity="0.7" />
        </g>

        {/* kepala bergoyang dengan pivot di leher */}
        <g transform={`translate(0 ${breath * 2.2}) rotate(${sway * 1.6 + nod * 0.4} 200 330)`}>
          {/* leher */}
          <path d="M170 288 L170 346 C186 366 214 366 230 346 L230 288 Z" fill={L.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M170 300 C186 322 214 322 230 300 L230 288 L170 288 Z" fill="#000" opacity="0.18" />
          {/* telinga */}
          <ellipse cx="141" cy="214" rx="13" ry="22" fill={L.skin} stroke={INK} strokeWidth="4.5" />
          <ellipse cx="259" cy="214" rx="13" ry="22" fill={L.skin} stroke={INK} strokeWidth="4.5" />
          {/* wajah */}
          <path d="M142 196 C142 128 176 98 200 98 C224 98 258 128 258 196 C258 252 232 296 200 298 C168 296 142 252 142 196 Z" fill={L.skin} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <g clipPath={`url(#head${seed})`}>
            <rect x="140" y="90" width="120" height="212" fill={`url(#sh${seed})`} />
            <rect x="196" y="90" width="64" height="212" fill={`url(#dots${seed})`} opacity="0.55" />
            <ellipse cx="200" cy="300" rx="70" ry="22" fill="#000" opacity="0.15" />
          </g>

          {/* alis */}
          <path d={`M${200 - eyeDX - 24} ${eyeY - 26 - lk * 0.6} Q${200 - eyeDX} ${eyeY - 36} ${200 - eyeDX + 22} ${eyeY - 24}`} stroke={L.hair} strokeWidth={4 + L.brows * 2} strokeLinecap="round" fill="none" />
          <path d={`M${200 + eyeDX - 22} ${eyeY - 24} Q${200 + eyeDX} ${eyeY - 36} ${200 + eyeDX + 24} ${eyeY - 26 - lk * 0.6}`} stroke={L.hair} strokeWidth={4 + L.brows * 2} strokeLinecap="round" fill="none" />
          {/* mata */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <ellipse cx={200 + s * eyeDX} cy={eyeY} rx="19" ry={11 * (1 - lid) + 1} fill="#f4efe4" stroke={INK} strokeWidth="3.5" />
              {lid < 0.8 && <circle cx={200 + s * eyeDX + lk * 3.2} cy={eyeY + 1} r={7.5 * (1 - lid * 0.5)} fill="#2a2018" />}
              {lid >= 0.3 && <path d={`M${200 + s * eyeDX - 19} ${eyeY} Q${200 + s * eyeDX} ${eyeY + 4} ${200 + s * eyeDX + 19} ${eyeY}`} stroke={INK} strokeWidth="4" fill="none" />}
              {/* kelopak atas */}
              <path d={`M${200 + s * eyeDX - 21} ${eyeY - 2} Q${200 + s * eyeDX} ${eyeY - 16 + lid * 14} ${200 + s * eyeDX + 21} ${eyeY - 2}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* hidung & mulut */}
          <path d="M200 226 C196 246 192 258 192 264 C196 270 204 270 208 264" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={`M176 280 Q200 ${284 + breath * 0.6} 224 280`} stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M186 292 Q200 296 214 292" stroke={INK} strokeWidth="2.5" fill="none" opacity="0.45" strokeLinecap="round" />

          {/* rambut / topi */}
          {L.hairStyle !== "bald" && !L.cap && (
            <path
              d={L.hairStyle === "slick"
                ? "M140 196 C132 128 160 94 200 92 C242 94 270 128 260 196 C258 160 244 140 206 134 C170 136 146 160 140 196 Z"
                : L.hairStyle === "parted"
                ? "M140 194 C134 126 162 94 202 92 C244 94 268 126 260 194 C256 166 246 146 224 136 C208 146 170 142 152 160 Z"
                : "M141 192 C136 126 164 96 200 94 C238 96 264 126 259 192 C255 164 240 142 200 138 C162 142 146 164 141 192 Z"}
              fill={L.hair}
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          )}
          {L.cap && (
            <g>
              <path d="M136 164 C138 98 176 70 202 70 C232 70 266 100 266 164 C240 154 160 154 136 164 Z" fill={L.uniform} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d="M134 166 C168 176 236 176 268 166 L270 180 C238 192 164 192 132 180 Z" fill={L.collar} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
            </g>
          )}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, mixBlendMode: "overlay", opacity: 0.7 }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 70px rgba(30,18,4,0.55)" }} />
      <div style={{ position: "absolute", left: 14, bottom: 10, fontFamily: F.type, fontSize: 20, letterSpacing: 3, color: "#3a2e1a", opacity: 0.8 }}>{label}</div>
    </div>
  );
};

// Perlakuan foto 2D: duotone sepia, halftone tipis, Ken Burns pelan (zoom + geser), vignette, grain.
// `src` = nama file di public/photos/. Tanpa src -> tampilkan `fallback` (placeholder) dengan perlakuan yang sama.
export const PhotoPortrait: React.FC<{ src?: string; fallback?: React.ReactNode; width?: number; seed?: number; credit?: string; duration?: number; focus?: [number, number]; start?: number }> = ({ src, fallback, width = 520, seed = 1, credit, duration = 150, focus = [50, 35], start = 0 }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, Math.max(0, (f - start) / duration));
  const e = 1 - Math.pow(1 - t, 3);
  const scale = 1.04 + 0.12 * e;
  const dx = (seed % 2 ? -1 : 1) * 14 * e;
  const dy = -10 * e;
  const flick = 0.96 + 0.08 * random(`pf${f}`);
  return (
    <div style={{ position: "relative", width, height: width * 1.25, overflow: "hidden", background: "#2a2418", boxShadow: "0 1px 1px rgba(30,18,4,0.25), 0 4px 6px rgba(30,18,4,0.22), 0 14px 22px rgba(30,18,4,0.22), 0 30px 44px rgba(30,18,4,0.2)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${scale})`, transformOrigin: `${focus[0]}% ${focus[1]}%`, filter: "grayscale(1) sepia(0.5) contrast(1.15) brightness(0.97)", opacity: flick }}>
        {src ? <Img src={staticFile(`photos/${src}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : fallback}
      </div>
      {/* halftone tipis seperti cetakan koran */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: HALFTONE, backgroundSize: "9px 9px", mixBlendMode: "multiply", opacity: 0.22 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, mixBlendMode: "overlay", opacity: 0.8 }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 80px rgba(20,12,2,0.7)" }} />
      {credit && <div style={{ position: "absolute", left: 12, bottom: 8, fontFamily: F.type, fontSize: 17, letterSpacing: 1, color: "#e8dfc8", opacity: 0.85, textShadow: "0 1px 2px #000" }}>{credit}</div>}
    </div>
  );
};
