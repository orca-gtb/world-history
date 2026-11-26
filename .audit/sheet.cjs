"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ww2/sheet.tsx
var sheet_exports = {};
__export(sheet_exports, {
  sheet: () => sheet
});
module.exports = __toCommonJS(sheet_exports);
var import_server = require("react-dom/server");

// src/ww2/units.ts
var UNITS = [
  { id: "us_rifleman", faction: "us", type: "rifleman", name: "Rifleman (M1 Garand)", kind: "infantry", weapon: "garand", hat: "m1", coat: "short", gear: ["webbing", "canteen", "pack"], stance: "std", role: "line infantry" },
  { id: "us_smg", faction: "us", type: "smg_trooper", name: "SMG Trooper (Thompson M1A1)", kind: "infantry", weapon: "thompson", hat: "m1", coat: "short", gear: ["webbing", "canteen"], stance: "std", role: "assault" },
  { id: "us_bar", faction: "us", type: "bar_gunner", name: "BAR Gunner (M1918)", kind: "infantry", weapon: "bar", hat: "m1", coat: "short", gear: ["webbing", "ammo"], stance: "std", role: "automatic rifleman" },
  { id: "us_mg_crew", faction: "us", type: "mg_crew", name: "M1919 Machine Gun Crew", kind: "infantry", weapon: "m1919", hat: "m1", coat: "short", gear: ["webbing", "ammo"], stance: "deploy", role: "machine gun" },
  { id: "us_bazooka", faction: "us", type: "bazooka_team", name: "Bazooka Team (M1)", kind: "infantry", weapon: "bazooka", hat: "m1", coat: "short", gear: ["webbing", "pack"], stance: "tube", role: "anti-tank" },
  { id: "us_radio", faction: "us", type: "radio_operator", name: "Radio Operator (SCR-300)", kind: "support", weapon: "garand", wscale: 0.85, hat: "headset_m1", coat: "short", gear: ["radio_us", "webbing"], stance: "std", role: "communications" },
  { id: "us_officer", faction: "us", type: "field_officer", name: "Field Officer", kind: "support", weapon: "pistol", hat: "m1", coat: "short", gear: ["binoc", "mapcase", "holster", "webbing"], stance: "pistol", role: "command" },
  { id: "us_medic", faction: "us", type: "medic", name: "Medic", kind: "support", weapon: null, hat: "m1", coat: "short", gear: ["medic", "webbing", "canteen"], stance: "std", role: "medical" },
  { id: "de_rifleman", faction: "germany", type: "rifleman", name: "Rifleman (Kar98k)", kind: "infantry", weapon: "kar98k", hat: "stahlhelm", coat: "short", gear: ["webbing", "gasmask", "shovel"], stance: "std", role: "line infantry" },
  { id: "de_smg", faction: "germany", type: "smg_trooper", name: "SMG Trooper (MP 40)", kind: "infantry", weapon: "mp40", hat: "stahlhelm", coat: "short", gear: ["webbing", "gasmask"], stance: "std", role: "assault" },
  { id: "de_mg", faction: "germany", type: "mg_gunner", name: "MG 34/42 Gunner", kind: "infantry", weapon: "mg42", hat: "stahlhelm", coat: "short", gear: ["webbing", "ammo"], stance: "deploy", role: "machine gun" },
  { id: "de_panzerfaust", faction: "germany", type: "panzerfaust_soldier", name: "Panzerfaust Soldier", kind: "infantry", weapon: "panzerfaust", hat: "stahlhelm", coat: "short", gear: ["webbing", "gasmask"], stance: "tube", role: "anti-tank" },
  { id: "de_radio", faction: "germany", type: "radio_operator", name: "Radio Operator (Funker)", kind: "support", weapon: "kar98k", wscale: 0.95, hat: "stahlhelm", coat: "short", gear: ["radio_de", "webbing"], stance: "std", role: "communications" },
  { id: "de_officer", faction: "germany", type: "officer", name: "Officer", kind: "support", weapon: "pistol", hat: "peaked_de", coat: "greatcoat", gear: ["binoc", "holster", "mapcase"], stance: "pistol", role: "command" },
  { id: "de_grenadier", faction: "germany", type: "grenadier", name: "Grenadier", kind: "infantry", weapon: "kar98k", hat: "stahlhelm", coat: "short", gear: ["grenades", "webbing", "gasmask"], stance: "std", role: "infantry" },
  { id: "su_rifleman", faction: "soviet", type: "rifleman", name: "Rifleman (Mosin\u2013Nagant)", kind: "infantry", weapon: "mosin", hat: "ssh40", coat: "short", gear: ["skatka", "webbing", "canteen"], stance: "std", role: "line infantry" },
  { id: "su_smg", faction: "soviet", type: "smg_trooper", name: "SMG Trooper (PPSh-41)", kind: "infantry", weapon: "ppsh", hat: "ssh40", coat: "short", gear: ["skatka", "webbing", "shovel"], stance: "std", role: "assault" },
  { id: "su_dp", faction: "soviet", type: "dp_gunner", name: "DP-27 Gunner", kind: "infantry", weapon: "dp27", hat: "ssh40", coat: "short", gear: ["webbing", "ammo"], stance: "deploy", role: "light machine gun" },
  { id: "su_ptrd", faction: "soviet", type: "ptrd_rifleman", name: "PTRD Anti-Tank Rifleman", kind: "infantry", weapon: "ptrd", hat: "ssh40", coat: "short", gear: ["skatka", "webbing"], stance: "deploy", role: "anti-tank" },
  { id: "su_radio", faction: "soviet", type: "radio_operator", name: "Radio Operator (radist)", kind: "support", weapon: "mosin", wscale: 0.85, hat: "ssh40", coat: "short", gear: ["radio_su", "webbing"], stance: "std", role: "communications" },
  { id: "su_officer", faction: "soviet", type: "officer", name: "Officer", kind: "support", weapon: "pistol", hat: "peaked_su", coat: "greatcoat", gear: ["binoc", "holster", "mapcase"], stance: "pistol", role: "command" },
  { id: "su_political", faction: "soviet", type: "political_officer", name: "Political Officer (zampolit)", kind: "support", weapon: "pistol", hat: "peaked_su", coat: "greatcoat", gear: ["mapcase", "holster", "skatka"], stance: "pistol", role: "political" }
];

