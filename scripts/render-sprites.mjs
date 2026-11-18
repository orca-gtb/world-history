// Pakai: node scripts/render-sprites.mjs <outDir> '<json array of {name, props}>'
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, jobs] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/sprites/index.tsx") });
const chromiumOptions = { gl: "swangle" };
for (const j of JSON.parse(jobs)) {
  const comp = await selectComposition({ serveUrl, id: "Sprite", browserExecutable, chromiumOptions, inputProps: j.props });
  await renderStill({ composition: comp, serveUrl, frame: 0, output: `${out}/${j.name}.png`, imageFormat: "png", browserExecutable, chromiumOptions, inputProps: j.props, scale: j.scale ?? 1 });
  console.log("done", j.name);
}
