import React from "react";
import { clamp01, easeOut, C, F } from "./theme";

// Stempel dokumen: menghantam kertas (skala besar → 1 + getar), tinta memudar tak rata.
export const Stamp: React.FC<{ lines: string[]; progress: number; rotate?: number; color?: string; size?: number }> = ({ lines, progress, rotate = -4, color = C.axis, size = 40 }) => {
  const p = clamp01(progress);
  if (p <= 0) return null;
  const hit = easeOut(clamp01(p / 0.18));
  const scale = 1 + (1 - hit) * 1.6;
  const shake = p > 0.18 && p < 0.3 ? Math.sin(p * 220) * (0.3 - p) * 40 : 0;
  return (
    <div style={{ display: "inline-block", transform: `rotate(${rotate}deg) scale(${scale}) translateX(${shake}px)`, opacity: hit, border: `6px double ${color}`, padding: "14px 26px", color, fontFamily: F.type, fontSize: size, letterSpacing: 3, lineHeight: 1.15, textAlign: "center", mixBlendMode: "multiply", filter: "contrast(1.1)" }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
};
