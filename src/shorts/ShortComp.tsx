import React from "react";
import { AbsoluteFill } from "remotion";
import { useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { FilmGrain, Vignette } from "../v4/Film";
import { Diorama } from "../conquer/Diorama";
import { bz, cl, io, rv } from "../conquer/mapkit";
import s01 from "./s01.timeline.json";

// SHORT 9:16 (1080x1920). Latar = Diorama 16:9 dipotong (crop) dan kamera meluncur menyamping tanpa zoom.
// Aturan layar: area aman Shorts (atas ±150 px, bawah ±380 px, kanan ±130 px dibiarkan kosong dari teks penting).
// Gerak (motion-design): satu "hero" per momen; angka = ease-out-expo 0,25 dtk; batang = ease-out 0,9 dtk; caption pop 0,1 dtk.
export const TIMELINES = { s01 } as Record<string, typeof s01>;
export const shortFrames = (id: string) => Math.round(TIMELINES[id].total * TIMELINES[id].fps);
const K = 2.2, Y0 = 300; // skala crop dan geser atas: aksi ada di tengah layar, caption di atasnya, bawah kosong untuk UI Shorts
const GOLD = "#ffcf6b", RED = "#ff5a44", GREY = "#b9c0c8";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
type Card = { type: string; t0: number; t1: number; [k: string]: unknown };
type Word = { w: string; t0: number; t1: number };

const Stroke: React.CSSProperties = { WebkitTextStroke: "0px", textShadow: "0 4px 18px rgba(0,0,0,0.85)" };

const Hook: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const o = cl(t, c.t0, 0.15) * (1 - cl(t, c.t1 - 0.35, 0.35)); if (o <= 0) return null;
  const sc = 1 + 0.22 * (1 - rv(t, c.t0, 0.25)), v = (c.big as number) * bz(cl(t, c.t0 + 0.1, 1.3));
  return (
    <div style={{ position: "absolute", left: 0, right: 130, top: 230, textAlign: "center", whiteSpace: "nowrap", opacity: o, transform: `scale(${sc})`, transformOrigin: "50% 40%" }}>
      <div style={{ fontFamily: F.type, fontSize: 36, letterSpacing: 12, color: GOLD, ...Stroke }}>{c.kick as string}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 210, lineHeight: 1, color: C.chalk, letterSpacing: 2, marginTop: 6, fontVariantNumeric: "tabular-nums", textShadow: "0 0 40px rgba(200,38,28,0.55), 0 6px 24px rgba(0,0,0,0.9)" }}>{(c.prefix as string) ?? ""}{fmt(v)}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 64, letterSpacing: 4, color: RED, marginTop: 8, ...Stroke }}>{c.sub as string}</div>
    </div>
  );
};

const Bars: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const o = cl(t, c.t0, 0.3) * (1 - cl(t, c.t1 - 0.4, 0.4)); if (o <= 0) return null;
  const a = bz(cl(t, c.t0 + 0.1, 0.9)), b = bz(cl(t, (c.t2 as number) ?? c.t0 + 4, 0.9)), W = 800;
  const row = (label: string, val: string, frac: number, col: string, vis: number, txt: string) => (
    <div style={{ opacity: vis > 0 ? 1 : 0.0, marginTop: 34 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.ui, fontWeight: 700, color: txt, ...Stroke }}>
        <span style={{ fontSize: 40, letterSpacing: 3 }}>{label}</span><span style={{ fontSize: 58, fontVariantNumeric: "tabular-nums" }}>{val}</span>
      </div>
      <div style={{ height: 46, width: W, background: "rgba(255,255,255,0.12)", marginTop: 8 }}><div style={{ height: "100%", width: W * frac * vis, background: col }} /></div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 90, top: 250, width: W + 40, opacity: o, transform: `translateY(${(1 - rv(t, c.t0, 0.4)) * 20}px)` }}>
      <div style={{ fontFamily: F.type, fontSize: 26, letterSpacing: 8, color: GOLD, ...Stroke }}>MEN · BELARUS, JUNE 1944 · ESTIMATES</div>
      {row("SOVIET UNION", `${fmt(1500000 * a)}+`, 1, RED, a, C.chalk)}
      {row("GERMANY", `< ${fmt(500000 * b)}`, 1 / 3, GREY, b, C.chalk)}
    </div>
  );
};

