"""Mix audio BOBRUISK PILOT dari src/conquer/pilot-timeline.json.
Bus: VO (narasi) · SFX (per adegan, preset jarak far/mid/near) · musik (Mixkit 565). SFX dan musik di-duck oleh VO (sidechain).
Pakai: python3 scripts/mix_pilot.py <gain_dB> [mux]"""
import json, subprocess, sys
TL = json.load(open("src/conquer/pilot-timeline.json"))
D = TL["total"]; G = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
S = "assets-src/sfx/"; E = TL["ev"]
seg = {s["id"] + ("" if s["kind"] != "map" else "@map"): s for s in TL["segments"]}
st = lambda i: [s for s in TL["segments"] if s["id"] == i]
C = []  # (file, mulai, offset, durasi, gain, fi, fo, proc, pan)
def add(*a): C.append(a)

# ---------- bed peta jauh (setiap segmen peta) ----------
for s in TL["segments"]:
    if s["kind"] != "map": continue
    t0, t1 = s["t0"] - 0.5, s["t1"] + 0.6
    q = t0; o = 0.0
    while q < t1:
        d = min(24.0 - o, t1 - q)
        quiet = -4 if s["id"] == "VIII-end" else 0
        add("el-battle-distant.mp3", q, o, d, 9 + quiet, 1.2, 1.2, "far", 0)
        q += d; o = 0.0
    add("deep-cinematic-wind-hum.mp3", t0, (t0 * 7) % 30, min(50, t1 - t0), -21, 1.5, 1.5, None, 0)

# ---------- Act I: still 01 ----------
add("wind-blowing-ambience.mp3", 0.0, 2.0, 5.5, -15, 1.5, 1.2, None, 0)
add("thunder-rumble.mp3", 0.0, 1.0, 5.5, -13, 1.5, 1.2, 150, 0)
add("el-fire-burning.mp3", 0.0, 3.0, 5.0, 8, 1.5, 1.2, None, 0.4)
add("far-away-war-explosions.mp3", 2.2, 0.0, 3.0, -14, 0.1, 1.0, "far", -0.4)

# ---------- Act II: still 02 artileri (dentuman diulang sebagai tembakan baterai) ----------
for i, dt in enumerate([0.3, 1.5, 2.1, 3.6, 4.4, 5.6]):
    add("el-artillery-battery.mp3", 31.25 + dt, 0.0, 2.2, -4 - (i % 2) * 3, 0.0, 1.2, None, (-0.5, 0.4, -0.1, 0.5, -0.3, 0.2)[i])
add("thunder-rumble.mp3", 31.0, 0.0, 7.2, -10, 0.6, 1.2, 160, 0)
add("el-shell-whistle.mp3", 33.2, 0.0, 1.32, -12, 0.02, 0.1, None, 0.5)
add("explosion-in-battle.mp3", 34.5, 0.0, 2.5, -14, 0.0, 1.0, "mid", 0.6)
# peta II: baterai jauh (pembuka + "the guns fire again"), serangan pertama (MG jauh)
for base in (E["soviet_units"] + 0.6, E["guns_again"]):
    for i, dt in enumerate([0.0, 0.5, 0.9, 1.4, 1.8, 2.3]):
        add("el-artillery-battery.mp3", base + dt, 0.0, 2.0, -6, 0.0, 1.0, "far", (-0.4, 0.3, 0, 0.5, -0.2, 0.2)[i])
add("el-mg-distant.mp3", E["first_assault"] + 0.4, 0.0, 1.6, -14, 0.05, 0.4, "far", 0.4)
add("el-mg-distant.mp3", E["first_assault"] + 2.4, 4.7, 1.2, -15, 0.05, 0.4, "far", 0.3)

# ---------- Act III: still 03 infanteri, peta, still 04 tank ----------
T3 = 57.05
add("el-mg-distant.mp3", T3 + 0.2, 0.0, 1.6, -9, 0.05, 0.3, None, -0.5)
add("el-mg-distant.mp3", T3 + 1.9, 4.7, 1.2, -10, 0.05, 0.3, None, 0.5)
add("el-footsteps-mud.mp3", T3 - 0.4, 2.0, 4.0, 2, 0.4, 0.8, None, -0.2)
add("far-away-war-explosions.mp3", T3 + 0.8, 0.0, 3.0, -12, 0.05, 1.0, "mid", 0.6)
add("distant-war-explosions.mp3", 61.5, 0.0, 3.5, -12, 0.1, 1.0, "far", -0.3)
add("far-away-war-explosions.mp3", 65.0, 0.0, 3.5, -12, 0.1, 1.0, "far", 0.3)
T4 = 69.4
add("el-tanks-advance.mp3", T4 - 0.8, 4.0, 9.5, -3, 0.8, 1.5, None, 0.1)
add("far-away-war-explosions.mp3", T4 + 4.0, 0.0, 3.0, -16, 0.1, 1.0, "far", -0.5)

