import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../kit/theme";
import { ArchivePhoto } from "../kit/ArchivePhoto";
import { Silhouette } from "../aces/Silhouettes";
import { ACES, HARTMANN_FACTS } from "../aces/data";
import { show } from "../episodes/schema";
import { buildAmbient, buildCamera, buildValues, FPS, type Shot } from "../v4/motion";
import { Dust, FilmGrain, PAPER_FIBER, PAPER_NOISE, Vignette } from "../v4/Film";
import { BlueprintSheet, BP_PAD, HEART_AT, TULIP_AT } from "../v4/BlueprintSheet";
import { PhotoPortrait } from "../portrait/Portrait";

// ============================================================================
// HARTMANN v4 — satu "meja" dunia besar. Semua dokumen DIAM di tempatnya;
// yang bergerak hanya KAMERA (GSAP Timeline, power4.out + overshoot).
// Counter & bar (data) pakai cubic-bezier(0.16,1,0.3,1).
// ============================================================================
export const V5_TOTAL = 1560;

// ---- tata letak dunia (px dunia)
const HOOK = { x: 0, y: 0, w: 1500, h: 2300 };
const BOARD = { x: 1700, y: 200, w: 1060, h: 1820 };
const SPOT = { x: 150, y: 2600, w: 1200, h: 1560 };
const BP = { x: 1600, y: 2300 };
const OUT = { x: 150, y: 4700, w: 1200, h: 1950 };
const rowY = (i: number) => BOARD.y + 380 + i * 248 + 116; // pusat baris i
const bpw = (lx: number, ly: number): [number, number] => [BP.x + BP_PAD.x + lx, BP.y + BP_PAD.y + ly];
const factY = [SPOT.y + 590, SPOT.y + 800, SPOT.y + 962, SPOT.y + 1125];

// ---- shot kamera (frame absolut). Sinkron dengan cue audio scripts/soundtrack_v4.py
const [tulX, tulY] = bpw(TULIP_AT[0] + 54, TULIP_AT[1] - 40);
const [hrtX, hrtY] = bpw(HEART_AT[0] + 95, HEART_AT[1] + 95);
const SHOTS: Shot[] = [
  // HOOK + BOARD: identik dengan v4
  { at: 0, d: 0, x: 750, y: 1150, s: 1.18 },
  { at: 4, d: 56, x: 750, y: 1130, s: 1.32 },
  { at: 60, d: 16, x: 750, y: 1120, s: 1.46 },
  { at: 86, d: 30, x: 2230, y: 1110, s: 0.98, via: 0.6 },
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 128 + 24 * i, d: 22, x: 2230, y: rowY(i) + 60, s: 1.12 })),
  { at: 262, d: 32, x: 2230, y: 1110, s: 0.95 },
  { at: 330, d: 40, x: 2230, y: rowY(0) + 20, s: 1.13 },
  // SPOT: diselaraskan dengan VO L3 (mulai 15,0 dtk): misi -> kemenangan terakhir -> unit
  { at: 414, d: 34, x: 750, y: 2850, s: 1.15, via: 0.55 },
  { at: 462, d: 22, x: 750, y: factY[1], s: 1.08 },
  { at: 556, d: 22, x: 750, y: factY[2], s: 1.08 },
  { at: 612, d: 22, x: 750, y: factY[3], s: 1.08 },
  { at: 650, d: 34, x: 750, y: 3400, s: 0.95 },
  { at: 692, d: 14, x: 1020, y: 3990, s: 1.36 },
  // BLUEPRINT: tulip di 27,9 dtk (VO L4)
  { at: 744, d: 36, x: bpw(540, 960)[0], y: bpw(540, 960)[1], s: 0.88, via: 0.6 },
  { at: 796, d: 28, x: bpw(540, 760)[0], y: bpw(540, 760)[1], s: 1.15 },
  { at: 826, d: 22, x: tulX, y: tulY, s: 2.3 },
  { at: 896, d: 24, x: hrtX, y: hrtY, s: 2.3 },
  { at: 960, d: 28, x: bpw(540, 1520)[0], y: bpw(540, 1520)[1], s: 1.1 },
  { at: 1030, d: 24, x: bpw(540, 1010)[0], y: bpw(540, 1010)[1], s: 1.2 },
  // OUTRO: judul -> ledger -> bar klaim -> bar kerugian -> foto
  { at: 1092, d: 30, x: 750, y: OUT.y + 450, s: 1.0, via: 0.55 },
  { at: 1200, d: 28, x: 750, y: OUT.y + 1030, s: 1.0 },
  { at: 1318, d: 22, x: 712, y: OUT.y + 988, s: 1.12 },
  { at: 1420, d: 22, x: 712, y: OUT.y + 1168, s: 1.12 },
  { at: 1500, d: 40, x: 750, y: OUT.y + 1630, s: 0.95 },
  { at: 1540, d: 20, x: 750, y: OUT.y + 1650, s: 1.0 },
];

