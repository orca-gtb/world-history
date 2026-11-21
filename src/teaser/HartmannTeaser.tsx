import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { Dust, FilmGrain, Vignette } from "../v4/Film";

export const FPS = 30;
export const TEASER_TOTAL = Math.ceil(51.8 * FPS);
const bz = Easing.bezier(0.16, 1, 0.3, 1);
const rv = (t: number, at: number, d = 0.45) => bz(clamp01((t - at) / d));
const fade = (t: number, a: number, b: number, d = 0.3) => clamp01((t - a) / d) * clamp01((b - t) / d);

// Waktu kalimat dari silencedetect pada vo-teaser/vo.mp3 (detik).
const CAP: [number, number, string][] = [
  [0, 5.9, "In March 1942, a young pilot was punished for breaking the rules."],
  [6.14, 9.34, "Years later, he said it saved his life."],
  [9.53, 12.64, "That same afternoon, his roommate took the flight Hartmann was meant to fly."],
  [13.05, 14.17, "The engine failed."],
  [14.53, 15.97, "His roommate was killed."],
  [16.55, 21.11, "Erich Hartmann went on to score 352 aerial victories,"],
  [21.31, 23.81, "more than any other fighter pilot in history."],
  [24.2, 27.75, "His method: See. Decide. Attack. Break."],
  [28.19, 31.1, "He held his fire until he was twenty metres away."],
  [31.56, 36.35, "Then, in 1945, the Americans handed him over to the Soviet Union."],
  [36.71, 38.49, "Ten years in prison camps."],
  [38.86, 42.78, "And after the war, a famous biography built a legend around him."],
  [43.15, 45.43, "Historians still question parts of it."],
  [45.8, 48.22, "So what is real, and what is myth?"],
  [48.6, 50.4, "The full story is on the channel."],
];

// Headline (zona atas): [mulai, selesai, kicker, [teks, muncul-pada][]]
type Head = [number, number, string, [string, number][]];
const HEAD: Head[] = [
  [0, 6.0, "MARCH 1942", [["PUNISHED FOR BREAKING THE RULES", 0.05]]],
  [6.1, 9.45, "YEARS LATER, HE SAID", [["IT SAVED HIS LIFE", 8.15]]],
  [9.5, 12.9, "THAT SAME AFTERNOON", [["HIS ROOMMATE TOOK HIS FLIGHT", 10.2]]],
  [12.95, 16.45, "THE ENGINE FAILED", [["HIS ROOMMATE WAS KILLED", 14.53]]],
  [24.1, 28.1, "HIS METHOD", []],
  [28.15, 31.4, "FIRING RANGE", [["≈ 20 METRES", 29.4]]],
  [31.5, 36.5, "1945", [["HANDED TO THE SOVIET UNION", 33.57]]],
  [36.6, 38.8, "1945 – 1955", [["TEN YEARS IN PRISON CAMPS", 36.71]]],
  [38.8, 45.6, "AFTER THE WAR", [["A LEGEND BUILT BY A BOOK", 39.99]]],
];

// Klip adegan 3D (di-render ulang dari long-form, ilustrasi bergaya)
const CLIPS: { id: string; from: number; to: number; pos: number }[] = [
  { id: "teaser", from: 0, to: 9.45, pos: 0.42 },
  { id: "stays", from: 9.5, to: 12.9, pos: 0.4 },
  { id: "flyby", from: 16.5, to: 24.1, pos: 0.5 },
  { id: "closeup", from: 24.1, to: 31.4, pos: 0.42 },
];

const WIN = { y: 520, h: 930 };

