// Pakai: node scripts/stills-gl-props.mjs <entry> <compId> <outDir> '<props json>' <frame...>  (WebGL lewat swangle)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [entry, id, out, props, ...fr] = process.argv.slice(2);
const inputProps = JSON.parse(props);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve(entry) });
const chromiumOptions = { gl: "swangle" };
const comp = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
for (const f of fr.map(Number)) await renderStill({ composition: comp, serveUrl, frame: f, output: `${out}/s${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 82, browserExecutable, chromiumOptions, inputProps });
console.log("ok");
