"""Mix audio BAGRATION PART 1 dari src/conquer/part1-timeline.json.
Sebelum 22 Juni peta hanya angin/hum (belum ada perang di sektor ini); bed tembakan jauh mulai saat serangan dibuka.
Jarak kamera = jarak suara (far/mid/near). SFX dan musik di-duck VO.
Pakai: python3 scripts/mix_part1.py <gain_dB> [mux]   (STEMS=1 untuk stem QC)"""
import json, subprocess, sys, os
TL = json.load(open("src/conquer/part1-timeline.json"))
D = TL["total"]; G = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
S = "assets-src/sfx/"; E = TL["ev"]; SEG = TL["segments"]
SG = {}
for _s in SEG: SG.setdefault(_s["id"], _s["t0"])
SG2 = [s_["t0"] for s_ in SEG if s_["id"] == "P1-05"][-1]
RM = TL["remap"]
def R(x):
    for (a, b), (c, d) in zip(RM, RM[1:]):
        if x <= c: return b + (x - a) * (d - b) / ((c - a) or 1)
    return x
C = []
def add(f, t0, of, du, g, fi=0.3, fo=0.8, pr=None, pan=0): C.append((f, t0, of, du, g, fi, fo, pr, pan))
def bed(f, t0, t1, g, pr, loop=24.0, off=0.0):
    q = t0
    while q < t1:
        d = min(loop - off, t1 - q)
        if d > 0.5: add(f, q, off, d, g, 1.2, 1.2, pr, 0)
        q += d; off = 0.0

# ---------- bed per segmen peta ----------
for s in SEG:
    if s["kind"] != "map": continue
    a, b = s["t0"] - 0.5, s["t1"] + 0.6
    add("deep-cinematic-wind-hum.mp3", a, (a * 7) % 30, min(60, b - a), -19, 1.5, 1.5)
    if b - a > 60: add("deep-cinematic-wind-hum.mp3", a + 60, 5, b - a - 60, -19, 1.5, 1.5)
    if s["t0"] >= 246:  # perang sudah dimulai di peta
        pr = "mid" if s["id"] in ("vitebsk",) else "far"
        bed("el-battle-distant.mp3", max(a, E["dawn"]) if s["id"] == "attack" else a, b, 7 if pr == "far" else 2, pr)
    if s["id"] == "open": bed("el-battle-distant.mp3", a, b, 6, "far")
# radio staf saat peringatan dan perencanaan (sangat pelan)
add("radio-noise-static-and-crackles.mp3", E["buildup"] - 1, 0, 24, -31, 1.5, 2.0, 3500)

# ---------- 0: cold open (P1-05 malam, artileri) ----------
add("el-katyusha.mp3", 0.6, 0.0, 7.0, -9, 0.05, 1.5, None, -0.2)
add("el-katyusha.mp3", 7.5, 5.8, 6.5, -12, 0.3, 1.5, "mid", 0.3)
for i, dt in enumerate([0.2, 1.1, 2.6, 3.4, 5.0, 6.2, 8.1, 9.3, 11.0, 12.2]):
    add("el-artillery-battery.mp3", dt, 0.0, 2.2, -11 - (i % 3) * 2, 0.0, 1.2, None, (-0.5, 0.4, -0.1, 0.5, -0.3, 0.2, -0.4, 0.3, 0, -0.2)[i])
add("thunder-rumble.mp3", 0.0, 0.0, 14.0, -10, 0.5, 1.5, 160)
# peta pembuka: artileri jauh sepanjang front
for i in range(8): add("el-artillery-battery.mp3", 15.0 + i * 0.4, 0.0, 2.0, -7, 0.0, 1.0, "far", (-0.5, 0.3, -0.2, 0.5, 0, -0.4, 0.2, 0.4)[i])
add("far-away-war-explosions.mp3", 31.5, 0.0, 3.0, -16, 0.1, 1.5, "far")  # di bawah kartu judul

