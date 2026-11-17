import React, { useMemo } from "react";
import { Easing, Img, staticFile } from "remotion";
import { C, F, clamp01 } from "../kit/theme";
import { PhotoPortrait } from "../portrait/Portrait";
import { COUNTRIES } from "./mapdata";
import { makeProj, ringPath } from "./geo";
import type { CardSpec, Icon, Line } from "./types";

export const CARD_W = 1700, CARD_H = 900;
const bz = Easing.bezier(0.16, 1, 0.3, 1);
// kemunculan elemen data: fade + geser 14px (cubic-bezier 0.16,1,0.3,1)
const rv = (t: number, at: number, d = 0.55) => bz(clamp01((t - at) / d));
const SH = ["0 1px 1px rgba(40,24,6,0.18)", "0 2px 2px rgba(40,24,6,0.16)", "0 4px 4px rgba(40,24,6,0.15)", "0 8px 8px rgba(40,24,6,0.14)", "0 16px 16px rgba(40,24,6,0.13)", "0 32px 40px rgba(40,24,6,0.16)"].join(", ");
export const PANEL: React.CSSProperties = { position: "absolute", width: CARD_W, height: CARD_H, overflow: "hidden", boxSizing: "border-box", background: "linear-gradient(170deg, #f7f0de 0%, #e9dec0 100%)", boxShadow: SH };
const DARK: React.CSSProperties = { background: "radial-gradient(ellipse at 50% 45%, #1d2b3a 0%, #0a0f14 72%)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" };
const fmt = (v: number, comma?: boolean) => (comma ? v.toLocaleString("en-US") : String(v));

const Kicker: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <div style={{ fontFamily: F.type, fontSize: 34, letterSpacing: 6, color: dark ? "#ff7a63" : C.axis }}>{children}</div>
);

