"""Mix prototype v2 Bobruisk (33 dtk). Peta: lapisan v1. Still retreat (t0 = 13.6): cue sheet research/bobruisk/briefs/retreat-still-eval-and-cues.md.
Pakai: python3 scripts/mix_proto2.py <gain_dB>. Sumber: assets-src/sfx (Mixkit + ElevenLabs)."""
import subprocess, sys
D = 33.0; G = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
S = "assets-src/sfx/"; T0 = 13.6  # still mulai
# (file, mulai, offset, durasi, gain dB, fadein, fadeout, lowpass, pan, bus) — bus "bed" = ikut momen teredam
C = [
 # ---- peta 0-12.4 ----
 ("deep-cinematic-wind-hum.mp3", 0.0, 0.0, 13.0, -16, 1.5, 1.5, None, 0, "map"),
 ("distant-war-explosions.mp3", 0.8, 0.0, 4.0, -13, 0.2, 1.0, 900, -0.4, "map"),
 ("far-away-war-explosions.mp3", 3.0, 0.0, 5.0, -14, 0.2, 1.2, 900, 0.4, "map"),
 ("radio-noise-static-and-crackles.mp3", 6.0, 0.0, 6.8, -23, 0.8, 1.2, 3500, 0, "map"),
 ("bomb-drop-impact.mp3", 7.6 - 1.2, 0.0, 4.0, -8, 0.05, 1.0, None, -0.3, "map"),
 ("explosion-in-battle.mp3", 8.5, 0.0, 3.0, -10, 0.02, 1.0, None, 0.3, "map"),
 ("war-field-explosion.mp3", 9.1, 0.0, 3.0, -11, 0.02, 1.0, None, -0.1, "map"),
 ("bomb-distant-explotion.mp3", 10.2, 0.0, 2.5, -9, 0.02, 1.0, None, 0.4, "map"),
 ("explosion-in-battle.mp3", 11.0, 0.5, 2.0, -12, 0.02, 1.0, None, -0.4, "map"),
 ("cinematic-wind-swoosh.mp3", 12.6, 0.0, 1.5, -12, 0.05, 0.3, None, 0, "map"),
 # ---- still retreat (J-cut 1 dtk sebelum T0) ----
 ("wind-blowing-ambience.mp3", T0 - 1.0, 2.0, 13.4, -14, 1.0, 1.0, None, 0, "bed"),
 ("thunder-rumble.mp3", T0 - 1.0, 1.0, 14.0, -12, 1.0, 1.5, 150, 0, "bed"),
 ("el-truck-engine-away.mp3", T0 - 1.0, 2.5, 11.2, 8, 1.0, 1.5, None, 0.2, "bed"),
 ("el-tires-mud.mp3", T0 + 0.5, 3.0, 10.5, 6, 0.8, 2.0, None, 0.2, "bed"),
 ("truck-driving-steady.mp3", T0, 2.0, 11.5, -22, 1.5, 2.0, 1800, 0.45, "bed"),
 ("el-footsteps-mud.mp3", T0 + 1.5, 0.5, 7.5, 6, 0.4, 1.5, None, -0.3, "bed"),
 ("el-gear-rattle.mp3", T0 + 1.5, 1.5, 7.0, 13, 0.4, 1.5, None, -0.25, "bed"),
 ("el-breathing.mp3", T0 + 3.0, 1.0, 4.5, 6, 0.4, 1.0, None, -0.15, "bed"),
 ("el-shouts.mp3", T0 + 2.4, 0.2, 1.5, -6, 0.02, 0.4, None, 0.3, "bed"),
 ("el-shouts.mp3", T0 + 8.2, 1.0, 1.5, -9, 0.02, 0.4, 3000, -0.35, "bed"),
 ("el-mg-distant.mp3", T0 + 0.8, 0.0, 1.6, -11, 0.05, 0.3, None, -0.6, "bed"),
 ("el-mg-distant.mp3", T0 + 3.6, 4.7, 1.2, -11, 0.05, 0.3, None, 0.6, "bed"),
 ("el-mg-distant.mp3", T0 + 7.2, 6.5, 1.2, -12, 0.05, 0.3, None, -0.5, "bed"),
 ("el-mg-distant.mp3", T0 + 10.4, 0.0, 1.4, -14, 0.05, 0.4, 2500, 0.5, "bed"),
 ("far-away-war-explosions.mp3", T0 + 1.8, 0.0, 3.5, -16, 0.05, 1.0, 1200, 0.6, "bed"),
 # ledakan dekat (tidak ikut diredam) + desis + puing
 ("el-shell-whistle.mp3", T0 + 4.3, 0.0, 1.35, -8, 0.02, 0.1, None, 0.5, "dry"),
 ("war-field-explosion.mp3", T0 + 5.6, 0.0, 4.0, -4, 0.0, 1.5, None, 0.5, "dry"),
 ("explosion-in-battle.mp3", T0 + 5.6, 0.0, 3.0, -7, 0.0, 1.2, None, 0.3, "dry"),
 ("stone-debris-falling.mp3", T0 + 5.8, 0.5, 2.5, 4, 0.05, 0.8, None, 0.3, "dry"),
 ("bomb-distant-explotion.mp3", T0 + 9.6, 0.0, 2.5, -12, 0.02, 1.0, None, -0.4, "bed"),
 ("far-away-war-explosions.mp3", T0 + 11.2, 0.0, 2.5, -18, 0.02, 1.0, 900, 0, "bed"),
 # ---- kembali ke peta 25.6-33 (L-cut gemuruh) ----
 ("cinematic-wind-swoosh.mp3", 25.7, 0.0, 1.5, -12, 0.05, 0.3, None, 0, "map"),
 ("deep-cinematic-wind-hum.mp3", 25.6, 20.0, 7.4, -16, 1.0, 1.5, None, 0, "map"),
 ("el-mg-distant.mp3", 27.4, 4.7, 1.2, -18, 0.05, 0.4, 1500, -0.3, "map"),
 ("distant-war-explosions.mp3", 28.2, 0.0, 3.5, -16, 0.1, 1.0, 800, 0.3, "map"),
]
args = ["ffmpeg", "-v", "error", "-y"]; fil = []; buses = {"map": [], "bed": [], "dry": []}
for i, (f, st, of, du, g, fi, fo, lp, pan, bus) in enumerate(C):
    args += ["-i", S + f]
    ch = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0,du-fo)}:d={fo},volume={g}dB"
    if lp: ch += f",lowpass=f={lp}"
    l, r = 1 - max(0, pan), 1 + min(0, pan)
    ch += f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,asetpts=PTS-STARTPTS+{st}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[a{i}]"
    fil.append(ch); buses[bus].append(f"[a{i}]")
