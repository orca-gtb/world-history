import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F as FONT, clamp01 } from "../kit/theme";
import { BridgeAndCanal, StarSky, World } from "./World";
import { Horsa } from "./Plane";

import { GL, GLIDER as GLIDER_FRAMES } from "../timing";
export const GLIDER = GLIDER_FRAMES;
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.55'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>")}")`;
const TOUCH = GL.touch; // frame sentuh tanah
const X0 = 620;
const XT = 114; // titik sentuh
const XS = 57; // berhenti ±43 m (47 yd) dari sisi timur jembatan (x = 14)
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

// jalur glider (hidung = -x). Sudut luncur melandai alami menuju titik sentuh.
const pathX = (Fr: number) => {
  if (Fr <= TOUCH) return X0 + (XT - X0) * (Fr / TOUCH);
  return XT + (XS - XT) * ease((Fr - TOUCH) / 34);
};
const pathY = (x: number, Fr: number) => {
  if (Fr > TOUCH) {
    const a = Fr - TOUCH;
    return 0.9 + 0.5 * Math.exp(-a / 5) * Math.abs(Math.sin(a * 0.5));
  }
  const t = clamp01((x - XT) / (X0 - XT));
  return 0.9 + 68 * Math.pow(t, 1.5);
};
const state = (Fr: number, dF = 0) => {
  const f = Fr + dF;
  const x = pathX(f);
  return { x, y: pathY(x, f) };
};

const Cam: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3; roll: number; fov?: number }> = ({ pos, look, roll, fov = 62 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.copy(pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(look);
  camera.rotateZ(roll);
  camera.fov = fov;
  camera.near = 0.05;
  camera.far = 2600;
  camera.setViewOffset(1080, 1920, 0, 330, 1080, 1920);
  camera.updateProjectionMatrix();
  return null;
};

// partikel debu saat benturan
const Dust: React.FC<{ origin: THREE.Vector3; age: number }> = ({ origin, age }) => {
  if (age < 0 || age > 70) return null;
  const k = age / 70;
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = random("d" + i) * Math.PI * 2;
        const sp = 1.4 + random("ds" + i) * 2.6;
        const r = (0.9 + random("dr" + i) * 1.4) * (1 + age * 0.03);
        return (
          <mesh key={i} position={[origin.x - 14 + Math.cos(a) * sp * age * 0.2 - age * 0.45, origin.y + 0.4 + Math.abs(Math.sin(a)) * sp * age * 0.06, origin.z + (Math.sin(a) >= 0 ? 1 : -1) * (5 + Math.abs(Math.sin(a)) * sp * age * 0.14)]} scale={r}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#8a7d68" transparent opacity={(1 - k) * 0.2} depthWrite={false} roughness={1} />
          </mesh>
        );
      })}
    </>
  );
};

const Scene: React.FC<{ Fr: number }> = ({ Fr }) => {
  const t = Fr / 30;
  const { x, y } = state(Fr);
  // kemiringan: turun saat meluncur, flare saat mendekat, hentakan saat sentuh
  const a = state(Fr, 6);
  const b = state(Fr, -6);
  const slope = Math.atan2(b.y - a.y, b.x - a.x); // sudut turun
  const flare = Fr > 160 && Fr <= TOUCH ? Math.sin(clamp01((Fr - 160) / 40) * Math.PI) * 0.06 : 0;
  const sway = Math.sin(t * 1.6) * 0.8 * (Fr < TOUCH ? 1 : 0.2);
  const sway2 = Math.sin(t * 2.3 + 1) * 0.35;
  const since = Fr - TOUCH;
  const shake = since >= 0 && since < 40 ? 1.1 * Math.exp(-since / 9) : 0;
  const jolt = since >= 0 && since < 16 ? Math.exp(-since / 4) : 0;
  const cam = new THREE.Vector3(x - 3.2 + (since >= 0 ? -0.8 * Math.min(1, since / 6) * Math.exp(-since / 14) : 0), y + 1.55 - jolt * 0.35 + Math.sin(Fr * 2.7) * shake * 0.09, sway * 0.12 + Math.cos(Fr * 3.1) * shake * 0.08);
  const pitch = Fr > TOUCH ? -0.04 * Math.exp(-since / 8) : slope - flare;
  const ext = Fr >= GL.extIn && Fr < GL.extOut;
  const look = new THREE.Vector3(cam.x - Math.cos(pitch) * 60, cam.y - Math.sin(pitch) * 60 + (Fr > TOUCH ? -jolt * 3 : 0), cam.z + sway * 0.5);

  const others = [
    { dz: 34, dF: 26 },
    { dz: -46, dF: 14 },
    { dz: 74, dF: 40 },
    { dz: -92, dF: 6 },
    { dz: 118, dF: 30 },
  ];
  return (
    <>
      <color attach="background" args={["#14203a"]} />
      <fog attach="fog" args={["#1b2b45", 90, 1500]} />
      <hemisphereLight args={["#7f9fd8", "#2c3a54", 3.1]} />
      <directionalLight position={[-70, 90, 40]} intensity={1.7} color="#b4cbff" />
      <directionalLight position={[60, 30, -80]} intensity={0.8} color="#8ea6d8" />
      <StarSky />
      <World />
      <BridgeAndCanal frame={Fr} />
      {others.map((o, i) => {
        const s = state(Fr, o.dF);
        const xx = s.x - 4;
        const rollO = Math.sin(t * 1.2 + i) * 0.06 + (Fr > TOUCH + o.dF ? 0 : 0);
        return <Horsa key={i} pos={[xx, s.y + 0.15, o.dz]} yaw={0} pitch={Fr < TOUCH - o.dF ? -0.07 : 0} roll={rollO} />;
      })}
      <Dust origin={new THREE.Vector3(x, y, 0)} age={since} />
      <Cam pos={ext ? new THREE.Vector3(x + 38 - (Fr - GL.extIn) * 0.35, 3.2, -118) : cam} look={ext ? new THREE.Vector3(x - 34 - (Fr - GL.extIn) * 0.2, y + 3 - Math.min(10, (Fr - GL.extIn) * 0.12), -4) : look} fov={ext ? 52 : 62} roll={sway2 * 0.03 + (since >= 0 ? Math.sin(Fr * 2.1) * shake * 0.05 : 0)} />
    </>
  );
};