// src/ww2/gear.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var P = (d, f, extra = {}) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d, fill: f, ...extra });
var Rc = (x, y, w, h, f, r = 0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x, y, width: w, height: h, rx: r, fill: f });
var WEAPONS = {
  garand: { id: "garand", name: "M1 Garand", cls: "rifle", fore: [46, 1], muzzle: 88, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-32,-3 L-32,8 L-6,6 L0,3 L24,3 L24,-4 L0,-4 L-6,-3 Z", f),
    Rc(24, -3, 64, 3, f),
    Rc(26, -6, 34, 3.4, f),
    Rc(60, -7, 3, 5, f),
    Rc(8, 3, 14, 3, f)
  ] }) },
  kar98k: { id: "kar98k", name: "Karabiner 98k", cls: "rifle", fore: [50, 1], muzzle: 92, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-34,-2 L-34,8 L-24,10 L-6,6 L0,3 L26,3 L26,-4 L0,-4 Z", f),
    Rc(26, -3, 66, 2.6, f),
    Rc(26, -5, 40, 2.6, f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 6, cy: -6, r: 2.4, fill: f }),
    Rc(88, -7, 2.4, 4, f)
  ] }) },
  mosin: { id: "mosin", name: "Mosin\u2013Nagant M91/30", cls: "rifle", fore: [58, 1], muzzle: 125, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-36,-2 L-36,8 L-6,6 L0,3 L28,3 L28,-4 L0,-4 Z", f),
    Rc(28, -3, 72, 2.4, f),
    Rc(28, -5, 44, 2.4, f),
    P("M100,-3 L128,-1.6 L100,0 Z", f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 5, cy: -6, r: 2.2, fill: f })
  ] }) },
  thompson: { id: "thompson", name: "Thompson M1A1", cls: "smg", fore: [34, 6], muzzle: 58, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-26,-3 L-26,8 L-10,8 L0,4 L26,4 L26,-5 L0,-5 L-8,-3 Z", f),
    Rc(26, -4, 28, 4, f),
    Rc(54, -5, 5, 6, f),
    Rc(28, -3, 2, 2, "none"),
    Rc(12, 4, 6, 21, f, 1),
    Rc(32, 4, 4, 13, f),
    Rc(2, 4, 5, 10, f)
  ] }) },
  mp40: { id: "mp40", name: "MP 40", cls: "smg", fore: [27, 12], muzzle: 56, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-16, -2, 16, 2, f),
    Rc(-16, -3, 2, 12, f),
    Rc(0, -5, 28, 7, f, 1),
    Rc(28, -4, 24, 5, f),
    Rc(52, -5, 4, 7, f),
    Rc(22, 2, 5, 24, f),
    Rc(2, 2, 5, 11, f)
  ] }) },
  ppsh: { id: "ppsh", name: "PPSh-41", cls: "smg", fore: [34, 2], muzzle: 52, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-28,-2 L-28,8 L-10,8 L0,4 L10,4 L10,-4 L0,-4 Z", f),
    Rc(10, -5, 34, 8, f, 1),
    Rc(44, -5, 8, 7, f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 22, cy: 13, r: 9.5, fill: f }),
    Rc(19, 3, 6, 4, f),
    Rc(2, 4, 5, 10, f)
  ] }) },
  bar: { id: "bar", name: "BAR M1918", cls: "lmg", fore: [50, 6], muzzle: 90, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-32,-3 L-32,9 L-6,7 L0,3 L26,3 L26,-5 L0,-5 Z", f),
    Rc(26, -4, 62, 3.4, f),
    Rc(26, -6, 30, 3, f),
    Rc(12, 3, 5, 15, f, 1),
    Rc(88, -6, 5, 6, f),
    Rc(56, 1, 2, 12, f)
  ] }) },
  m1919: { id: "m1919", name: "M1919A4", cls: "mg", fore: [10, 9], muzzle: 70, mount: { at: 34, kind: "tripod" }, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-12, -9, 34, 14, f, 2),
    Rc(22, -7, 44, 7, f),
    Rc(66, -8, 5, 9, f),
    Rc(-6, -13, 22, 4, f),
    Rc(-10, 5, 12, 11, f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-4,16 q-3,10 2,14 q4,-8 3,-14", fill: "none", stroke: f, strokeWidth: 2.2 }),
    Rc(-26, -5, 14, 9, f)
  ] }) },
  mg42: { id: "mg42", name: "MG 42", cls: "mg", fore: [30, 8], muzzle: 80, mount: { at: 62, kind: "bipod" }, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-34, -5, 24, 10, f),
    Rc(-10, -8, 40, 11, f, 2),
    Rc(30, -7, 44, 9, f, 1),
    Rc(74, -8, 6, 11, f),
    Rc(-2, 3, 14, 10, f, 1),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-2,13 q-4,8 2,12", fill: "none", stroke: f, strokeWidth: 2.2 }),
    Rc(-6, -12, 20, 4, f)
  ] }) },
  dp27: { id: "dp27", name: "DP-27", cls: "mg", fore: [46, 7], muzzle: 90, mount: { at: 62, kind: "bipod" }, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-36,-3 L-36,8 L-8,7 L0,3 L30,3 L30,-6 L0,-6 Z", f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 16, cy: -11, r: 12, fill: f }),
    Rc(30, -5, 52, 5, f),
    Rc(82, -7, 8, 9, f),
    Rc(4, 3, 5, 9, f)
  ] }) },
  bazooka: { id: "bazooka", name: "M1 Bazooka", cls: "tube", fore: [34, 9], muzzle: 98, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-50, -4, 148, 8, f, 3),
    P("M-50,-8 L-42,-4 L-42,4 L-50,8 Z", f),
    Rc(26, 3, 5, 10, f),
    Rc(2, 3, 5, 9, f),
    Rc(20, -9, 4, 5, f)
  ] }) },
  panzerfaust: { id: "panzerfaust", name: "Panzerfaust 60", cls: "tube", fore: [14, 8], muzzle: 62, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-40, -3.5, 82, 7, f, 2),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", { cx: 54, cy: 0, rx: 15, ry: 11, fill: f }),
    P("M42,-3 L42,3 L50,6 L50,-6 Z", f),
    Rc(-2, 3, 5, 9, f),
    Rc(20, -7, 3, 4, f)
  ] }) },
  ptrd: { id: "ptrd", name: "PTRD-41", cls: "ptr", fore: [86, 8], muzzle: 168, mount: { at: 120, kind: "bipod" }, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-38,-3 L-38,9 L-8,7 L0,3 L36,3 L36,-5 L0,-5 Z", f),
    Rc(36, -3, 128, 2.6, f),
    Rc(160, -6, 10, 8, f),
    Rc(6, -9, 14, 4, f)
  ] }) },
  pistol: { id: "pistol", name: "Pistol", cls: "pistol", fore: null, muzzle: 15, draw: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(0, -5, 15, 5.5, f),
    Rc(-3, 0, 6, 12, f, 1)
  ] }) }
};
var HATS = {
  m1: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: P("M-13,1 C-13,-10 -6,-14 1,-14 C9,-14 13,-9 13,1 L17,4 L-17,4 Z", f) }),
  stahlhelm: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: P("M-16,9 L-12,0 C-11,-9 -5,-14 2,-14 C9,-14 12,-9 12,-2 L15,3 L9,3 L-2,3 L-8,5 L-13,10 Z", f) }),
  ssh40: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: P("M-12,2 C-12,-10 -5,-15 1,-15 C8,-15 12,-10 12,2 L13,4 L-13,4 Z", f) }),
  peaked_de: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-11,-2 L-9,-15 C-2,-17 5,-16 9,-14 L11,-3 Z", f),
    P("M8,-3 L21,-1 L8,1 Z", f)
  ] }),
  peaked_su: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-11,-2 L-10,-12 L9,-12 L11,-3 Z", f),
    P("M9,-3 L20,0 L9,1 Z", f)
  ] }),
  headset_m1: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    P("M-13,1 C-13,-10 -6,-14 1,-14 C9,-14 13,-9 13,1 L17,4 L-17,4 Z", f),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-9,-3 C-5,-13 7,-13 10,-3", fill: "none", stroke: f, strokeWidth: 2.5 }),
    Rc(-3, -2, 7, 8, f, 2)
  ] })
};
var GEAR = {
  pack: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(-26, -50, 15, 34, f, 3) }),
  radio_us: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-30, -62, 17, 50, f, 3),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-24,-62 C-24,-90 -20,-110 -26,-134", fill: "none", stroke: f, strokeWidth: 1.8 }),
    Rc(-12, -34, 6, 14, f, 2)
  ] }),
  radio_de: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-32, -50, 22, 30, f, 2),
    Rc(-30, -20, 18, 8, f, 1),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-20,-50 C-18,-92 -10,-120 -16,-150", fill: "none", stroke: f, strokeWidth: 1.6 })
  ] }),
  radio_su: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-29, -52, 16, 30, f, 2),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-22,-52 C-20,-82 -14,-104 -18,-130", fill: "none", stroke: f, strokeWidth: 1.6 })
  ] }),
  webbing: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-13, -9, 28, 5, f),
    Rc(6, -16, 8, 11, f, 1),
    Rc(-2, -15, 7, 10, f, 1)
  ] }),
  canteen: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(-18, -14, 9, 14, f, 3) }),
  shovel: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(-16, -20, 3, 20, f),
    P("M-18,-4 L-10,-4 L-12,8 L-16,8 Z", f)
  ] }),
  gasmask: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(-22, -40, 8, 26, f, 3) }),
  skatka: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-11,-50 C8,-48 15,-26 7,-5", fill: "none", stroke: f, strokeWidth: 7, strokeLinecap: "round" }),
  grenades: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(6, -15, 2.6, 16, f),
    Rc(4.7, -19, 5.2, 5, f),
    Rc(-1, -15, 2.6, 16, f),
    Rc(-2.3, -19, 5.2, 5, f)
  ] }),
  binoc: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(7, -42, 12, 9, f, 3),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2,-50 L9,-42", stroke: f, strokeWidth: 1.6 })
  ] }),
  mapcase: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(4, -26, 20, 15, f, 1) }),
  medic: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
    Rc(0, -26, 18, 17, f, 3),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-6,-50 L4,-26", stroke: f, strokeWidth: 2 })
  ] }),
  holster: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(6, -15, 8, 11, f, 2) }),
  ammo: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: Rc(-14, -14, 14, 11, f, 1) }),
  aerial_whip: (f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-22,-52 C-21,-98 -12,-134 -18,-160", fill: "none", stroke: f, strokeWidth: 1.3 })
};

