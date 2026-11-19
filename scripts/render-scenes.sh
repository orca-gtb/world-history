#!/usr/bin/env bash
# Pra-render adegan dogfight 3D jadi klip public/scenes/<id>.mp4 (WebGL lewat swangle). Dipakai long-form (SceneVideo).
# Pakai: scripts/render-scenes.sh [id ...]   (default semua: first ambush goebel brno)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/scenes
BR=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
for id in ${@:-first ambush goebel brno teaser stalk flyby closeup alfred ferry mustang stays}; do
  n=$(node -e '
const t=require("./src/longform/timing.json"); const W=require("./src/longform/scene-windows.json"); const P=1.6; const [a,b]=W[process.argv[1]];
const c07=t.chapters.find(c=>c.id==="c07"); const sec=b>=90?(c07.frames-t.pre)/30-(a-P):b-a+2*P; console.log(Math.ceil(sec*30));' $id)
  npx remotion render src/sprites/index.tsx SceneClip public/scenes/$id.mp4 --props="{\"id\":\"$id\"}" --frames=0-$((n-1)) --gl=swangle --codec=h264 --crf=15 --concurrency=4 --pixel-format=yuv420p --browser-executable=$BR >/dev/null 2>&1
  echo "$id: $n frame ok"
done
