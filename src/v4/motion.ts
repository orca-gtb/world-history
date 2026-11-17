import gsap from "gsap";
import { Easing } from "remotion";

// ============================================================================
// MOTION v4 — semua gerak dikendalikan GSAP Timeline yang di-"seek" per frame.
// Remotion merender frame acak & paralel, jadi timeline dibuat paused lalu
// tl.seek(frame / FPS). Tidak ada CSS transition, tidak ada requestAnimationFrame.
// ============================================================================
export const FPS = 30;
const sec = (f: number) => f / FPS;

// Angka & bar: cubic-bezier(0.16, 1, 0.3, 1) — kurva SAMA dipakai scripts/soundtrack_v4.py.
export const bezierOut = Easing.bezier(0.16, 1, 0.3, 1);

// Kamera: power4.out + overshoot ±3%.
// f(t) = 1 + 2u^4 - 3u^5, u = 1 - t  ->  f(0)=0, f(1)=1, start lebih cepat dari power4.out,
// puncak 1.032 di t≈0.47 lalu mengendap. (power4.out bawaan GSAP tidak punya overshoot.)
export const power4OutOvershoot = (t: number) => {
  const u = 1 - t;
  return 1 + 2 * u ** 4 - 3 * u ** 5;
};

export type Cam = { x: number; y: number; s: number; r: number };
export type Shot = { at: number; d: number; x: number; y: number; s: number; r?: number; via?: number };

// Kamera: daftar shot (frame). Tiap shot = satu gerakan dari shot sebelumnya.
// `via` = zoom-out di tengah perjalanan (whip/crane antar dokumen).
export const buildCamera = (shots: Shot[]) => {
  const first = shots[0];
  const cam: Cam = { x: first.x, y: first.y, s: first.s, r: first.r ?? 0 };
  const tl = gsap.timeline({ paused: true });
  let prev = first;
  for (const sh of shots.slice(1)) {
    const at = sec(sh.at), d = sec(sh.d);
    tl.fromTo(cam, { x: prev.x, y: prev.y, r: prev.r ?? 0 }, { x: sh.x, y: sh.y, r: sh.r ?? 0, duration: d, ease: power4OutOvershoot, immediateRender: false }, at);
    if (sh.via) {
      tl.fromTo(cam, { s: prev.s }, { s: sh.via, duration: d * 0.42, ease: "power2.inOut", immediateRender: false }, at);
      tl.fromTo(cam, { s: sh.via }, { s: sh.s, duration: d * 0.58, ease: power4OutOvershoot, immediateRender: false }, at + d * 0.42);
    } else {
      tl.fromTo(cam, { s: prev.s }, { s: sh.s, duration: d, ease: power4OutOvershoot, immediateRender: false }, at);
    }
    prev = sh;
  }
  return { tl, cam };
};

// Handheld mikro + napas kertas: GSAP yoyo (sine.inOut), tetap timeline yang di-seek.
export const buildAmbient = (totalFrames: number) => {
  const amb = { hx: 0, hy: 0, hr: 0, paper: 1 };
  const tl = gsap.timeline({ paused: true });
  const T = sec(totalFrames) + 2;
  // kertas latar bernafas: scale 1 -> 1.02 -> 1, satu napas = 8 detik
  tl.fromTo(amb, { paper: 1 }, { paper: 1.02, duration: 4, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(T / 4), immediateRender: false }, 0);
  tl.fromTo(amb, { hx: -5 }, { hx: 5, duration: 3.3, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(T / 3.3), immediateRender: false }, 0);
  tl.fromTo(amb, { hy: 4 }, { hy: -4, duration: 4.1, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(T / 4.1), immediateRender: false }, 0);
  tl.fromTo(amb, { hr: -0.12 }, { hr: 0.12, duration: 5.2, ease: "sine.inOut", yoyo: true, repeat: Math.ceil(T / 5.2), immediateRender: false }, 0);
  return { tl, amb };
};

// Nilai data (counter, bar, fade) — semua cubic-bezier(0.16,1,0.3,1).
export type Val = { key: string; from: number; to: number; at: number; end: number };
export const buildValues = (vals: Val[]) => {
  const v: Record<string, number> = {};
  const tl = gsap.timeline({ paused: true });
  for (const it of vals) {
    v[it.key] = it.from;
    tl.fromTo(v, { [it.key]: it.from }, { [it.key]: it.to, duration: sec(it.end - it.at), ease: bezierOut, immediateRender: false }, sec(it.at));
  }
  return { tl, v };
};
