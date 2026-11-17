#!/usr/bin/env bash
# Ekspor src/timing.ts -> JSON untuk soundtrack.py
set -euo pipefail
cd "$(dirname "$0")/.."
npx esbuild src/timing.ts --bundle --platform=node --format=cjs --outfile=out/timing.cjs --log-level=error
node -e "const t=require('./out/timing.cjs');console.log(JSON.stringify({START:t.START,TOTAL:t.TOTAL,GLIDER:t.GLIDER,GL:t.GL}))" > out/timing.json