// src/ww2/anim.ts
var ANIMS = [
  { id: "idle", frames: 4, loop: true, fps: 4 },
  { id: "walk", frames: 8, loop: true, fps: 10 },
  { id: "run", frames: 8, loop: true, fps: 14 },
  { id: "advance", frames: 8, loop: true, fps: 10 },
  { id: "crouch", frames: 4, loop: true, fps: 4 },
  { id: "aim", frames: 4, loop: true, fps: 4 },
  { id: "fire", frames: 6, loop: true, fps: 12 },
  { id: "reload", frames: 8, loop: false, fps: 8 },
  { id: "hit", frames: 6, loop: false, fps: 12 },
  { id: "fall", frames: 8, loop: false, fps: 10 }
];
var H = {
  rifle: { carry: [8, 50, -12], run: [12, 18, -34], ready: [12, 22, -8], aim: [16, 5, 0], reload: [10, 26, 38] },
  smg: { carry: [8, 48, 8], run: [12, 20, -12], ready: [12, 24, 2], aim: [17, 7, 0], reload: [10, 28, 40] },
  lmg: { carry: [10, 50, 2], run: [14, 24, -6], ready: [14, 26, 2], aim: [20, 8, 0], reload: [12, 30, 40] },
  mg: { carry: [12, 40, 0], run: [14, 26, -4], ready: [14, 28, 4], aim: [30, 40, 0], reload: [30, 40, 0] },
  ptr: { carry: [12, 42, -4], run: [12, 22, -24], ready: [12, 24, -6], aim: [34, 46, 0], reload: [34, 46, 0] },
  tube: { carry: [0, -2, -6], run: [0, -2, -6], ready: [0, -2, -6], aim: [4, -1, 0], reload: [2, 14, 10] },
  pistol: { carry: [8, 36, 80], run: [8, 36, 80], ready: [24, 18, -10], aim: [32, 4, 0], reload: [14, 26, -30] }
};
var sm = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
var wclass = (s) => s.weapon ? WEAPONS[s.weapon].cls : null;
var hold = (s, mode) => {
  const c = wclass(s);
  if (!c) return { a: [8, 30], ang: 0 };
  const [x, y, a] = H[c][mode];
  return { a: [x, y], ang: a, deploy: (c === "mg" || c === "ptr") && (mode === "aim" || mode === "reload"), oneHand: mode === "carry" && (c === "rifle" || c === "smg" || c === "lmg") };
};
var heavy = (s) => s.stance === "deploy" || s.stance === "tube";
function poseOf(s, anim, u) {
  const p = u * 2 * Math.PI, c = wclass(s), pistol = c === "pistol", none = !c;
  const base = { lean: 2, neck: 0, rot: 0, legF: [5, 5], legB: [-5, 5], hold: hold(s, "carry"), recoil: 0, flash: false, armFree: [8, 12], hideGun: pistol };
  const swing = (amp, b0, b1, lean, mode, thighBias = 0, bendBias = 0) => ({
    ...base,
    lean,
    legF: [amp * Math.sin(p) + thighBias, b0 + b1 * Math.max(0, Math.cos(p)) + bendBias],
    legB: [-amp * Math.sin(p) + thighBias, b0 + b1 * Math.max(0, -Math.cos(p)) + bendBias],
    hold: hold(s, mode),
    armFree: [(pistol || none || mode === "carry" ? 1 : 0) * amp * 0.9 * -Math.sin(p) + 6, 14 + (amp > 40 ? 50 : 6)]
  });
  switch (anim) {
    case "idle":
      return { ...base, lean: 2 + 1.4 * Math.sin(p), legF: [7, 5], legB: [-6, 4], armFree: [8 + 2 * Math.sin(p), 12], neck: Math.sin(p) };
    case "walk":
      return swing(26, 8, 38, 3, "carry");
    case "run":
      return swing(50, 22, 78, 14, "run");
    case "advance":
      return swing(30, 20, 40, 26, "ready", 12, 22);
    case "crouch":
      return { ...base, lean: 22 + 2 * Math.sin(p), legF: [62, 112], legB: [34, 104], hold: hold(s, "ready"), armFree: [20, 50] };
    case "aim":
    case "fire": {
      const k = anim === "fire" ? Math.exp(-u * 6) : 0;
      const kneel = heavy(s), base2 = kneel ? { ...base, lean: s.stance === "tube" ? 12 : 30, legF: [62, 112], legB: [-12, 118] } : { ...base, lean: 5, legF: [15, 10], legB: [-17, 6] };
      return { ...base2, hold: hold(s, "aim"), recoil: 5 * k, flash: anim === "fire" && u < 0.2, lean: base2.lean - 1.5 * k, hideGun: false, armFree: [10, 22] };
    }
    case "reload": {
      const dep = c === "mg" || c === "ptr";
      const b = dep ? { ...base, lean: 30, legF: [62, 112], legB: [-12, 118] } : { ...base, lean: 22, legF: [62, 112], legB: [34, 104] };
      const t = u < 0.25 ? sm(u / 0.25) : u < 0.5 ? 1 : u < 0.75 ? 1 - sm((u - 0.5) / 0.25) * 0.15 : 0.85 * (1 - sm((u - 0.75) / 0.25));
      const pouch = [12, 48];
      const hd = hold(s, "reload");
      return { ...b, hold: { ...hd, fore: c === "pistol" || !c ? null : [pouch[0] + (hd.a[0] + 40 - pouch[0]) * (1 - t), pouch[1] + (hd.a[1] - pouch[1]) * (1 - t)] }, hideGun: false, armFree: [10, 30] };
    }
    case "hit": {
      const f = Math.sin(Math.PI * u), h = hold(s, "carry");
      return { ...base, lean: 4 - 30 * f, rot: -7 * f, legF: [6 - 6 * f, 10 + 20 * f], legB: [-5 - 16 * f, 8 + 36 * f], hold: { ...h, ang: h.ang - 45 * f, a: [h.a[0] - 4 * f, h.a[1] - 10 * f] }, hideGun: false, armFree: [8 - 30 * f, 30 * f + 12] };
    }
    case "fall": {
      const v = Math.pow(u, 1.25), h = hold(s, "carry");
      return { ...base, lean: 4 - 20 * v, neck: -8 * v, rot: -92 * sm(v), legF: [6 + 36 * v, 14 + 70 * v], legB: [-5 + 14 * v, 10 + 80 * v], hold: { a: [h.a[0] - 20 * v, h.a[1] - 22 * v], ang: h.ang - 70 * v }, hideGun: false, armFree: [8 - 55 * v, 20 + 40 * v] };
    }
  }
}

