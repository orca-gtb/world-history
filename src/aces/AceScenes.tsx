import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { Cine, SHADOW, SHADOW_GOLD, useEnter } from "../kit/Cine";
import { C, F, clamp01, countEase } from "../kit/theme";
import { Paper } from "../kit/Paper";
import { Stamp } from "../kit/Stamp";
import { MODE, show } from "../episodes/schema";
import type { Person } from "../episodes/schema";
import { Dossier } from "../kit/Dossier";
import { ACES, DOT, HARTMANN_FACTS } from "./data";
import { Silhouette } from "./Silhouettes";
export { AceBlueprint } from "./Blueprint";

export const AC = { HOOK: 100, BOARD: 330, SPOT: 330, MODEL: 360, OUT: 150 };
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const Dot: React.FC<{ s: keyof typeof DOT }> = ({ s }) => (MODE === "preview" ? <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 8, background: DOT[s], marginRight: 10, flexShrink: 0 }} /> : null);

const SPR = { damping: 13, stiffness: 115, mass: 0.95 };

// ----------------------------------------------------------------- 1. HOOK
export const AceHook: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.round(352 * countEase(seg(f, 6, 62)));
  const pop = useEnter(4, { damping: 11, stiffness: 90 });
  const sub = useEnter(55);
  return (
    <Cine dark zoom={[1.03, 1.1]} seed={1}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #1d2b3a 0%, #0a0f14 70%)" }} />
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 480, letterSpacing: 6, color: "#fff", lineHeight: 1, textShadow: "0 2px 0 rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.6), 0 30px 90px rgba(0,0,0,0.8)", opacity: clamp01(pop), transform: `scale(${0.86 + 0.14 * pop})` }}>{n}</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 70, letterSpacing: 10, color: "#ff7a63", opacity: clamp01(sub), transform: `translateY(${(1 - sub) * 40}px)` }}>CREDITED VICTORIES</div>
        <div style={{ fontFamily: F.type, fontSize: 38, letterSpacing: 5, color: C.gold, marginTop: 24, opacity: seg(f, 72, 92) }}>ONE PILOT · 1939–1945</div>
      </div>
    </Cine>
  );
};

// ----------------------------------------------------------------- 2. PAPAN PERINGKAT
export const AceBoard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = useEnter(0);
  const exit = seg(f, 300, 330);
  return (
    <Cine seed={2}>
      <Paper />
      <div style={{ position: "absolute", top: 90, left: 50, right: 50, opacity: clamp01(header), transform: `translateY(${(1 - header) * 30}px)` }}>
        <div style={{ fontFamily: F.type, fontSize: 34, color: C.axis, letterSpacing: 4 }}>1939 – 1945</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 90, letterSpacing: 5, color: C.ink, lineHeight: 1.02 }}>DEADLIEST FIGHTER ACES</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: "#5a4a2c" }}>Credited aerial victories</div>
      </div>
      <div style={{ position: "absolute", top: 380, left: 40, right: 40 }}>
        {ACES.map((a, i) => {
          const p = spring({ frame: f - (28 + i * 24), fps, config: SPR });
          const cnt = countEase(seg(f, 40 + i * 24, 100 + i * 24));
          const n = Math.round(a.kills * cnt);
          const barW = (a.kills / 352) * 430 * countEase(seg(f, 36 + i * 24, 104 + i * 24));
          const top = i === 0;
          const fade = top ? 1 : 1 - exit;
          const lift = top ? exit * 1 : 0; // nomor 1 terangkat saat lainnya memudar
          return (
            <div key={a.id} style={{ position: "relative", height: 232, marginBottom: 16, opacity: clamp01(p) * fade, transform: `translateX(${(1 - p) * 140}px) rotate(${(1 - p) * 2.5 + (i % 2 ? 0.25 : -0.3)}deg) scale(${1 + lift * 0.03})`, display: "flex", alignItems: "center", gap: 18, padding: "0 26px", background: top ? "linear-gradient(170deg, rgba(242,224,165,0.98), rgba(226,203,140,0.98))" : "linear-gradient(170deg, rgba(247,240,222,0.95), rgba(234,223,196,0.95))", border: top ? `4px solid ${C.gold}` : "2px solid rgba(42,36,24,0.5)", boxShadow: top ? SHADOW_GOLD : SHADOW }}>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 100, color: top ? C.gold : C.ink, width: 80, textShadow: top ? "0 1px 0 rgba(90,60,10,0.5)" : undefined }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center" }}><Dot s={a.status} /><div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 52, color: C.ink, lineHeight: 1.02 }}>{a.name}</div></div>
                <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 30, color: "#5a4a2c", marginTop: 4 }}>{a.aircraft}</div>
                <div style={{ position: "relative", width: 430, height: 14, marginTop: 10, background: "rgba(42,36,24,0.12)", boxShadow: "inset 0 1px 2px rgba(40,24,6,0.25)" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: barW, background: top ? `linear-gradient(90deg, ${C.gold}, #e2b552)` : `linear-gradient(90deg, ${C.axis}, #c4544a)`, boxShadow: "0 1px 2px rgba(40,24,6,0.35)" }} />
                </div>
                {a.note && show(a.noteStatus ?? "unverified") && <div style={{ display: "flex", alignItems: "center", fontFamily: F.type, fontSize: 24, color: C.axis, marginTop: 6 }}><Dot s={a.noteStatus ?? "unverified"} />{a.note}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Silhouette icon={a.icon} width={200} />
                <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 96, color: C.ink, lineHeight: 0.95 }}>{n}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Cine>
  );
};

