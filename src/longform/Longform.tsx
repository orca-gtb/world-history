import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { buildAmbient, buildCamera, FPS, type Shot as MShot } from "../v4/motion";
import { FilmGrain, PAPER_FIBER, PAPER_NOISE, Vignette } from "../v4/Film";
import { CardBody } from "./Cards";
import { CHAPTERS } from "./spec";
import timing from "./timing.json";

export const LONG_TOTAL = timing.total;
const STEP = 2200;

// debu melayang untuk layar 16:9
const MOTES = Array.from({ length: 40 }).map((_, i) => ({ x: random(`wx${i}`) * 1920, y: random(`wy${i}`) * 1080, r: 1.2 + random(`wr${i}`) * 3.2, vy: -0.15 - random(`wv${i}`) * 0.4, ph: random(`wp${i}`) * 6.28, soft: random(`ws${i}`) > 0.7 }));
const DustWide: React.FC<{ tint: string }> = ({ tint }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {MOTES.map((m, i) => {
        const x = (((m.x + Math.sin(f / 40 + m.ph) * 14) % 1920) + 1920) % 1920, y = (((m.y + m.vy * f) % 1080) + 1080) % 1080;
        const s = m.soft ? m.r * 2.6 : m.r;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s * 2, height: s * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${tint},${m.soft ? 0.35 : 0.9}) 0%, rgba(${tint},0) 70%)`, opacity: 0.5 * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f / 23 + m.ph * 3))) }} />;
      })}
    </AbsoluteFill>
  );
};

const ChapterStage: React.FC<{ idx: number; frames: number }> = ({ idx, frames }) => {
  const f = useCurrentFrame();
  const spec = CHAPTERS[idx];
  const PRE = timing.pre;
  const t = (f - PRE) / FPS;
  const shots: MShot[] = useMemo(() => spec.shots.map((sh, i) => ({ at: i === 0 ? 0 : Math.max(1, Math.round(sh.t * FPS) + PRE), d: i === 0 ? 0 : sh.d ?? 36, x: sh.card * STEP + (sh.dx ?? 0), y: sh.dy ?? 0, s: sh.s ?? 1.0 })), [spec]);
  const cam = useMemo(() => buildCamera(shots), [shots]);
  const amb = useMemo(() => buildAmbient(frames), [frames]);
  cam.tl.seek(f / FPS, true);
  amb.tl.seek(f / FPS, true);
  const { x, y, s, r } = cam.cam;
  const { hx, hy, hr, paper } = amb.amb;
  const fadeIn = 1 - clamp01(f / 12), fadeOut = clamp01((f - (frames - 14)) / 14);
  const dark = spec.cards.some((c, i) => i === 0 && "dark" in c && c.dark);
  return (
    <AbsoluteFill style={{ background: "#7c6a48", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${960 + hx}px, ${540 + hy}px) rotate(${r + hr}deg) scale(${s}) translate(${-x}px, ${-y}px)` }}>
        <div style={{ position: "absolute", left: -3000, top: -2200, width: spec.cards.length * STEP + 6000, height: 4400, transformOrigin: `${x + 3000}px ${y + 2200}px`, transform: `scale(${paper})`, background: `radial-gradient(ellipse at 40% 40%, ${C.paper} 0%, #cdb98f 60%, ${C.paperDark} 100%)` }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_FIBER, mixBlendMode: "multiply", opacity: 0.9 }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: PAPER_NOISE, mixBlendMode: "multiply", opacity: 0.7 }} />
        </div>
        {spec.cards.map((c, i) => (
          <div key={i} style={{ position: "absolute", left: i * STEP - 850, top: -450, transform: `rotate(${i % 2 ? 0.3 : -0.3}deg)` }}>
            <CardBody c={c} t={t} />
          </div>
        ))}
      </div>
      <DustWide tint={dark ? "200,225,255" : "255,246,226"} />
      <Vignette amount={0.7} />
      <FilmGrain strength={0.17} />
      <AbsoluteFill style={{ background: "#05080c", opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};

const Opener: React.FC<{ kicker: string; title: string; sub: string; frames: number }> = ({ kicker, title, sub, frames }) => {
  const f = useCurrentFrame();
  const o = clamp01(f / 14) * (1 - clamp01((f - (frames - 12)) / 12));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1d2b3a 0%, #070b10 75%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 18}px)` }}>
        <div style={{ fontFamily: F.type, fontSize: 36, letterSpacing: 8, color: "#ff7a63" }}>{kicker}</div>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 190, color: "#fff", lineHeight: 1.0, letterSpacing: 4, marginTop: 14 }}>{title}</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 56, color: "#a9cdef", marginTop: 12, letterSpacing: 2 }}>{sub}</div>
      </div>
      <DustWide tint="200,225,255" />
      <Vignette amount={0.85} />
      <FilmGrain strength={0.2} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const o = clamp01(f / 20) * (1 - clamp01((f - (frames - 20)) / 20));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1d2b3a 0%, #070b10 75%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: o }}>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 120, color: "#fff", letterSpacing: 10 }}>WORLD HISTORY</div>
        <div style={{ fontFamily: F.type, fontSize: 34, letterSpacing: 6, color: C.gold, marginTop: 10 }}>ERICH HARTMANN · 1922 – 1993</div>
      </div>
      <DustWide tint="200,225,255" />
      <Vignette amount={0.85} />
      <FilmGrain strength={0.2} />
    </AbsoluteFill>
  );
};

export const HartmannLong: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Audio src={staticFile("audio/aces-longform.wav")} />
    {timing.chapters.map((c, i) => (
      <React.Fragment key={c.id}>
        {c.cardStart !== null && CHAPTERS[i].cardTitle && (
          <Sequence from={c.cardStart} durationInFrames={timing.cardFrames}><Opener {...CHAPTERS[i].cardTitle!} frames={timing.cardFrames} /></Sequence>
        )}
        <Sequence from={c.start} durationInFrames={c.frames}><ChapterStage idx={i} frames={c.frames} /></Sequence>
      </React.Fragment>
    ))}
    <Sequence from={timing.endStart} durationInFrames={timing.endFrames}><EndCard frames={timing.endFrames} /></Sequence>
  </AbsoluteFill>
);