// ---- nilai data
const VALS = [
  { key: "hook", from: 0, to: 352, at: 6, end: 62 },
  ...ACES.flatMap((a, i) => [
    { key: `n${i}`, from: 0, to: a.kills, at: 140 + 24 * i, end: 200 + 24 * i },
    { key: `b${i}`, from: 0, to: a.kills / 352, at: 136 + 24 * i, end: 204 + 24 * i },
  ]),
  // ledger penutup (cubic-bezier 0.16,1,0.3,1). Sinkron dengan VO L5: "thirty-two" ~45 dtk, "eleven at most" ~48 dtk
  { key: "claims", from: 0, to: 32, at: 1325, end: 1385 },
  { key: "loss", from: 0, to: 11, at: 1430, end: 1480 },
  { key: "air", from: 0, to: 2, at: 1486, end: 1506 },
  { key: "black", from: 0, to: 1, at: 1538, end: 1560 },
];

const SHADOW = ["0 1px 1px rgba(40,24,6,0.18)", "0 2px 2px rgba(40,24,6,0.16)", "0 4px 4px rgba(40,24,6,0.15)", "0 8px 8px rgba(40,24,6,0.14)", "0 16px 16px rgba(40,24,6,0.13)", "0 32px 40px rgba(40,24,6,0.16)"].join(", ");
const SHEET: React.CSSProperties = { position: "absolute", background: "linear-gradient(170deg, rgba(247,240,222,0.98) 0%, rgba(232,220,192,0.98) 100%)", boxShadow: SHADOW };
const CARD: React.CSSProperties = { background: "linear-gradient(170deg, #f8f2e2, #ebe0c4)", border: "2px solid rgba(42,36,24,0.45)", boxShadow: SHADOW };
const at = (r: { x: number; y: number }): React.CSSProperties => ({ position: "absolute", left: r.x, top: r.y });

// ---------------------------------------------------------------- dokumen (statis)
const HookPanel: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ ...at(HOOK), width: HOOK.w, height: HOOK.h, background: "radial-gradient(ellipse at 50% 48%, #1d2b3a 0%, #0a0f14 70%)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
    <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 480, letterSpacing: 6, color: "#fff", lineHeight: 1, textShadow: "0 2px 0 rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.6), 0 30px 90px rgba(0,0,0,0.8)" }}>{Math.round(n)}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 70, letterSpacing: 10, color: "#ff7a63" }}>CREDITED VICTORIES</div>
      <div style={{ fontFamily: F.type, fontSize: 38, letterSpacing: 5, color: C.gold, marginTop: 24 }}>ONE PILOT · 1939–1945</div>
    </div>
  </div>
);

