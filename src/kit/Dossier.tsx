import React from "react";
import type { Person } from "../episodes/schema";
import { C, F, clamp01 } from "./theme";
import { ArchivePhoto } from "./ArchivePhoto";
import { SHADOW } from "./Cine";

// Kartu dossier komandan. `progress` boleh nilai spring (bisa >1 sedikit -> overshoot organik).
// Foto dari public/photos bila ada, kalau tidak: placeholder cetakan arsip.
export const Dossier: React.FC<{ person: Person; progress: number; width?: number }> = ({ person, progress, width = 900 }) => {
  const o = clamp01(progress);
  const col = person.side === "ALLIED" ? C.allied : C.axis;
  const inv = 1 - progress;
  return (
    <div style={{ width, display: "flex", gap: 30, padding: "26px 26px 26px 30px", background: "linear-gradient(170deg, rgba(247,240,222,0.97) 0%, rgba(236,225,198,0.97) 100%)", border: `2px solid rgba(42,36,24,0.55)`, boxShadow: SHADOW, opacity: o, transform: `translateY(${inv * 90}px) scale(${0.94 + 0.06 * progress}) rotate(${inv * -3 - 0.6}deg)`, transformOrigin: "30% 80%", position: "relative" }}>
      {/* pita selotip tua */}
      <div style={{ position: "absolute", top: -16, left: width / 2 - 70, width: 140, height: 34, background: "rgba(226,214,178,0.75)", transform: "rotate(-3deg)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
      <ArchivePhoto photo={person.photo} width={172} caption={person.photo ? undefined : person.name.split(" ").pop()?.toUpperCase()} />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 6 }}>
        <div style={{ fontFamily: F.type, fontSize: 24, color: col, letterSpacing: 2 }}>{person.rank.toUpperCase()}</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 56, color: C.ink, lineHeight: 1.0, marginTop: 4 }}>{person.name}</div>
        <div style={{ height: 3, width: 120, background: col, margin: "14px 0 12px" }} />
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 31, color: "#4a3f2a", lineHeight: 1.12 }}>{person.role}</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 26, color: "#6a5c3e", marginTop: 8, letterSpacing: 0.5 }}>{person.unit}</div>
      </div>
    </div>
  );
};
