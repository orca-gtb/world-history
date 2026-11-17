#!/usr/bin/env bash
# Render long-form per segmen (bisa dilanjutkan: segmen yang sudah ada dilewati), lalu gabung + mux audio master.
# Pakai: scripts/render-longform.sh [scale]   (scale default 1 = Full HD)
set -euo pipefail
cd "$(dirname "$0")/.."
SC=${1:-1}
OUT=out/lf-final; mkdir -p $OUT
T=$(node -e 'console.log(require("./src/longform/timing.json").total)')
STEP=1500
BR=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
i=0; : > $OUT/list.txt
for ((s=0; s<T; s+=STEP)); do
  e=$((s+STEP-1)); ((e>=T)) && e=$((T-1))
  f=$OUT/p$(printf %02d $i).mp4
  if [ ! -s "$f" ]; then
    npx remotion render src/longform/index.tsx HartmannLong "$f.tmp.mp4" --frames=$s-$e --scale=$SC --muted --gl=angle --codec=h264 --crf=18 --concurrency=4 --pixel-format=yuv420p --browser-executable=$BR >/dev/null 2>&1
    mv "$f.tmp.mp4" "$f"
  fi
  echo "file 'p$(printf %02d $i).mp4'" >> $OUT/list.txt
  echo "segmen $i ($s-$e) ok"
  i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i $OUT/list.txt -i public/audio/aces-longform.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/hartmann-longform-fullhd.mp4
echo DONE
