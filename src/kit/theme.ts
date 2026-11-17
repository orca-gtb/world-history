import { Easing, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

loadFont({ family: "Barlow Condensed", url: staticFile("fonts/BarlowCondensed-SemiBold.ttf"), weight: "600" });
loadFont({ family: "Barlow Condensed", url: staticFile("fonts/BarlowCondensed-Bold.ttf"), weight: "700" });
loadFont({ family: "Special Elite", url: staticFile("fonts/SpecialElite-Regular.ttf"), weight: "400" });

export const C = {
  paper: "#d8c7a1",
  paperDark: "#bfa97c",
  ink: "#2a2418",
  chalk: "#f4efe4",
  allied: "#2b5aa8",
  alliedFill: "#a9c1e6",
  axis: "#a8372d",
  axisFill: "#e3a79f",
  gold: "#c8962b",
  night: "#0c1218",
};
export const F = { ui: "Barlow Condensed", type: "Special Elite" };
export const W = 1080;
export const H = 1920;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Kurva cubic-bezier untuk semua hitungan angka & bar (expo-out: cepat lalu mengendap, gaya dokumenter).
// PENTING: scripts/soundtrack_aces.py memakai kurva yang SAMA untuk menaruh bunyi ketik mesin tik.
export const BZ = [0.16, 1, 0.3, 1] as const;
export const countEase = Easing.bezier(...BZ);
