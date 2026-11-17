// Pakai: node scripts/stills-any.mjs <entry> <compId> <outDir> <frame...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, id, out, ...fr] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve(entry) });
const chromiumOptions = { gl: "angle" };
const comp = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
for (const f of fr.map(Number)) await renderStill({ composition: comp, serveUrl, frame: f, output: `${out}/s${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 82, browserExecutable, chromiumOptions });
console.log("ok");