// src/ww2/Unit.tsx
var import_react = __toESM(require("react"));

// src/ww2/rig.ts
var rad = (d) => d * Math.PI / 180;
var add = (a, b) => [a[0] + b[0], a[1] + b[1]];
var sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
var rot = (v, d) => {
  const r = rad(d), c = Math.cos(r), s = Math.sin(r);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c];
};
var dirDown = (a, l) => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l];
var dirUp = (a, l) => [Math.sin(rad(a)) * l, -Math.cos(rad(a)) * l];
var BONE = { thigh: 44, shin: 43, torso: 54, up: 29, fore: 27 };
function ik2(S, T, l1, l2) {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  let d = Math.hypot(dx, dy);
  const mx = l1 + l2 - 0.5;
  if (d > mx) d = mx;
  if (d < 10) d = 10;
  const a = Math.atan2(dy, dx), aa = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
  const e1 = [S[0] + aa * Math.cos(a) - h * Math.sin(a), S[1] + aa * Math.sin(a) + h * Math.cos(a)];
  const e2 = [S[0] + aa * Math.cos(a) + h * Math.sin(a), S[1] + aa * Math.sin(a) - h * Math.cos(a)];
  return { el: e1[1] >= e2[1] ? e1 : e2, hand: [S[0] + Math.cos(a) * d, S[1] + Math.sin(a) * d] };
}
function solve(p, foreLocal, hasGun) {
  const hip = [0, 0];
  const sh = add(hip, dirUp(p.lean, BONE.torso));
  const nb = add(sh, dirUp(p.lean, 5)), head = add(nb, dirUp(p.lean + p.neck, 13));
  const kneeF = add(hip, dirDown(p.legF[0], BONE.thigh)), footF = add(kneeF, dirDown(p.legF[0] - p.legF[1], BONE.shin));
  const kneeB = add(hip, dirDown(p.legB[0], BONE.thigh)), footB = add(kneeB, dirDown(p.legB[0] - p.legB[1], BONE.shin));
  let gun = add(sh, p.hold.a);
  const ga = p.hold.ang;
  if (p.recoil) gun = sub(gun, rot([p.recoil, 0], ga));
  let rear, fore;
  const free = (ang, bend) => {
    const el = add(sh, dirDown(ang, BONE.up));
    const hand = add(el, dirDown(ang + bend, BONE.fore));
    return { el, hand };
  };
  if (hasGun) {
    rear = ik2(sh, gun, BONE.up, BONE.fore);
    if (!p.hold.oneHand && (foreLocal || p.hold.fore)) {
      const T = p.hold.fore ? add(sh, p.hold.fore) : add(gun, rot(foreLocal, ga));
      fore = ik2(sh, T, BONE.up, BONE.fore);
    } else fore = free(p.armFree[0], p.armFree[1]);
  } else {
    rear = free(p.armFree[0], p.armFree[1]);
    fore = free(-p.armFree[0] * 0.8, p.armFree[1] * 0.8);
  }
  const all = { hip, sh, head, kneeF, footF, kneeB, footB, gun, rear, fore };
  const R = (v) => rot(v, p.rot);
  const out = { hip: R(all.hip), sh: R(all.sh), head: R(all.head), kneeF: R(kneeF), footF: R(footF), kneeB: R(kneeB), footB: R(footB), rear: { el: R(rear.el), hand: R(rear.hand) }, fore: { el: R(fore.el), hand: R(fore.hand) }, gun: R(gun), gunAng: ga + p.rot, lean: p.lean + p.rot, neckAng: p.lean + p.neck + p.rot, rotAll: p.rot };
  const pts = [out.footF, out.footB, out.kneeF, out.kneeB, out.hip, out.sh, out.head, out.rear.hand, out.fore.hand, out.rear.el, out.fore.el];
  const maxY = Math.max(...pts.map((q) => q[1])), dy = -maxY - (p.rot !== 0 && Math.abs(p.rot) > 40 ? 9 : 5);
  const S = (v) => [v[0], v[1] + dy];
  return { ...out, hip: S(out.hip), sh: S(out.sh), head: S(out.head), kneeF: S(out.kneeF), footF: S(out.footF), kneeB: S(out.kneeB), footB: S(out.footB), rear: { el: S(out.rear.el), hand: S(out.rear.hand) }, fore: { el: S(out.fore.el), hand: S(out.fore.hand) }, gun: S(out.gun) };
}