# ---------- P1-04 parit fajar (sepi, menunggu) ----------
T = SG["P1-04"]
add("wind-in-the-forest.mp3", T - 0.6, 3.0, 9.0, -11, 0.8, 1.2)
add("el-gear-rattle.mp3", T + 1.0, 1.0, 4.0, 2, 0.4, 1.0, None, -0.3)
add("el-breathing.mp3", T + 2.0, 0.0, 4.5, -6, 0.6, 1.0, None, 0.2)
# ---------- P1-01 meja staf ----------
T = SG["P1-01"]
add("radio-noise-static-and-crackles.mp3", T - 0.4, 3.0, 9.5, -22, 0.6, 1.2, 3500, -0.3)
add("thunder-rumble.mp3", T - 0.4, 2.0, 9.5, -17, 1.0, 1.2, 150)
add("el-gear-rattle.mp3", T + 3.0, 2.0, 3.0, -2, 0.3, 0.8, None, 0.3)
T = SG["P1-01b"]  # staf Soviet merencanakan
add("radio-noise-static-and-crackles.mp3", T - 0.4, 12.0, 5.5, -23, 0.6, 1.0, 3500, 0.3)
add("el-gear-rattle.mp3", T + 1.0, 6.0, 3.0, -4, 0.3, 0.8, None, -0.3)
# ---------- P1-02 tank berkamuflase, senja ----------
T = SG["P1-02"]
add("wind-in-the-forest.mp3", T - 0.6, 10.0, 6.0, -12, 0.6, 1.0)
add("el-tanks-advance.mp3", T - 0.4, 1.0, 5.8, -12, 0.8, 1.2, "mid", 0.2)
# ---------- P1-03 partisan di rel (malam) ----------
T = SG["P1-03"]
add("el-night-forest.mp3", T - 0.6, 2.0, 12.5, 12, 0.8, 1.2)
add("el-footsteps-mud.mp3", T + 0.8, 1.0, 4.0, -3, 0.4, 0.8, None, -0.2)
add("el-gear-rattle.mp3", T + 3.5, 4.0, 3.0, -1, 0.3, 0.8, None, 0.3)
add("far-away-war-explosions.mp3", E["rail"] + 0.3, 0.0, 3.0, -9, 0.05, 1.5, "mid", 0.4)
# peta Rail War
for i, dt in enumerate([1.4, 2.3, 3.1, 4.0, 4.6]):
    add(("distant-war-explosions.mp3", "far-away-war-explosions.mp3")[i % 2], E["rail"] + dt, 0.0, 2.5, -12, 0.05, 1.0, "far", (-0.4, 0.3, 0, 0.5, -0.2)[i])