const End: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const o = cl(t, c.t0, 0.35); if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 190, top: 250, textAlign: "center", opacity: o, transform: `translateY(${(1 - rv(t, c.t0, 0.5)) * 24}px)` }}>
      <div style={{ fontFamily: F.type, fontSize: 28, letterSpacing: 10, color: GOLD, ...Stroke }}>{c.sub as string}</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 92, lineHeight: 1.02, color: C.chalk, marginTop: 10, ...Stroke }}>{c.text as string}</div>
    </div>
  );
};

const chunkWords = (ws: Word[]) => {
  const out: Word[][] = []; let cur: Word[] = [];
  ws.forEach((w, i) => { cur.push(w); const end = /[.,:;!?]$/.test(w.w); if (cur.length >= 3 || (end && cur.length >= 2) || i === ws.length - 1) { out.push(cur); cur = []; } });
  return out;
};

export const ShortComp: React.FC<{ id: string }> = ({ id }) => {
  const tl = TIMELINES[id], t = useCurrentFrame() / tl.fps;
  const sc = tl.scenes.find((s) => t >= s.t0 && t < s.t1) ?? tl.scenes[tl.scenes.length - 1];
  const dur = sc.t1 - sc.t0, u = clamp01((t - sc.t0) / Math.max(0.1, dur)), x0 = sc.x[0] + (sc.x[1] - sc.x[0]) * io(u);
  const dip = Math.max(0, ...tl.scenes.slice(1).map((s) => 1 - Math.abs(t - s.t0) / 0.1));
  const chunks = React.useMemo(() => chunkWords(tl.words as Word[]), [tl]);
  const ch = chunks.find((c) => t >= c[0].t0 - 0.02 && t < c[c.length - 1].t1 + 0.14);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${-x0 * K}px,${-Y0 * K}px) scale(${K})`, transformOrigin: "0 0" }}>
        <Diorama id={sc.id} lt={t - sc.t0} dur={dur} bare />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.65) 100%)" }} />
      <div style={{ position: "absolute", left: 60, top: 168, fontFamily: F.type, fontSize: 24, letterSpacing: 7, color: GOLD, ...Stroke }}>OPERATION BAGRATION · 1944</div>
      <div style={{ position: "absolute", left: 60, top: 204, width: 90, height: 6, background: "#c8261c" }} />
      {(tl.cards as Card[]).map((c, i) => c.type === "hook" ? <Hook key={i} c={c} t={t} /> : c.type === "bars" ? <Bars key={i} c={c} t={t} /> : <End key={i} c={c} t={t} />)}
      {ch && (
        <div style={{ position: "absolute", left: 50, right: 180, top: 610, textAlign: "center", transform: `scale(${0.9 + 0.1 * rv(t, ch[0].t0, 0.12)})` }}>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 98, lineHeight: 1.04, textTransform: "uppercase", letterSpacing: 2, WebkitTextStroke: "9px #000", paintOrder: "stroke fill" as never }}>
            {ch.map((w, i) => <span key={i} style={{ color: t >= w.t0 - 0.02 && t < w.t1 + 0.05 ? GOLD : C.chalk, marginRight: 22, display: "inline-block" }}>{w.w}</span>)}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", right: 150, top: 176, fontFamily: F.type, fontSize: 17, letterSpacing: 2, color: "rgba(232,225,207,0.7)" }}>ILLUSTRATIVE</div>
      <AbsoluteFill style={{ background: "#000", opacity: dip, pointerEvents: "none" }} />
      <Vignette amount={0.35} />
      <FilmGrain strength={0.1} />
    </AbsoluteFill>
  );
};