// kerangka kokpit Horsa (overlay 2D): kaca depan, tiang, panel instrumen berpendar redup, tuas kemudi.
const Cockpit: React.FC<{ Fr: number }> = ({ Fr }) => {
  const t = Fr / 30;
  const since = Fr - TOUCH;
  const bump = since >= 0 && since < 40 ? Math.sin(since * 2.4) * 16 * Math.exp(-since / 10) : 0;
  const sx = Math.sin(t * 1.6) * 6 + (since >= 0 ? bump * 0.6 : 0);
  const sy = Math.sin(t * 2.2 + 1) * 4 + bump;
  const glow = 0.75 + 0.25 * Math.sin(t * 5);
  const dial = (cx: number, cy: number, r: number, ang: number, i: number) => (
    <g key={i}>
      <circle cx={cx} cy={cy} r={r} fill="#07090c" stroke="#3a3f46" strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r - 7} fill="none" stroke="#ffb15a" strokeWidth={1.5} opacity={0.35 * glow} strokeDasharray="3 8" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(ang) * (r - 12)} y2={cy + Math.sin(ang) * (r - 12)} stroke="#ffb15a" strokeWidth={3} opacity={0.9 * glow} />
      <circle cx={cx} cy={cy} r={4} fill="#ffb15a" opacity={glow} />
    </g>
  );
  const colAx = Math.sin(t * 1.3) * 14 + (since >= 0 ? bump * 0.5 : 0);
  const cracks = since > 6 ? clamp01((since - 6) / 8) : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${sx} ${sy})`}>
        {/* bingkai kaca depan */}
        <path d="M-60 -60 H1140 V330 C900 250 700 215 540 215 C380 215 180 250 -60 330 Z" fill="#06080b" />
        <path d="M-60 330 C180 250 380 215 540 215 C700 215 900 250 1140 330" fill="none" stroke="#2a3342" strokeWidth={10} />
        <path d="M110 760 C70 560 30 430 -60 330 M970 760 C1010 560 1050 430 1140 330 M514 215 L500 1100 M566 215 L580 1100" fill="none" stroke="#33405a" strokeWidth={4} opacity={0.8} />
        {/* pilar kiri-kanan + tengah */}
        <path d="M-60 330 L-60 2000 H150 L120 1140 L110 760 C70 560 30 430 -60 330 Z" fill="#06080b" />
        <path d="M1140 330 L1140 2000 H930 L960 1140 L970 760 C1010 560 1050 430 1140 330 Z" fill="#06080b" />
        <path d="M514 215 H566 L580 1100 H500 Z" fill="#06080b" />
        <path d="M-60 520 C200 470 420 455 514 453 M566 453 C660 455 880 470 1140 520" fill="none" stroke="#06080b" strokeWidth={14} />
        {/* panel instrumen */}
        <path d="M-60 1180 C200 1120 420 1100 540 1100 C660 1100 880 1120 1140 1180 V2000 H-60 Z" fill="#090c10" />
        <path d="M-60 1180 C200 1120 420 1100 540 1100 C660 1100 880 1120 1140 1180" fill="none" stroke="#1b2129" strokeWidth={8} />
        {dial(300, 1330, 82, -2.0 + Math.sin(t * 1.1) * 0.2 - Math.min(0.9, since > 0 ? 0.9 : 0), 0)}
        {dial(540, 1300, 70, -1.2 + Math.sin(t * 0.9 + 1) * 0.15, 1)}
        {dial(780, 1330, 82, -0.6 + Math.sin(t * 1.4) * 0.25, 2)}
        <rect x={160} y={1480} width={760} height={6} fill="#ffb15a" opacity={0.15 * glow} />
        {/* tuas kemudi */}
        <g transform={`translate(${colAx} 0)`}>
          <rect x={516} y={1500} width={48} height={460} fill="#0b0e12" />
          <path d="M330 1520 H750 L720 1590 H360 Z" fill="#0b0e12" stroke="#222a33" strokeWidth={4} />
          <rect x={300} y={1500} width={60} height={110} rx={20} fill="#10151b" stroke="#222a33" strokeWidth={4} />
          <path d="M286 1596 C280 1530 330 1490 380 1510 L372 1580 Z" fill="#1c222b" stroke="#3a4558" strokeWidth={3} />
          <path d="M794 1596 C800 1530 750 1490 700 1510 L708 1580 Z" fill="#1c222b" stroke="#3a4558" strokeWidth={3} />
          <rect x={720} y={1500} width={60} height={110} rx={20} fill="#10151b" stroke="#222a33" strokeWidth={4} />
        </g>
      </g>
      {/* retakan kaca setelah benturan */}
      {cracks > 0 && (
        <g stroke="#cfd8e8" strokeWidth={2} fill="none" opacity={0.35 * cracks}>
          <path d="M300 420 L360 520 L330 640 L410 760 M360 520 L470 560 L520 680 M640 300 L600 400 L690 470 L720 600 M690 470 L800 440" strokeDasharray={`${1500 * cracks} 1500`} />
        </g>
      )}
    </svg>
  );
};

export const GliderLanding: React.FC = () => {
  const Fr = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const since = Fr - TOUCH;
  const fadeIn = 1 - clamp01(Fr / 26);
  const fadeOut = clamp01((Fr - (GLIDER - 40)) / 40);
  const blink = [GL.extIn, GL.extOut].reduce((m, c) => Math.max(m, 1 - clamp01(Math.abs(Fr - c) / 3)), 0) * 0.9;
  const extOp = clamp01((Fr - (GL.extIn + 4)) / 14) * (1 - clamp01((Fr - (GL.extOut - 20)) / 14));
  const flash = since >= 0 && since < 5 ? (1 - since / 5) * 0.22 : 0;
  const cap1 = clamp01((Fr - 14) / 18) * (1 - clamp01((Fr - (GL.extIn - 12)) / 10));
  const cap2 = clamp01((Fr - 236) / 22);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 62, position: [600, 70, 0], near: 0.05, far: 2600 }} gl={{ antialias: true }}>
        <Scene Fr={Fr} />
      </ThreeCanvas>
      {!(Fr >= GL.extIn && Fr < GL.extOut) && <Cockpit Fr={Fr} />}
      {/* kilau kaca + grain film */}
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(180,210,255,0) 30%, rgba(180,210,255,0.08) 38%, rgba(180,210,255,0) 46%, rgba(180,210,255,0.05) 70%, rgba(180,210,255,0) 78%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, backgroundPosition: `${(Fr * 37) % 420}px ${(Fr * 53) % 420}px`, opacity: 0.22, mixBlendMode: "overlay" }} />
      {/* vinyet */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "#ffd9a0", opacity: flash, mixBlendMode: "screen" }} />
      {/* keterangan */}
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 150, opacity: cap1, transform: `translateY(${(1 - cap1) * 20}px)`, padding: "20px 26px", background: "rgba(6,8,12,0.78)", borderLeft: `8px solid ${C.gold}` }}>
        <div style={{ fontFamily: FONT.type, fontSize: 28, color: C.gold, letterSpacing: 3 }}>NIGHT OF 5 JUNE</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 42, color: "#f0ece2", lineHeight: 1.12, marginTop: 6 }}>No engines. No second chance. Just a dark field and a bridge.</div>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 150, opacity: cap2, transform: `translateY(${(1 - cap2) * 20}px)`, padding: "20px 26px", background: "rgba(6,8,12,0.82)", borderLeft: `8px solid ${C.axis}` }}>
        <div style={{ fontFamily: FONT.type, fontSize: 30, color: "#ff8a75", letterSpacing: 3 }}>00:16</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 44, color: "#f0ece2", lineHeight: 1.12, marginTop: 6 }}>Five of six gliders touch down within 47 yards of their targets.</div>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, bottom: 150, opacity: extOp, padding: "20px 26px", background: "rgba(6,8,12,0.78)", borderLeft: `8px solid ${C.gold}` }}>
        <div style={{ fontFamily: FONT.type, fontSize: 28, color: C.gold, letterSpacing: 3 }}>SIX HORSA GLIDERS</div>
        <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 42, color: "#f0ece2", lineHeight: 1.12, marginTop: 6 }}>Cut loose from their tugs, gliding in toward two bridges.</div>
      </div>
      <div style={{ position: "absolute", top: 44, right: 44, fontFamily: FONT.ui, fontWeight: 600, fontSize: 22, letterSpacing: 2, color: "rgba(230,224,206,0.6)" }}>ILLUSTRATIVE RECONSTRUCTION</div>
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(fadeIn, fadeOut, blink) }} />
    </AbsoluteFill>
  );
};
