// Ekspor paket siluet WWII ke assets/ww2/ (SVG + metadata). Pakai: node scripts/ww2-export.mjs
import { build } from "esbuild"; import fs from "fs"; import path from "path";
await build({ entryPoints: ["src/ww2/export.tsx"], bundle: true, platform: "node", format: "cjs", outfile: ".audit/ww2export.cjs", jsx: "automatic", logLevel: "error", external: ["react", "react-dom"] });
const m = (await import("../.audit/ww2export.cjs")).default ?? (await import("../.audit/ww2export.cjs"));
const { UNITS, ANIMS, FIG, staticSvg, stripSvg } = m;
const ROOT = "assets/ww2"; const w = (f, c) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };
let n = 0; const meta = [];
for (const u of UNITS) {
  const base = `${ROOT}/${u.faction}`; const staticPath = `${base}/${u.kind}/${u.id}.svg`; w(staticPath, staticSvg(u)); n++;
  const anim = {};
  for (const a of ANIMS) { const p = `${base}/animations/${u.id}/${a.id}.svg`; w(p, stripSvg(u, a.id)); anim[a.id] = { path: p, frames: a.frames, fps: a.fps, loop: a.loop, cell: [FIG.w, FIG.h] }; n++; }
  meta.push({ unit_id: u.id, faction: u.faction, unit_type: u.type, name: u.name, kind: u.kind, role: u.role, weapon: u.weapon, hat: u.hat, coat: u.coat, gear: u.gear, stance: u.stance, animation_set: ANIMS.map((a) => a.id), scale_reference: { unit_px: 1, height_px: 172, note: "1 satuan ≈ 1 cm; tinggi berdiri ±172" }, scale: 1, depth: 0.5, layer_depth_hint: "foreground 0.8–1.0, midground 0.4–0.7, background 0.0–0.3", anchor: { x: FIG.cx, y: FIG.gy, cell: [FIG.w, FIG.h] }, asset_paths: { static: staticPath, animations: anim } });
}
w(`${ROOT}/metadata/units.json`, JSON.stringify({ version: "1.0", period: "WWII 1944", facing: "right (+x), mirror with scale(-1,1)", units: meta }, null, 1));
w(`${ROOT}/shared/animation_library/animation_library.json`, JSON.stringify({ version: "1.0", animations: ANIMS, note: "Pose dihitung dari parameter sendi (src/ww2/anim.ts poseOf), jadi engine bisa menghidupkan unit langsung dengan <UnitFigure spec anim u />, atau memakai sprite strip SVG di folder animations/." }, null, 1));
console.log("files:", n + 2, "units:", UNITS.length, "anims/unit:", ANIMS.length);