# ---------- Act IV: still 05 rawa ----------
T5 = 77.9
add("wind-in-the-forest.mp3", T5 - 0.6, 3.0, 7.5, -12, 0.8, 1.2, None, 0)
add("el-footsteps-mud.mp3", T5 + 0.3, 0.5, 5.8, 3, 0.4, 1.0, None, 0.3)
add("el-mg-distant.mp3", T5 + 2.5, 6.5, 1.2, -16, 0.05, 0.4, "far", -0.5)

# ---------- Act V: peta kantong (mid) + serangan udara ----------
add("el-aircraft-distant.mp3", E["air"][0] - 7.5, 0.0, 11.0, -6, 2.0, 2.0, "mid", 0.15)
for i, (f, g) in enumerate([("bomb-drop-impact.mp3", -10), ("explosion-in-battle.mp3", -12), ("war-field-explosion.mp3", -13), ("bomb-distant-explotion.mp3", -11), ("explosion-in-battle.mp3", -14)]):
    a = E["air"][i]
    add(f, a - (1.2 if f == "bomb-drop-impact.mp3" else 0), 0.0 if i != 4 else 0.5, 2.6, g, 0.02, 0.9, "mid", (-0.3, 0.3, -0.1, 0.4, -0.4)[i])
add("radio-noise-static-and-crackles.mp3", E["ring"], 0.0, 9.0, -29, 1.0, 1.5, 3500, 0)

# ---------- still 06: terkepung ----------
T6 = 112.7
add("radio-noise-static-and-crackles.mp3", T6 - 0.5, 2.0, 9.5, -24, 0.8, 1.5, 3500, -0.2)
add("thunder-rumble.mp3", T6 - 0.5, 3.0, 9.5, -12, 1.0, 1.5, 150, 0)
add("far-away-war-explosions.mp3", T6 + 1.5, 0.0, 3.0, -15, 0.1, 1.0, "far", 0.5)
add("el-shouts.mp3", T6 + 3.0, 0.2, 1.5, -14, 0.05, 0.4, "far", -0.4)
add("distant-war-explosions.mp3", T6 + 6.0, 0.0, 3.0, -15, 0.1, 1.0, "far", -0.3)

# ---------- Act VI: peta terobosan + still 07 retreat (set yang disetujui) ----------
add("el-mg-distant.mp3", E["breakout"] + 0.5, 4.7, 1.2, -16, 0.05, 0.4, "far", -0.3)
add("distant-war-explosions.mp3", E["breakout"] + 2.0, 0.0, 3.0, -14, 0.1, 1.0, "far", 0.3)
T7 = 132.7
add("wind-blowing-ambience.mp3", T7 - 1.0, 2.0, 13.0, -19, 1.0, 1.0, None, 0)
add("el-truck-engine-away.mp3", T7 - 1.0, 3.5, 11.0, 2, 1.0, 1.5, None, 0.2)
add("el-tires-mud.mp3", T7 + 0.4, 3.0, 10.0, 0, 0.8, 1.5, None, 0.2)
add("el-footsteps-mud.mp3", T7 + 0.8, 0.5, 9.0, 0, 0.4, 1.2, None, -0.3)
add("el-gear-rattle.mp3", T7 + 0.8, 1.5, 8.0, 7, 0.4, 1.2, None, -0.25)
add("el-mg-distant.mp3", T7 + 1.0, 0.0, 1.6, -15, 0.05, 0.3, None, -0.6)
add("el-mg-distant.mp3", T7 + 4.6, 4.7, 1.2, -15, 0.05, 0.3, None, 0.6)
add("el-shell-whistle.mp3", T7 + 6.2, 0.0, 1.32, -13, 0.02, 0.1, None, 0.5)
add("war-field-explosion.mp3", T7 + 7.5, 0.0, 3.5, -10, 0.0, 1.5, None, 0.5)
add("stone-debris-falling.mp3", T7 + 7.7, 0.5, 2.5, -2, 0.05, 0.8, None, 0.3)

# ---------- Act VII: kota (puncak) ----------
T8 = 144.8
add("el-urban-battle.mp3", T8 - 0.8, 0.0, 14.4, -8, 0.6, 1.5, None, 0)
add("el-fire-burning.mp3", T8 - 0.8, 5.0, 14.5, 6, 1.0, 1.5, None, 0.4)
add("explosion-in-battle.mp3", T8 + 2.2, 0.0, 3.0, -11, 0.0, 1.2, None, -0.3)
add("stone-debris-falling.mp3", T8 + 2.4, 0.5, 2.5, -3, 0.05, 0.8, None, -0.2)
add("el-tanks-advance.mp3", 154.0, 7.0, 4.8, -11, 0.6, 1.2, "mid", 0.3)
add("war-field-explosion.mp3", T8 + 6.8, 0.0, 3.0, -12, 0.0, 1.2, None, 0.4)
add("distant-war-explosions.mp3", 159.0, 0.0, 3.0, -15, 0.1, 1.0, "far", 0)

