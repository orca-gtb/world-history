import React from "react";
import type { Side, UnitKind } from "../episodes/schema";
import { C, F } from "./theme";

// Counter unit bergaya peta (APP-6 disederhanakan). Simbol: inf (X), glider, tug (pesawat), engineer, armour, hq (bendera).
const GLYPH: Record<UnitKind, React.ReactNode> = {
  inf: (
    <g stroke="currentColor" strokeWidth={4}>
      <line x1={-26} y1={-16} x2={26} y2={16} />
      <line x1={-26} y1={16} x2={26} y2={-16} />
    </g>
  ),
  engineer: (
    <g stroke="currentColor" strokeWidth={4} fill="none">
      <path d="M-22 14 V-4 M-22 -4 H22 M22 -4 V14 M-8 -4 V14 M8 -4 V14" />
    </g>
  ),
  armour: (
    <g stroke="currentColor" strokeWidth={4} fill="none">
      <ellipse cx={0} cy={0} rx={24} ry={13} />
    </g>
  ),
  hq: (
    <g stroke="currentColor" strokeWidth={4} fill="none">
      <path d="M-14 18 V-18 M-14 -18 H20 L10 -8 L20 2 H-14" />
    </g>
  ),
  glider: (
    <g fill="currentColor">
      <path d="M-30 -2 L30 -2 L30 3 L-30 3 Z" />
      <path d="M-4 -14 L4 -14 L8 -2 L-8 -2 Z" />
      <path d="M-18 12 L18 12 L14 5 L-14 5 Z" opacity={0.85} />
    </g>
  ),
  tug: (
    <g fill="currentColor">
      <path d="M0 -20 L5 -5 L26 4 L26 9 L5 4 L3 16 L12 21 L12 24 L0 21 L-12 24 L-12 21 L-3 16 L-5 4 L-26 9 L-26 4 L-5 -5 Z" />
    </g>
  ),
  air: (
    <g fill="currentColor">
      <path d="M-24 8 C-14 -10 14 -10 24 8 L12 8 C8 0 -8 0 -12 8 Z" />
    </g>
  ),
};

export const Counter: React.FC<{ kind: UnitKind; side: Side; label?: string; size?: number; opacity?: number; flag?: boolean }> = ({ kind, side, label, size = 1, opacity = 1, flag }) => {
  const col = side === "ALLIED" ? C.allied : C.axis;
  const fill = side === "ALLIED" ? C.alliedFill : C.axisFill;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", opacity, transform: `scale(${size})`, transformOrigin: "50% 50%" }}>
      <svg width={92} height={64} viewBox="-46 -32 92 64" style={{ color: C.ink, filter: "drop-shadow(0 3px 2px rgba(40,24,6,0.35))" }}>
        <rect x={-42} y={-28} width={84} height={56} rx={3} fill={fill} stroke={col} strokeWidth={5} />
        {GLYPH[kind]}
      </svg>
      {label && (
        <div style={{ marginTop: 4, fontFamily: F.ui, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: C.ink, textShadow: "0 0 6px rgba(216,199,161,0.9)", whiteSpace: "nowrap" }}>{label}</div>
      )}
      {flag && <div style={{ position: "absolute", top: -14, right: -6, width: 20, height: 14, background: col }} />}
    </div>
  );
};
