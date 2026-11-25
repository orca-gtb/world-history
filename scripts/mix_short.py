"""Mix audio Short: VO (potongan kalimat) + SFX (sinkron dengan kejadian Diorama lewat dio-events.json) + musik di-duck.
Mastering ke -14 LUFS (layar HP). Pakai: python3 scripts/mix_short.py s01 [mux]"""
import json, subprocess, sys, os
sid = sys.argv[1]; TL = json.load(open(f"src/shorts/{sid}.timeline.json")); EV = json.load(open("src/conquer/dio-events.json"))
D = TL["total"]; S = "assets-src/sfx/"; C = []
def new(*a): C.append(a)  # (file, t0, offset, dur, gain, fade_in, fade_out, proc, pan)
SC = TL["scenes"]
EVMAP = {"salvo": ("el-katyusha.mp3", 3.4, -4, None), "gun": ("el-artillery-battery.mp3", 2.2, -5, None), "blast": ("explosion-in-battle.mp3", 2.8, -8, "mid"),
         "impact": ("far-away-war-explosions.mp3", 3.0, -9, "far"), "fire": ("war-field-explosion.mp3", 2.6, -8, "mid")}
BED = {"aftermathB": [("wind-blowing-ambience.mp3", 30.0, -14), ("big-army-crowd-marching.mp3", 0.0, -15)], "trench": [("wind-blowing-ambience.mp3", 5.0, -14), ("el-night-forest.mp3", 0.0, -16)],
       "barrageA": [("thunder-rumble.mp3", 0.0, -13)], "road": [("el-tanks-advance.mp3", 3.0, -14), ("wind-blowing-ambience.mp3", 12.0, -16)],
       "armorA": [("el-tanks-advance.mp3", 6.0, -9), ("wind-blowing-ambience.mp3", 20.0, -17)], "assault": [("el-footsteps-mud.mp3", 0.5, -8), ("el-mg-distant.mp3", 0.0, -16)]}
for n, sc in enumerate(SC):
    L = sc["t1"] - sc["t0"]; a = max(0.0, sc["t0"] - 0.3)
    for f, off, g in BED.get(sc["id"], []): new(f, a, off, min(L + 0.6, 24.0), g, 0.5, 0.6, None, 0)
    for k, (f, du, g, pr) in EVMAP.items():
        for i, q in enumerate(EV.get(sc["id"], {}).get(k, [])):
            if q + sc["t0"] < sc["t1"] - 0.2: new(f, sc["t0"] + q - 0.03, 6.4 if (k == "salvo" and i % 2) else 0.0, du, g, 0.02, 0.9, pr, ((i * 0.37) % 1.0) - 0.5)
new("thunder-rumble.mp3", 0.0, 0.5, 3.4, -9, 0.0, 1.2, 150, 0)             # hook: dentum rendah di angka 300.000
new("bomb-drop-impact.mp3", 0.12, 0.0, 2.6, -12, 0.0, 1.0, "mid", 0)
for q in (0.0,): new("deep-cinematic-wind-hum.mp3", 0.0, 3.0, D, -24, 0.8, 1.6, None, 0)
def cue(i, x):
    f, t0, of, du, g, fi, fo, pr, pan = x
    if t0 < 0: of, du, t0 = of - t0, du + t0, 0.0
    ch = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, du-fo)}:d={fo},volume={g}dB"
    if pr == "far": ch += ",lowpass=f=1100,lowpass=f=1100,highpass=f=40,aecho=0.8:0.6:70|140:0.35|0.22"
    elif pr == "mid": ch += ",lowpass=f=3200,aecho=0.8:0.55:45:0.22"
    elif pr: ch += f",lowpass=f={pr}"
    l, r = 1 - max(0, pan), 1 + min(0, pan)
    return ch + f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,asetpts=PTS-STARTPTS+{t0}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[s{i}]"
# tidak boleh melewati panjang file (audit Part 2): batasi durasi
FD = {f: float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", S + f])) for f in {c[0] for c in C}}
C[:] = [(c[0], c[1], c[2], min(c[3], FD[c[0]] - c[2] - 0.05)) + c[4:] for c in C]
args = ["ffmpeg", "-v", "error", "-y"]
for x in C: args += ["-i", S + x[0]]
n = len(C); vo = TL["vo"]
for v in vo: args += ["-i", v["file"]]
args += ["-stream_loop", "1", "-ss", "20", "-i", "assets-src/music/565.mp3"]
fil = [cue(i, x) for i, x in enumerate(C)]
for j, v in enumerate(vo):
    fil.append(f"[{n+j}]aresample=48000,aformat=channel_layouts=stereo,atrim={v['ss']}:{v['to']},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={max(0, v['dur']-0.05)}:d=0.05,volume=2dB,asetpts=PTS-STARTPTS+{v['start']}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[v{j}]")
mi = n + len(vo)
fil.append(f"[{mi}]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},asetpts=PTS-STARTPTS,volume=-25dB,afade=t=in:d=1.0,afade=t=out:st={D-2.0}:d=2.0,apad=whole_dur={D},atrim=0:{D}[mus]")
fil.append("".join(f"[v{j}]" for j in range(len(vo))) + f"amix=inputs={len(vo)}:normalize=0:duration=longest,asplit=3[vo][sc1][sc2]")
fil.append("".join(f"[s{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest[sfx]")
fil.append("[sfx][sc1]sidechaincompress=threshold=0.03:ratio=3:attack=30:release=400[sfxd]")
fil.append("[mus][sc2]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=600[musd]")
fil.append(f"[vo][sfxd][musd]amix=inputs=3:normalize=0:duration=longest,atrim=0:{D},loudnorm=I=-14:TP=-1.5:LRA=9[out]")
os.makedirs("out/shorts", exist_ok=True)
subprocess.run(args + ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", f"out/shorts/{sid}-audio.wav"], check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"out/shorts/{sid}-muted.mp4", "-i", f"out/shorts/{sid}-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", f"out/shorts/{sid}.mp4"], check=True)
print("ok", len(C), "cue SFX,", len(vo), "klip VO")
