import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Diorama } from "../src/conquer/Diorama";
import P2 from "../src/conquer/part2-timeline.json";
const scenes = (P2.scenes as any[]).filter((s) => s.kind === "dio");
let bad = 0, frames = 0, maxEls = 0, maxId = "";
const report: Record<string, { n: number; max: number }> = {};
for (const s of scenes) {
  const dur = s.t1 - s.t0; let mx = 0, n = 0;
  for (let lt = 0; lt <= dur + 1e-6; lt += 0.1) {
    let html = "";
    try { html = renderToStaticMarkup(<Diorama id={s.id} lt={lt} dur={dur} />); }
    catch (e: any) { console.log("THROW", s.id, lt.toFixed(1), e.message); bad++; continue; }
    frames++; n++;
    const els = (html.match(/<(circle|rect|path|line|ellipse|polyline|g)\b/g) || []).length; mx = Math.max(mx, els);
    if (els > maxEls) { maxEls = els; maxId = `${s.id}@${lt.toFixed(1)}`; }
    const m = html.match(/NaN|Infinity|undefined|\[object/);
    if (m) { bad++; const i = html.indexOf(m[0]); if (bad < 15) console.log("BAD", s.id, lt.toFixed(1), m[0], html.slice(Math.max(0, i - 90), i + 40).replace(/\s+/g, " ")); }
    if (html.length < 2500) { bad++; console.log("EMPTY?", s.id, lt.toFixed(1), html.length); }
  }
  report[s.id] = { n, max: mx };
}
console.log(JSON.stringify(report));
console.log(`scenes=${scenes.length} frames=${frames} bad=${bad} maxElements=${maxEls} (${maxId})`);
