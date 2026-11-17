// Spesifikasi kartu long-form. Semua waktu `at` dalam DETIK sejak suara bab mulai.
import type { View } from "./geo";

export type Line = { t: string; at: number; hi?: boolean; tag?: string };
export type Marker = { lon: number; lat: number; label: string; at: number; primary?: boolean; dx?: number; dy?: number };
export type Route = { pts: [number, number][]; at: number; end: number; dash?: boolean; color?: string };
export type Icon = "bf109" | "fw190" | "me262" | "p51" | "ju87" | "yak9";

export type CardSpec =
  | { k: "counter"; kicker?: string; label: string; from: number; to: number; at: number; end: number; unit?: string; dark?: boolean; lines?: Line[]; fmt?: "comma" }
  | { k: "text"; kicker?: string; title?: string; lines: Line[]; dark?: boolean; big?: boolean }
  | { k: "timeline"; kicker?: string; entries: { date: string; text: string; at: number; hi?: boolean }[] }
  | { k: "map"; view: View; title: string; note?: string; markers: Marker[]; routes?: Route[]; tint?: { name: string; color: string }[] }
  | { k: "quote"; kicker?: string; text: string; who?: string; at: number }
  | { k: "sil"; icon: Icon; kicker?: string; title: string; sub?: string; lines?: Line[]; flip?: boolean }
  | { k: "bars"; kicker: string; title: string; rows: { label: string; value: number; at: number; end: number; unit?: string; hi?: boolean }[]; max: number; foot?: Line[] }
  | { k: "photo"; src: string; kicker?: string; title: string; sub?: string; lines?: Line[] }
  | { k: "scene"; id: "first" | "ambush" | "goebel" | "brno" }
  | { k: "custom"; id: "tulip" | "goebel" | "steps" };

export type Shot = { t: number; card: number; s?: number; d?: number; dx?: number; dy?: number };
export type ChapterSpec = {
  id: string;
  cardTitle?: { kicker: string; title: string; sub: string };
  cards: CardSpec[];
  shots: Shot[]; // t = detik sejak suara mulai
};
