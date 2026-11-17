import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const out = process.argv[2];
const frames = process.argv.slice(3).map(Number);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/v4/index.tsx") });
const chromiumOptions = { gl: "angle" };
const comp = await selectComposition({ serveUrl, id: "AceHartmannV4", browserExecutable, chromiumOptions });
for (const f of frames) {
  await renderStill({ composition: comp, serveUrl, frame: f, output: `${out}/s${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 80, browserExecutable, chromiumOptions });
}
console.log("ok");
