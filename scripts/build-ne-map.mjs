// Natural Earth (domain publik) 50m countries -> src/longform/mapdata.ts (ring disederhanakan, lon/lat).
// Pakai: node scripts/build-ne-map.mjs assets-src/ne/ne_50m_admin_0_countries.geojson src/longform/mapdata.ts
import fs from "node:fs";
const [, , src, out] = process.argv;
const gj = JSON.parse(fs.readFileSync(src, "utf8"));
const EX = { x0: -25, x1: 150, y0: 0, y1: 75 };
const TOL = 0.05;
const dp = (pts, tol) => {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b]; const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > md) { md = d; mi = i; } }
    if (md > tol && mi > 0) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
};
const res = [];
for (const f of gj.features) {
  const name = f.properties.NAME_EN || f.properties.NAME || f.properties.ADMIN;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = [];
  for (const poly of polys) {
    const ring = poly[0];
    const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
    if (Math.max(...xs) < EX.x0 || Math.min(...xs) > EX.x1 || Math.max(...ys) < EX.y0 || Math.min(...ys) > EX.y1) continue;
    const m = Math.floor(ring.length / 2); const s = [...dp(ring.slice(0, m + 1), TOL), ...dp(ring.slice(m), TOL).slice(1)]; if (s.length < 4) continue;
    rings.push(s.flatMap(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]));
  }
  if (rings.length) res.push({ n: name, r: rings });
}
fs.writeFileSync(out, `// DIHASILKAN oleh scripts/build-ne-map.mjs dari Natural Earth 50m (domain publik). Jangan edit manual.\nexport type Country = { n: string; r: number[][] };\nexport const COUNTRIES: Country[] = ${JSON.stringify(res)};\n`);
console.log("countries", res.length, "bytes", fs.statSync(out).size);
