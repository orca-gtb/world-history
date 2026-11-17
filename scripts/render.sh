#!/usr/bin/env bash
# Render episode: bagian 2D (angle, cepat) + bagian 3D (swangle), disambung, lalu mux soundtrack.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/pegasus-bridge.mp4}
scripts/export-timing.sh
G=$(node -e "const t=require('./out/timing.json');console.log(t.START.glider)")
T=$(node -e "const t=require('./out/timing.json');console.log(t.TOTAL)")
P=out/parts; rm -rf $P; mkdir -p $P
common="--muted --codec=h264 --crf=18 --concurrency=4 --pixel-format=yuv420p"
npx remotion render src/index.ts PegasusBridge $P/p1.mp4 --frames=0-$((G-1)) --gl=angle $common
npx remotion render src/index.ts PegasusBridge $P/p2.mp4 --frames=$G-$((T-1)) --gl=swangle $common
printf "file 'p1.mp4'\nfile 'p2.mp4'\n" > $P/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $P/list.txt -i public/audio/soundtrack.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo DONE "$OUT"
