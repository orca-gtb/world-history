import React from "react";
import { C, F } from "./theme";

// Peta SKEMATIS (bukan skala, bukan survei): pantai, kanal, sungai, jembatan, kota.
// Koordinat lokal 0..1000; ditempatkan di layar oleh <MapFrame>.
// Peta layar penuh: koordinat lokal (0..1000) -> layar 1080x1920 lewat VIEW (pusat + skala).
export const VIEW = { cx: 520, cy: 560, s: 1.55 };
export const toScreen = (x: number, y: number): [number, number] => [(x - VIEW.cx) * VIEW.s + 540, (y - VIEW.cy) * VIEW.s + 960];

const WATER = "#6f8fa6";
export const MapBase: React.FC<{ labels?: boolean; labelOpacity?: number }> = ({ labels = true, labelOpacity = 1 }) => {
  const coast = "M -40 190 C 120 170 260 215 420 190 C 520 170 600 150 760 205 C 860 235 960 210 1040 200";
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(540 960) scale(${VIEW.s}) translate(${-VIEW.cx} ${-VIEW.cy})`}>
        {/* laut */}
        <path d={`${coast} L 1040 -300 L -40 -300 Z`} fill={WATER} opacity={0.38} />
        {Array.from({ length: 16 }).map((_, i) => (
          <path key={i} d={`M -40 ${-150 + i * 20} q 30 -9 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`} fill="none" stroke={WATER} strokeWidth={2} opacity={0.5} />
        ))}
        <path d={coast} fill="none" stroke={C.ink} strokeWidth={5} />
        {/* arsiran daratan */}
        {Array.from({ length: 48 }).map((_, i) => (
          <line key={i} x1={-40} y1={240 + i * 22} x2={1040} y2={226 + i * 22} stroke={C.ink} strokeWidth={1} opacity={0.08} />
        ))}
        {/* sungai Orne & kanal Caen (garis ganda) */}
        <path d="M 600 205 C 590 330 560 420 572 520 C 580 620 540 760 500 900 L 480 1300" fill="none" stroke={WATER} strokeWidth={26} opacity={0.75} strokeLinecap="round" />
        <path d="M 600 205 C 590 330 560 420 572 520 C 580 620 540 760 500 900 L 480 1300" fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="2 14" />
        <path d="M 520 205 C 505 330 470 420 470 520 C 470 620 460 760 456 900 L 446 1300" fill="none" stroke={WATER} strokeWidth={22} opacity={0.75} strokeLinecap="round" />
        <path d="M 520 205 C 505 330 470 420 470 520 C 470 620 460 760 456 900 L 446 1300" fill="none" stroke={C.ink} strokeWidth={2} strokeDasharray="2 14" />
        {/* jembatan */}
        {[[470, 530], [570, 500]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 38} y={y - 6} width={76} height={12} fill={C.ink} />
            <rect x={x - 38} y={y - 6} width={76} height={12} fill="none" stroke={C.paper} strokeWidth={1} opacity={0.5} />
          </g>
        ))}
        {/* kota */}
        {[[380, 520, "B"], [690, 470, "R"], [690, 210, "O"], [480, 880, "C"]].map(([x, y], i) => (
          <g key={i}>
            <rect x={(x as number) - 16} y={(y as number) - 12} width={32} height={24} fill={C.ink} opacity={0.65} />
            <rect x={(x as number) + 4} y={(y as number) + 6} width={18} height={14} fill={C.ink} opacity={0.5} />
          </g>
        ))}
        {labels && (
          <g fontFamily={F.type} fill={C.ink} opacity={labelOpacity}>
            <text x={500} y={90} textAnchor="middle" fontSize={30} letterSpacing={10} fontStyle="italic" opacity={0.75}>ENGLISH CHANNEL</text>
            <text x={676} y={190} fontSize={26} textAnchor="end">Ouistreham</text>
            <text x={720} y={436} fontSize={28}>Ranville</text>
            <text x={236} y={514} fontSize={28}>Bénouville</text>
            <text x={520} y={900} fontSize={28}>Caen</text>
            <text x={606} y={760} fontSize={22} fontStyle="italic" opacity={0.8}>R. Orne</text>
            <text x={352} y={760} fontSize={22} fontStyle="italic" opacity={0.8}>Caen Canal</text>
          </g>
        )}
        </g>
      <text x={50} y={1876} fontFamily={F.ui} fontWeight={600} fontSize={24} fill={C.ink} opacity={0.65} letterSpacing={2}>SCHEMATIC MAP · NOT TO SCALE</text>
    </svg>
  );
};
