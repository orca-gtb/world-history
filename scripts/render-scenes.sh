#!/usr/bin/env bash
# Pra-render adegan dogfight 3D jadi klip public/scenes/<id>.mp4 (WebGL lewat swangle). Dipakai long-form (SceneVideo).
# Pakai: scripts/render-scenes.sh [id ...]   (default semua: first ambush goebel brno)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/scenes
BR=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for id in ${@:-first ambush goebel brno teaser stalk flyby closeup}; do
  n=$(node -e '
const t=require("./src/longform/timing.json"); const W={first:[14.3,28.8],ambush:[14.6,22.4],goebel:[9.9,null],brno:[4.6,8.0],teaser:[5.8,12.9],stalk:[-0.3,9.2],flyby:[22.4,30.4],closeup:[30.4,39.2]}; const P=1.6; const [a,b]=W[process.argv[1]];
const c07=t.chapters.find(c=>c.id==="c07"); const sec=b===null?(c07.frames-t.pre)/30-(a-P):b-a+2*P; console.log(Math.ceil(sec*30));' $id)
  npx remotion render src/sprites/index.tsx SceneClip public/scenes/$id.mp4 --props="{\"id\":\"$id\"}" --frames=0-$((n-1)) --gl=swangle --codec=h264 --crf=15 --concurrency=4 --pixel-format=yuv420p --browser-executable=$BR >/dev/null 2>&1
  echo "$id: $n frame ok"
done