const Board: React.FC<{ v: Record<string, number>; f: number }> = ({ v, f }) => (
  <div style={{ ...SHEET, ...at(BOARD), width: BOARD.w, height: BOARD.h, transform: "rotate(0.6deg)" }}>
    <div style={{ position: "absolute", top: 60, left: 50, right: 50 }}>
      <div style={{ fontFamily: F.type, fontSize: 34, color: C.axis, letterSpacing: 4 }}>1939 – 1945</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 90, letterSpacing: 5, color: C.ink, lineHeight: 1.02 }}>DEADLIEST FIGHTER ACES</div>
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: "#5a4a2c" }}>Credited aerial victories</div>
    </div>
    {ACES.map((a, i) => {
      const top = i === 0;
      const started = f >= 140 + 24 * i;
      return (
        <div key={a.id} style={{ ...CARD, position: "absolute", left: 50, width: 960, top: 380 + i * 248, height: 232, display: "flex", alignItems: "center", gap: 18, padding: "0 26px", boxSizing: "border-box", transform: `rotate(${i % 2 ? 0.35 : -0.4}deg)`, ...(top ? { background: "linear-gradient(170deg, #f2e0a5, #e2cb8c)", border: `4px solid ${C.gold}` } : {}) }}>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 100, color: top ? C.gold : C.ink, width: 80 }}>{i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 52, color: C.ink, lineHeight: 1.02 }}>{a.name}</div>
            <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 30, color: "#5a4a2c", marginTop: 4 }}>{a.aircraft}</div>
            <div style={{ position: "relative", width: 430, height: 14, marginTop: 10, background: "rgba(42,36,24,0.12)", boxShadow: "inset 0 1px 2px rgba(40,24,6,0.25)" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 430 * (v[`b${i}`] ?? 0), background: top ? `linear-gradient(90deg, ${C.gold}, #e2b552)` : `linear-gradient(90deg, ${C.axis}, #c4544a)` }} />
            </div>
            {a.note && show(a.noteStatus ?? "unverified") && <div style={{ fontFamily: F.type, fontSize: 24, color: C.axis, marginTop: 8 }}>{a.note}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 210 }}>
            <Silhouette icon={a.icon} width={200} />
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 96, color: C.ink, lineHeight: 0.95 }}>{started ? Math.round(v[`n${i}`] ?? 0) : "—"}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Spot: React.FC = () => {
  const facts = HARTMANN_FACTS.filter((r) => show(r.status));
  return (
    <div style={{ ...SHEET, ...at(SPOT), width: SPOT.w, height: SPOT.h, transform: "rotate(-0.5deg)" }}>
      <div style={{ position: "absolute", top: 40, left: 80, fontFamily: F.type, fontSize: 38, color: C.axis, letterSpacing: 5 }}>NUMBER ONE</div>
      <div style={{ ...CARD, position: "absolute", top: 110, left: 80, width: 1040, display: "flex", gap: 30, padding: 26, boxSizing: "border-box", transform: "rotate(-0.8deg)" }}>
        <ArchivePhoto width={172} photo="hartmann-a.jpg" />
        <div style={{ flex: 1, paddingTop: 6 }}>
          <div style={{ fontFamily: F.type, fontSize: 24, color: C.axis, letterSpacing: 2 }}>LUFTWAFFE FIGHTER PILOT</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 64, color: C.ink, lineHeight: 1.0, marginTop: 4 }}>Erich Hartmann</div>
          <div style={{ height: 3, width: 120, background: C.axis, margin: "14px 0 12px" }} />
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 34, color: "#4a3f2a" }}>Highest-scoring fighter ace in history</div>
          <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 28, color: "#6a5c3e", marginTop: 8 }}>JG 52 · Eastern Front</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 470, left: 80, width: 1040, display: "flex", flexDirection: "column", gap: 26 }}>
        {facts.map((r, i) => (
          <div key={r.label} style={{ ...CARD, padding: "18px 28px", borderLeft: `10px solid ${i === 0 ? C.axis : C.ink}`, transform: `rotate(${i % 2 ? 0.35 : -0.25}deg)` }}>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: "#6a5a38" }}>{r.label}</div>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: i === 0 ? 150 : 64, color: C.ink, lineHeight: 1.0 }}>{r.value}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 700, top: 1300, transform: "rotate(-7deg)", border: `7px solid ${C.axis}`, padding: "10px 26px", color: C.axis, fontFamily: F.ui, fontWeight: 700, fontSize: 56, letterSpacing: 4, lineHeight: 1.05, opacity: 0.85, mixBlendMode: "multiply" }}>
        CREDITED,<br />NOT PROVEN
      </div>
    </div>
  );
};

const Ledger: React.FC<{ v: Record<string, number> }> = ({ v }) => {
  const W = 880;
  const claims = Math.round(v.claims ?? 0), loss = Math.round(v.loss ?? 0), air = Math.round(v.air ?? 0);
  const track: React.CSSProperties = { position: "relative", width: W, height: 36, background: "rgba(42,36,24,0.12)", boxShadow: "inset 0 1px 2px rgba(40,24,6,0.25)" };
  return (
    <div style={{ ...CARD, position: "absolute", left: 80, top: 720, width: 1040, height: 620, padding: "34px 40px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: F.type, fontSize: 26, color: C.axis, letterSpacing: 4 }}>23–24 AUGUST 1944 · SANDOMIERZ SECTOR</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 6 }}>German claims vs. Soviet losses</div>
      {/* baris 1: klaim Jerman */}
      <div style={{ position: "absolute", left: 40, top: 130, width: W, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 32, color: "#4a3f2a", paddingBottom: 14 }}>German pilots' claims</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, color: C.axis, lineHeight: 1 }}>{claims}</div>
      </div>
      <div style={{ ...track, position: "absolute", left: 40, top: 250 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * ((v.claims ?? 0) / 32), background: `linear-gradient(90deg, ${C.axis}, #c4544a)` }} />
      </div>
      {/* baris 2: kerugian Soviet */}
      <div style={{ position: "absolute", left: 40, top: 310, width: W, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 32, color: "#4a3f2a", paddingBottom: 14 }}>Soviet 2nd Air Army losses · at most</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, color: C.ink, lineHeight: 1 }}>{loss}</div>
      </div>
      <div style={{ ...track, position: "absolute", left: 40, top: 430 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * ((v.loss ?? 0) / 32), background: "linear-gradient(90deg, #3a3326, #5a4e38)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * ((v.air ?? 0) / 32), background: C.gold }} />
      </div>
      <div style={{ position: "absolute", left: 40, top: 480, fontFamily: F.type, fontSize: 24, color: "#6a5a38", opacity: Math.min(1, air / 2) }}>of which {air} in air combat with German fighters</div>
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 26, fontFamily: F.type, fontSize: 20, color: "#7a6a48" }}>Figures as cited in Wikipedia: Bergström (claims), Khazanov (losses)</div>
    </div>
  );
};

