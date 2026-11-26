"""Mix audio Short: VO (potongan kalimat) + SFX (sinkron dengan kejadian Diorama lewat dio-events.json) + musik di-duck.
Mastering ke -14 LUFS (layar HP). Pakai: python3 scripts/mix_short.py s01 [mux]"""
import json, subprocess, sys, os
sid = sys.argv[1]; TL = json.load(open(f"src/shorts/{sid}.timeline.json")); EV = json.load(open("src/conquer/dio-events.json"))
D = TL["total"]; S = "assets-src/sfx/"; C = []
def new(*a): C.append(a)  # (file, t0, offset, dur, gain, fade_in, fade_out, proc, pan)
SC = TL["scenes"]
IDX = json.load(open(S + "slices/index.json"))
def sl(name, n): L = IDX[name]; return L[n % len(L)]
BED = {"aftermathB": [("wind-blowing-ambience.mp3", 30.0, -14), ("big-army-crowd-marching.mp3", 0.0, -15)], "trench": [("wind-blowing-ambience.mp3", 5.0, -14), ("el-night-forest.mp3", 0.0, -16)],
       "barrageA": [("thunder-rumble.mp3", 0.0, -13)], "road": [("wind-blowing-ambience.mp3", 12.0, -17)], "armorA": [("wind-blowing-ambience.mp3", 20.0, -18)], "assault": [("el-footsteps-mud.mp3", 0.5, -8)]}
# Karakter per kendaraan (dari perangkat keras, BUKAN rekaman terverifikasi): T-34 = rantai baja tanpa karet + diesel V-2 V12 (berisik, berderak);
# Panzer IV = deru mesin bensin yang lebih tinggi (el2-pz4-tracks, dipakai saat tank Jerman muncul).
TRACKS = {"armorA": "el2-t34-tracks.mp3", "road": "el2-t34-tracks.mp3"}
for n, sc in enumerate(SC):
    L = sc["t1"] - sc["t0"]; a = max(0.0, sc["t0"] - 0.3); e = EV.get(sc["id"], {})
    for f, off, g in BED.get(sc["id"], []): new(f, a, off, min(L + 0.6, 24.0), g, 0.5, 0.6, None, 0)
    if sc["id"] in TRACKS: new(TRACKS[sc["id"]], a, 0.0, min(L + 0.6, 11.9), 1, 0.5, 0.8, None, 0.1)
    for i, q in enumerate(e.get("salvo", [])): z = sl("el2-katyusha", i); new(z["file"], sc["t0"] + q - 0.1, 0.0, min(z["dur"], 5.0), 1, 0.03, 1.2, None, -0.35 + 0.7 * (i % 2))
    for i, q in enumerate(e.get("gun", [])): z = sl("el2-artillery", i); new(z["file"], sc["t0"] + q - 0.04, 0.0, z["dur"], -2, 0.0, 0.6, None, (-0.45, 0.4, -0.15)[i % 3])
    for i, q in enumerate(e.get("fire", [])): z = sl("el2-t34-gun", 0); new(z["file"], sc["t0"] + q - 0.02, 0.0, 3.6, 1, 0.0, 0.8, "mid", (-0.3, 0.25, -0.1, 0.4)[i % 4])
    for i, q in enumerate(e.get("blast", [])):
        if q + sc["t0"] < sc["t1"] - 0.2: new("explosion-in-battle.mp3", sc["t0"] + q - 0.03, 0.0, 2.8, -8, 0.02, 0.9, "mid", ((i * 0.37) % 1.0) - 0.5)
    for i, q in enumerate(e.get("impact", [])): new("far-away-war-explosions.mp3", sc["t0"] + q, 0.0, 3.0, -9, 0.02, 0.9, "far", 0.5)
    for i, q in enumerate(e.get("mg", [])):                 # MG-42 menembaki unit Soviet: dua semburan beruntun + desing peluru meleset
        if q + sc["t0"] < sc["t1"] - 0.3:
            z0, z1 = sl("el2-mg42", 2 * i), sl("el2-mg42", 2 * i + 1); w = sl("el2-bullet-whizz", i)
            new(z0["file"], sc["t0"] + q, 0.0, z0["dur"], -7, 0.0, 0.05, "mid", 0.55); new(z1["file"], sc["t0"] + q + z0["dur"] - 0.04, 0.0, z1["dur"], -7, 0.0, 0.05, "mid", 0.55)
            new(w["file"], sc["t0"] + q + 0.12, 0.0, w["dur"], -6, 0.0, 0.3, None, ((i * 0.77) % 1.4) - 0.7)
    if sc["id"] == "assault": new("el2-urra.mp3", sc["t0"] + 0.1, 0.0, 8.0, 8, 0.4, 1.0, None, 0)   # teriakan "Urra" saat serbuan infanteri Soviet
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
fil.append("[sfx][sc1]sidechaincompress=threshold=0.008:ratio=9:attack=15:release=320[sfxd]")
fil.append("[mus][sc2]sidechaincompress=threshold=0.02:ratio=8:attack=30:release=600[musd]")
fil.append(f"[vo][sfxd][musd]amix=inputs=3:normalize=0:duration=longest,atrim=0:{D},loudnorm=I=-14:TP=-1.5:LRA=9[out]")
os.makedirs("out/shorts", exist_ok=True)
if os.environ.get("STEMS") == "1":   # QC: stem VO dan stem latar terpisah
    fil2 = [f for f in fil[:-1]] + ["[sfxd][musd]amix=inputs=2:normalize=0:duration=longest[bed]"]
    subprocess.run(args + ["-filter_complex", ";".join(fil2), "-map", "[vo]", "-ar", "48000", f"out/shorts/{sid}-stem-vo.wav", "-map", "[bed]", "-ar", "48000", f"out/shorts/{sid}-stem-bed.wav"], check=True); sys.exit(0)
subprocess.run(args + ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", f"out/shorts/{sid}-audio.wav"], check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"out/shorts/{sid}-muted.mp4", "-i", f"out/shorts/{sid}-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", f"out/shorts/{sid}.mp4"], check=True)
print("ok", len(C), "cue SFX,", len(vo), "klip VO")
