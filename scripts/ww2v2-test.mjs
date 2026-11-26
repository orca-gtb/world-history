// Tes numerik rig v2: foot sliding (deviasi x dunia kaki tumpu) dan jangkauan kaki, per animasi.
import { build } from "esbuild"; import { pathToFileURL } from "url";
await build({ entryPoints: ["src/ww2/v2/gait.ts"], bundle: true, format: "esm", outfile: "/tmp/gait-test.mjs", logLevel: "error" });
const G = await import(pathToFileURL("/tmp/gait-test.mjs").href);
const rep = {};
for (const a of ["walk", "run"]) {
  const g = G.GAITS[a], v = G.speedOf(a), dt = 1 / 120, N = Math.round(g.T * 3 / dt);
  let worst = 0, overMax = 0, runs = 0;
  // kaki tumpu: ambil titik kontak (tumit saat u kecil, telapak datar, ujung saat akhir) dan cek posisi dunia konstan per sub-fase
  const seg = { heel: [], flat: [], toe: [] };
  for (let i = 0; i < N; i++) {
    const t = i * dt, p = G.solvePose({ anim: a, t, phase: 0, wclass: "rifle" }), u = ((t / g.T) % 1), hx = v * t;
    overMax = Math.max(overMax, p.legOver);
    if (u < g.duty) {
      const ang = p.nearFoot.psi, ax = p.nearFoot.ankle[0] + hx;
      const heel = ang > 0.5, toe = ang < -0.5;
      const k = heel ? "heel" : toe ? "toe" : "flat";
      const cp = heel ? ax - 6 * Math.cos(ang * Math.PI / 180) - 8 * Math.sin(ang * Math.PI / 180) * -1 : ax;
      (seg[k] ||= []).push({ u, c: k === "flat" ? ax : (k === "heel" ? ax + (-6 * Math.cos(ang * Math.PI / 180) + 8 * Math.sin(ang * Math.PI / 180)) : ax + (14 * Math.cos(ang * Math.PI / 180) + 8 * Math.sin(ang * Math.PI / 180))) });
    }
  }
  const out = {};
  for (const k of ["heel", "flat", "toe"]) {
    // per langkah (kelompok berurutan u naik), hitung deviasi maksimum dari rata-rata
    let groups = [], cur = []; let last = -1;
    for (const s of seg[k]) { if (s.u < last - 0.002) { groups.push(cur); cur = []; } cur.push(s); last = s.u; } if (cur.length) groups.push(cur);
    let d = 0; for (const gr of groups) { const m = gr.reduce((x, y) => x + y.c, 0) / gr.length; for (const s of gr) d = Math.max(d, Math.abs(s.c - m)); }
    out[k] = +d.toFixed(2);
  }
  rep[a] = { speed_cm_s: +v.toFixed(1), slide_cm: out, leg_over_reach_max_cm: +overMax.toFixed(3) };
}
console.log(JSON.stringify(rep, null, 1));
// --- tes lengan & senjata: tangan harus selalu di titik pegang (tanpa lepas), semua animasi x semua senjata ---
await build({ entryPoints: ["src/ww2/v2/rig2.ts"], bundle: true, format: "esm", outfile: "/tmp/rig2-test.mjs", logLevel: "error" });
const R = await import(pathToFileURL("/tmp/rig2-test.mjs").href);
const arm = {};
for (const w of Object.keys(R.WD)) for (const a of ["idle", "walk", "run", "aim", "fire"]) {
  let worst = 0, n = 0;
  for (let t = 0; t < 6; t += 1 / 60) {
    const r = R.solveRig({ anim: a, t, phase: 0.13, weapon: w, aimK: Math.min(1, t / 0.6), shots: [1, 1.1, 1.2, 2, 3] });
    worst = Math.max(worst, r.armOver); n++;
  }
  arm[`${w}/${a}`] = +worst.toFixed(2);
}
const bad = Object.entries(arm).filter(([, v]) => v > 0.05);
console.log("arm_over_reach_max_cm:", Math.max(...Object.values(arm)).toFixed(2), "| kombinasi melampaui jangkauan:", bad.length, bad.slice(0, 8).map(([k, v]) => k + "=" + v).join(", "));
