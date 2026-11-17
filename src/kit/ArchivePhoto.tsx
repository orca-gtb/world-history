import React from "react";
import { Img, staticFile } from "remotion";
import { F } from "./theme";

// Cetakan foto arsip: bingkai putih, sudut foto (photo corners), tone sepia/B&W, grain.
// Tanpa aset foto -> placeholder potret studio yang rapi (siluet bahu + topi, pencahayaan samping).
const PRINT_GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' seed='3'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.55'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`,
)}")`;

const Placeholder: React.FC = () => (
  <svg viewBox="0 0 160 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bgp" cx="35%" cy="30%" r="85%">
        <stop offset="0%" stopColor="#cdbb98" />
        <stop offset="55%" stopColor="#8d7a5c" />
        <stop offset="100%" stopColor="#3e3426" />
      </radialGradient>
      <linearGradient id="fig" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor="#5a4b38" />
        <stop offset="45%" stopColor="#2e261c" />
        <stop offset="100%" stopColor="#15110c" />
      </linearGradient>
      <linearGradient id="rim" x1="0" x2="1">
        <stop offset="0%" stopColor="#e8dcc0" stopOpacity="0.55" />
        <stop offset="25%" stopColor="#e8dcc0" stopOpacity="0" />
      </linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="1.1" /></filter>
    </defs>
    <rect width="160" height="200" fill="url(#bgp)" />
    <g filter="url(#soft)">
      {/* bahu + jaket */}
      <path d="M8 200 C10 160 38 144 62 140 L98 140 C122 144 150 160 152 200 Z" fill="url(#fig)" />
      {/* kerah */}
      <path d="M62 140 L80 168 L98 140 L92 136 L80 150 L68 136 Z" fill="#1c1711" />
      {/* leher */}
      <path d="M68 118 L92 118 L94 140 L66 140 Z" fill="#4a3d2d" />
      {/* kepala */}
      <ellipse cx="80" cy="96" rx="25" ry="30" fill="url(#fig)" />
      {/* topi lapangan */}
      <path d="M50 78 C54 56 106 56 110 78 L112 84 L48 84 Z" fill="#17120d" />
      <path d="M46 84 C60 92 100 92 114 84 L116 88 C100 96 60 96 44 88 Z" fill="#0f0c08" />
      {/* rim light kiri */}
      <path d="M8 200 C10 160 38 144 62 140 L98 140 C122 144 150 160 152 200 Z" fill="url(#rim)" />
      <ellipse cx="80" cy="96" rx="25" ry="30" fill="url(#rim)" />
    </g>
    {/* light leak + vignette cetakan */}
    <rect width="160" height="200" fill="url(#bgp)" opacity="0.08" />
  </svg>
);

export const ArchivePhoto: React.FC<{ photo?: string; width?: number; caption?: string; tilt?: number }> = ({ photo, width = 190, caption, tilt = -2.2 }) => {
  const h = width * 1.25;
  const corner = (pos: React.CSSProperties, rot: number) => (
    <div style={{ position: "absolute", width: 30, height: 30, ...pos, transform: `rotate(${rot}deg)`, background: "linear-gradient(135deg, #1d1912 0 50%, transparent 50%)", opacity: 0.9, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }} />
  );
  return (
    <div style={{ position: "relative", width: width + 24, padding: "12px 12px 34px", background: "linear-gradient(160deg, #f6f1e4 0%, #e8dfc8 100%)", transform: `rotate(${tilt}deg)`, boxShadow: "0 1px 1px rgba(30,18,4,0.25), 0 3px 4px rgba(30,18,4,0.2), 0 10px 14px rgba(30,18,4,0.22), 0 22px 30px rgba(30,18,4,0.2)", flexShrink: 0 }}>
      <div style={{ position: "relative", width, height: h, overflow: "hidden", background: "#3e3426" }}>
        {photo ? (
          <Img src={staticFile(`photos/${photo}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) sepia(0.45) contrast(1.12) brightness(0.96)" }} />
        ) : (
          <Placeholder />
        )}
        <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, mixBlendMode: "overlay", opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 28px rgba(20,12,2,0.65)" }} />
      </div>
      {caption && <div style={{ position: "absolute", left: 14, bottom: 6, fontFamily: F.type, fontSize: 18, color: "#4a3f2a", letterSpacing: 1 }}>{caption}</div>}
      {corner({ left: -6, top: -6 }, 0)}
      {corner({ right: -6, top: -6 }, 90)}
      {corner({ right: -6, bottom: -6 }, 180)}
      {corner({ left: -6, bottom: -6 }, 270)}
    </div>
  );
};
