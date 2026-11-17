import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { C, F } from "../kit/theme";
import { ArchivePhoto } from "../kit/ArchivePhoto";
import { Silhouette } from "../aces/Silhouettes";
import { ACES, HARTMANN_FACTS } from "../aces/data";
import { show } from "../episodes/schema";
import { buildAmbient, buildCamera, buildValues, FPS, type Shot } from "./motion";
import { Dust, FilmGrain, PAPER_FIBER, PAPER_NOISE, Vignette } from "./Film";
import { BlueprintSheet, BP_PAD, HEART_AT, TULIP_AT } from "./BlueprintSheet";

// ============================================================================
// HARTMANN v4 — satu "meja" dunia besar. Semua dokumen DIAM di tempatnya;
// yang bergerak hanya KAMERA (GSAP Timeline, power4.out + overshoot).
// Counter & bar (data) pakai cubic-bezier(0.16,1,0.3,1).
// ============================================================================
export const V4_TOTAL = 1270;

// ---- tata letak dunia (px dunia)
const HOOK = { x: 0, y: 0, w: 1500, h: 2300 };
const BOARD = { x: 1700, y: 200, w: 1060, h: 1820 };
const SPOT = { x: 150, y: 2600, w: 1200, h: 1560 };
const BP = { x: 1600, y: 2300 };
const OUT = { x: 150, y: 4700, w: 1200, h: 1500 };
const rowY = (i: number) => BOARD.y + 380 + i * 248 + 116; // pusat baris i
const bpw = (lx: number, ly: number): [number, number] => [BP.x + BP_PAD.x + lx, BP.y + BP_PAD.y + ly];
const factY = [SPOT.y + 593, SPOT.y + 812, SPOT.y + 978];

// ---- shot kamera (frame absolut). Sinkron dengan cue audio scripts/soundtrack_v4.py
const [tulX, tulY] = bpw(TULIP_AT[0] + 75, TULIP_AT[1] - 40);
const [hrtX, hrtY] = bpw(HEART_AT[0] + 95, HEART_AT[1] + 95);
const SHOTS: Shot[] = [
  { at: 0, d: 0, x: 750, y: 1150, s: 1.18 },
  { at: 4, d: 56, x: 750, y: 1130, s: 1.32 }, // dorong pelan saat angka berlari
  { at: 60, d: 16, x: 750, y: 1120, s: 1.46 }, // punch di hantaman 352
  { at: 86, d: 30, x: 2230, y: 1110, s: 0.98, via: 0.6 }, // crane ke papan peringkat
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 128 + 24 * i, d: 22, x: 2230, y: rowY(i) + 60, s: 1.12 })), // dolly per baris
  { at: 262, d: 32, x: 2230, y: 1110, s: 0.95 }, // tarik mundur: seluruh papan
  { at: 330, d: 40, x: 2230, y: rowY(0) + 20, s: 1.13 }, // dorong ke nomor 1
  { at: 414, d: 34, x: 750, y: 2850, s: 1.15, via: 0.55 }, // pindah ke dossier
  ...[0, 1, 2].map((i) => ({ at: 486 + 28 * i, d: 22, x: 750, y: factY[i], s: 1.08 })), // turun per fakta
  { at: 590, d: 34, x: 750, y: 3400, s: 0.95 }, // seluruh lembar
  { at: 692, d: 14, x: 1020, y: 3930, s: 1.36 }, // punch ke stempel
  { at: 744, d: 36, x: bpw(540, 960)[0], y: bpw(540, 960)[1], s: 0.88, via: 0.6 }, // whip ke cetak biru
  { at: 830, d: 24, x: bpw(540, 760)[0], y: bpw(540, 760)[1], s: 1.15 }, // tampak atas
  { at: 900, d: 26, x: bpw(540, 1010)[0], y: bpw(540, 1010)[1], s: 1.2 }, // bentang 9.92 m
  { at: 945, d: 24, x: bpw(540, 1520)[0], y: bpw(540, 1520)[1], s: 1.15 }, // tampak samping + panjang
  { at: 988, d: 22, x: tulX, y: tulY, s: 2.3 }, // close-up tulip
  { at: 1022, d: 22, x: hrtX, y: hrtY, s: 2.3 }, // close-up hati
  { at: 1060, d: 30, x: bpw(540, 960)[0], y: bpw(540, 960)[1], s: 0.88 }, // mundur
  { at: 1092, d: 30, x: 750, y: 5300, s: 1.0, via: 0.55 }, // ke penutup
  { at: 1140, d: 110, x: 750, y: 5200, s: 1.2 }, // dorong akhir
];

// ---- nilai data
const VALS = [
  { key: "hook", from: 0, to: 352, at: 6, end: 62 },
  ...ACES.flatMap((a, i) => [
    { key: `n${i}`, from: 0, to: a.kills, at: 140 + 24 * i, end: 200 + 24 * i },
    { key: `b${i}`, from: 0, to: a.kills / 352, at: 136 + 24 * i, end: 204 + 24 * i },
  ]),
  { key: "black", from: 0, to: 1, at: 1250, end: 1270 },
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
        <ArchivePhoto width={172} caption="HARTMANN" />
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
      <div style={{ position: "absolute", left: 700, top: 1250, transform: "rotate(-7deg)", border: `7px solid ${C.axis}`, padding: "10px 26px", color: C.axis, fontFamily: F.ui, fontWeight: 700, fontSize: 56, letterSpacing: 4, lineHeight: 1.05, opacity: 0.85, mixBlendMode: "multiply" }}>
        CREDITED,<br />NOT PROVEN
      </div>
    </div>
  );
};

const Outro: React.FC = () => (
  <div style={{ ...SHEET, ...at(OUT), width: OUT.w, height: OUT.h, transform: "rotate(0.4deg)" }}>
    <div style={{ position: "absolute", top: 230, left: 120, right: 120 }}>
      <div style={{ fontFamily: F.type, fontSize: 36, color: C.axis, letterSpacing: 5 }}>THE CATCH</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, color: C.ink, lineHeight: 1.04, letterSpacing: 2, marginTop: 10 }}>CREDITED IS NOT THE SAME AS CONFIRMED.</div>
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 48, color: "#4a3d22", lineHeight: 1.15, marginTop: 36 }}>Some historians question how many of the 352 claims can be matched to real losses on the other side.</div>
    </div>
  </div>
);

// ---------------------------------------------------------------- episode
export const HartmannV4: React.FC = () => {
  const f = useCurrentFrame();
  const cam = useMemo(() => buildCamera(SHOTS), []);
  const amb = useMemo(() => buildAmbient(V4_TOTAL), []);
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
      <Audio src={staticFile("audio/aces-v4.wav")} />
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
        <Outro />
      </div>
      {/* lapisan film (layar) */}
      <Dust tint={dark ? "200,225,255" : "255,246,226"} />
      <Vignette amount={dark ? 0.85 : 0.68} />
      <FilmGrain strength={dark ? 0.2 : 0.17} />
      <AbsoluteFill style={{ background: "#000", opacity: val.v.black }} />
    </AbsoluteFill>
  );
};
