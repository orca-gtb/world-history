// Skema data episode. SETIAP fakta membawa status + sumber, supaya yang belum terverifikasi
// tidak lolos ke video final: pada mode `final`, entri non-"verified" tidak digambar (atau diberi keterangan "disputed").
// verified = dibaca langsung dari teks sumber; corroborated = cocok di banyak hasil pencarian (belum dibaca langsung);
// contested = sumber bertentangan; unverified = satu sumber / belum dicek.
export type Status = "verified" | "corroborated" | "contested" | "unverified";
export type Source = { note: string; url?: string };
export type Side = "ALLIED" | "AXIS";

export type Fact<T = {}> = T & { status: Status; sources: Source[] };

export type Person = Fact<{
  id: string;
  name: string;
  rank: string;
  role: string;
  unit: string;
  side: Side;
  photo?: string; // file di public/photos/ (domain publik / berlisensi, isi `photoCredit`)
  photoCredit?: string;
}>;

export type UnitKind = "inf" | "glider" | "tug" | "engineer" | "armour" | "air" | "hq";
export type Unit = Fact<{
  id: string;
  name: string;
  short: string;
  kind: UnitKind;
  side: Side;
  parent?: string;
  commander?: string; // id Person
  strength?: string; // teks apa adanya (jangan paksa jadi angka bila sumber berbeda)
  note?: string;
  unique?: boolean; // unit "sorot" (tank, pesawat, glider)
}>;

export type Place = Fact<{ id: string; name: string; x: number; y: number; kind: "bridge" | "town" | "coast" | "airfield" | "river" }>;

export type Beat = Fact<{ t: string; label: string }>; // t: jam lokal, bebas format
export type Episode = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  pov: "ALLIED";
  weather: { title: string; detail: string; status: Status; sources: Source[] };
  people: Person[];
  units: Unit[];
  places: Place[];
  timeline: Beat[];
};

export const MODE = "final" as "preview" | "final";
export const show = (s: Status) => MODE === "preview" || s === "verified" || s === "corroborated";