const Headline: React.FC<{ t: number }> = ({ t }) => (
  <>
    {HEAD.map(([a, b, kick, lines], i) => {
      const o = fade(t, a, b, 0.25);
      if (o <= 0) return null;
      return (
        <div key={i} style={{ position: "absolute", left: 60, right: 60, top: 130, height: 360, opacity: o }}>
          <div style={{ fontFamily: F.type, fontSize: 40, letterSpacing: 8, color: "#ff7a63", transform: `translateY(${(1 - rv(t, a)) * 16}px)`, opacity: rv(t, a) }}>{kick}</div>
          {lines.map(([txt, at], k) => (
            <div key={k} style={{ fontFamily: F.ui, fontWeight: 700, fontSize: txt.length > 24 ? 100 : 124, lineHeight: 0.98, color: C.chalk, marginTop: 14, opacity: rv(t, at), transform: `translateY(${(1 - rv(t, at)) * 22}px)`, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>{txt}</div>
          ))}
        </div>
      );
    })}
  </>
);

const Clip: React.FC<{ c: (typeof CLIPS)[number]; t: number }> = ({ c, t }) => {
  const o = fade(t, c.from, c.to, 0.35);
  if (o <= 0) return null;
  return (
    <Sequence from={Math.round(c.from * FPS)} durationInFrames={Math.round((c.to - c.from) * FPS) + 1} layout="none">
      <div style={{ position: "absolute", inset: 0, opacity: o }}>
        <OffthreadVideo src={staticFile(`scenes/${c.id}.mp4`)} muted style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.pos * 100}% 50%` }} />
      </div>
    </Sequence>
  );
};

// 352 besar (hitung naik 16,55 → 19,7 dtk) di zona atas
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 16.5, 24.1, 0.3);
  if (o <= 0) return null;
  const v = Math.round(352 * bz(clamp01((t - 16.7) / 2.9)));
  const sub = t < 21.3 ? "AERIAL VICTORIES" : "MORE THAN ANY OTHER FIGHTER PILOT";
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 110, height: 380, opacity: o }}>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 340, lineHeight: 0.9, color: C.chalk, letterSpacing: 2, textShadow: "0 6px 24px rgba(0,0,0,0.6)" }}>{v}</div>
      <div style={{ fontFamily: F.type, fontSize: t < 21.3 ? 44 : 38, letterSpacing: 6, color: "#ff7a63", marginTop: 6 }}>{sub}</div>
    </div>
  );
};

// SEE. DECIDE. ATTACK. BREAK. muncul satu-satu di dalam jendela
const Method: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 24.1, 28.1, 0.25);
  if (o <= 0) return null;
  const W: [string, number][] = [["SEE.", 25.05], ["DECIDE.", 25.75], ["ATTACK.", 26.55], ["BREAK.", 27.27]];
  return (
    <div style={{ position: "absolute", left: 60, top: 190, opacity: o }}>
      {W.map(([w, at], i) => (
        <div key={w} style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 96, lineHeight: 1.0, color: i === 3 ? "#ff7a63" : C.chalk, opacity: rv(t, at, 0.18), transform: `translateX(${(1 - rv(t, at, 0.18)) * -40}px)`, textShadow: "0 4px 18px rgba(0,0,0,0.65)" }}>{w}</div>
      ))}
    </div>
  );
};

const Timeline: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 31.5, 38.8, 0.3);
  if (o <= 0) return null;
  const grow = bz(clamp01((t - 36.7) / 1.7));
  const X0 = 200, X1 = 880;
  return (
    <div style={{ position: "absolute", left: 0, top: WIN.y, width: 1080, height: WIN.h, opacity: o }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 560, lineHeight: 1, color: "rgba(244,239,228,0.07)" }}>1945</div>
      <div style={{ position: "absolute", left: X0, right: 1080 - X1, top: 440, height: 8, background: "rgba(244,239,228,0.18)" }} />
      <div style={{ position: "absolute", left: X0, width: (X1 - X0) * grow, top: 440, height: 8, background: "#ff7a63" }} />
      {[["14 MAY 1945", X0], ["1955", X1]].map(([lab, x]) => (
        <div key={lab as string}>
          <div style={{ position: "absolute", left: (x as number) - 14, top: 428, width: 32, height: 32, borderRadius: 16, background: C.chalk }} />
          <div style={{ position: "absolute", left: (x as number) - 150, width: 300 + 0, top: 480, textAlign: "center", fontFamily: F.type, fontSize: 40, color: C.chalk, opacity: lab === "1955" ? clamp01((grow - 0.85) * 7) : rv(t, 32.0) }}>{lab as string}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: F.ui, fontWeight: 700, fontSize: 180, color: C.chalk, opacity: rv(t, 36.9), letterSpacing: 2 }}>10 YEARS</div>
    </div>
  );
};

const BookCard: React.FC<{ t: number }> = ({ t }) => {
  const o = fade(t, 38.8, 45.6, 0.35);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, top: WIN.y + 60, width: 900, height: 760, opacity: o, background: "linear-gradient(180deg,#e5d6b0,#cdb98a)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)", transform: `rotate(${-1.2 + (1 - rv(t, 39.2, 0.8)) * 2}deg) translateY(${(1 - rv(t, 39.2, 0.8)) * 60}px)`, padding: 60, boxSizing: "border-box" }}>
      <div style={{ fontFamily: F.type, fontSize: 32, letterSpacing: 6, color: C.axis }}>A BIOGRAPHY</div>
      <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 108, lineHeight: 0.98, color: C.ink, marginTop: 24 }}>THE BLOND KNIGHT OF GERMANY</div>
      <div style={{ fontFamily: F.type, fontSize: 36, color: C.ink, marginTop: 26, opacity: 0.8 }}>Constable &amp; Toliver, 1970</div>
      <div style={{ height: 3, background: C.ink, opacity: 0.35, margin: "44px 0" }} />
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 64, lineHeight: 1.05, color: C.ink, opacity: rv(t, 43.15, 0.6), transform: `translateY(${(1 - rv(t, 43.15, 0.6)) * 16}px)` }}>Historians question parts of it.</div>
    </div>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const o = clamp01((t - 45.7) / 0.35);
  if (o <= 0) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 60, right: 60, top: 140, display: "flex", justifyContent: "space-between", fontFamily: F.ui, fontWeight: 700, fontSize: 170, lineHeight: 1, color: C.chalk, opacity: o, textShadow: "0 4px 18px rgba(0,0,0,0.6)" }}>
        <span style={{ opacity: rv(t, 45.85) }}>REAL?</span>
        <span style={{ opacity: rv(t, 46.85), color: "#ff7a63" }}>MYTH?</span>
      </div>
      <div style={{ position: "absolute", left: 0, top: WIN.y, width: 1080, height: WIN.h, opacity: o }}>
        <div style={{ position: "absolute", left: 60, right: 60, top: 280, opacity: rv(t, 48.6, 0.5), transform: `translateY(${(1 - rv(t, 48.6, 0.5)) * 24}px)`, border: `3px solid ${C.gold}`, padding: "44px 44px", background: "rgba(12,18,24,0.7)" }}>
          <div style={{ fontFamily: F.type, fontSize: 36, letterSpacing: 6, color: C.gold }}>FULL STORY · 8 MINUTES</div>
          <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 104, lineHeight: 1.0, color: C.chalk, marginTop: 16 }}>ON THE CHANNEL ▶</div>
        </div>
      </div>
    </>
  );
};

const Caption: React.FC<{ t: number }> = ({ t }) => {
  const c = CAP.find(([a, b]) => t >= a - 0.05 && t < b + 0.15);
  if (!c) return null;
  const o = clamp01((t - c[0]) / 0.15);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1500, height: 240, display: "flex", alignItems: "flex-start", opacity: o }}>
      <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 60, lineHeight: 1.12, color: C.chalk, textShadow: "0 3px 12px rgba(0,0,0,0.8)" }}>{c[2]}</div>
    </div>
  );
};

export const HartmannTeaser: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const dark = fade(t, 13.0, 16.45, 0.3); // jeda hening: jendela digelapkan
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #1d2b3a 0%, #0a0f14 75%)" }}>
      <Dust tint="200,210,225" />
      {/* jendela adegan */}
      <div style={{ position: "absolute", left: 0, top: WIN.y, width: 1080, height: WIN.h, overflow: "hidden", background: "#0a0f14", boxShadow: "inset 0 0 0 2px rgba(244,239,228,0.12)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: WIN.h }}>
          {CLIPS.map((c) => <Clip key={c.id} c={c} t={t} />)}
        </div>
        <AbsoluteFill style={{ background: `rgba(6,9,12,${dark * 0.97})`, pointerEvents: "none" }} />
      </div>
      <Headline t={t} />
      <Counter t={t} />
      <Method t={t} />
      <Timeline t={t} />
      <BookCard t={t} />
      <EndCard t={t} />
      <Caption t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1800, textAlign: "center", fontFamily: F.type, fontSize: 26, letterSpacing: 5, color: "rgba(244,239,228,0.5)" }}>ILLUSTRATIVE RECONSTRUCTION · ANIMATION, NOT FOOTAGE</div>
      <Vignette amount={0.5} />
      <FilmGrain strength={0.22} />
    </AbsoluteFill>
  );
};