// ----------------------------------------------------------------- 3. SOROTAN HARTMANN
const HARTMANN: Person = {
  id: "hartmann", name: "Erich Hartmann", rank: "Luftwaffe fighter pilot", role: "Highest-scoring fighter ace in history", unit: "JG 52 · Eastern Front", side: "AXIS",
  status: "corroborated", sources: [],
};
export const AceSpot: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = useEnter(10, { damping: 12, stiffness: 95, mass: 1.1 });
  const rows = HARTMANN_FACTS.filter((r) => show(r.status));
  return (
    <Cine seed={4}>
      <Paper />
      <div style={{ position: "absolute", top: 100, left: 50, right: 50, fontFamily: F.type, fontSize: 38, color: C.axis, letterSpacing: 5, opacity: seg(f, 0, 20) }}>NUMBER ONE</div>
      <div style={{ position: "absolute", top: 190, left: 90 }}>
        <Dossier person={HARTMANN} progress={card} />
      </div>
      <div style={{ position: "absolute", top: 600, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 22 }}>
        {rows.map((r, i) => {
          const p = spring({ frame: f - (62 + i * 30), fps, config: SPR });
          const big = i === 0;
          return (
            <div key={r.label} style={{ opacity: clamp01(p), transform: `translateX(${(1 - p) * 110}px) rotate(${(1 - p) * 2 + (i % 2 ? 0.35 : -0.25)}deg)`, padding: "18px 28px", background: "linear-gradient(170deg, rgba(247,240,222,0.97), rgba(234,223,196,0.97))", border: "2px solid rgba(42,36,24,0.5)", borderLeft: `10px solid ${big ? C.axis : C.ink}`, boxShadow: SHADOW }}>
              <div style={{ display: "flex", alignItems: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "#6a5a38" }}><Dot s={r.status} />{r.label}</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: big ? 150 : 64, color: C.ink, lineHeight: 1.0, marginLeft: MODE === "preview" ? 26 : 0 }}>{r.value}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 230 }}>
        <Stamp lines={["CREDITED,", "NOT PROVEN"]} progress={seg(f, 250, 285)} rotate={-6} size={50} />
      </div>
    </Cine>
  );
};

// ----------------------------------------------------------------- 5. PENUTUP
export const AceOutro: React.FC = () => {
  const f = useCurrentFrame();
  const head = useEnter(10, { damping: 14, stiffness: 80 });
  return (
    <Cine seed={5} zoom={[1.03, 1.08]}>
      <Paper />
      <div style={{ position: "absolute", top: 380, left: 60, right: 60 }}>
        <div style={{ fontFamily: F.type, fontSize: 36, color: C.axis, letterSpacing: 5, opacity: seg(f, 0, 20) }}>THE CATCH</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, color: C.ink, lineHeight: 1.04, letterSpacing: 2, opacity: clamp01(head), transform: `translateY(${(1 - head) * 40}px)`, textShadow: "0 1px 0 rgba(255,250,235,0.5), 0 3px 6px rgba(40,24,6,0.18)" }}>CREDITED IS NOT THE SAME AS CONFIRMED.</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 48, color: "#4a3d22", lineHeight: 1.15, marginTop: 36, opacity: seg(f, 50, 80) }}>Some historians question how many of the 352 claims can be matched to real losses on the other side.</div>
      </div>
    </Cine>
  );
};
