import React from "react";
import type { V } from "./rig";
// SENJATA, TOPI, PERLENGKAPAN sebagai SVG. Senjata: koordinat lokal, asal = genggaman belakang, +x ke depan, y ke bawah.
export type WClass = "rifle" | "smg" | "lmg" | "mg" | "tube" | "pistol" | "ptr";
export type WeaponDef = { id: string; name: string; cls: WClass; fore: V | null; muzzle: number; mount?: { at: number; kind: "bipod" | "tripod" }; draw: (f: string) => React.ReactNode };
const P = (d: string, f: string, extra: Record<string, unknown> = {}) => <path d={d} fill={f} {...extra} />;
const Rc = (x: number, y: number, w: number, h: number, f: string, r = 0) => <rect x={x} y={y} width={w} height={h} rx={r} fill={f} />;
export const WEAPONS: Record<string, WeaponDef> = {
  garand: { id: "garand", name: "M1 Garand", cls: "rifle", fore: [46, 1], muzzle: 88, draw: (f) => <g>{P("M-32,-3 L-32,8 L-6,6 L0,3 L24,3 L24,-4 L0,-4 L-6,-3 Z", f)}{Rc(24, -3, 64, 3, f)}{Rc(26, -6, 34, 3.4, f)}{Rc(60, -7, 3, 5, f)}{Rc(8, 3, 14, 3, f)}</g> },
  kar98k: { id: "kar98k", name: "Karabiner 98k", cls: "rifle", fore: [50, 1], muzzle: 92, draw: (f) => <g>{P("M-34,-2 L-34,8 L-24,10 L-6,6 L0,3 L26,3 L26,-4 L0,-4 Z", f)}{Rc(26, -3, 66, 2.6, f)}{Rc(26, -5, 40, 2.6, f)}<circle cx={6} cy={-6} r={2.4} fill={f} />{Rc(88, -7, 2.4, 4, f)}</g> },
  mosin: { id: "mosin", name: "Mosin–Nagant M91/30", cls: "rifle", fore: [58, 1], muzzle: 125, draw: (f) => <g>{P("M-36,-2 L-36,8 L-6,6 L0,3 L28,3 L28,-4 L0,-4 Z", f)}{Rc(28, -3, 72, 2.4, f)}{Rc(28, -5, 44, 2.4, f)}{P("M100,-3 L128,-1.6 L100,0 Z", f)}<circle cx={5} cy={-6} r={2.2} fill={f} /></g> },
  thompson: { id: "thompson", name: "Thompson M1A1", cls: "smg", fore: [34, 6], muzzle: 58, draw: (f) => <g>{P("M-26,-3 L-26,8 L-10,8 L0,4 L26,4 L26,-5 L0,-5 L-8,-3 Z", f)}{Rc(26, -4, 28, 4, f)}{Rc(54, -5, 5, 6, f)}{Rc(28, -3, 2, 2, "none")}{Rc(12, 4, 6, 21, f, 1)}{Rc(32, 4, 4, 13, f)}{Rc(2, 4, 5, 10, f)}</g> },
  mp40: { id: "mp40", name: "MP 40", cls: "smg", fore: [27, 12], muzzle: 56, draw: (f) => <g>{Rc(-16, -2, 16, 2, f)}{Rc(-16, -3, 2, 12, f)}{Rc(0, -5, 28, 7, f, 1)}{Rc(28, -4, 24, 5, f)}{Rc(52, -5, 4, 7, f)}{Rc(22, 2, 5, 24, f)}{Rc(2, 2, 5, 11, f)}</g> },
  ppsh: { id: "ppsh", name: "PPSh-41", cls: "smg", fore: [34, 2], muzzle: 52, draw: (f) => <g>{P("M-28,-2 L-28,8 L-10,8 L0,4 L10,4 L10,-4 L0,-4 Z", f)}{Rc(10, -5, 34, 8, f, 1)}{Rc(44, -5, 8, 7, f)}<circle cx={22} cy={13} r={9.5} fill={f} />{Rc(19, 3, 6, 4, f)}{Rc(2, 4, 5, 10, f)}</g> },
  bar: { id: "bar", name: "BAR M1918", cls: "lmg", fore: [50, 6], muzzle: 90, draw: (f) => <g>{P("M-32,-3 L-32,9 L-6,7 L0,3 L26,3 L26,-5 L0,-5 Z", f)}{Rc(26, -4, 62, 3.4, f)}{Rc(26, -6, 30, 3, f)}{Rc(12, 3, 5, 15, f, 1)}{Rc(88, -6, 5, 6, f)}{Rc(56, 1, 2, 12, f)}</g> },
  m1919: { id: "m1919", name: "M1919A4", cls: "mg", fore: [10, 9], muzzle: 70, mount: { at: 34, kind: "tripod" }, draw: (f) => <g>{Rc(-12, -9, 34, 14, f, 2)}{Rc(22, -7, 44, 7, f)}{Rc(66, -8, 5, 9, f)}{Rc(-6, -13, 22, 4, f)}{Rc(-10, 5, 12, 11, f)}<path d="M-4,16 q-3,10 2,14 q4,-8 3,-14" fill="none" stroke={f} strokeWidth={2.2} />{Rc(-26, -5, 14, 9, f)}</g> },
  mg42: { id: "mg42", name: "MG 42", cls: "mg", fore: [30, 8], muzzle: 80, mount: { at: 62, kind: "bipod" }, draw: (f) => <g>{Rc(-34, -5, 24, 10, f)}{Rc(-10, -8, 40, 11, f, 2)}{Rc(30, -7, 44, 9, f, 1)}{Rc(74, -8, 6, 11, f)}{Rc(-2, 3, 14, 10, f, 1)}<path d="M-2,13 q-4,8 2,12" fill="none" stroke={f} strokeWidth={2.2} />{Rc(-6, -12, 20, 4, f)}</g> },
  dp27: { id: "dp27", name: "DP-27", cls: "mg", fore: [46, 7], muzzle: 90, mount: { at: 62, kind: "bipod" }, draw: (f) => <g>{P("M-36,-3 L-36,8 L-8,7 L0,3 L30,3 L30,-6 L0,-6 Z", f)}<circle cx={16} cy={-11} r={12} fill={f} />{Rc(30, -5, 52, 5, f)}{Rc(82, -7, 8, 9, f)}{Rc(4, 3, 5, 9, f)}</g> },
  bazooka: { id: "bazooka", name: "M1 Bazooka", cls: "tube", fore: [34, 9], muzzle: 98, draw: (f) => <g>{Rc(-50, -4, 148, 8, f, 3)}{P("M-50,-8 L-42,-4 L-42,4 L-50,8 Z", f)}{Rc(26, 3, 5, 10, f)}{Rc(2, 3, 5, 9, f)}{Rc(20, -9, 4, 5, f)}</g> },
  panzerfaust: { id: "panzerfaust", name: "Panzerfaust 60", cls: "tube", fore: [14, 8], muzzle: 62, draw: (f) => <g>{Rc(-40, -3.5, 82, 7, f, 2)}<ellipse cx={54} cy={0} rx={15} ry={11} fill={f} />{P("M42,-3 L42,3 L50,6 L50,-6 Z", f)}{Rc(-2, 3, 5, 9, f)}{Rc(20, -7, 3, 4, f)}</g> },
  ptrd: { id: "ptrd", name: "PTRD-41", cls: "ptr", fore: [86, 8], muzzle: 168, mount: { at: 120, kind: "bipod" }, draw: (f) => <g>{P("M-38,-3 L-38,9 L-8,7 L0,3 L36,3 L36,-5 L0,-5 Z", f)}{Rc(36, -3, 128, 2.6, f)}{Rc(160, -6, 10, 8, f)}{Rc(6, -9, 14, 4, f)}</g> },
  pistol: { id: "pistol", name: "Pistol", cls: "pistol", fore: null, muzzle: 15, draw: (f) => <g>{Rc(0, -5, 15, 5.5, f)}{Rc(-3, 0, 6, 12, f, 1)}</g> },
};
export type HatId = "m1" | "stahlhelm" | "ssh40" | "peaked_de" | "peaked_su" | "headset_m1";
export const HATS: Record<HatId, (f: string) => React.ReactNode> = {
  m1: (f) => <g>{P("M-13,1 C-13,-10 -6,-14 1,-14 C9,-14 13,-9 13,1 L17,4 L-17,4 Z", f)}</g>,
  stahlhelm: (f) => <g>{P("M-16,9 L-12,0 C-11,-9 -5,-14 2,-14 C9,-14 12,-9 12,-2 L15,3 L9,3 L-2,3 L-8,5 L-13,10 Z", f)}</g>,
  ssh40: (f) => <g>{P("M-12,2 C-12,-10 -5,-15 1,-15 C8,-15 12,-10 12,2 L13,4 L-13,4 Z", f)}</g>,
  peaked_de: (f) => <g>{P("M-11,-2 L-9,-15 C-2,-17 5,-16 9,-14 L11,-3 Z", f)}{P("M8,-3 L21,-1 L8,1 Z", f)}</g>,
  peaked_su: (f) => <g>{P("M-11,-2 L-10,-12 L9,-12 L11,-3 Z", f)}{P("M9,-3 L20,0 L9,1 Z", f)}</g>,
  headset_m1: (f) => <g>{P("M-13,1 C-13,-10 -6,-14 1,-14 C9,-14 13,-9 13,1 L17,4 L-17,4 Z", f)}<path d="M-9,-3 C-5,-13 7,-13 10,-3" fill="none" stroke={f} strokeWidth={2.5} />{Rc(-3, -2, 7, 8, f, 2)}</g>,
};
export type GearId = "pack" | "radio_us" | "radio_de" | "radio_su" | "webbing" | "canteen" | "shovel" | "gasmask" | "skatka" | "grenades" | "binoc" | "mapcase" | "medic" | "holster" | "ammo" | "aerial_whip";
// koordinat gear: asal = pinggul, sumbu torso (atas = -y), depan = +x
export const GEAR: Record<GearId, (f: string) => React.ReactNode> = {
  pack: (f) => <g>{Rc(-26, -50, 15, 34, f, 3)}</g>,
  radio_us: (f) => <g>{Rc(-30, -62, 17, 50, f, 3)}<path d="M-24,-62 C-24,-90 -20,-110 -26,-134" fill="none" stroke={f} strokeWidth={1.8} />{Rc(-12, -34, 6, 14, f, 2)}</g>,
  radio_de: (f) => <g>{Rc(-32, -50, 22, 30, f, 2)}{Rc(-30, -20, 18, 8, f, 1)}<path d="M-20,-50 C-18,-92 -10,-120 -16,-150" fill="none" stroke={f} strokeWidth={1.6} /></g>,
  radio_su: (f) => <g>{Rc(-29, -52, 16, 30, f, 2)}<path d="M-22,-52 C-20,-82 -14,-104 -18,-130" fill="none" stroke={f} strokeWidth={1.6} /></g>,
  webbing: (f) => <g>{Rc(-13, -9, 28, 5, f)}{Rc(6, -16, 8, 11, f, 1)}{Rc(-2, -15, 7, 10, f, 1)}</g>,
  canteen: (f) => <g>{Rc(-18, -14, 9, 14, f, 3)}</g>,
  shovel: (f) => <g>{Rc(-16, -20, 3, 20, f)}{P("M-18,-4 L-10,-4 L-12,8 L-16,8 Z", f)}</g>,
  gasmask: (f) => <g>{Rc(-22, -40, 8, 26, f, 3)}</g>,
  skatka: (f) => <path d="M-11,-50 C8,-48 15,-26 7,-5" fill="none" stroke={f} strokeWidth={7} strokeLinecap="round" />,
  grenades: (f) => <g>{Rc(6, -15, 2.6, 16, f)}{Rc(4.7, -19, 5.2, 5, f)}{Rc(-1, -15, 2.6, 16, f)}{Rc(-2.3, -19, 5.2, 5, f)}</g>,
  binoc: (f) => <g>{Rc(7, -42, 12, 9, f, 3)}<path d="M2,-50 L9,-42" stroke={f} strokeWidth={1.6} /></g>,
  mapcase: (f) => <g>{Rc(4, -26, 20, 15, f, 1)}</g>,
  medic: (f) => <g>{Rc(0, -26, 18, 17, f, 3)}<path d="M-6,-50 L4,-26" stroke={f} strokeWidth={2} /></g>,
  holster: (f) => <g>{Rc(6, -15, 8, 11, f, 2)}</g>,
  ammo: (f) => <g>{Rc(-14, -14, 14, 11, f, 1)}</g>,
  aerial_whip: (f) => <path d="M-22,-52 C-21,-98 -12,-134 -18,-160" fill="none" stroke={f} strokeWidth={1.3} />,
};
