"""Mix soundscape prototype Bobruisk (lapisan cue sheet). Sumber: assets-src/sfx (Mixkit, lisensi belum dibaca).
Lapisan: 1 ambient, 2 jauh, 3 depan, 4 komunikasi, 5 efek peristiwa, 6 transisi. Waktu = PT/AIR di src/conquer/Proto.tsx."""
import subprocess
D = 26.0
import sys
GAIN = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
SFX = "assets-src/sfx/"
# (file, mulai detik, offset dalam file, durasi, gain dB, fade-in, fade-out, lowpass Hz atau None, pan -1..1)
CUES = [
  # 1 ambient: dengung angin rendah sepanjang peta, turun saat still
  ("deep-cinematic-wind-hum.mp3", 0.0, 0.0, 26.0, -24, 1.5, 2.0, None, 0),
  # 2 jauh: artileri jauh saat peta 25-26 Jun
  ("distant-war-explosions.mp3", 1.2, 0.0, 4.0, -20, 0.2, 1.0, 900, -0.4),
  ("far-away-war-explosions.mp3", 3.6, 0.0, 5.0, -21, 0.2, 1.2, 900, 0.4),
  # 6 transisi peta -> still
  ("cinematic-wind-swoosh.mp3", 6.8, 0.0, 1.5, -12, 0.05, 0.3, None, 0),
  # still: ambient hutan/angin (1), pasukan bergerak (4), ledakan jauh (2)
  ("wind-in-the-forest.mp3", 7.2, 2.0, 8.0, -14, 1.0, 1.2, None, 0),
  ("big-army-crowd-marching.mp3", 8.4, 0.0, 6.0, -23, 1.5, 1.5, 2500, 0.2),
  ("far-away-war-explosions.mp3", 9.6, 0.0, 4.0, -19, 0.1, 1.0, 700, -0.6),
  ("distant-war-explosions.mp3", 12.6, 0.0, 3.0, -21, 0.1, 0.8, 700, 0.5),
  # 6 transisi still -> peta
  ("cinematic-wind-swoosh.mp3", 14.7, 0.0, 1.5, -12, 0.05, 0.3, None, 0),
  # 4 komunikasi: radio statis di bawah kantong
  ("radio-noise-static-and-crackles.mp3", 16.0, 0.0, 9.0, -27, 0.8, 1.5, 3500, 0),
  # 5 efek: serangan udara (sinkron AIR)
  ("bomb-drop-impact.mp3", 17.6 - 1.2, 0.0, 4.0, -14, 0.05, 1.0, None, -0.3),
  ("explosion-in-battle.mp3", 18.5, 0.0, 3.0, -16, 0.02, 1.0, None, 0.3),
  ("war-field-explosion.mp3", 19.1, 0.0, 3.0, -17, 0.02, 1.0, None, -0.1),
  ("bomb-distant-explotion.mp3", 20.2, 0.0, 3.0, -15, 0.02, 1.0, None, 0.4),
  ("explosion-in-battle.mp3", 21.0, 0.5, 2.5, -17, 0.02, 1.0, None, -0.4),
  ("war-field-explosion.mp3", 22.1, 0.5, 3.0, -16, 0.02, 1.2, None, 0.1),
]
args = ["ffmpeg", "-v", "error", "-y"]
fil = []
for i, (f, st, of, du, g, fi, fo, lp, pan) in enumerate(CUES):
    args += ["-i", SFX + f]
    chain = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0,du-fo)}:d={fo},volume={g}dB"
    if lp: chain += f",lowpass=f={lp}"
    l, r = (1 - max(0, pan)), (1 + min(0, pan))
    chain += f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,adelay={int(st*1000)}|{int(st*1000)},apad=whole_dur={D}[a{i}]"
    fil.append(chain)
fil.append("".join(f"[a{i}]" for i in range(len(CUES))) + f"amix=inputs={len(CUES)}:normalize=0:duration=longest,atrim=0:{D},afade=t=out:st={D-1.6}:d=1.6,volume={GAIN}dB,alimiter=limit=0.8:level=0[out]")
args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", "out/conquer/proto-audio.wav"]
subprocess.run(args, check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/conquer/proto-muted.mp4", "-i", "out/conquer/proto-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "out/bobruisk-proto-v1.mp4"], check=True)
print("ok")
