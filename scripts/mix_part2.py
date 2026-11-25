"""Mix audio BAGRATION PART 2. SFX pilot (waktu pilot tau) dipetakan ke waktu baru lewat anchors part2-timeline.json;
bed per adegan peta baru; cue tambahan untuk klip baru. SFX dan musik di-duck VO. Pakai: python3 scripts/mix_part2.py <gain_dB> [mux]"""
import json, subprocess, sys, os
import numpy as np
P2 = json.load(open("src/conquer/part2-timeline.json")); TL = json.load(open("src/conquer/pilot-timeline.json"))
D = P2["total"]; G = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
S = "assets-src/sfx/"; E = TL["ev"]; E2 = P2["ev2"]; AN = P2["anchors"]; SC = P2["scenes"]
def tau(tn):
    i = 0
    for j in range(len(AN)):
        if AN[j][0] <= tn: i = j
        else: break
    a = AN[i]; b = AN[i + 1] if i + 1 < len(AN) else None
    if not b or b[0] <= a[0]: return a[1]
    return a[1] + (b[1] - a[1]) * (tn - a[0]) / (b[0] - a[0])
def occ(old):  # semua waktu baru di mana waktu pilot 'old' dilewati (laju > 0)
    out = []
    for (t0, u0), (t1, u1) in zip(AN, AN[1:]):
        if t1 > t0 and u1 > u0 and u0 - 1e-6 <= old < u1 - 1e-6:
            tn = t0 + (old - u0) * (t1 - t0) / (u1 - u0)
            if all(abs(tn - o) > 0.05 for o in out): out.append(round(tn, 3))
    return out
C = []; OLD = []  # (file, mulai, offset, durasi, gain, fi, fo, proc, pan)
def add(*a): OLD.append(a)
def new(*a): C.append(a)
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


for x in OLD:
    for tn in occ(x[1]):
        if E2["recap"] - 0.3 <= tn < E2["recap"] + 34.3: continue
        dg = -11 if tn < 17.4 else (-5 if 77.0 < tn < 89.5 else 0)
        for lo, hi, dd in ((69.0, 72.5, -4), (104.0, 108.8, -4), (166.3, 170.3, -4), (217.5, 222.5, -4), (236.0, 244.5, -3)):
            if tn < hi and tn + x[3] > lo: dg += dd
        C.append((x[0], tn, x[2], x[3], x[4] + dg) + x[5:])

# ---------- bed per adegan peta (jarak jauh) + swoosh peta -> still ----------
for s in SC:
    if s["kind"] != "map": continue
    a, b = max(s["t0"] - 0.5, 0.0), s["t1"] + 0.6
    if s["id"] == "hook": a = 2.0
    q, o = a, 0.0
    while q < b:
        d = min(24.0 - o, b - q)
        if d > 0.5: new("el-battle-distant.mp3", q, o, d, 5.5 - (4 if s["id"] in ("VIII-end", "wide") else 0), 1.2, 1.2, "far", 0)
        q += d; o = 0.0
    new("deep-cinematic-wind-hum.mp3", a, (a * 7) % 30, min(60, b - a), -21, 1.5, 1.5, None, 0)
for a, b in zip(SC, SC[1:]):
    if a["kind"] == "map" and b["kind"] == "still": new("cinematic-wind-swoosh.mp3", b["t0"] - 0.6, 0.0, 1.4, -18, 0.05, 0.4, None, 0)
