import React from "react";
import { Easing, Img, staticFile } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import type { Icon, Line } from "./types";

// Adegan animasi 2D (siluet pesawat bergerak di langit berparalaks). Waktu `t` = detik sejak suara bab mulai.
// Gerak pesawat = keyframe; semua angka/HUD pakai cubic-bezier(0.16,1,0.3,1). Bentuk pesawat dari public/silhouettes.
const W = 1700, H = 900;
const bz = Easing.bezier(0.16, 1, 0.3, 1);
const LEN: Record<Icon, number> = { bf109: 8.9, fw190: 8.95, me262: 10.6, p51: 9.8, ju87: 11.1, yak9: 8.5 };
const ASP: Record<Icon, number> = { bf109: 700 / 206, fw190: 672 / 231, me262: 710 / 221, p51: 322 / 100, ju87: 898 / 301, yak9: 709 / 208 };

export const SCENE_PANEL: React.CSSProperties = { position: "absolute", width: W, height: H, overflow: "hidden", boxSizing: "border-box", boxShadow: "0 1px 1px rgba(40,24,6,0.18), 0 4px 4px rgba(40,24,6,0.15), 0 16px 16px rgba(40,24,6,0.13), 0 32px 40px rgba(40,24,6,0.16)" };

type Key = { t: number; x: number; y: number; r?: number; s?: number };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const sk = (t: number, k: Key[]) => {
  const f = k[0];
  if (t <= f.t) return { x: f.x, y: f.y, r: f.r ?? 0, s: f.s ?? 1 };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (t <= b.t) { const u = (t - a.t) / (b.t - a.t); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), r: lerp(a.r ?? 0, b.r ?? 0, u), s: lerp(a.s ?? 1, b.s ?? 1, u) }; }
  }
  const l = k[k.length - 1];
  return { x: l.x, y: l.y, r: l.r ?? 0, s: l.s ?? 1 };
};
const rv = (t: number, at: number, d = 0.5) => bz(clamp01((t - at) / d));

const Plane: React.FC<{ icon: Icon; x: number; y: number; r?: number; w: number; dir: 1 | -1; opacity?: number }> = ({ icon, x, y, r = 0, w, dir, opacity = 1 }) => {
  const h = w / ASP[icon];
  return <Img src={staticFile(`silhouettes/${icon}.png`)} style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity, transform: `rotate(${dir > 0 ? -r : r}deg) scaleX(${dir > 0 ? -1 : 1})`, transformOrigin: "50% 50%" }} />;
};

const Tag: React.FC<{ x: number; y: number; text: string; color?: string; o?: number }> = ({ x, y, text, color = "#ffd36e", o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, padding: "2px 14px", background: "rgba(10,16,22,0.82)", border: `2px solid ${color}`, fontFamily: F.ui, fontWeight: 700, fontSize: 28, letterSpacing: 2, color, whiteSpace: "nowrap" }}>{text}</div>
);

const Hud: React.FC<{ x: number; y: number; title: string; value: string; sub?: string; color?: string }> = ({ x, y, title, value, sub, color = C.gold }) => (
  <div style={{ position: "absolute", left: x, top: y, minWidth: 330, padding: "12px 22px", background: "rgba(10,16,22,0.86)", border: `2px solid ${color}` }}>
    <div style={{ fontFamily: F.type, fontSize: 22, letterSpacing: 4, color }}>{title}</div>
    <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 84, lineHeight: 1.0, color: "#fff" }}>{value}</div>
    {sub && <div style={{ fontFamily: F.type, fontSize: 20, color: "#a9cdef", letterSpacing: 2 }}>{sub}</div>}
  </div>
);