for b, ins in buses.items():
    fil.append("".join(ins) + f"amix=inputs={len(ins)}:normalize=0:duration=longest[{b}]")
# momen teredam: bed → lowpass 400 Hz pada T0+5.7..T0+6.9, kembali dalam 1 dtk
a, b = T0 + 5.7, T0 + 6.9
m = f"if(lt(t,{a}),0,if(lt(t,{a}+0.08),(t-{a})/0.08,if(lt(t,{b}),1,if(lt(t,{b}+1.0),1-(t-{b})/1.0,0))))"
fil.append("[bed]asplit=2[bd][bw]")
fil.append(f"[bd]volume='1-0.9*({m})':eval=frame[bd2]")
fil.append(f"[bw]lowpass=f=400,lowpass=f=400,volume='1.3*({m})':eval=frame[bw2]")
fil.append(f"[map][bd2][bw2][dry]amix=inputs=4:normalize=0:duration=longest,atrim=0:{D},afade=t=out:st={D-1.4}:d=1.4,volume={G}dB,alimiter=limit=0.8:level=0[out]")
args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", "out/conquer/proto2-audio.wav"]
subprocess.run(args, check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/conquer/proto2-muted.mp4", "-i", "out/conquer/proto2-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "out/bobruisk-proto-v2.mp4"], check=True)
print("ok")