# ---------- Act VIII: still 01 lagi (tenang), peta akhir, judul ----------
add("wind-blowing-ambience.mp3", 173.6, 10.0, 9.5, -15, 1.2, 1.5, None, 0)
add("el-fire-burning.mp3", 173.6, 12.0, 9.5, 4, 1.2, 1.5, None, 0.3)
add("wind-blowing-ambience.mp3", 193.5, 25.0, 7.5, -18, 1.5, 3.0, None, 0)

# swoosh hanya pada transisi peta → still
segs = TL["segments"]
for a, b in zip(segs, segs[1:]):
    if a["kind"] == "map" and b["kind"] == "still":
        add("cinematic-wind-swoosh.mp3", b["t0"] - 0.6, 0.0, 1.4, -17, 0.05, 0.4, None, 0)

# ---------- render ----------
args = ["ffmpeg", "-v", "error", "-y"]; fil = []; sfx = []
for i, (f, t0, of, du, g, fi, fo, pr, pan) in enumerate(C):
    args += ["-i", S + f]
    ch = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, du-fo)}:d={fo},volume={g}dB"
    if pr == "far": ch += ",lowpass=f=1100,lowpass=f=1100,highpass=f=40,aecho=0.8:0.6:70|140:0.35|0.22"
    elif pr == "mid": ch += ",lowpass=f=3200,aecho=0.8:0.55:45:0.22"
    elif pr: ch += f",lowpass=f={pr}"
    l, r = 1 - max(0, pan), 1 + min(0, pan)
    ch += f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,asetpts=PTS-STARTPTS+{t0}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[s{i}]"
    fil.append(ch); sfx.append(f"[s{i}]")
n = len(C)
vo = TL["vo"]; vi = []
for j, (k, v) in enumerate(vo.items()):
    args += ["-i", f"vo-bobruisk/{k}.mp3"]; idx = n + j
    fil.append(f"[{idx}]aresample=48000,aformat=channel_layouts=stereo,volume=2dB,asetpts=PTS-STARTPTS+{v['start']}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[v{j}]"); vi.append(f"[v{j}]")
args += ["-i", "assets-src/music/565.mp3"]; mi = n + len(vo)
# musik: tingkat per act (dB), di-duck oleh VO
lv = [(0, -30), (31, -26), (57, -24), (78, -30), (99, -27), (121.75, -25), (144.8, -22), (163.7, -30), (190, -34), (199, -60)]
expr = "-60"
for (a, x), (b, y) in zip(lv, lv[1:]):
    expr = f"if(between(t,{a},{b}),{x}+({y}-{x})*(t-{a})/({b}-{a}),{expr})"
fil.append(f"[{mi}]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},asetpts=PTS-STARTPTS,volume='pow(10,({expr})/20)':eval=frame,afade=t=in:d=3,apad=whole_dur={D},atrim=0:{D}[mus]")
fil.append("".join(vi) + f"amix=inputs={len(vi)}:normalize=0:duration=longest,asplit=3[vo][sc1][sc2]")
fil.append("".join(sfx) + f"amix=inputs={n}:normalize=0:duration=longest[sfx]")
fil.append("[sfx][sc1]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=500[sfxd]")
fil.append("[mus][sc2]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=700[musd]")
import os
STEMS = os.environ.get("STEMS") == "1"
if STEMS:  # ekspor stem untuk QC kejelasan narasi (VO vs bed SFX+musik), dengan gain yang sama
    fil.append(f"[vo]volume={G}dB[vo1]")
    fil.append(f"[sfxd][musd]amix=inputs=2:normalize=0:duration=longest,volume={G}dB[bed]")
    args += ["-filter_complex", ";".join(fil), "-map", "[vo1]", "-ar", "48000", "out/conquer/stem-vo.wav", "-map", "[bed]", "-ar", "48000", "out/conquer/stem-bed.wav"]
    fil = None
else:
    fil.append(f"[vo][sfxd][musd]amix=inputs=3:normalize=0:duration=longest,atrim=0:{D},volume={G}dB,alimiter=limit=0.8:level=0[out]")
    args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", "out/conquer/pilot-audio.wav"]
subprocess.run(args, check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/conquer/pilot-muted.mp4", "-i", "out/conquer/pilot-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "out/bobruisk-pilot-v1.mp4"], check=True)
print("ok", n, "cue SFX")
