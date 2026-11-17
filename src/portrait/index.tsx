import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { C, F } from "../kit/theme";
import { Paper } from "../kit/Paper";
import { IllustratedFigure, PhotoPortrait } from "./Portrait";

// Demo: kiri-atas = ilustrasi beranimasi, bawah = perlakuan foto 2D (placeholder sampai foto asli ada di public/photos/).
const Placeholder: React.FC = () => (
  <svg viewBox="0 0 160 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="pg" cx="35%" cy="30%" r="85%"><stop offset="0" stopColor="#cdbb98" /><stop offset="0.55" stopColor="#8d7a5c" /><stop offset="1" stopColor="#3e3426" /></radialGradient>
    </defs>
    <rect width="160" height="200" fill="url(#pg)" />
    <path d="M8 200 C10 160 38 144 62 140 L98 140 C122 144 150 160 152 200 Z" fill="#2e261c" />
    <ellipse cx="80" cy="96" rx="25" ry="30" fill="#3a3024" />
    <path d="M50 78 C54 56 106 56 110 78 L112 84 L48 84 Z" fill="#17120d" />
  </svg>
);

const Demo: React.FC = () => (
  <AbsoluteFill>
    <Paper />
    <div style={{ position: "absolute", top: 80, left: 70, fontFamily: F.type, fontSize: 34, letterSpacing: 5, color: C.axis }}>MODE 1 · ILUSTRASI ANIMASI</div>
    <div style={{ position: "absolute", top: 140, left: 70 }}>
      <IllustratedFigure width={470} seed={1} look={{ hairStyle: "short", hair: "#3b2a1e", uniform: "#56606a", collar: "#2e353c", brows: 2 }} />
    </div>
    <div style={{ position: "absolute", top: 140, left: 580 }}>
      <IllustratedFigure width={430} seed={3} tone="color" look={{ hairStyle: "slick", hair: "#1e1612", uniform: "#6a5a44", collar: "#3a3020", brows: 3 }} />
    </div>
    <div style={{ position: "absolute", top: 1010, left: 70, fontFamily: F.type, fontSize: 34, letterSpacing: 5, color: C.axis }}>MODE 2 · FOTO ASLI → 2D</div>
    <div style={{ position: "absolute", top: 1070, left: 70 }}>
      <PhotoPortrait width={470} seed={1} credit="[ganti dengan foto asli · sumber]" fallback={<Placeholder />} />
    </div>
    <div style={{ position: "absolute", top: 1090, left: 580, width: 430, fontFamily: F.ui, fontWeight: 600, fontSize: 38, color: "#3a2e1a", lineHeight: 1.18 }}>
      Foto asli (public/photos/) otomatis dapat duotone, halftone, grain, dan Ken Burns pelan.
    </div>
  </AbsoluteFill>
);

registerRoot(() => <Composition id="PortraitDemo" component={Demo} durationInFrames={150} fps={30} width={1080} height={1920} />);
