import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pegasus as EP } from "./episodes/pegasus";
export { ALIVE, BRIEF, HOOK, OOB_A, OOB_X } from "./timing";
import { MODE, show } from "./episodes/schema";
import { C, F, H, W, clamp01, ease, easeOut } from "./kit/theme";
import { Paper } from "./kit/Paper";
import { ChalkArrow, ChalkCircle, ChalkDefs } from "./kit/Chalk";
import { Stamp } from "./kit/Stamp";
import { Counter } from "./kit/Counter";
import { Dossier } from "./kit/Dossier";
import { MapBase, toScreen } from "./kit/MapBase";

const place = (id: string) => EP.places.find((p) => p.id === id)!;
const person = (id: string) => EP.people.find((p) => p.id === id)!;
const unit = (id: string) => EP.units.find((u) => u.id === id)!;
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

const Caption: React.FC<{ tag: string; text: string; op: number }> = ({ tag, text, op }) => (
  <div style={{ position: "absolute", left: 50, right: 50, bottom: 150, opacity: op, transform: `translateY(${(1 - op) * 24}px)`, padding: "22px 28px", background: "rgba(14,10,4,0.82)", borderLeft: `8px solid ${C.gold}` }}>
    <div style={{ fontFamily: F.type, fontSize: 30, color: C.gold, letterSpacing: 3 }}>{tag}</div>
    <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 44, color: "#f4efe4", lineHeight: 1.12, marginTop: 6 }}>{text}</div>
  </div>
);
const Header: React.FC<{ clock?: string; op?: number }> = ({ clock, op = 1 }) => (
  <div style={{ position: "absolute", top: 70, left: 50, right: 50, display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: op }}>
    <div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 36, letterSpacing: 8, color: C.ink }}>OPERATION DEADSTICK</div>
      <div style={{ fontFamily: F.type, fontSize: 34, color: C.axis, letterSpacing: 3 }}>{EP.date}</div>
    </div>
    {clock && <div style={{ fontFamily: F.type, fontSize: 74, color: C.ink, letterSpacing: 4 }}>{clock}</div>}
  </div>
);
const PreviewBadge: React.FC = () =>
  MODE === "preview" ? (
    <div style={{ position: "absolute", top: 16, left: 16, padding: "6px 14px", background: "#b83a30", color: "#fff", fontFamily: F.ui, fontWeight: 700, fontSize: 24, letterSpacing: 3 }}>PREVIEW · DATA NOT YET VERIFIED</div>
  ) : null;

// ------------------------------------------------------------------ 1. HOOK

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const lines = ["Six gliders.", "Two bridges.", "One chance."];
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1c2a38 0%, #0a0f14 70%)" }} />
      <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center" }}>
        {lines.map((l, i) => {
          const p = easeOut(seg(f, 8 + i * 22, 26 + i * 22));
          return (
            <div key={i} style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 150, letterSpacing: 6, color: i === 2 ? "#ff7a63" : "#fff", lineHeight: 1.08, opacity: p, transform: `translateY(${(1 - p) * 46}px)` }}>
              {l.toUpperCase()}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 1230, left: 0, right: 0, textAlign: "center", fontFamily: F.type, fontSize: 40, letterSpacing: 8, color: C.gold, opacity: seg(f, 70, 90) }}>6 JUNE 1944 · 00:16</div>
      <PreviewBadge />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2. PETA BRIEFING

