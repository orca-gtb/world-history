"""Mix audio scene uji WW2 v2. Waktu SEMUA dibaca dari src/ww2/v2/showcase-events.json (sama dengan gambar).
Radio: processed+static per faksi (suara asli, tanpa kloning), radio_on sebelum, hiss 'radio silence' di antara transmisi, ducking SFX saat radio bicara.
Pakai: python3 scripts/ww2v2-mix.py"""
import json, subprocess, os
EV = json.load(open("src/ww2/v2/showcase-events.json")); D = EV["dur"]; S = "assets-src/sfx/"; R = "assets/ww2/radio/"
IDX = json.load(open(S + "slices/index.json"))
def sl(n, i): L = IDX[n]; return S + L[i % len(L)]["file"], L[i % len(L)]["dur"]
C = []  # (file, t0, gain_dB, trim_dur, lowpass, pan, bus)  bus: "r" radio, "s" sfx
def add(f, t0, g, d=None, lp=None, pan=0.0, bus="s", off=0.0): C.append((f, t0, g, d, lp, pan, bus, off))
NAT = {"us": "us/us_01_initial_contact", "de": "germany/de_01_initial_contact"}
for r in EV["radio"]:
    add(R + "sfx/radio_on.wav", r["t0"] - 0.35, -8, bus="r"); add(R + "processed/" + NAT[r["f"]] + "/radio_with_static.wav", r["t0"], -1, bus="r")
    add(R + "sfx/radio_off.wav", r["t0"] + r["dur"] + 0.05, -10, bus="r")
gap0 = EV["radio"][0]["t0"] + EV["radio"][0]["dur"] + 0.2; gap1 = EV["radio"][1]["t0"] - 0.45
add(R + "sfx/static_burst.wav", gap0, -24, d=max(0.3, gap1 - gap0), bus="r")  # radio silence: hanya desis pembawa
# ambience + kendaraan
add(S + "wind-blowing-ambience.mp3", 0, -22, d=D); add(S + "thunder-rumble.mp3", 0, -30, d=D, lp=300)
add(S + "el-footsteps-mud.mp3", 0, -15, d=EV["stop"] + 0.9); add(S + "el2-pz4-tracks.mp3", 0, -14, d=8.6, lp=2600)
add(S + "el2-t34-tracks.mp3", 0, -25, d=D, lp=1800, pan=0.3); add(S + "low-drone-engine-hum.mp3", 0, -27, d=D, lp=500, pan=0.5)
# tembakan tank + dampak
for t in EV["panzer"]: f, d = sl("el2-t34-gun", 0); add(f, t - 0.02, 0, d=d, pan=0.55); f2, d2 = sl("el2-shell-incoming", 0); add(f2, t + 0.15, -9, d=d2, pan=-0.2)
for t in EV["sherman"]: f, d = sl("el2-t34-gun", 0); add(f, t - 0.02, -2, d=d, pan=0.0)
for t in EV["t34"]: f, d = sl("el2-t34-gun", 0); add(f, t, -11, d=d, lp=2400, pan=-0.2)
for i, im in enumerate(EV["impacts"]): add(S + ("explosion-in-battle.mp3", "war-field-explosion.mp3", "far-away-war-explosions.mp3")[i % 3], im["t"] - 0.03, -5 - 2 * i, d=3.2, lp=3800 if i < 2 else 1800, pan=(-0.3, 0.45, 0.6)[i % 3])
# MG42 (Wehrmacht) + desing peluru meleset
for b, (a, e) in enumerate(EV["mg"]):
    t = a; k = 0
    while t < e - 0.05: f, d = sl("el2-mg42", 2 * b + k); add(f, t, -8, d=min(d, e - t + 0.1), lp=3600, pan=0.5); t += d - 0.04; k += 1
    f, d = sl("el2-bullet-whizz", b); add(f, a + 0.14, -9, d=d, pan=-0.3)
# senapan: Garand (US) kiri, Kar 98k (Wehrmacht) kanan
for key, ts in EV["us_shots"].items():
    for i, t in enumerate(ts): f, d = sl("el2-garand", i + sum(map(ord, key)) % 2); add(f, t, -10, d=min(d, 1.0), pan=-0.5 + 0.25 * (sum(map(ord, key)) % 3))
for key, ts in EV["de_shots"].items():
    for i, t in enumerate(ts): f, d = sl("el2-kar98k", i); add(f, t, -12, d=min(d, 1.1), lp=4000, pan=0.55)
a = ["ffmpeg", "-v", "error", "-y"]; fc = []
for i, (f, t0, g, d, lp, pan, bus, off) in enumerate(C):
    a += ["-i", f]; ch = "aresample=48000,aformat=channel_layouts=stereo"
    if d: ch += f",atrim=0:{d:.3f},afade=t=out:st={max(0, d - 0.2):.3f}:d=0.2"
    ch += ",afade=t=in:d=0.02" + (f",lowpass=f={lp}" if lp else "") + f",volume={g}dB,pan=stereo|c0={1 - max(0, pan):.2f}*c0|c1={1 + min(0, pan):.2f}*c1"
    ms = int(max(0, t0) * 1000); fc.append(f"[{i}]{ch},adelay={ms}|{ms},apad=whole_dur={D},atrim=0:{D}[c{i}]")
R_ = [i for i, c in enumerate(C) if c[6] == "r"]; S_ = [i for i, c in enumerate(C) if c[6] == "s"]
fc.append("".join(f"[c{i}]" for i in R_) + f"amix=inputs={len(R_)}:normalize=0:duration=longest,asplit=2[rad][scr]")
fc.append("".join(f"[c{i}]" for i in S_) + f"amix=inputs={len(S_)}:normalize=0:duration=longest[sfx]")
fc.append("[sfx][scr]sidechaincompress=threshold=0.01:ratio=6:attack=15:release=400[sfxd]")
fc.append(f"[rad][sfxd]amix=inputs=2:normalize=0:duration=longest,atrim=0:{D},loudnorm=I=-16:TP=-1.5:LRA=9[out]")
os.makedirs("out", exist_ok=True)
subprocess.run(a + ["-filter_complex", ";".join(fc), "-map", "[out]", "-ar", "48000", "out/ww2v2-audio.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/ww2v2-muted.mp4", "-i", "out/ww2v2-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "out/ww2v2-showcase.mp4"], check=True)
print("ok", len(C), "cue")