// src/ww2/Unit.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var line = (a, b, w, c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: c, strokeWidth: w, strokeLinecap: "round" });
var leg = (hip, knee, foot, c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { children: [
  line(hip, knee, 15, c),
  line(knee, foot, 11, c),
  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M${foot[0] - 5},${foot[1] - 3} L${foot[0] + 16},${foot[1] + 1} L${foot[0] + 17},${foot[1] + 6} L${foot[0] - 6},${foot[1] + 6} Z`, fill: c })
] });
var FIG = { w: 300, h: 270, cx: 118, gy: 246 };
var UnitFigure = ({ spec, anim, u, fill = "#14110e", far = "#2b2723", x = 0, y = 0, s = 1, flip = false }) => {
  const pose = poseOf(spec, anim, u), w = spec.weapon ? WEAPONS[spec.weapon] : null, ws = spec.wscale ?? 1;
  const J = solve(pose, w ? [w.fore ? w.fore[0] * ws : 0, w.fore ? w.fore[1] * ws : 0] : null, !!w && !pose.hideGun && !!w.fore);
  const showGun = !!w && !pose.hideGun;
  const twoHand = !!w && !!w.fore && !pose.hideGun && !pose.hold.oneHand;
  const gx = J.gun[0], gy = J.gun[1], ga = J.gunAng;
  const skirt = spec.coat === "greatcoat" ? (() => {
    const mid = (k, f) => [k[0] + (f[0] - k[0]) * 0.55, k[1] + (f[1] - k[1]) * 0.55];
    const A = [J.hip[0] - 11, J.hip[1] - 6], B = [J.hip[0] + 12, J.hip[1] - 6], C = mid(J.kneeF, J.footF), D = mid(J.kneeB, J.footB);
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M${A[0]},${A[1]} L${B[0]},${B[1]} L${C[0] + 10},${C[1]} L${D[0] - 10},${D[1]} Z`, fill });
  })() : null;
  const mount = showGun && w && w.mount && pose.hold.deploy ? (() => {
    const m = [gx + Math.cos(ga * Math.PI / 180) * w.mount.at - Math.sin(ga * Math.PI / 180) * 5, gy + Math.sin(ga * Math.PI / 180) * w.mount.at + Math.cos(ga * Math.PI / 180) * 5];
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { stroke: fill, strokeWidth: 2.6, strokeLinecap: "round", children: [
      line(m, [m[0] + 22, 0 - 1], 2.6, fill),
      line(m, [m[0] - 14, 0 - 1], 2.6, fill),
      w.mount.kind === "tripod" && line(m, [m[0] + 4, -1], 2.6, fill)
    ] });
  })() : null;
  const gearRot = J.lean;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${x},${y}) scale(${flip ? -s : s},${s})`, children: [
    leg(J.hip, J.kneeB, J.footB, far),
    line(J.sh, J.fore.el, 8, far),
    line(J.fore.el, J.fore.hand, 7, far),
    skirt,
    line(J.hip, J.sh, 21, fill),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { transform: `translate(${J.hip[0]},${J.hip[1]}) rotate(${gearRot})`, children: spec.gear.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react.default.Fragment, { children: GEAR[g](fill) }, i)) }),
    leg(J.hip, J.kneeF, J.footF, fill),
    line(J.sh, [J.head[0] - (J.head[0] - J.sh[0]) * 0.1, J.head[1] + 4], 9, fill),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: J.head[0], cy: J.head[1], r: 10, fill }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { transform: `translate(${J.head[0]},${J.head[1] - 1}) rotate(${J.neckAng})`, children: HATS[spec.hat](fill) }),
    mount,
    showGun && w && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("g", { transform: `translate(${gx},${gy}) rotate(${ga}) scale(${ws})`, children: [
      w.draw(fill),
      pose.flash && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: `M${w.muzzle},-1 L${w.muzzle + 14},-8 L${w.muzzle + 9},-1 L${w.muzzle + 18},0 L${w.muzzle + 9},2 L${w.muzzle + 14},9 Z`, fill: "#ffcf6b" })
    ] }),
    line(J.sh, J.rear.el, 9, fill),
    line(J.rear.el, J.rear.hand, 7.5, fill),
    twoHand && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: J.rear.hand[0], cy: J.rear.hand[1], r: 4.4, fill }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: J.fore.hand[0], cy: J.fore.hand[1], r: 4, fill })
    ] }),
    !twoHand && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: J.rear.hand[0], cy: J.rear.hand[1], r: 4.4, fill }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: J.fore.hand[0], cy: J.fore.hand[1], r: 4, fill })
    ] })
  ] });
};

// src/ww2/sheet.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var PICK = { idle: 0, walk: 2, run: 2, advance: 2, crouch: 0, aim: 0, fire: 0, reload: 3, hit: 3, fall: 6 };
function sheet(f) {
  const us = UNITS.filter((u) => u.faction === f), C = 0.5, cw = FIG.w * C, ch = FIG.h * C, L = 150;
  const W = L + ANIMS.length * cw, H2 = 30 + us.length * ch;
  return (0, import_server.renderToStaticMarkup)(
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: W, height: H2, viewBox: `0 0 ${W} ${H2}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("rect", { width: W, height: H2, fill: "#e9dfc4" }),
      ANIMS.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", { x: L + i * cw + cw / 2, y: 20, textAnchor: "middle", fontFamily: "Arial", fontSize: 14, fontWeight: 700, fill: "#3a2f1d", children: a.id.toUpperCase() }, a.id)),
      us.map((u, r) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("g", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("text", { x: 8, y: 30 + r * ch + ch / 2, fontFamily: "Arial", fontSize: 12, fontWeight: 700, fill: "#3a2f1d", children: u.name }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("line", { x1: 0, x2: W, y1: 30 + (r + 1) * ch, y2: 30 + (r + 1) * ch, stroke: "#cdbf9b" }),
        ANIMS.map((a, i) => {
          const fr = PICK[a.id], uu = a.loop ? fr / a.frames : fr / (a.frames - 1);
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(UnitFigure, { spec: u, anim: a.id, u: uu, x: L + i * cw + FIG.cx * C, y: 30 + r * ch + FIG.gy * C, s: C }, a.id);
        })
      ] }, u.id))
    ] })
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sheet
});
