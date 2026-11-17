import type { Source, Status } from "../episodes/schema";

const SRC = {
  infographic: { note: "Infografis tss.ww2 'Deadliest Fighter Aces' (unggahan pengguna) — sekunder" } as Source,
  wikiList: { note: "Wikipedia — List of aerial victories claimed by Erich Hartmann", url: "https://en.wikipedia.org/wiki/List_of_aerial_victories_claimed_by_Erich_Hartmann" } as Source,
  whn: { note: "Warfare History Network — Ace of Aces", url: "https://warfarehistorynetwork.com/article/ace-of-aces/" } as Source,
  migflug: { note: "Migflug — Erich Hartmann: 352 Kills", url: "https://migflug.com/afterburner/erich-hartmann-352-kills-the-record-that-will-never-be-broken/" } as Source,
  eduard: { note: "Eduard Info — Hartmann's Gustav (markings)", url: "https://info.eduard.com/en/04-2024-1/hartmanns-gustav" } as Source,
  eduard2: { note: "Eduard Info — Markings for Bf 109G-14 (white 1, black tulip)", url: "https://info.eduard.com/en/12-2024-1/markings-for-bf-109g-14-1-72" } as Source,
  flightsim: { note: "Flightsim.to — Bf 109 G-6 'Weisse 1' JG 52 (heart 'USCH')", url: "https://Flightsim.to/file/58096/messerschmitt-bf-109g-6-weisse-1-4-jg-52" } as Source,
  acesofww2: { note: "acesofww2.com — top aces (Germany)", url: "https://www.acesofww2.com/germany/top_aces.html" } as Source,
};

export type Icon = "bf109" | "fw190" | "me262";
export type Ace = { id: string; name: string; kills: number; aircraft: string; icon: Icon; note?: string; noteStatus?: Status; status: Status; sources: Source[] };

// Peringkat: angka kemenangan cocok di banyak hasil pencarian (corroborated). Catatan di infografis = unverified.
export const ACES: Ace[] = [
  { id: "hartmann", name: "Erich Hartmann", kills: 352, aircraft: "Bf 109 G / K", icon: "bf109", note: "Highest-scoring ace in history", noteStatus: "corroborated", status: "corroborated", sources: [SRC.infographic, SRC.wikiList, SRC.whn, SRC.acesofww2] },
  { id: "barkhorn", name: "Gerhard Barkhorn", kills: 301, aircraft: "Bf 109 / Fw 190", icon: "bf109", note: "1,104 combat sorties", noteStatus: "unverified", status: "corroborated", sources: [SRC.infographic, SRC.acesofww2] },
  { id: "rall", name: "Günther Rall", kills: 275, aircraft: "Bf 109", icon: "bf109", note: "Eastern Front specialist", noteStatus: "unverified", status: "corroborated", sources: [SRC.infographic, SRC.acesofww2] },
  { id: "kittel", name: "Otto Kittel", kills: 267, aircraft: "Fw 190A / Bf 109", icon: "fw190", note: "Leading ace killed in WWII", noteStatus: "unverified", status: "corroborated", sources: [SRC.infographic, SRC.acesofww2] },
  { id: "nowotny", name: "Walter Nowotny", kills: 258, aircraft: "Fw 190 / Me 262", icon: "me262", note: "", noteStatus: "unverified", status: "corroborated", sources: [SRC.infographic, SRC.acesofww2] },
];

export type FactRow = { label: string; value: string; status: Status; sources: Source[] };
export const HARTMANN_FACTS: FactRow[] = [
  { label: "CREDITED VICTORIES", value: "352", status: "corroborated", sources: [SRC.wikiList, SRC.whn, SRC.migflug] },
  { label: "LAST VICTORY", value: "8 May 1945", status: "corroborated", sources: [SRC.acesofww2] },
  { label: "UNIT", value: "JG 52 · Eastern Front", status: "corroborated", sources: [SRC.whn, SRC.eduard] },
  { label: "AGAINST", value: "345 Soviet · 7 American", status: "unverified", sources: [SRC.wikiList] },
  { label: "COMBAT MISSIONS", value: "≈1,400 (sources differ)", status: "contested", sources: [SRC.migflug, SRC.whn] },
  { label: "SHOT DOWN?", value: "Never by enemy fighters · 14 forced landings", status: "contested", sources: [SRC.migflug] },
];
export const MARKINGS = {
  tulip: { text: "Black tulip on the nose", status: "corroborated" as Status, sources: [SRC.eduard, SRC.eduard2, SRC.flightsim] },
  heart: { text: "Heart with his wife's initials", status: "corroborated" as Status, sources: [SRC.eduard, SRC.flightsim] },
  white1: { text: "“White 1”", status: "unverified" as Status, sources: [SRC.eduard2] },
};
export const DOT = { verified: "#2d8a3e", corroborated: "#2d6db8", contested: "#d49a1c", unverified: "#b83a30" } as const;
