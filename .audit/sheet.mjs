import { build } from "esbuild"; import fs from "fs";
await build({ entryPoints: ["src/ww2/sheet.tsx"], bundle: true, platform: "node", format: "cjs", outfile: ".audit/sheet.cjs", jsx: "automatic", logLevel: "error", external: ["react", "react-dom"] });
const { sheet } = await import("../.audit/sheet.cjs");
const dir = process.argv[2]; for (const f of ["us", "germany", "soviet"]) fs.writeFileSync(`${dir}/ww2-${f}.svg`, sheet(f));
console.log("ok");
