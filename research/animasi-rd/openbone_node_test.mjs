import { readFileSync, writeFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { parseDocument, textureAssets } from "@openbone/core";
import { encodePng } from "@openbone/export";
import { CanvasRenderer } from "@openbone/render-canvas";
import { OpenBoneInstance } from "@openbone/runtime";
const doc = parseDocument(readFileSync("knight.obone"));
const images = new Map();
for (const img of textureAssets(doc)) images.set(img.id, await loadImage(readFileSync(img.src)));
const w = doc.width, h = doc.height, canvas = createCanvas(w, h), ctx = canvas.getContext("2d");
const renderer = new CanvasRenderer(ctx, (id) => images.get(id));
const k = new OpenBoneInstance(doc); k.animationState.setAnimation(0, "walk", true, 0);
const t0 = performance.now(); const N = 90;
for (let i = 0; i < N; i++) { k.advance(i === 0 ? 0 : 1 / 30); renderer.render(k.skeleton, { view: { x: 0, y: 0, zoom: 1 }, background: "#d9c298" });
  if ([0, 10, 20, 30].includes(i)) writeFileSync(`f${i}.png`, await encodePng(ctx.getImageData(0, 0, w, h))); }
console.log("ms/frame", ((performance.now() - t0) / N).toFixed(1), "frames", N);