const LineRow: React.FC<{ l: Line; t: number; dark?: boolean; size?: number }> = ({ l, t, dark, size = 58 }) => {
  const o = rv(t, l.at);
  return (
    <div style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)`, display: "flex", alignItems: "baseline", gap: 18, marginTop: 20 }}>
      {l.tag && <span style={{ fontFamily: F.type, fontSize: 26, letterSpacing: 3, color: dark ? C.gold : C.axis, border: `2px solid ${dark ? C.gold : C.axis}`, padding: "2px 10px" }}>{l.tag}</span>}
      <span style={{ fontFamily: F.ui, fontWeight: l.hi ? 700 : 600, fontSize: l.hi ? size + 14 : size, color: dark ? (l.hi ? "#fff" : "#d9d2c0") : l.hi ? C.ink : "#4a3d22", lineHeight: 1.12 }}>{l.t}</span>
    </div>
  );
};

// ---------------------------------------------------------------- peta
const MapCard: React.FC<{ c: Extract<CardSpec, { k: "map" }>; t: number }> = ({ c, t }) => {
  const { p } = useMemo(() => makeProj(c.view, CARD_W, CARD_H), [c.view]);
  const land = useMemo(() => COUNTRIES.map((k) => ({ n: k.n, d: k.r.map((r) => ringPath(r, p)).join("") })), [p]);
  const grat = useMemo(() => {
    const out: string[] = [];
    for (let lon = Math.ceil(c.view[0] / 5) * 5; lon <= c.view[2]; lon += 5) { const [x0, y0] = p(lon, c.view[1]), [x1, y1] = p(lon, c.view[3]); out.push(`M${x0.toFixed(0)} ${y0.toFixed(0)}L${x1.toFixed(0)} ${y1.toFixed(0)}`); }
    for (let lat = Math.ceil(c.view[1] / 5) * 5; lat <= c.view[3]; lat += 5) { const [x0, y0] = p(c.view[0], lat), [x1, y1] = p(c.view[2], lat); out.push(`M${x0.toFixed(0)} ${y0.toFixed(0)}L${x1.toFixed(0)} ${y1.toFixed(0)}`); }
    return out.join("");
  }, [p, c.view]);
  const tint = (n: string) => c.tint?.find((x) => x.name === n)?.color;
  return (
    <div style={{ ...PANEL, background: "#a9b8b2" }}>
      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0 }}>
        <rect width={CARD_W} height={CARD_H} fill="#a9b8b2" />
        <path d={grat} stroke="#ffffff" strokeOpacity={0.28} strokeWidth={1.2} fill="none" />
        {land.map((k) => <path key={k.n} d={k.d} fill={tint(k.n) ?? "#e8dcc0"} stroke="#6a5a3c" strokeOpacity={0.55} strokeWidth={1.4} strokeLinejoin="round" />)}
        {(c.routes ?? []).map((r, i) => {
          const pts = r.pts.map(([lo, la]) => p(lo, la));
          const d = "M" + pts.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join("L");
          const pr = bz(clamp01((t - r.at) / Math.max(0.1, r.end - r.at)));
          return <path key={i} d={d} fill="none" stroke={r.color ?? C.axis} strokeWidth={6} strokeLinecap="round" strokeDasharray={r.dash ? "16 14" : "1 1"} pathLength={r.dash ? undefined : 1} strokeDashoffset={r.dash ? 0 : 1 - pr} opacity={r.dash ? pr : 1} />;
        })}
        {c.markers.map((m, i) => {
          const [x, y] = p(m.lon, m.lat); const o = rv(t, m.at, 0.5);
          const bx = x + (m.dx ?? 26), by = y + (m.dy ?? -70);
          return (
            <g key={i} opacity={o}>
              <circle cx={x} cy={y} r={m.primary ? 15 + (1 - o) * 30 : 11} fill={m.primary ? C.axis : C.ink} stroke="#f7f0de" strokeWidth={4} />
              <rect x={bx} y={by} width={m.label.length * 21 + 36} height={56} fill="rgba(247,240,222,0.95)" stroke={C.ink} strokeWidth={2} />
              <text x={bx + 18} y={by + 39} fontFamily={F.ui} fontWeight={700} fontSize={34} fill={C.ink} letterSpacing={1}>{m.label}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 36, padding: "10px 26px 14px", background: "rgba(247,240,222,0.95)", border: `2px solid ${C.ink}`, boxShadow: SH }}>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 64, color: C.ink, lineHeight: 1.0 }}>{c.title}</div>
        {c.note && <div style={{ fontFamily: F.type, fontSize: 20, color: "#6a5a3c", marginTop: 4 }}>{c.note}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- siluet
const LEN: Record<Icon, number> = { bf109: 8.9, fw190: 8.95, me262: 10.6, p51: 9.8, ju87: 11.1, yak9: 8.5 };
const ASP: Record<Icon, number> = { bf109: 700 / 206, fw190: 672 / 231, me262: 710 / 221, p51: 322 / 100, ju87: 898 / 301, yak9: 709 / 208 };
export const Sil: React.FC<{ icon: Icon; width: number; flip?: boolean }> = ({ icon, width, flip }) => {
  const w = (width * LEN[icon]) / 11.1;
  return <Img src={staticFile(`silhouettes/${icon}.png`)} style={{ width: w, height: w / ASP[icon], transform: flip ? "scaleX(-1)" : undefined }} />;
};

// ---------------------------------------------------------------- kartu kustom
const TulipCard: React.FC<{ t: number }> = ({ t }) => {
  const o = rv(t, 8.3);
  return (
    <div style={{ ...PANEL, background: "linear-gradient(170deg, #11202f, #0a1520)" }}>
      <div style={{ position: "absolute", left: 60, top: 50 }}><Kicker dark>MESSERSCHMITT Bf 109</Kicker><div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 80, color: "#fff", lineHeight: 1.0, marginTop: 6 }}>The black tulip</div></div>
      <div style={{ position: "absolute", left: 60, top: 330, filter: "invert(1) brightness(0.92)" }}><Sil icon="bf109" width={1580} /></div>
      {/* tulip diagram di kap mesin (hidung di kiri) */}
      <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0, opacity: o }}>
        <g transform="translate(235 640) rotate(-12) scale(1.15)">
          <path d="M0 -150 C26 -112 42 -72 32 -22 C16 -4 -16 -4 -32 -22 C-42 -72 -26 -112 0 -150 Z" fill="#05080c" stroke="#ffd36e" strokeWidth={5} strokeLinejoin="round" />
          <path d="M-32 -22 C-58 -62 -80 -112 -68 -140 C-42 -118 -22 -82 -16 -32 Z" fill="#05080c" stroke="#ffd36e" strokeWidth={5} strokeLinejoin="round" />
          <path d="M32 -22 C58 -62 80 -112 68 -140 C42 -118 22 -82 16 -32 Z" fill="#05080c" stroke="#ffd36e" strokeWidth={5} strokeLinejoin="round" />
          <path d="M0 -4 L0 44" stroke="#ffd36e" strokeWidth={6} strokeLinecap="round" />
        </g>
        <path d="M300 560 L420 440 L760 440" fill="none" stroke="#ffd36e" strokeWidth={4} />
        <circle cx={300} cy={560} r={8} fill="#ffd36e" />
        <text x={440} y={424} fontFamily={F.ui} fontWeight={700} fontSize={60} fill="#ffd36e" letterSpacing={3}>BLACK TULIP</text>
        <text x={440} y={490} fontFamily={F.type} fontSize={30} fill="#d9e6f2" letterSpacing={2}>on the engine cowling</text>
      </svg>
      <div style={{ position: "absolute", left: 60, bottom: 60, opacity: rv(t, 21.5), transform: `translateY(${(1 - rv(t, 21.5)) * 14}px)` }}>
        <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 96, color: "#fff", lineHeight: 1.0 }}>5 OR 6 TIMES</div>
        <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 40, color: "#a9cdef" }}>flown with the tulip, in reality</div>
      </div>
    </div>
  );
};

const GoebelCard: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ ...PANEL, background: "linear-gradient(180deg, #b8c9d6 0%, #e4dcc4 100%)" }}>
    <div style={{ position: "absolute", left: 80, top: 40 }}><Kicker>JUNE 1944 · ROMANIA</Kicker></div>
    <div style={{ position: "absolute", left: 120, top: 120, opacity: rv(t, 10.6) }}><Img src={staticFile("silhouettes/parachute.png")} style={{ height: 520 }} /></div>
    <div style={{ position: "absolute", left: 640, top: 250, opacity: rv(t, 13.3) }}><Sil icon="p51" width={900} /></div>
    <svg width={CARD_W} height={CARD_H} style={{ position: "absolute", inset: 0, opacity: rv(t, 19.7) }}>
      <path d="M1500 330 C1200 330 900 330 640 360" fill="none" stroke={C.axis} strokeWidth={5} strokeDasharray="16 14" />
      <circle cx={640} cy={360} r={9} fill={C.axis} />
    </svg>
    <div style={{ position: "absolute", left: 80, right: 80, bottom: 56 }}>
      <LineRow l={{ t: "Hartmann bails out, out of fuel and ammunition", at: 10.5 }} t={t} size={46} />
      <LineRow l={{ t: "Lt. Robert J. Goebel · P-51B · 31st Fighter Group", at: 13.4, hi: true }} t={t} size={46} />
      <LineRow l={{ t: "A camera pass to record the bailout. He banks away, and waves.", at: 19.7 }} t={t} size={46} />
    </div>
  </div>
);

const StepsCard: React.FC<{ t: number }> = ({ t }) => {
  const S = [{ w: "SEE", at: 10.5 }, { w: "DECIDE", at: 11.5 }, { w: "ATTACK", at: 12.5 }, { w: "BREAK", at: 13.6 }];
  return (
    <div style={{ ...PANEL, ...DARK }}>
      <div style={{ position: "absolute", left: 80, top: 70 }}><Kicker dark>HARTMANN'S MOTTO</Kicker></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "flex", gap: 24, justifyContent: "center" }}>
        {S.map((s, i) => {
          const o = rv(t, s.at, 0.5);
          return (
            <div key={s.w} style={{ width: 380, height: 360, border: `4px solid ${C.gold}`, background: "rgba(200,150,43,0.10)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
              <div style={{ fontFamily: F.type, fontSize: 40, color: C.gold }}>{i + 1}</div>
              <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 92, color: "#fff", letterSpacing: 4 }}>{s.w}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- render kartu
export const CardBody: React.FC<{ c: CardSpec; t: number }> = ({ c, t }) => {
  switch (c.k) {
    case "counter": {
      const p = bz(clamp01((t - c.at) / Math.max(0.1, c.end - c.at)));
      const v = Math.round(c.from + (c.to - c.from) * p);
      return (
        <div style={{ ...PANEL, ...(c.dark ? DARK : {}) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center" }}>{c.kicker && <Kicker dark={c.dark}>{c.kicker}</Kicker>}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 420, lineHeight: 1, color: c.dark ? "#fff" : C.ink, letterSpacing: 4, textShadow: c.dark ? "0 10px 40px rgba(0,0,0,0.7)" : undefined }}>{fmt(v, c.fmt === "comma")}<span style={{ fontSize: 150 }}>{c.unit ?? ""}</span></div>
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 72, letterSpacing: 10, color: c.dark ? "#ff7a63" : C.axis }}>{c.label}</div>
          </div>
          <div style={{ position: "absolute", left: 120, right: 120, bottom: 60 }}>{(c.lines ?? []).map((l, i) => <LineRow key={i} l={l} t={t} dark={c.dark} size={46} />)}</div>
        </div>
      );
    }
    case "text":
      return (
        <div style={{ ...PANEL, ...(c.dark ? DARK : {}) }}>
          <div style={{ position: "absolute", left: 110, right: 110, top: 100 }}>
            {c.kicker && <Kicker dark={c.dark}>{c.kicker}</Kicker>}
            {c.title && <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 110, lineHeight: 1.02, color: c.dark ? "#fff" : C.ink, marginTop: 12 }}>{c.title}</div>}
            <div style={{ marginTop: 26 }}>{c.lines.map((l, i) => <LineRow key={i} l={l} t={t} dark={c.dark} size={c.big ? 78 : 62} />)}</div>
          </div>
        </div>
      );
    case "timeline":
      return (
        <div style={PANEL}>
          <div style={{ position: "absolute", left: 90, top: 60 }}>{c.kicker && <Kicker>{c.kicker}</Kicker>}</div>
          <div style={{ position: "absolute", left: 640, top: 130, bottom: 70, width: 6, background: "rgba(42,36,24,0.35)" }} />
          {c.entries.map((e, i) => {
            const o = rv(t, e.at);
            return (
              <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 130 + i * (700 / Math.max(c.entries.length, 4)), opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
                <div style={{ position: "absolute", left: 540, top: 28, width: 24, height: 24, borderRadius: 12, background: e.hi ? C.gold : C.axis, boxShadow: "0 0 0 7px #f1e8cf" }} />
                <div style={{ width: 500, textAlign: "right", fontFamily: F.ui, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1.0 }}>{e.date}</div>
                <div style={{ position: "absolute", left: 620, top: 6, width: 920, fontFamily: F.ui, fontWeight: 600, fontSize: 50, color: "#4a3d22", lineHeight: 1.12 }}>{e.text}</div>
              </div>
            );
          })}
        </div>
      );
    case "map":
      return <MapCard c={c} t={t} />;
    case "quote":
      return (
        <div style={{ ...PANEL, ...DARK }}>
          <div style={{ position: "absolute", left: 110, right: 110, top: 190, opacity: rv(t, c.at), transform: `translateY(${(1 - rv(t, c.at)) * 20}px)` }}>
            {c.kicker && <Kicker dark>{c.kicker}</Kicker>}
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 130, lineHeight: 1.06, color: "#fff", marginTop: 20 }}>“{c.text}”</div>
            {c.who && <div style={{ fontFamily: F.type, fontSize: 36, color: C.gold, marginTop: 30, letterSpacing: 3 }}>{c.who}</div>}
          </div>
        </div>
      );
    case "sil":
      return (
        <div style={PANEL}>
          <div style={{ position: "absolute", left: 100, top: 60 }}>{c.kicker && <Kicker>{c.kicker}</Kicker>}<div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 96, color: C.ink, lineHeight: 1.0, marginTop: 6 }}>{c.title}</div>{c.sub && <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 42, color: "#5a4a2c", marginTop: 6 }}>{c.sub}</div>}</div>
          <div style={{ position: "absolute", right: 90, top: 240 }}><Sil icon={c.icon} width={1100} flip={c.flip} /></div>
          <div style={{ position: "absolute", left: 100, right: 100, bottom: 50 }}>{(c.lines ?? []).map((l, i) => <LineRow key={i} l={l} t={t} size={50} />)}</div>
        </div>
      );
    case "bars":
      return (
        <div style={PANEL}>
          <div style={{ position: "absolute", left: 100, top: 60 }}><Kicker>{c.kicker}</Kicker><div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 84, color: C.ink, lineHeight: 1.0, marginTop: 6 }}>{c.title}</div></div>
          {c.rows.map((r, i) => {
            const p = bz(clamp01((t - r.at) / Math.max(0.1, r.end - r.at)));
            const v = Math.round(r.value * p);
            return (
              <div key={i} style={{ position: "absolute", left: 100, right: 100, top: 240 + i * 130, opacity: clamp01((t - r.at + 0.4) / 0.4) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 40, color: "#4a3d22" }}>{r.label}</div>
                  <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 70, lineHeight: 0.9, color: r.hi ? C.axis : C.ink }}>{v}{r.unit ?? ""}</div>
                </div>
                <div style={{ position: "relative", height: 26, background: "rgba(42,36,24,0.12)", boxShadow: "inset 0 1px 2px rgba(40,24,6,0.25)" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 * r.value * p) / c.max}%`, background: r.hi ? `linear-gradient(90deg, ${C.gold}, #e2b552)` : `linear-gradient(90deg, ${C.axis}, #c4544a)` }} />
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 100, right: 100, bottom: 40 }}>{(c.foot ?? []).map((l, i) => <LineRow key={i} l={l} t={t} size={42} />)}</div>
        </div>
      );
    case "photo":
      return (
        <div style={PANEL}>
          <div style={{ position: "absolute", left: 110, top: 100 }}><PhotoPortrait src={c.src} width={560} seed={1} start={0} duration={400} focus={[50, 40]} /></div>
          <div style={{ position: "absolute", left: 860, right: 90, top: 150 }}>
            {c.kicker && <Kicker>{c.kicker}</Kicker>}
            <div style={{ fontFamily: F.ui, fontWeight: 700, fontSize: 120, color: C.ink, lineHeight: 1.0, marginTop: 8 }}>{c.title}</div>
            {c.sub && <div style={{ fontFamily: F.ui, fontWeight: 600, fontSize: 48, color: "#5a4a2c", marginTop: 10 }}>{c.sub}</div>}
            <div style={{ marginTop: 24 }}>{(c.lines ?? []).map((l, i) => <LineRow key={i} l={l} t={t} size={52} />)}</div>
          </div>
        </div>
      );
    case "custom":
      return c.id === "tulip" ? <TulipCard t={t} /> : c.id === "goebel" ? <GoebelCard t={t} /> : <StepsCard t={t} />;
  }
};