const Outro: React.FC<{ v: Record<string, number> }> = ({ v }) => (
  <div style={{ ...SHEET, ...at(OUT), width: OUT.w, height: OUT.h, transform: "rotate(0.4deg)" }}>
    <div style={{ position: "absolute", top: 110, left: 80, right: 80 }}>
      <div style={{ fontFamily: F.type, fontSize: 36, color: C.axis, letterSpacing: 5 }}>THE CATCH</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, color: C.ink, lineHeight: 1.04, letterSpacing: 2, marginTop: 10 }}>CREDITED IS NOT THE SAME AS CONFIRMED.</div>
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 44, color: "#4a3d22", lineHeight: 1.15, marginTop: 24 }}>Researchers comparing Soviet loss records say the real total may be much lower.</div>
    </div>
    <Ledger v={v} />
    <div style={{ position: "absolute", left: 80, top: 1430 }}>
      <PhotoPortrait src="hartmann-b.jpg" width={340} seed={1} start={1480} duration={120} focus={[50, 40]} />
    </div>
    <div style={{ position: "absolute", left: 470, top: 1520, width: 640 }}>
      <div style={{ fontFamily: F.type, fontSize: 30, color: C.axis, letterSpacing: 4 }}>ERICH HARTMANN</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 72, color: C.ink, lineHeight: 1.0 }}>1922 – 1993</div>
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 34, color: "#5a4a2c", marginTop: 10 }}>Wartime photograph</div>
    </div>
  </div>
);

// ---------------------------------------------------------------- episode
export const HartmannV5: React.FC = () => {
  const f = useCurrentFrame();
  const cam = useMemo(() => buildCamera(SHOTS), []);
  const amb = useMemo(() => buildAmbient(V5_TOTAL), []);
  const val = useMemo(() => buildValues(VALS), []);
  const t = f / FPS;
  cam.tl.seek(t, true);
  amb.tl.seek(t, true);
  val.tl.seek(t, true);
  const { x, y, s, r } = cam.cam;
  const { hx, hy, hr, paper } = amb.amb;
  const dark = f < 96 || (f >= 760 && f < 1100);

  return (
    <AbsoluteFill style={{ background: "#7c6a48", overflow: "hidden" }}>
      <Audio src={staticFile("audio/aces-v5.wav")} />
      {/* DUNIA — satu-satunya transform yang bergerak adalah kamera */}
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${540 + hx}px, ${960 + hy}px) rotate(${r + hr}deg) scale(${s}) translate(${-x}px, ${-y}px)` }}>
        {/* kertas meja bernafas: scale 1 -> 1.02, satu napas 8 detik */}
        <div style={{ position: "absolute", left: -2000, top: -2000, width: 7000, height: 10500, transformOrigin: `${x + 2000}px ${y + 2000}px`, transform: `scale(${paper})`, background: `radial-gradient(ellipse at 40% 40%, ${C.paper} 0%, #cdb98f 60%, ${C.paperDark} 100%)` }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_FIBER, mixBlendMode: "multiply", opacity: 0.9 }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_NOISE, mixBlendMode: "multiply", opacity: 0.7 }} />
          <svg width={7000} height={10500} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
            <defs><pattern id="desk" width={100} height={100} patternUnits="userSpaceOnUse"><path d="M100 0 L0 0 0 100" fill="none" stroke={C.ink} strokeWidth={1.4} /></pattern></defs>
            <rect width={7000} height={10500} fill="url(#desk)" />
          </svg>
        </div>
        <HookPanel n={val.v.hook} />
        <Board v={val.v} f={f} />
        <Spot />
        <div style={{ position: "absolute", left: BP.x, top: BP.y, transform: "rotate(-0.7deg)" }}><BlueprintSheet /></div>
        <Outro v={val.v} />
      </div>
      {/* lapisan film (layar) */}
      <Dust tint={dark ? "200,225,255" : "255,246,226"} />
      <Vignette amount={dark ? 0.85 : 0.68} />
      <FilmGrain strength={dark ? 0.2 : 0.17} />
      <AbsoluteFill style={{ background: "#000", opacity: val.v.black }} />
    </AbsoluteFill>
  );
};
