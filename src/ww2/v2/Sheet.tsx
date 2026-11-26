import React from "react";
import { AbsoluteFill } from "remotion";
import { Soldier, SKINS, type SkinId } from "./Soldier";
import type { AnimId } from "./gait";
const COLS: { a: AnimId; t: number; k?: number; label: string }[] = [
  { a: "idle", t: 1.1, label: "IDLE" }, { a: "walk", t: 0.1, label: "WALK a" }, { a: "walk", t: 0.55, label: "WALK b" }, { a: "run", t: 0.05, label: "RUN a" }, { a: "run", t: 0.37, label: "RUN b" }, { a: "aim", t: 3, label: "AIM" },
];
export const SheetV2: React.FC<{ skins: SkinId[]; size?: number }> = ({ skins, size = 2.35 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#dccaa2,#bfa77a)" }}>
    <svg width={1920} height={1080}>
      {skins.map((sk, r) => { const H = 1080 / skins.length, gy = H * r + H * 0.84; return (
        <g key={sk}><line x1={0} x2={1920} y1={gy} y2={gy} stroke="#8c7a56" strokeWidth={2} />
          <text x={22} y={H * r + 34} fontFamily="Georgia,serif" fontSize={26} fill="#2a241b" fontWeight={700}>{SKINS[sk].label}</text>
          {COLS.map((c, i) => <g key={i}><Soldier skin={sk} anim={c.a} t={c.t} phase={0} x={120 + i * 310} y={gy} px={size} aimK={1} rim={false} />{r === 0 && <text x={90 + i * 310} y={1060} fontFamily="monospace" fontSize={20} fill="#4a4030">{c.label}</text>}</g>)}
        </g>); })}
    </svg>
  </AbsoluteFill>
);

export const CloseUp: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#e0cfa6,#b79f72)" }}>
    <svg width={1920} height={1080}>
      <line x1={0} x2={1920} y1={1000} y2={1000} stroke="#8c7a56" strokeWidth={2} />
      <Soldier skin="us_radio" anim="idle" t={1.1} x={330} y={1000} px={5.2} />
      <Soldier skin="de_rifleman" anim="walk" t={0.3} x={950} y={1000} px={5.2} />
      <Soldier skin="su_smg" anim="aim" t={3} x={1420} y={1000} px={5.2} aimK={1} />
    </svg>
  </AbsoluteFill>
);

import { Vehicle, VEH_INFO, Puffs, type VKind } from "./Vehicles2";
export const VehSheet: React.FC<{ t?: number }> = ({ t = 1.3 }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#dccaa2,#bfa77a)" }}>
    <svg width={1920} height={1080}>
      {(["sherman", "panzer4", "t34"] as VKind[]).map((k, i) => { const gy = 330 + i * 350; return (
        <g key={k}><line x1={0} x2={1920} y1={gy} y2={gy} stroke="#8c7a56" strokeWidth={2} />
          <text x={24} y={gy - 290} fontFamily="Georgia,serif" fontSize={28} fontWeight={700} fill="#2a241b">{VEH_INFO[k].label}</text>
          <Puffs x={430} y={gy - 90} px={1.3} t={t} n={7} dx={-60} rise={50} flip={false} seed={i} />
          <Vehicle kind={k} t={t} x={700} y={gy} px={1.18} speed={190} moving fireTimes={[0.5]} />
        </g>); })}
    </svg>
  </AbsoluteFill>
);