# ---------- pembuka gelap, kartu ----------
new("el-night-forest.mp3", 0.0, 0.0, 5.5, 3, 0.4, 2.5, None, 0)
new("wind-blowing-ambience.mp3", E2["p2_9"] + 8.6, 25.0, 9.0, -18, 1.5, 3.0, None, 0)
# ---------- rekap enam hari (tanpa narasi): soundscape sendiri ----------
RC = E2["recap"]
new("el-battle-distant.mp3", RC - 0.3, 0.0, 24.0, 4, 0.8, 1.2, "far", 0)
new("el-battle-distant.mp3", RC + 23.7, 0.0, 11.0, 4, 0.8, 1.5, "far", 0)
new("thunder-rumble.mp3", RC, 0.0, 34.0, -14, 1.0, 2.0, 160, 0)
for i, dt in enumerate([1.0, 2.2, 3.1, 14.0, 15.1, 16.0, 22.5, 23.4, 29.0, 30.2]): new("explosion-in-battle.mp3" if i % 2 else "distant-war-explosions.mp3", RC + dt, 0.0, 2.8, -12, 0.0, 1.0, "far", ((i * 0.41) % 1.0) - 0.5)
new("el-aircraft-distant.mp3", RC + 12.0, 0.0, 12.0, -11, 1.5, 2.0, "far", 0.1)
new("el-tanks-advance.mp3", RC + 5.0, 4.0, 9.0, -14, 0.8, 1.5, "far", 0)
new("el-footsteps-mud.mp3", RC + 8.0, 0.5, 10.0, -12, 0.6, 1.2, "mid", -0.2)
# ---------- klip baru ----------
p = lambda k, x=0.0: E2[k] + x
new("el-tanks-advance.mp3", E2["p2_3_sil"][0] - 0.3, 4.0, 8.0, -16, 0.6, 1.2, "far", -0.2)
new("el-mg-distant.mp3", p("p2_3", 1.5), 0.0, 1.6, -15, 0.05, 0.4, "far", 0.3)
new("distant-war-explosions.mp3", p("p2_3", 3.5), 0.0, 3.0, -14, 0.1, 1.0, "far", -0.3)
new("wind-in-the-forest.mp3", p("p2_4"), 3.0, 28.0, -18, 1.0, 1.5, None, 0)
new("el-footsteps-mud.mp3", p("p2_4", 0.5), 0.5, 15.0, -11, 0.6, 1.5, "mid", -0.2)
new("el-tanks-advance.mp3", E2["p2_4_sil"][2], 5.0, 10.0, -18, 0.8, 1.5, "far", 0.2)
new("radio-noise-static-and-crackles.mp3", p("p2_6"), 2.0, 12.0, -27, 0.8, 1.5, 3500, 0)
new("el-aircraft-distant.mp3", E2["p2_6_sil"][1] - 3.0, 0.0, 9.0, -9, 1.5, 1.5, "mid", 0.1)
new("bomb-drop-impact.mp3", E2["p2_6_sil"][1] + 0.8, 0.0, 2.6, -13, 0.02, 0.9, "mid", -0.3)
new("explosion-in-battle.mp3", E2["p2_6_sil"][1] + 1.9, 0.0, 2.6, -14, 0.0, 0.9, "mid", 0.4)
new("bomb-distant-explotion.mp3", E2["p2_6_sil"][1] + 3.0, 0.0, 2.6, -14, 0.0, 0.9, "far", 0.1)
new("el-mg-distant.mp3", p("p2_7", 0.6), 0.0, 1.6, -17, 0.05, 0.4, "far", -0.3)
new("distant-war-explosions.mp3", p("p2_7", 2.0), 0.0, 3.0, -17, 0.1, 1.0, "far", 0.3)
new("el-mg-distant.mp3", p("p2_7", 4.0), 4.7, 1.2, -18, 0.05, 0.4, "far", 0.4)
new("wind-blowing-ambience.mp3", p("p2_8", -0.3), 3.0, 13.5, -17, 1.0, 1.5, None, 0)
new("wind-blowing-ambience.mp3", p("p2_9", -0.3), 12.0, 9.0, -17, 1.0, 1.5, None, 0)

# ---------- render (SFX per batch -> stem, hemat memori) ----------
os.makedirs("out/conquer/p2sfx", exist_ok=True)
def cue(i, x):
    f, t0, of, du, g, fi, fo, pr, pan = x
    if t0 < 0: of, du, t0 = of - t0, du + t0, 0.0
    ch = f"[{i}]aresample=48000,aformat=channel_layouts=stereo,atrim={of}:{of+du},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, du-fo)}:d={fo},volume={g}dB"
    if pr == "far": ch += ",lowpass=f=1100,lowpass=f=1100,highpass=f=40,aecho=0.8:0.6:70|140:0.35|0.22"
    elif pr == "mid": ch += ",lowpass=f=3200,aecho=0.8:0.55:45:0.22"
    elif pr: ch += f",lowpass=f={pr}"
    l, r = 1 - max(0, pan), 1 + min(0, pan)
    return ch + f",pan=stereo|c0={l:.2f}*c0|c1={r:.2f}*c1,asetpts=PTS-STARTPTS+{t0}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[s{i}]"