add("el-train-brake.mp3", E["trains"] - 0.6, 0.4, 5.5, -4, 0.1, 1.5, "mid", 0.2)
# ---------- 21–22 Juni: malam, pesawat, lalu fajar ----------
add("el-night-forest.mp3", E["v5"] - 0.5, 14.0, 10.5, 10, 1.0, 2.0)
add("el-aircraft-distant.mp3", E["probe"] + 1.5, 0.0, 8.0, -8, 1.5, 2.0, "far", 0.2)
for i, dt in enumerate([3.2, 4.4, 5.3, 6.5]): add("bomb-distant-explotion.mp3", E["probe"] + dt, 0.0, 2.5, -14, 0.05, 1.0, "far", (-0.4, 0.3, -0.1, 0.4)[i])
add("el-katyusha.mp3", SG2 - 0.1, 0.0, 6.0, -13, 0.05, 1.5, None, -0.2)
for i in range(10): add("el-artillery-battery.mp3", E["dawn"] + 0.3 + i * 0.35, 0.0, 2.0, -13 if i < 7 else -6, 0.0, 1.0, None if i < 7 else "far", ((i * 0.37) % 1.0) - 0.5)
add("thunder-rumble.mp3", E["dawn"], 0.0, 10.0, -10, 0.3, 2.0, 150)
# ---------- Vitebsk ----------
add("el-mg-distant.mp3", E["surr"] - 1.0, 0.0, 1.6, -13, 0.05, 0.4, "mid", -0.3)
add("explosion-in-battle.mp3", E["surr"] + 0.5, 0.0, 2.5, -14, 0.0, 1.0, "mid", 0.3)
T = SG["P1-06"]  # P1-06 kota terbakar
add("el-fire-burning.mp3", T - 0.6, 2.0, 7.5, 8, 0.6, 1.2, None, 0.3)
add("el-urban-battle.mp3", T - 0.4, 3.0, 7.0, -14, 0.6, 1.2, "mid", 0)
add("stone-debris-falling.mp3", T + 2.0, 0.5, 2.5, -6, 0.05, 0.8, None, -0.3)
add("el-mg-distant.mp3", E["bo"] + 0.5, 4.7, 1.2, -14, 0.05, 0.4, "mid", -0.3)
add("distant-war-explosions.mp3", E["bo"] + 2.0, 0.0, 3.0, -12, 0.1, 1.0, "mid", 0.3)
T = SG["P1-07"]  # P1-07 terobosan di hutan
add("wind-in-the-forest.mp3", T - 0.6, 20.0, 8.0, -14, 0.6, 1.2)
add("el-footsteps-mud.mp3", T - 0.2, 0.5, 7.5, 0, 0.4, 1.0, None, -0.3)
add("el-mg-distant.mp3", T + 0.6, 0.0, 1.6, -12, 0.05, 0.3, None, -0.6)
add("el-shouts.mp3", T + 2.0, 0.2, 1.5, -13, 0.05, 0.4, "mid", 0.4)
add("el-mg-distant.mp3", T + 3.4, 4.7, 1.2, -12, 0.05, 0.3, None, 0.6)
add("el-shell-whistle.mp3", T + 4.6, 0.0, 1.32, -12, 0.02, 0.1, None, 0.5)
add("war-field-explosion.mp3", T + 5.9, 0.0, 2.0, -12, 0.0, 1.2, None, 0.5)
# ---------- Orsha ----------
for i in range(6): add("el-artillery-battery.mp3", E["depth"] + 0.5 + i * 0.5, 0.0, 2.0, -8, 0.0, 1.0, "far", (-0.3, 0.4, 0, -0.5, 0.2, 0.5)[i])
# Orsha di peta (jauh): ledakan ranjau dibersihkan, lalu tembakan saat celah terbuka
for i, dt in enumerate([0.4, 1.6, 2.5]): add("far-away-war-explosions.mp3", E["mines"] + dt, 0.0, 2.5, -13, 0.05, 1.0, "far", (-0.3, 0.3, 0)[i])
add("el-mg-distant.mp3", E["breach"] + 0.6, 0.0, 1.6, -15, 0.05, 0.4, "far", 0.3)
add("el-tanks-advance.mp3", E["berez"] - 0.3, 5.0, 4.5, -8, 0.6, 1.0, "far", 0)
T = SG["P1-09"]  # P1-09 jalan raya terbakar
add("el-fire-burning.mp3", T - 0.6, 8.0, 4.8, 7, 0.5, 1.0, None, -0.3)
add("el-tanks-advance.mp3", T - 0.4, 8.0, 4.6, -8, 0.5, 1.0, "mid", 0.4)
# ---------- Mogilev ----------
add("el-mg-distant.mp3", E["a49"] + 0.5, 0.0, 1.6, -12, 0.05, 0.4, "far", 0.4)
add("explosion-in-battle.mp3", E["a49"] + 1.2, 0.0, 2.5, -13, 0.0, 1.0, "far", 0.3)
add("distant-war-explosions.mp3", E["a49"] + 2.8, 0.0, 3.0, -13, 0.1, 1.0, "far", 0.5)
add("radio-noise-static-and-crackles.mp3", E["tipp"] - 0.5, 8.0, 13.0, -27, 1.0, 1.5, 3500, 0)
T = SG["P1-10"]  # P1-10 menyeberang Dnieper di bawah tembakan
add("el-mg-distant.mp3", T + 0.2, 0.0, 1.6, -9, 0.05, 0.3, None, -0.5)
add("el-shell-whistle.mp3", T + 1.6, 0.0, 1.32, -12, 0.02, 0.1, None, 0.4)
add("explosion-in-battle.mp3", T + 2.9, 0.0, 2.5, -9, 0.0, 1.2, None, 0.4)
add("el-shouts.mp3", T + 3.8, 0.2, 1.5, -12, 0.05, 0.4, "mid", -0.3)
add("el-mg-distant.mp3", T + 5.2, 4.7, 1.2, -10, 0.05, 0.3, None, 0.5)
add("el-aircraft-distant.mp3", E["mkill"] - 1.5, 0.0, 7.0, -8, 1.0, 1.5, "far", -0.2)
add("bomb-distant-explotion.mp3", E["mkill"] + 1.2, 0.0, 2.5, -14, 0.05, 1.0, "far", 0.2)
# ---------- ke Berezina ----------
add("el-aircraft-distant.mp3", E["roads"] - 1.0, 0.0, 11.0, -9, 1.5, 2.0, "mid", 0.15)
for i in range(6):
    add(("bomb-drop-impact.mp3", "explosion-in-battle.mp3", "war-field-explosion.mp3")[i % 3], E["roads"] + 0.5 + i * 1.1, 0.0, 2.4, -17, 0.02, 0.9, "mid", (-0.3, 0.3, -0.1, 0.4, -0.4, 0.2)[i])
add("el-tanks-advance.mp3", E["cut"] - 0.3, 6.0, 5.0, -9, 0.6, 1.2, "far", -0.2)
add("wind-blowing-ambience.mp3", E["trap"] - 0.5, 10.0, 13.0, -16, 1.5, 3.0)
add("wind-blowing-ambience.mp3", E["endcard"] + 0.4, 25.0, 9.5, -19, 1.5, 3.0)

# swoosh hanya peta -> still
for a, b in zip(SEG, SEG[1:]):
    if a["kind"] == "map" and b["kind"] == "still": add("cinematic-wind-swoosh.mp3", b["t0"] - 0.6, 0.0, 1.4, -18, 0.05, 0.4)

