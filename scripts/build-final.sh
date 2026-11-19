#!/usr/bin/env bash
# Pipeline final long-form: spec.json -> SFX -> musik (+peta dinamika) -> mix narasi -> master -2 LUFS 16 -> render video -> (salinan tonton).
# Klip adegan 3D (public/scenes) harus sudah ada: scripts/render-scenes.sh [id ...]
set -euo pipefail
cd "$(dirname "$0")/.."
npx esbuild src/longform/spec.ts --bundle --format=cjs --platform=node --outfile=/tmp/spec.cjs --log-level=error
node -e 'const m=require("/tmp/spec.cjs");require("fs").writeFileSync("longform/spec.json",JSON.stringify(m.CHAPTERS))'
python3 scripts/gen-timing.py 45 300
NO_PAD=1 python3 scripts/soundtrack_longform.py out/longform-sfx.wav
python3 scripts/music_mixkit.py out/longform-sfx.wav out/longform-bed-final.wav
python3 scripts/mix_vo_longform.py out/longform-bed-final.wav longform/vo out/longform-mix-final.wav
G=$(ffmpeg -hide_banner -i out/longform-mix-final.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
V=$(python3 -c "print(round(-16-($G),2))")
ffmpeg -v error -y -i out/longform-mix-final.wav -af "volume=${V}dB,alimiter=limit=0.80:level=false" -ar 48000 -c:a pcm_s16le out/longform-master-final.wav
cp out/longform-master-final.wav public/audio/aces-longform.wav
rm -f out/lf-final/p*.mp4 out/lf-final/*.tmp.mp4
scripts/render-longform.sh 1
echo PIPELINE_DONE