B = 20; stems = []
for bi in range(0, len(C), B):
    part = C[bi:bi+B]; a2 = ["ffmpeg", "-v", "error", "-y"]
    for x in part: a2 += ["-i", S + x[0]]
    f2 = [cue(i, x) for i, x in enumerate(part)]
    f2.append("".join(f"[s{i}]" for i in range(len(part))) + f"amix=inputs={len(part)}:normalize=0:duration=longest[o]")
    out = f"out/conquer/p2sfx/b{bi//B}.wav"; stems.append(out)
    subprocess.run(a2 + ["-filter_complex", ";".join(f2), "-map", "[o]", "-ar", "48000", "-c:a", "pcm_f32le", out], check=True)
args = ["ffmpeg", "-v", "error", "-y"]; fil = []; sfx = []
for i, st in enumerate(stems):
    args += ["-i", st]; fil.append(f"[{i}]aformat=channel_layouts=stereo[s{i}]"); sfx.append(f"[s{i}]")
n = len(stems); vo = P2["vo"]; vi = []
for j, v in enumerate(vo):
    args += ["-i", v['file'] if v['file'].endswith(".mp3") else v['file'] + ".mp3"]
    fil.append(f"[{n+j}]aresample=48000,aformat=channel_layouts=stereo,atrim={v['ss']}:{v['to']},asetpts=PTS-STARTPTS,afade=t=out:st={max(0, v['dur'] - 0.06)}:d=0.06,volume=2dB,asetpts=PTS-STARTPTS+{v['start']}/TB,aresample=async=1:first_pts=0,apad=whole_dur={D},atrim=0:{D}[v{j}]"); vi.append(f"[v{j}]")
lv_old = [(0, -30), (31, -26), (57, -24), (78, -30), (99, -27), (121.75, -25), (144.8, -22), (163.7, -30), (190, -34), (199, -60)]
SRn = 48000
raw = subprocess.run(["ffmpeg", "-v", "error", "-stream_loop", "1", "-i", "assets-src/music/565.mp3", "-t", str(D), "-ac", "2", "-ar", str(SRn), "-f", "f32le", "-"], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
tt = np.arange(0, D, 0.1)
db = np.interp([tau(x) for x in tt], [a for a, _ in lv_old], [b for _, b in lv_old])
for lo, hi in ((E2["oob"], E2["oob"] + 17.0), (E2["recap"], E2["recap"] + 34.0)):
    db = np.where((tt >= lo) & (tt < hi), np.maximum(db, -19.0), db)
db = np.where(tt > D - 9, db + (-60 - db) * np.clip((tt - (D - 9)) / 8.0, 0, 1), db)
db = np.convolve(db, np.ones(10) / 10, mode="same")
fade_in = np.clip(tt / 3.0, 0, 1)
gain = 10 ** (db / 20) * fade_in
g = np.interp(np.arange(len(mus)) / SRn, tt, gain)
mus *= g[:, None].astype(np.float32)
mus.tofile("out/conquer/p2-music.f32")
args += ["-f", "f32le", "-ar", str(SRn), "-ac", "2", "-i", "out/conquer/p2-music.f32"]; mi = n + len(vo)
fil.append(f"[{mi}]aformat=channel_layouts=stereo,apad=whole_dur={D},atrim=0:{D}[mus]")
fil.append("".join(vi) + f"amix=inputs={len(vi)}:normalize=0:duration=longest,asplit=3[vo][sc1][sc2]")
fil.append("".join(sfx) + f"amix=inputs={n}:normalize=0:duration=longest[sfx]")
fil.append("[sfx][sc1]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=500[sfxd]")
fil.append("[mus][sc2]sidechaincompress=threshold=0.02:ratio=8:attack=40:release=700[musd]")
os.makedirs("out/conquer", exist_ok=True)
if os.environ.get("STEMS") == "1":
    fil.append(f"[vo]volume={G}dB[vo1]"); fil.append(f"[sfxd][musd]amix=inputs=2:normalize=0:duration=longest,volume={G}dB[bed]")
    args += ["-filter_complex", ";".join(fil), "-map", "[vo1]", "-ar", "48000", "out/conquer/p2-stem-vo.wav", "-map", "[bed]", "-ar", "48000", "out/conquer/p2-stem-bed.wav"]
else:
    fil.append(f"[vo][sfxd][musd]amix=inputs=3:normalize=0:duration=longest,atrim=0:{D},volume={G}dB,alimiter=limit=0.8:level=0[out]")
    args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-ar", "48000", "out/conquer/part2-audio.wav"]
subprocess.run(args, check=True)
if len(sys.argv) > 2:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/conquer/part2-muted.mp4", "-i", "out/conquer/part2-audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "out/bagration-part2-v1.mp4"], check=True)
print("ok", len(C), "cue SFX")
