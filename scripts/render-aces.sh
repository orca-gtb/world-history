#!/usr/bin/env bash
# Render AceHartmann: 2D (angle) + 3D (swangle) + audio.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/ace-hartmann.mp4}
P=out/parts_ace; rm -rf $P; mkdir -p $P
M0=430; M1=1120   # model 3D: HOOK+BOARD+SPOT = 760 .. +360
M0=760; M1=1119
T=1270
common="--muted --codec=h264 --crf=18 --concurrency=4 --pixel-format=yuv420p"
npx remotion render src/index.ts AceHartmann $P/p1.mp4 --frames=0-$((M0-1)) --gl=angle $common
npx remotion render src/index.ts AceHartmann $P/p2.mp4 --frames=$M0-$M1 --gl=swangle $common
npx remotion render src/index.ts AceHartmann $P/p3.mp4 --frames=$((M1+1))-$((T-1)) --gl=angle $common
printf "file 'p1.mp4'\nfile 'p2.mp4'\nfile 'p3.mp4'\n" > $P/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $P/list.txt -i public/audio/aces.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
echo DONE "$OUT"