# ---------- render (SFX per batch -> stem, hemat memori) ----------
os.makedirs("out/conquer/p1sfx", exist_ok=True)
def cue(i, x):
    f, t0, of, du, g, fi, fo, pr, pan = x
    ch = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, du-fo)}:d={fo},volume={g}dB"
    if pr == "far": ch += ",lowpass=f=1100,lowpass=f=1100,highpass=f=40,aecho=0.8:0.6:70|140:0.35|0.22"
    elif pr == "mid": ch += ",lowpass=f=3200,aecho=0.8:0.55:45:0.22"
    elif pr: ch += f",lowpass=f={pr}"
    l, r = 1 - max(0, pan), 1 + min(0, pan)
    return ch + f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,adelay={int(round(t0*1000))}:all=1,apad=whole_dur={D},atrim=0:{D}[s{i}]"
B = 20; stems = []
for bi in range(0, len(C), B):
    part = C[bi:bi+B]; a2 = ["ffmpeg", "-v", "error", "-y"]
    for x in part: a2 += ["-i", S + x[0]]
    f2 = [cue(i, x) for i, x in enumerate(part)]
    f2.append("".join(f"[s{i}]" for i in range(len(part))) + f"amix=inputs={len(part)}:normalize=0:duration=longest[o]")
    out = f"out/conquer/p1sfx/b{bi//B}.wav"; stems.append(out)
    subprocess.run(a2 + ["-filter_complex", ";".join(f2), "-map", "[o]", "-ar", "48000", "-c:a", "pcm_f32le", out], check=True)
args = ["ffmpeg", "-v", "error", "-y"]; fil = []; sfx = []
for i, st in enumerate(stems):
    args += ["-i", st]; fil.append(f"[{i}]aformat=channel_layouts=stereo[s{i}]"); sfx.append(f"[s{i}]")
n = len(stems); vo = TL["vo"]; vi = []
for j, v in enumerate(vo):
    args += ["-i", f"vo-bagration-p1/{v['file']}.mp3"]
    fil.append(f"[{n+j}]aresample=48000,aformat=channel_layouts=stereo,atrim={v['ss']}:{v['to']},asetpts=PTS-STARTPTS,afade=t=out:st={max(0, v['dur'] - 0.06)}:d=0.06,volume=2dB,asetpts=PTS-STARTPTS+{v['start']}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[v{j}]"); vi.append(f"[v{j}]")
args += ["-stream_loop", "1", "-i", "assets-src/music/565.mp3"]; mi = n + len(vo)
lv0 = [(0, -28), (13.9, -27), (29.3, -22), (35, -27), (113, -26), (181, -25), (234.5, -28), (256, -26), (264, -24), (275, -25), (331, -26), (359, -26), (410.7, -24), (430, -24), (436, -26), (444, -60)]
lv = [(round(R(a), 2), x) for a, x in lv0]
expr = "-60"
for (a, x), (b, y) in zip(lv, lv[1:]): expr = f"if(between(t,{a},{b}),{x}+({y}-{x})*(t-{a})/({b}-{a}),{expr})"
fil.append(f"[{mi}]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},asetpts=PTS-STARTPTS,volume='pow(10,({expr})/20)':eval=frame,afade=t=in:d=3,apad=whole_dur={D},atrim=0:{D}[mus]")
fil.append("".join(vi) + f"amix=inputs={len(vi)}:normalize=0:duration=longest,asplit=3[vo][sc1][sc2]")
fil.append("".join(sfx) + f"amix=inputs={n}:normalize=0:duration=longest[sfx]")
fil.append("[sfx][sc1]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=500[sfxd]")
fil.append("[mus][sc2]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=700[musd]")
os.makedirs("out/conquer", exist_ok=True)
if os.environ.get("STEMS") == "1":
    fil.append(f"[vo]volume={G}dB[vo1]"); fil.append(f"[sfxd][musd]amix=inputs=2:normalize=0:duration=longest,volume={G}dB[bed]")
    args += ["-filter_complex", ";".join(fil), "-map", "[vo1]", "-ar", "48000", "out/conquer/p1-stem-vo.wav", "-map", "[bed]", "-ar", "48000", "out/conquer/p1-stem-bed.wav"]
else:
    fil.append(f"[vo][sfxd][musd]amix=inputs=3:normalize=0:duration=longest,atrim=0:{D},volume={G}dB,alimiter=limit=0.8:level=0[out]")
    args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", "out/conquer/part1-audio.wav"]
subprocess.run(args, check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/conquer/part1-muted.mp4", "-i", "out/conquer/part1-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "out/bagration-part1-v1.mp4"], check=True)
print("ok", len(C), "cue SFX")
