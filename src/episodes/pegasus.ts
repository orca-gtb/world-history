import type { Episode, Source } from "./schema";

// STATUS: "verified" = dibaca langsung dari teks sumber (dan tidak dibantah sumber lain).
//         "contested" = sumber saling berbeda / hanya satu sisi.  "unverified" = baru dari ringkasan pencarian.
const S = {
  wikiPeg: { note: "Wikipedia — Pegasus Bridge (teks ditempel pengguna, 16 Nov 2026)", url: "https://en.wikipedia.org/wiki/Pegasus_Bridge" } as Source,
  archive: { note: "Pegasus Archive — Coup de Main Force (halaman belum bisa dibuka)", url: "https://www.pegasusarchive.org/normandy/repCoupDeMain.htm" } as Source,
  search: { note: "Ringkasan pencarian web — BELUM dicek ke halaman aslinya" } as Source,
};

export const pegasus: Episode = {
  id: "pegasus-bridge",
  title: "PEGASUS BRIDGE",
  subtitle: "Operation Deadstick · 6 June 1944",
  date: "6 JUNE 1944",
  pov: "ALLIED",
  weather: { title: "—", detail: "belum diverifikasi", status: "unverified", sources: [] },
  people: [
    { id: "howard", name: "Maj. John Howard", rank: "Major", role: "Commander of the glider-borne force that seized both bridges", unit: "D Company, 2nd (Airborne) Bn, Ox & Bucks Light Infantry", side: "ALLIED", status: "verified", sources: [S.wikiPeg] },
    { id: "brotheridge", name: "Lt. Den Brotheridge", rank: "Lieutenant", role: "Mortally wounded crossing the bridge — first Allied soldier killed by enemy fire on D-Day", unit: "D Company, 2nd Ox & Bucks LI", side: "ALLIED", status: "verified", sources: [S.wikiPeg] },
    { id: "pinecoffin", name: "Lt. Col. Pine-Coffin", rank: "Lieutenant Colonel", role: "Commander, 7th Parachute Battalion — reinforced the bridges at 03:00", unit: "7th Parachute Battalion", side: "ALLIED", status: "verified", sources: [S.wikiPeg] },
    { id: "priday", name: "Capt. Brian Priday", rank: "Captain", role: "Second-in-command, D Company", unit: "2nd Ox & Bucks LI", side: "ALLIED", status: "unverified", sources: [S.search] },
    { id: "wallwork", name: "S/Sgt Jim Wallwork", rank: "Staff Sergeant", role: "Pilot of the first glider to land", unit: "Glider Pilot Regiment (C Sqn)", side: "ALLIED", status: "unverified", sources: [S.search] },
    { id: "gale", name: "Maj. Gen. Richard Gale", rank: "Major General", role: "Commander, 6th Airborne Division", unit: "6th Airborne Division", side: "ALLIED", status: "unverified", sources: [S.search] },
    { id: "schmidt", name: "Maj. Hans Schmidt", rank: "Major", role: "Commander, 736th Grenadier Regt (per some sources)", unit: "716th Infantry Division", side: "AXIS", status: "contested", sources: [{ note: "Identitas dipersoalkan di forum axishistory.com", url: "https://forum.axishistory.com/viewtopic.php?p=2377431" }] },
  ],
  units: [
    { id: "div6", name: "6th Airborne Division", short: "6 AB DIV", kind: "hq", side: "ALLIED", commander: "gale", status: "verified", sources: [S.wikiPeg] },
    { id: "abde6", name: "6th Airlanding Brigade", short: "6 AL BDE", kind: "hq", side: "ALLIED", parent: "div6", status: "verified", sources: [S.wikiPeg] },
    { id: "dcoy", name: "D Company, 2nd (Airborne) Bn, Ox & Bucks LI", short: "D COY", kind: "inf", side: "ALLIED", parent: "abde6", commander: "howard", strength: "181 in the full force (Wikipedia); other sources say 170–180", status: "contested", sources: [S.wikiPeg, S.search] },
    { id: "bcoy", name: "2 platoons of B Company", short: "B COY (2 PL)", kind: "inf", side: "ALLIED", parent: "dcoy", status: "verified", sources: [S.wikiPeg] },
    { id: "re", name: "Royal Engineers, 249 Field Company (Airborne)", short: "249 FD COY RE", kind: "engineer", side: "ALLIED", parent: "dcoy", strength: "20 sappers (Wikipedia) vs 30 (other sources)", status: "contested", sources: [S.wikiPeg, S.search] },
    { id: "gpr", name: "Glider Pilot Regiment", short: "GPR", kind: "air", side: "ALLIED", status: "verified", sources: [S.wikiPeg] },
    { id: "horsa", name: "Airspeed Horsa gliders ×6", short: "HORSA ×6", kind: "glider", side: "ALLIED", note: "Towed from RAF Tarrant Rushton, Dorset", unique: true, status: "verified", sources: [S.wikiPeg] },
    { id: "halifax", name: "Halifax tugs ×6 (3 × 298 Sqn, 3 × 644 Sqn)", short: "HALIFAX ×6", kind: "tug", side: "ALLIED", note: "Took off Tarrant Rushton 22:30; led by Wg Cdr Duder (298 Sqn)", unique: true, status: "unverified", sources: [S.search] },
    { id: "p7", name: "7th Parachute Battalion", short: "7 PARA", kind: "inf", side: "ALLIED", commander: "pinecoffin", note: "Reinforced the bridges at 03:00", status: "verified", sources: [S.wikiPeg] },
    { id: "lovat", name: "Lord Lovat's Commandos", short: "COMMANDOS", kind: "inf", side: "ALLIED", note: "Linked up from the beaches", status: "verified", sources: [S.wikiPeg] },
    { id: "g736", name: "736th Grenadier Regiment (garrison, ~50 men)", short: "736 GREN", kind: "inf", side: "AXIS", parent: "g716", status: "unverified", sources: [S.search] },
    { id: "g716", name: "716th Infantry Division", short: "716 ID", kind: "hq", side: "AXIS", status: "unverified", sources: [S.search] },
    { id: "p21", name: "21st Panzer Division (counterattack later on D-Day)", short: "21 PZ DIV", kind: "armour", side: "AXIS", status: "contested", sources: [S.search] },
  ],
  places: [
    { id: "channel", name: "ENGLISH CHANNEL", x: 500, y: 90, kind: "coast", status: "verified", sources: [] },
    { id: "ouistreham", name: "Ouistreham", x: 690, y: 210, kind: "town", status: "verified", sources: [S.wikiPeg] },
    { id: "benouville", name: "Bénouville", x: 380, y: 520, kind: "town", status: "verified", sources: [S.wikiPeg] },
    { id: "ranville", name: "Ranville", x: 690, y: 470, kind: "town", status: "verified", sources: [S.wikiPeg] },
    { id: "pegasus", name: "Pegasus Bridge (Bénouville Bridge, Caen Canal)", x: 470, y: 530, kind: "bridge", status: "verified", sources: [S.wikiPeg] },
    { id: "horsabr", name: "Horsa Bridge (Ranville Bridge, River Orne)", x: 570, y: 500, kind: "bridge", status: "verified", sources: [S.wikiPeg] },
    { id: "caen", name: "Caen", x: 480, y: 880, kind: "town", status: "verified", sources: [S.wikiPeg] },
  ],
  timeline: [
    { t: "Night of 5 June", label: "Six Horsa gliders are towed from RAF Tarrant Rushton, Dorset", status: "verified", sources: [S.wikiPeg] },
    { t: "00:16", label: "Five of six gliders land within 47 yd (43 m) of their objectives", status: "verified", sources: [S.wikiPeg] },
    { t: "00:26", label: "Both bridges taken within 10 minutes of landing", status: "contested", sources: [S.wikiPeg, S.search] },
    { t: "03:00", label: "7th Parachute Battalion reinforces the bridges", status: "verified", sources: [S.wikiPeg] },
    { t: "00:07", label: "Gliders cast off from tugs", status: "unverified", sources: [S.search] },
    { t: "22:30", label: "Take-off from Tarrant Rushton", status: "unverified", sources: [S.search] },
  ],
};
