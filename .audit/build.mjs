import { build } from "esbuild";
await build({ entryPoints: [".audit/sweep.tsx"], bundle: true, platform: "node", format: "cjs", outfile: ".audit/sweep.cjs", jsx: "automatic", loader: { ".json": "json" }, logLevel: "error",
  plugins: [{ name: "stub", setup(b) { b.onResolve({ filter: /^@remotion\/fonts$/ }, () => ({ path: "x", namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "exports.loadFont=()=>Promise.resolve();" })); } }] });
