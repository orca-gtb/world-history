#!/usr/bin/env bash
# Mix audio Short teaser Hartmann: VO (vo-teaser/vo.mp3) + musik Mixkit 565 (ducking) + SFX sintetis. Master -16 LUFS, limiter 0.80.
set -euo pipefail
cd "$(dirname "$0")/.."
D=51.8
ffmpeg -v error -y -i vo-teaser/vo.mp3 -i assets-src/music/565.mp3 \
 -f lavfi -i "sine=f=48:d=1.6" -f lavfi -i "sine=f=1700:d=0.05" \
 -filter_complex "
 [0]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=$D,atrim=0:$D,asplit=2[vo][vsc];
 [1]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$D,asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st=$(echo "$D-2.2"|bc):d=2.2,
   volume='0.30*if(between(t,13,16.4),0.55,1)*if(between(t,16.5,20),1.5,1)':eval=frame[m0];
 [m0][vsc]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=450[mduck];
 [2]afade=t=out:st=0.2:d=1.4,volume=1.1,aformat=channel_layouts=stereo,adelay=16550|16550,apad=whole_dur=$D,atrim=0:$D[boom];
 [3]volume=0.5,aformat=channel_layouts=stereo,asplit=4[k1][k2][k3][k4];
 [k1]adelay=25050|25050[a1];[k2]adelay=25750|25750[a2];[k3]adelay=26550|26550[a3];[k4]adelay=27270|27270[a4];
 [vo][mduck][boom][a1][a2][a3][a4]amix=inputs=7:normalize=0:duration=longest,
 loudnorm=I=-16:TP=-1.5:LRA=9,alimiter=limit=0.80:level=0,atrim=0:$D[out]" \
 -map "[out]" -ar 48000 out/teaser/audio.wav
ffmpeg -v error -y -i out/teaser/video-muted.mp4 -i out/teaser/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart out/hartmann-teaser-short-v1.mp4
