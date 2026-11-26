import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { UnitFigure } from "./Unit";
import { UNITS, type Faction } from "./units";
import { ANIMS, type AnimId } from "./anim";
import { VEHICLES } from "./vehicles";

export const DEMO_FPS = 30, DEMO_TOTAL = 19 * 30;
const U = (id: string) => UNITS.find((x) => x.id === id)!;
const V = (id: string) => VEHICLES.find((x) => x.id === id)!;
const loopU = (a: AnimId, t: number, off = 0) => { const d = ANIMS.find((x) => x.id === a)!; const c = d.frames / d.fps; return (((t + off) % c) / c); };
// panggilan radio (detik): teks asli dari radio.json, waktu sama dengan mix audio
export const CALLS = [
  { f: "us" as Faction, t0: 0.5, t1: 5.8, who: "US · SCR-300 (FM)", text: "Able-One to Command, radio check. How do you read me? Over." },
  { f: "germany" as Faction, t0: 6.2, t1: 12.5, who: "DEUTSCH · Torn.Fu (AM)", text: "Gefechtsstand, hier Falke Eins. Funkprobe. Wie hören Sie mich? Kommen." },
  { f: "soviet" as Faction, t0: 12.9, t1: 18.8, who: "РУССКИЙ · 13-Р (AM)", text: "Штаб, я Сокол-один. Проверка связи. Как слышите? Приём." },
];
type Lane = { f: Faction; y: number; dir: 1 | -1; x0: number; label: string; units: string[]; veh: string; col: string };
const LANES: Lane[] = [
  { f: "us", y: 300, dir: 1, x0: 160, label: "UNITED STATES", units: ["us_officer", "us_rifleman", "us_bar", "us_radio"], veh: "m4_sherman", col: "#6f8f5a" },
  { f: "germany", y: 590, dir: -1, x0: 1760, label: "GERMANY", units: ["de_officer", "de_rifleman", "de_mg", "de_radio"], veh: "panzer_iv_h", col: "#8a8d93" },
  { f: "soviet", y: 880, dir: 1, x0: 160, label: "SOVIET UNION", units: ["su_officer", "su_rifleman", "su_dp", "su_radio"], veh: "t34_76", col: "#b0533f" },
];
const T_ADV = 11, T_CROUCH = 12.5, T_FIRE = 16;

const phaseOf = (t: number, i: number): { a: AnimId; u: number } => {
  if (t < T_ADV) return { a: i % 2 ? "walk" : "advance", u: loopU(i % 2 ? "walk" : "advance", t, i * 0.07) };
  if (t < T_CROUCH) return { a: "crouch", u: loopU("crouch", t) };
  if (t < T_FIRE) { return i === 2 ? { a: "fire", u: loopU("fire", t) } : { a: "aim", u: loopU("aim", t) }; }
  if (i === 1) return t < 17 ? { a: "hit", u: (t - T_FIRE) / 1.0 } : { a: "fall", u: Math.min(1, (t - 17) / 0.8) };
  return i === 3 ? { a: "aim", u: loopU("aim", t) } : { a: "idle", u: loopU("idle", t) };
};

export const Demo: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / DEMO_FPS;
  const sp = 118, move = Math.min(t, T_ADV) * sp;
  const call = CALLS.find((c) => t >= c.t0 && t <= c.t1);
  return (
    <AbsoluteFill style={{ background: "#d8c8a0" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9dcc0" /><stop offset="1" stopColor="#cdb98f" /></linearGradient></defs>
        <rect width={1920} height={1080} fill="url(#sky)" />
        {LANES.map((L, li) => (
          <g key={L.f}>
            <rect x={0} y={L.y + 10} width={1920} height={100} fill={li % 2 ? "#b9a477" : "#c2ae82"} />
            <rect x={0} y={L.y + 10} width={1920} height={4} fill="#8c7a56" />
            {/* garis medan pelan-pelan bergeser (parallax) */}
            {Array.from({ length: 14 }).map((_, k) => <rect key={k} x={((k * 160 - move * 0.6 * L.dir) % 2240 + 2240) % 2240 - 160} y={L.y + 80} width={60} height={3} fill="#a08d62" opacity={0.5} />)}
            <rect x={36} y={L.y - 200} width={8} height={44} fill={L.col} />
            <text x={60} y={L.y - 166} fontFamily="Georgia, serif" fontSize={34} fontWeight={700} fill="#2a241b" letterSpacing={4}>{L.label}</text>
            {call && call.f === L.f && <circle cx={470} cy={L.y - 180} r={9 + 3 * Math.sin(fr * 0.5)} fill="#c0392b" />}
            {/* kendaraan mengikuti di belakang */}
            <g transform={`translate(${L.x0 - L.dir * 360 + L.dir * move * 0.85},${L.y + 38}) scale(${L.dir * 0.72},0.72)`}>{V(L.veh).draw("#1d1a15")}</g>
            {L.units.map((id, i) => {
              const ph = phaseOf(t, i);
              const x = L.x0 + L.dir * (move + i * 105 - 100) + (t > T_ADV ? 0 : 0);
              return <UnitFigure key={id} spec={U(id)} anim={ph.a} u={ph.u} x={x} y={L.y + 50} s={0.78} flip={L.dir === -1} />;
            })}
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center" }}>
        {call && (
          <div style={{ background: "rgba(20,17,14,.88)", color: "#f1e7cf", padding: "14px 28px", borderRadius: 6, maxWidth: 1500, fontFamily: "Georgia, serif", opacity: interpolate(t, [call.t0, call.t0 + 0.25, call.t1 - 0.25, call.t1], [0, 1, 1, 0]) }}>
            <div style={{ fontSize: 20, letterSpacing: 3, color: "#c9a85b", marginBottom: 4 }}>📻 {call.who}</div>
            <div style={{ fontSize: 34 }}>{call.text}</div>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", right: 24, top: 16, fontFamily: "monospace", fontSize: 20, color: "#4a4030" }}>WW2 Silhouette Pack · demo · {t.toFixed(1)}s</div>
    </AbsoluteFill>
  );
};
