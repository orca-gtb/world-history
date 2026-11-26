import type { GearId, HatId } from "./gear";
export type Faction = "us" | "germany" | "soviet";
export type UnitSpec = { id: string; faction: Faction; type: string; name: string; kind: "infantry" | "support"; weapon: string | null; wscale?: number; hat: HatId; coat: "short" | "greatcoat"; gear: GearId[]; stance: "std" | "deploy" | "tube" | "pistol"; role: string };
// 22 unit, tiga faksi, 1944. Perlengkapan per faksi mengikuti referensi periode; senjata dari rig bersama.
export const UNITS: UnitSpec[] = [
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
  { id: "su_rifleman", faction: "soviet", type: "rifleman", name: "Rifleman (Mosin–Nagant)", kind: "infantry", weapon: "mosin", hat: "ssh40", coat: "short", gear: ["skatka", "webbing", "canteen"], stance: "std", role: "line infantry" },
  { id: "su_smg", faction: "soviet", type: "smg_trooper", name: "SMG Trooper (PPSh-41)", kind: "infantry", weapon: "ppsh", hat: "ssh40", coat: "short", gear: ["skatka", "webbing", "shovel"], stance: "std", role: "assault" },
  { id: "su_dp", faction: "soviet", type: "dp_gunner", name: "DP-27 Gunner", kind: "infantry", weapon: "dp27", hat: "ssh40", coat: "short", gear: ["webbing", "ammo"], stance: "deploy", role: "light machine gun" },
  { id: "su_ptrd", faction: "soviet", type: "ptrd_rifleman", name: "PTRD Anti-Tank Rifleman", kind: "infantry", weapon: "ptrd", hat: "ssh40", coat: "short", gear: ["skatka", "webbing"], stance: "deploy", role: "anti-tank" },
  { id: "su_radio", faction: "soviet", type: "radio_operator", name: "Radio Operator (radist)", kind: "support", weapon: "mosin", wscale: 0.85, hat: "ssh40", coat: "short", gear: ["radio_su", "webbing"], stance: "std", role: "communications" },
  { id: "su_officer", faction: "soviet", type: "officer", name: "Officer", kind: "support", weapon: "pistol", hat: "peaked_su", coat: "greatcoat", gear: ["binoc", "holster", "mapcase"], stance: "pistol", role: "command" },
  { id: "su_political", faction: "soviet", type: "political_officer", name: "Political Officer (zampolit)", kind: "support", weapon: "pistol", hat: "peaked_su", coat: "greatcoat", gear: ["mapcase", "holster", "skatka"], stance: "pistol", role: "political" },
];
export const FACTION_DIR: Record<Faction, string> = { us: "us", germany: "germany", soviet: "soviet" };