export const Briefing: React.FC = () => {
  const f = useCurrentFrame();
  const [px, py] = toScreen(place("pegasus").x, place("pegasus").y);
  const [hx, hy] = toScreen(place("horsabr").x, place("horsabr").y);
  const mapIn = easeOut(seg(f, 0, 30));
  return (
    <AbsoluteFill>
      <Paper />
      <div style={{ opacity: mapIn }}>
        <MapBase labelOpacity={seg(f, 20, 50)} />
      </div>
      <Header op={seg(f, 0, 20)} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <ChalkDefs />
        {/* sasaran dilingkari */}
        <ChalkCircle cx={px} cy={py} r={70} progress={seg(f, 70, 110)} color={C.axis} />
        <ChalkCircle cx={hx} cy={hy} r={70} progress={seg(f, 100, 140)} color={C.axis} />
        {/* arah serangan skematis (dari utara) */}
        <ChalkArrow from={[px + 120, py - 330]} to={[px + 10, py - 80]} bend={0.25} progress={seg(f, 150, 200)} color="#2a2418" />
        <ChalkArrow from={[hx + 150, hy - 330]} to={[hx + 10, hy - 80]} bend={-0.25} progress={seg(f, 175, 225)} color="#2a2418" />
      </svg>
      <div style={{ position: "absolute", left: px - 330, top: py + 110 }}>
        <Stamp lines={["BÉNOUVILLE", "CANAL BRIDGE"]} progress={seg(f, 110, 150)} rotate={-5} size={34} />
      </div>
      <div style={{ position: "absolute", left: hx + 60, top: hy + 110 }}>
        <Stamp lines={["RANVILLE", "ORNE BRIDGE"]} progress={seg(f, 140, 180)} rotate={4} size={34} />
      </div>
      <Caption tag="THE TARGET" text="Two bridges stood between German armour and the eastern flank of the landings." op={seg(f, 230, 260)} />
      <PreviewBadge />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3. ORDER OF BATTLE (Sekutu)

export const OobAllied: React.FC = () => {
  const f = useCurrentFrame();
  const chain = [unit("div6"), unit("abde6"), unit("dcoy")];
  const chainOp = seg(f, 10, 40);
  return (
    <AbsoluteFill>
      <Paper />
      <Header op={1} />
      <div style={{ position: "absolute", top: 230, left: 50, fontFamily: F.ui, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: C.allied, opacity: chainOp }}>ALLIED · 6th AIRBORNE DIVISION</div>
      <div style={{ position: "absolute", top: 330, left: 60, right: 60, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: chainOp }}>
        {chain.map((u, i) => {
          const p = easeOut(seg(f, 20 + i * 18, 44 + i * 18));
          return (
            <React.Fragment key={u.id}>
              <div style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
                <Counter kind={u.kind} side={u.side} label={u.short} />
              </div>
              {i < chain.length - 1 && <div style={{ flex: 1, height: 4, background: C.ink, margin: "0 14px", opacity: p * 0.6, transformOrigin: "left", transform: `scaleX(${p})` }} />}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 480, left: 90, display: "flex", flexDirection: "column", gap: 18 }}>
        {["howard", "brotheridge", "pinecoffin", "priday", "wallwork"].filter((id) => show(person(id).status)).slice(0, 3).map((id, i) => (
          <Dossier key={id} person={person(id)} progress={seg(f, 80 + i * 36, 115 + i * 36)} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1290, left: 60, right: 60, opacity: seg(f, 210, 240) }}>
        <div style={{ fontFamily: F.type, fontSize: 30, color: C.gold, letterSpacing: 4, marginBottom: 12, background: "rgba(14,10,4,0.82)", display: "inline-block", padding: "4px 14px" }}>SPOTLIGHT</div>
        <div style={{ display: "flex", gap: 26 }}>
          {[unit("horsa"), unit("halifax")].filter((u) => show(u.status)).map((u, i) => {
            const p = easeOut(seg(f, 225 + i * 25, 260 + i * 25));
            return (
              <div key={u.id} style={{ flex: 1, padding: 18, background: "rgba(244,236,214,0.92)", border: `4px solid ${C.ink}`, opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
                <Counter kind={u.kind} side={u.side} />
                <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 6, lineHeight: 1.05 }}>{u.name}</div>
                <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: "#4a3f2a", marginTop: 6 }}>{u.strength ?? u.note}</div>
              </div>
            );
          })}
        </div>
      </div>
      <PreviewBadge />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3b. ORDER OF BATTLE (Jerman)

export const OobAxis: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Paper />
      <Header op={1} />
      <div style={{ position: "absolute", top: 230, left: 50, right: 50, fontFamily: F.ui, fontWeight: 700, fontSize: 64, letterSpacing: 6, color: C.axis, opacity: seg(f, 5, 30) }}>GERMAN GARRISON</div>
      {show(unit("g736").status) && (
        <div style={{ position: "absolute", top: 350, left: 60, right: 60, display: "flex", gap: 40, alignItems: "center", opacity: seg(f, 25, 55) }}>
          <Counter kind="hq" side="AXIS" label={unit("g716").short} />
          <div style={{ width: 70, height: 4, background: C.ink, opacity: 0.6 }} />
          <Counter kind="inf" side="AXIS" label={unit("g736").short} />
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 36, color: C.ink, lineHeight: 1.1 }}>~50 men guarding both bridges</div>
        </div>
      )}
      <div style={{ position: "absolute", top: 560, left: 90 }}>
        <Dossier person={person("schmidt")} progress={seg(f, 60, 95)} />
      </div>
      <div style={{ position: "absolute", top: 860, left: 60, right: 60, opacity: seg(f, 110, 140), fontFamily: F.ui, fontWeight: 600, fontSize: 44, color: C.ink, lineHeight: 1.15 }}>
        Germany held both bridges with a small garrison, with armour held in reserve.
      </div>
      <PreviewBadge />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 4. PETA HIDUP

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const MapAlive: React.FC = () => {
  const f = useCurrentFrame();
  const [px, py] = toScreen(place("pegasus").x, place("pegasus").y);
  const [hx, hy] = toScreen(place("horsabr").x, place("horsabr").y);
  // rute skematis tug: dari kanan-atas (Inggris) → titik lepas → putar balik
  const start: [number, number] = [W + 80, -120];
  const coast: [number, number] = toScreen(760, 200);
  const rel: [number, number] = toScreen(720, 330);
  const t1 = ease(seg(f, 20, 220)); // inggris → pantai
  const t2 = ease(seg(f, 220, 300)); // pantai → titik lepas
  const t4 = ease(seg(f, 300, 460)); // tug berputar balik
  const tug: [number, number] = f < 220 ? [lerp(start[0], coast[0], t1), lerp(start[1], coast[1], t1)] : [lerp(coast[0], rel[0], t2), lerp(coast[1], rel[1], t2)];
  const tugOut: [number, number] = [lerp(rel[0], W + 100, t4), lerp(rel[1], rel[1] - 160, t4)];
  const clock = f < 380 ? "NIGHT" : "00:16";
  const targets: [number, number][] = [[px - 10, py - 60], [px - 60, py - 130], [px + 30, py - 200], [hx + 10, hy - 60], [hx + 70, hy - 130], [hx - 20, hy - 200]];
  return (
    <AbsoluteFill>
      <Paper />
      <MapBase />
      <Header clock={clock} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <ChalkDefs />
        <ChalkArrow from={[start[0] - 40, start[1] + 10]} to={rel} bend={0.12} progress={seg(f, 10, 140)} color={C.ink} width={6} />
      </svg>
      {/* tug + glider */}
      {f < 300 && (
        <div style={{ position: "absolute", left: tug[0] - 46, top: tug[1] - 32 }}>
          <Counter kind="tug" side="ALLIED" label="TUGS" />
          {f > 60 && <div style={{ position: "absolute", left: 50, top: 4, opacity: 0.8 }}><Counter kind="glider" side="ALLIED" size={0.7} /></div>}
        </div>
      )}
      {f >= 300 && f < 470 && (
        <div style={{ position: "absolute", left: tugOut[0] - 46, top: tugOut[1] - 32, opacity: 1 - seg(f, 440, 470) }}>
          <Counter kind="tug" side="ALLIED" />
        </div>
      )}
      {f >= 300 &&
        targets.map((tg, i) => {
          const p = ease(seg(f, 300 + i * 4, 400 + i * 6));
          const x = lerp(rel[0], tg[0], p);
          const y = lerp(rel[1], tg[1], p) - Math.sin(p * Math.PI) * 30;
          return (
            <div key={i} style={{ position: "absolute", left: x - 40, top: y - 28 }}>
              <Counter kind="glider" side="ALLIED" size={0.8} />
            </div>
          );
        })}
      <Caption tag={f < 300 ? "NIGHT OF 5 JUNE" : "00:16 · TOUCHDOWN"} text={f < 300 ? "Six gliders are towed across the Channel from Tarrant Rushton." : "Five of the six land within 47 yards of their targets."} op={seg(f, 30, 60) * (1 - seg(f, 520, 560))} />
      <PreviewBadge />
    </AbsoluteFill>
  );
};