const CLOUDS = Array.from({ length: 9 }).map((_, i) => ({ x0: (i * 271) % 2100, y: ((i * 137) % 480) + 30, w: 340 + ((i * 53) % 260), sp: 18 + (i % 4) * 14, o: 0.38 + (i % 3) * 0.12 }));
const Sky: React.FC<{ t: number; ground?: number; top?: string; bottom?: string }> = ({ t, ground = 0, top = "#6f8fa8", bottom = "#e6dcc0" }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${top} 0%, ${bottom} 78%)` }}>
    {CLOUDS.map((c, i) => {
      const x = ((((c.x0 - t * c.sp) % (W + 700)) + (W + 700)) % (W + 700)) - 350;
      return <div key={i} style={{ position: "absolute", left: x, top: c.y, width: c.w, height: c.w * 0.32, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)", opacity: c.o, filter: "blur(5px)" }} />;
    })}
    {ground > 0 && (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: ground, background: "linear-gradient(180deg, #7b8460 0%, #3e4533 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 70px, rgba(255,255,255,0.05) 70px, rgba(255,255,255,0.05) 150px)", backgroundPositionX: -t * 260 }} />
      </div>
    )}
  </div>
);

const Tracers: React.FC<{ t: number; t0: number; t1: number; a: [number, number]; b: [number, number] }> = ({ t, t0, t1, a, b }) => {
  if (t < t0 || t > t1) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {[-6, 6].map((o) => <line key={o} x1={a[0]} y1={a[1] + o} x2={b[0]} y2={b[1] + o * 0.3} stroke="#ffd36e" strokeWidth={6} strokeLinecap="round" strokeDasharray="40 220" strokeDashoffset={-((t * 3200) % 260)} style={{ filter: "drop-shadow(0 0 7px #ffb347)" }} />)}
    </svg>
  );
};

const Flash: React.FC<{ t: number; t0: number; x: number; y: number; r?: number; dur?: number }> = ({ t, t0, x, y, r = 70, dur = 0.3 }) => {
  const u = (t - t0) / dur;
  if (u < 0 || u > 1) return null;
  const s = r * (0.4 + u * 1.1);
  return <div style={{ position: "absolute", left: x - s, top: y - s, width: 2 * s, height: 2 * s, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,180,70,0.8) 40%, rgba(255,120,30,0) 72%)", opacity: 1 - u }} />;
};

const Smoke: React.FC<{ t: number; t0: number; pos: (tt: number) => { x: number; y: number }; n?: number }> = ({ t, t0, pos, n = 18 }) => {
  if (t < t0) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const tt = t - k * 0.07;
        if (tt < t0) return null;
        const p = pos(tt), r = 10 + k * 3.4;
        return <div key={k} style={{ position: "absolute", left: p.x - r, top: p.y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "radial-gradient(circle, rgba(36,32,30,0.9), rgba(36,32,30,0))", opacity: (1 - k / n) * 0.65 }} />;
      })}
    </>
  );
};

const Caps: React.FC<{ lines?: Line[]; t: number }> = ({ lines, t }) => (
  <div style={{ position: "absolute", left: 60, right: 60, bottom: 34, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    {(lines ?? []).map((l, i) => {
      const o = rv(t, l.at);
      return <div key={i} style={{ opacity: o, transform: `translateY(${(1 - o) * 12}px)`, marginTop: 8, padding: "4px 16px", background: "rgba(10,16,22,0.78)", fontFamily: F.ui, fontWeight: l.hi ? 700 : 600, fontSize: l.hi ? 56 : 48, color: l.hi ? "#fff" : "#e6ecef", lineHeight: 1.1 }}><div>{l.t}</div></div>;
    })}
  </div>
);

const Head: React.FC<{ kicker?: string; title?: string }> = ({ kicker, title }) => (
  <div style={{ position: "absolute", left: 50, top: 36 }}>
    {kicker && <div style={{ display: "inline-block", padding: "2px 14px", background: "rgba(10,16,22,0.8)", fontFamily: F.type, fontSize: 28, letterSpacing: 5, color: "#ffb08a" }}>{kicker}</div>}
    {title && <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 74, color: "#fff", textShadow: "0 3px 18px rgba(0,0,0,0.6)", lineHeight: 1.05, marginTop: 6 }}>{title}</div>}
  </div>
);

// ---------------------------------------------------------------- 1. misi tempur pertama (14 Okt 1942)
const First: React.FC<{ t: number }> = ({ t }) => {
  const bob = Math.sin(t * 1.7) * 8;
  const lead = { x: 860, y: 330 + bob, r: Math.sin(t * 1.1) * 2 };
  const hk = sk(t, [
    { t: 14.4, x: 560, y: 420 }, { t: 18.6, x: 566, y: 424 },
    { t: 19.4, x: 700, y: 470, r: -10 }, { t: 20.4, x: 980, y: 610, r: -14 }, { t: 21.4, x: 1160, y: 640, r: 0 },
    { t: 22.0, x: 1080, y: 590, r: 30 }, { t: 22.9, x: 900, y: 520, r: 20 }, { t: 23.6, x: 760, y: 600, r: -22 },
    { t: 24.9, x: 640, y: 770, r: -16 }, { t: 25.4, x: 610, y: 792, r: -3 },
  ]);
  const yak = sk(t, [{ t: 20.3, x: 1950, y: 622 }, { t: 21.4, x: 1170, y: 628 }, { t: 22.1, x: 620, y: 640 }, { t: 22.8, x: -300, y: 650 }]);
  const shake = t > 21.35 && t < 21.8 ? Math.sin(t * 90) * 9 : 0;
  const fuel = 100 * (1 - clamp01((t - 21.0) / 3.4));
  const groundH = 150 * bz(clamp01((t - 24.1) / 1.0));
  const cloudO = 0.92 * clamp01((t - 23.0) / 0.9) * (1 - clamp01((t - 24.7) / 0.8));
  const below = Array.from({ length: 5 }).map((_, i) => ({ x: 360 + i * 150 - ((t - 16.4) * 40), y: 826 + (i % 2) * 18 }));
  const bo = rv(t, 16.4) * (1 - clamp01((t - 19.2) / 0.7));
  return (
    <div style={{ ...SCENE_PANEL, filter: "sepia(0.25) saturate(0.9) contrast(1.04)" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Sky t={t} />
        {below.map((b, i) => <Plane key={i} icon="yak9" x={b.x} y={b.y} w={130} dir={1} opacity={bo * 0.85} />)}
        <Plane icon="bf109" x={lead.x} y={lead.y} r={lead.r} w={330} dir={1} />
        <Plane icon="bf109" x={hk.x} y={hk.y} r={hk.r} w={330} dir={1} />
        {t > 20.3 && t < 22.9 && <Plane icon="yak9" x={yak.x} y={yak.y} w={320} dir={-1} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, height: 230, opacity: cloudO, background: "radial-gradient(ellipse at 50% 50%, rgba(250,250,250,0.98) 0%, rgba(235,235,240,0.9) 55%, rgba(235,235,240,0) 80%)", filter: "blur(10px)" }} />
        {groundH > 0 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: groundH, background: "linear-gradient(180deg, #7b8460, #3e4533)" }} />}
        {t > 24.9 && Array.from({ length: 7 }).map((_, i) => { const u = clamp01((t - 24.9 - i * 0.04) / 1.2), r = 24 + u * 70; return <div key={i} style={{ position: "absolute", left: 600 + i * 26 - 80 + u * (i - 3) * 30, top: 770 - u * 70 - (i % 3) * 10, width: r, height: r, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,112,78,0.85), rgba(140,112,78,0))", opacity: (1 - u) * 0.9 }} />; })}
        <Tag x={lead.x - 70} y={lead.y - 130} text="ROßMANN" color="#e6ecef" o={rv(t, 14.8)} />
        <Tag x={hk.x - 80} y={hk.y - 118} text="HARTMANN" o={rv(t, 14.8) * (1 - clamp01((t - 24.9) / 0.5))} />
        <Tag x={560} y={740} text="10 ENEMY AIRCRAFT BELOW" color="#ff8a70" o={bo} />
        {t > 21.3 && t < 22.4 && <Tag x={hk.x - 150} y={hk.y - 150} text="NEAR COLLISION" color="#ff8a70" />}
      </div>
      <Head kicker="14 OCTOBER 1942" title="First combat mission" />
      <Hud x={W - 380} y={36} title="FUEL" value={`${Math.round(fuel)}%`} color={fuel < 20 ? "#ff6a50" : C.gold} />
    </div>
  );
};

// ---------------------------------------------------------------- 2. serangan jarak 20 m
const Ambush: React.FC<{ t: number }> = ({ t }) => {
  const p = bz(clamp01((t - 15.0) / 4.4));
  const pxm = 4 + 20 * p;
  const D = 200 - 180 * p;
  const yakW = LEN.yak9 * pxm, bfW = LEN.bf109 * pxm;
  const yak = sk(t, [{ t: 14.6, x: 1100, y: 470 }, { t: 19.9, x: 1100, y: 470 }, { t: 20.8, x: 1150, y: 520, r: -20 }, { t: 21.8, x: 1230, y: 690, r: -45 }, { t: 22.6, x: 1300, y: 860, r: -60 }]);
  const hBase = { x: 1100 - (D + (LEN.bf109 + LEN.yak9) / 2) * pxm, y: 470 - (16 - 8 * p) * pxm };
  const leave = sk(t, [{ t: 21.0, x: hBase.x, y: hBase.y, r: 0 }, { t: 21.7, x: hBase.x - 30, y: hBase.y - 50, r: 25 }, { t: 22.6, x: hBase.x - 150, y: hBase.y - 190, r: 40 }]);
  const h = t < 21.0 ? { x: hBase.x, y: hBase.y, r: Math.sin(t * 2) * 1.5 } : leave;
  const nose: [number, number] = [h.x + bfW / 2, h.y + 6];
  const tgt: [number, number] = [yak.x - yakW * 0.3, yak.y - 4];
  return (
    <div style={{ ...SCENE_PANEL, filter: "sepia(0.25) saturate(0.9) contrast(1.04)" }}>
      <Sky t={t * 0.8} top="#5f7f9a" />
      <Smoke t={t} t0={20.0} pos={(tt) => { const k = sk(tt, [{ t: 19.9, x: 1100, y: 470 }, { t: 20.8, x: 1150, y: 520 }, { t: 21.8, x: 1230, y: 690 }, { t: 22.6, x: 1300, y: 860 }]); return { x: k.x - 40, y: k.y }; }} />
      <Plane icon="yak9" x={yak.x} y={yak.y} r={yak.r} w={yakW} dir={1} />
      <Plane icon="bf109" x={h.x} y={h.y} r={h.r} w={bfW} dir={1} />
      <Tracers t={t} t0={19.6} t1={20.6} a={nose} b={tgt} />
      <Flash t={t} t0={19.9} x={tgt[0]} y={tgt[1]} />
      <Tag x={h.x - 70} y={h.y - 90 - 20 * p} text="HARTMANN" o={rv(t, 14.8)} />
      <Tag x={yak.x - 60} y={yak.y - 90} text="TARGET" color="#ff8a70" o={rv(t, 14.8)} />
      <Head kicker="HE HELD HIS FIRE" />
      <Hud x={W - 400} y={36} title="DISTANCE TO TARGET" value={`${Math.round(D)} m`} sub={t > 19.4 ? "TWENTY METRES — OR CLOSER" : "CLOSING IN"} />
      <Caps t={t} lines={[{ t: "A short burst at point-blank range", at: 19.6 }, { t: "Then he left", at: 21.2, hi: true }]} />
    </div>
  );
};

// ---------------------------------------------------------------- 3. Goebel melambai
const Goebel: React.FC<{ t: number }> = ({ t }) => {
  const chute = { x: 540 + Math.sin(t * 0.9) * 14, y: 300 + (t - 10) * 12 };
  const sway = Math.sin(t * 1.3) * 4;
  const p51 = sk(t, [
    { t: 10.0, x: 2100, y: 170, s: 0.4 }, { t: 13.3, x: 1950, y: 230, s: 0.5 }, { t: 16.0, x: 1500, y: 340, s: 0.65 }, { t: 18.5, x: 1150, y: 420, s: 0.85 },
    { t: 20.2, x: 880, y: 450, s: 1.0 }, { t: 21.4, x: 800, y: 455, s: 1.0 }, { t: 23.3, x: 650, y: 430, r: 14, s: 1.0 }, { t: 24.6, x: 430, y: 300, r: 28, s: 0.9 }, { t: 26.4, x: 80, y: 120, r: 36, s: 0.7 },
  ]);
  const rock = t > 24.2 && t < 25.8 ? Math.sin((t - 24.2) * 16) * 12 : 0;
  return (
    <div style={{ ...SCENE_PANEL, filter: "sepia(0.2) saturate(0.9) contrast(1.04)" }}>
      <Sky t={t * 0.7} top="#7a9db6" bottom="#efe6cc" />
      <div style={{ position: "absolute", left: chute.x - 150, top: chute.y - 200, width: 300, transform: `rotate(${sway}deg)`, transformOrigin: "50% 8%", opacity: rv(t, 10.2) }}>
        <Img src={staticFile("silhouettes/parachute.png")} style={{ width: 300 }} />
      </div>
      <Plane icon="p51" x={p51.x} y={p51.y} r={p51.r + rock} w={LEN.p51 * 46 * p51.s} dir={-1} />
      <Flash t={t} t0={21.3} x={p51.x - 190 * p51.s} y={p51.y} r={40} dur={0.25} />
      <Tag x={chute.x - 70} y={chute.y - 250} text="HARTMANN" o={rv(t, 10.4)} />
      <Tag x={p51.x - 120} y={p51.y + 70 * p51.s + 30} text="LT. GOEBEL · P-51B" color="#e6ecef" o={rv(t, 13.4)} />
      {t > 20.6 && t < 23.2 && <Tag x={p51.x - 330} y={p51.y - 130} text="CAMERA PASS" color="#a9cdef" o={rv(t, 20.6, 0.3)} />}
      <Head kicker="JUNE 1944 · ROMANIA" />
      <Caps t={t} lines={[{ t: "Hartmann bails out, out of fuel and ammunition", at: 10.5 }, { t: "Lt. Robert J. Goebel · P-51B · 31st Fighter Group", at: 13.4, hi: true }, { t: "A camera pass to record the bailout. He banks away, and waves.", at: 19.7 }]} />
    </div>
  );
};

// ---------------------------------------------------------------- 4. kemenangan terakhir, Brno, 8 Mei 1945
const Brno: React.FC<{ t: number }> = ({ t }) => {
  const bf = sk(t, [{ t: 4.7, x: 200, y: 230, r: -4, s: 0.9 }, { t: 5.4, x: 300, y: 250, r: -6, s: 0.9 }, { t: 6.4, x: 700, y: 400, r: -34, s: 1.0 }, { t: 6.95, x: 800, y: 470, r: -12, s: 1.0 }, { t: 7.9, x: 1000, y: 430, r: 24, s: 1.0 }]);
  const yak = sk(t, [{ t: 4.7, x: 980, y: 560 }, { t: 7.35, x: 1180, y: 566 }, { t: 7.9, x: 1280, y: 640, r: -30 }, { t: 8.6, x: 1380, y: 790, r: -55 }]);
  const alt = Math.round(3700 - 3700 * 0.45 * clamp01((t - 5.4) / 1.5));
  return (
    <div style={{ ...SCENE_PANEL, filter: "sepia(0.25) saturate(0.9) contrast(1.04)" }}>
      <Sky t={t * 1.2} ground={190} top="#7d9ab0" bottom="#e9dfc4" />
      <Smoke t={t} t0={7.4} pos={(tt) => { const k = sk(tt, [{ t: 7.35, x: 1180, y: 566 }, { t: 7.9, x: 1280, y: 640 }, { t: 8.6, x: 1380, y: 790 }]); return { x: k.x - 30, y: k.y }; }} />
      <Plane icon="yak9" x={yak.x} y={yak.y} r={yak.r} w={LEN.yak9 * 34} dir={1} />
      <Plane icon="bf109" x={bf.x} y={bf.y} r={bf.r} w={LEN.bf109 * 36 * bf.s} dir={1} />
      <Tracers t={t} t0={6.95} t1={7.4} a={[bf.x + 150, bf.y + 8]} b={[yak.x - 90, yak.y - 6]} />
      <Flash t={t} t0={7.3} x={yak.x - 90} y={yak.y - 6} />
      <Tag x={bf.x - 70} y={bf.y - 100} text="HARTMANN" o={rv(t, 4.9)} />
      <Tag x={yak.x - 40} y={yak.y - 100} text="YAK-9" color="#ff8a70" o={rv(t, 4.9)} />
      <Head kicker="BRNO · 8 MAY 1945" />
      <Hud x={W - 380} y={36} title="ALTITUDE" value={`${alt.toLocaleString("en-US")} m`} sub="AMBUSHED FROM 12,000 FT" />
      <Caps t={t} lines={[{ t: "A Yak-9, ambushed from above", at: 5.0 }, { t: "His 352nd, and last, victory", at: 7.2, hi: true }]} />
    </div>
  );
};

export const SceneCard: React.FC<{ id: "first" | "ambush" | "goebel" | "brno"; t: number }> = ({ id, t }) => (id === "first" ? <First t={t} /> : id === "ambush" ? <Ambush t={t} /> : id === "goebel" ? <Goebel t={t} /> : <Brno t={t} />);
