// Mengubah GeoJSON OpenStreetMap (hasil Overpass Turbo "Export → GeoJSON") menjadi path SVG lokal untuk peta layar penuh.
// Pakai: node scripts/geojson-to-map.mjs peta.geojson src/data/realmap.ts
// Atribusi WAJIB di video/deskripsi: "Map data © OpenStreetMap contributors (ODbL)".
import fs from "node:fs";
const [, , src, out] = process.argv;
const gj = JSON.parse(fs.readFileSync(src, "utf8"));
const feats = gj.features ?? [];

// bbox dari semua koordinat
let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
const eachCoord = (g, fn) => {
  const t = g.type, c = g.coordinates;
  if (t === "Point") fn(c);
  else if (t === "LineString" || t === "MultiPoint") c.forEach(fn);
  else if (t === "Polygon" || t === "MultiLineString") c.forEach((r) => r.forEach(fn));
  else if (t === "MultiPolygon") c.forEach((p) => p.forEach((r) => r.forEach(fn)));
};
feats.forEach((f) => f.geometry && eachCoord(f.geometry, ([x, y]) => { minLon = Math.min(minLon, x); maxLon = Math.max(maxLon, x); minLat = Math.min(minLat, y); maxLat = Math.max(maxLat, y); }));
// proyeksi Mercator -> koordinat lokal 0..1000 (sisi terpanjang = 1000)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const x0 = minLon, y1 = merc(maxLat);
const kx = (maxLon - minLon) * (Math.PI / 180), ky = merc(maxLat) - merc(minLat);
const scale = 1000 / Math.max(kx, ky);
const P = ([lon, lat]) => [((lon - x0) * Math.PI / 180) * scale, (y1 - merc(lat)) * scale];
const d = (pts, close) => "M" + pts.map((p) => P(p).map((v) => v.toFixed(1)).join(" ")).join("L") + (close ? "Z" : "");

const groups = { water: [], waterway: [], roads: [], rail: [], buildings: [], other: [] };
const names = [];
for (const f of feats) {
  const g = f.geometry; if (!g) continue;
  const p = f.properties ?? {};
  const lines = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
  const polys = g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((x) => x[0]) : [];
  if (p.waterway || p.natural === "water") {
    if (polys.length) polys.forEach((r) => groups.water.push(d(r, true)));
    else lines.forEach((l) => groups.waterway.push(d(l, false)));
  } else if (p.highway) lines.forEach((l) => groups.roads.push(d(l, false)));
  else if (p.railway) lines.forEach((l) => groups.rail.push(d(l, false)));
  else if (p.building) polys.forEach((r) => groups.buildings.push(d(r, true)));
  else polys.forEach((r) => groups.other.push(d(r, true)));
  if (p.name && g.type === "Point") names.push({ name: p.name, xy: P(g.coordinates).map((v) => +v.toFixed(1)) });
}
const ts = `// DIHASILKAN oleh scripts/geojson-to-map.mjs — jangan edit manual.\n// Map data © OpenStreetMap contributors (ODbL).\nexport const REALMAP = ${JSON.stringify({ bbox: [minLon, minLat, maxLon, maxLat], scale, groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.join("")])), names })} as const;\n`;
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(out, ts);
console.log("fitur", feats.length, "bbox", [minLon, minLat, maxLon, maxLat].map((v) => +v.toFixed(4)), "bytes", ts.length);
