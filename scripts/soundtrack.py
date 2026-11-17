"""Soundtrack prosedural episode Pegasus Bridge — musik + SFX, tanpa narator, bebas lisensi.
Pakai: python3 scripts/soundtrack.py timing.json public/audio/soundtrack.wav
timing.json dihasilkan dari src/timing.ts (lihat scripts/export-timing.sh)."""
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(1944)
T = json.load(open(sys.argv[1]))
FPS = 30.0
S = {k: v / FPS for k, v in T["START"].items()}
DUR = T["TOTAL"] / FPS
N = int((DUR + 1.0) * SR)
music = np.zeros((2, N)); sfx = np.zeros((2, N)); amb = np.zeros((2, N))
fr = lambda f: f / FPS  # frame -> detik

# ---------------------------------------------------------------- utilitas
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, min(b, SR * 0.45)], "band", fs=SR, output="sos"), x)
def env(n, a, r):
    t = np.arange(n) / SR; d = n / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)
def add(buf, x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or g == 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * g * l * 1.414
    buf[1, i:i + len(x)] += x * g * r * 1.414
NOTE = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "Bb": 1, "B": 2}
def hz(n): return 440.0 * 2 ** ((NOTE[n[:-1]] + (int(n[-1]) - 4) * 12) / 12)
def per(arr):  # kurva per-frame -> per-sampel
    xs = np.arange(len(arr)) / FPS
    return np.interp(np.arange(N) / SR, xs, arr, right=arr[-1])

# ---------------------------------------------------------------- instrumen
def strings(notes, dur, a=1.0, r=1.5, g=1.0, bright=1800, trem=0.0):
    n = int(dur * SR); x = np.zeros(n); t = np.arange(n) / SR
    for nn in notes:
        f = hz(nn)
        for d in (-0.004, -0.0015, 0.0, 0.002, 0.0045):
            vib = 1 + 0.0025 * np.sin(2 * np.pi * (4.8 + rng.random()) * t + rng.random() * 6)
            x += signal.sawtooth(2 * np.pi * np.cumsum(f * (1 + d) * vib) / SR + rng.random() * 6)
    x = lp(x, bright, 2) * env(n, a, r) / (len(notes) * 5)
    if trem: x *= 0.6 + 0.4 * np.sin(2 * np.pi * trem * t) ** 2
    return x * g
def horn(note, dur, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(note)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t) * np.clip((t - 0.3) / 0.4, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    return lp(sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 9)), 1500) * env(n, 0.2, 0.8) * g * 0.35
def timp(t0, note="D2", g=1.0):
    n = int(2.2 * SR); t = np.arange(n) / SR; f = hz(note)
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.3)) * np.exp(-t / 0.9)
    x += lp(rng.standard_normal(n), 900) * np.exp(-t / 0.02) * 0.3
    add(music, x * 0.6, t0, g)
def hit(t0, g=1.0, length=3.0, buf=None):
    n = int(length * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(38 + 50 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 1.0)
    nz = lp(rng.standard_normal(n), 1100) * np.exp(-t / 0.3) * 0.6
    add(buf if buf is not None else music, (sub + nz) * 0.9, t0, g)
def riser(t0, dur, g=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    y = bp(x, 300, 1200) * (1 - t / dur) + bp(x, 1500, 7000) * (t / dur)
    add(music, y * (t / dur) ** 2.2 * 0.5, t0, g)
def tick(t0, g=0.08):
    n = int(0.03 * SR); t = np.arange(n) / SR
    add(music, hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 1700 * t) * np.exp(-t / 0.01) * 0.2, t0, g)

# ---------------------------------------------------------------- SFX
def chalk(t0, dur, g=0.07):
    n = int(dur * SR); t = np.arange(n) / SR
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * (7 + rng.random() * 3) * t)) * (0.6 + 0.4 * rng.random(n))
    x = bp(rng.standard_normal(n), 900, 4200) * am * env(n, 0.06, 0.15)
    add(sfx, x, t0, g, pan=rng.uniform(-0.3, 0.3))
def stamp(t0, g=0.8):
    n = int(0.8 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(90 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12)
    slap = bp(rng.standard_normal(n), 500, 4000) * np.exp(-t / 0.035)
    add(sfx, thud + slap * 0.5, t0, g)
def paper(t0, g=0.4):
    n = int(0.45 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 800, 7000) * np.sin(np.pi * np.clip(t / 0.4, 0, 1)) ** 1.5
    add(sfx, x, t0, g, pan=rng.uniform(-0.4, 0.4))
def pop(t0, g=0.35):
    n = int(0.15 * SR); t = np.arange(n) / SR
    add(sfx, np.sin(2 * np.pi * (520 - 260 * t / 0.15) * t) * np.exp(-t / 0.03) + bp(rng.standard_normal(n), 800, 3000) * np.exp(-t / 0.01) * 0.4, t0, g)
def whoosh(t0, dur, g=0.5, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    sweep = np.sin(np.pi * t / dur) ** 2
    x = bp(rng.standard_normal(n), 300, 3000) * sweep
    add(sfx, x, t0, g)
def creak(t0, dur=0.9, g=0.35, f0=180):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.sin(2 * np.pi * (2.5 + rng.random() * 2) * t) * np.exp(-t / dur) + 0.4 * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph + 0.7 * np.sin(ph * 0.3)) / k for k in (1, 2, 3, 5)) * (0.7 + 0.3 * rng.standard_normal(n) * 0.2)
    x = bp(x, 120, 1400) * env(n, 0.05, 0.3)
    add(sfx, x, t0, g, pan=rng.uniform(-0.5, 0.5))
def engines(t0, dur, g=0.5, f_start=70.0, f_end=70.0, pan=0.0):
    """Halifax: 4 mesin radial -> dengung rendah dengan pelayangan."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = np.linspace(f_start, f_end, n)
    x = np.zeros(n)
    for k, d in enumerate((-1.2, -0.4, 0.5, 1.3)):
        ph = 2 * np.pi * np.cumsum(f + d + 0.4 * np.sin(2 * np.pi * (0.3 + 0.1 * k) * t)) / SR
        x += sum(np.sin(h * ph) / h for h in range(1, 14))
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 14 * t)
    add(sfx, lp(x, 1500) * 0.07 * env(n, 1.0, 1.5), t0, g, pan)
def crash(t0, g=1.0):
    """Benturan kayu + tanah: retak kayu, gedebuk berat, serpihan, geseran."""
    n = int(4.5 * SR); t = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(46 + 70 * np.exp(-t / 0.05)) / SR) * np.exp(-t / 0.45)
    body = lp(rng.standard_normal(n), 900) * np.exp(-t / 0.22)
    crack = hp(rng.standard_normal(n), 1500) * np.exp(-t / 0.05) * 0.9
    splinter = sum(np.sin(2 * np.pi * rng.uniform(300, 1800) * t) * np.exp(-(t - rng.uniform(0.03, 0.4)) ** 2 / 0.0004) for _ in range(34))
    scrape = bp(rng.standard_normal(n), 120, 1100) * np.clip(1 - t / 2.2, 0, 1) ** 1.3 * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    debris = hp(rng.standard_normal(n), 3000) * (rng.random(n) > 0.9993) * np.exp(-t / 1.5) * 3
    add(sfx, thud * 1.2 + body * 0.9 + crack + splinter * 0.25 + scrape * 0.45 + debris, t0, g)
def ring(t0, dur=4.0, g=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * 3150 * t) + 0.4 * np.sin(2 * np.pi * 4720 * t)) * np.exp(-t / (dur * 0.45))
    add(sfx, x, t0, g)

# ---------------------------------------------------------------- MUSIK
t_hook = S["hook"]
add(music, strings(["D2", "A2"], 6.0, a=1.0, r=2.0, bright=700, g=0.9), t_hook, 1.0)
for i in range(3): hit(fr(8 + 22 * i), 0.7 + 0.1 * i)
riser(fr(66), 1.0, 0.5)

# briefing: pad tipis + detak jarum jam
b0 = S["brief"]; b1 = S["oobA"]
for i, ch in enumerate((["D3", "A3", "D4"], ["Bb2", "F3", "Bb3"], ["G2", "D3", "G3"])):
    add(music, strings(ch, (b1 - b0) / 3 + 1.2, a=1.6, r=1.8, bright=1300, g=0.5), b0 + i * (b1 - b0) / 3, 1.0, pan=-0.15)
t = b0 + 0.5
while t < b1 - 0.5: tick(t); t += 1.0

# order of battle: pad lebih tebal + timpani pelan
o0 = S["oobA"]; o2 = S["alive"]
for i, ch in enumerate((["D3", "F3", "A3", "D4"], ["Bb2", "D3", "F3", "Bb3"], ["G2", "Bb2", "D3", "G3"], ["A2", "E3", "A3", "C4"])):
    add(music, strings(ch, (o2 - o0) / 4 + 1.5, a=1.8, r=2.0, bright=1500, g=0.55), o0 + i * (o2 - o0) / 4, 1.0)
for off in (225, 250): timp(o0 + fr(off), "D2", 0.5)
timp(S["oobX"], "G2", 0.45)

# peta hidup: ketegangan naik menuju lepas glider
a0 = S["alive"]; cast = a0 + fr(300); g0_ = S["glider"]
t = a0
while t < cast - 0.3:
    p = (t - a0) / (cast - a0)
    timp(t, "D2", 0.12 + 0.5 * p); t += max(0.35, 1.2 - 0.9 * p)
add(music, strings(["D2", "A2", "F3"], cast - a0 + 0.5, a=3.0, r=0.6, trem=6, bright=1400, g=0.7), a0, 1.0)
riser(cast - 4.0, 4.0, 0.6)
hit(cast, 0.8)

# peta hidup, fase meluncur: tug menjauh, tinggal angin + dengung rendah sampai adegan 3D
add(music, strings(["D2", "A2"], g0_ - cast + 0.6, a=1.2, r=0.8, bright=650, g=0.5, trem=2.5), cast + 0.4, 1.0)
for ch in range(2):
    k0 = int(cast * SR); m = int((g0_ - cast + 0.4) * SR)
    nz = rng.standard_normal(m)
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * np.arange(m) / SR + ch)
    amb[ch, k0:k0 + m] += (bp(nz, 150, 800) + bp(rng.standard_normal(m), 800, 2400) * 0.25) * gust * np.minimum(1, np.arange(m) / (1.5 * SR)) * 0.12

# glider: musik menipis, hampir hanya ambien; musik kembali setelah benturan
g0 = S["glider"]; touch = g0 + fr(T["GL"]["touch"])
add(music, strings(["D2", "A2"], touch - g0 - 0.2, a=2.5, r=0.5, bright=600, g=0.5, trem=3), g0, 1.0)
riser(touch - 3.0, 3.0, 0.5)
add(music, strings(["D2", "A2", "D3", "F3"], DUR - touch, a=2.5, r=2.5, bright=1100, g=0.7), touch + 1.4, 1.0)
add(music, horn("A3", 5.0, 0.8), touch + 3.2, 1.0)
add(music, horn("D4", 4.0, 0.8), touch + 6.0, 1.0)

# ---------------------------------------------------------------- SFX tersinkron
# briefing
c = lambda f: b0 + fr(f)
chalk(c(70), 1.4); chalk(c(100), 1.4)
stamp(c(117)); stamp(c(147))
chalk(c(150), 1.7); chalk(c(175), 1.7)
# order of battle
for off in (20, 38, 56): pop(o0 + fr(off))
for off in (80, 116, 152): paper(o0 + fr(off))
for off in (225, 250): paper(o0 + fr(off), 0.5)
x0 = S["oobX"]
for off in (25, 45): pop(x0 + fr(off))
paper(x0 + fr(60))
# peta hidup: mesin tug mendekat lalu pergi
engines(a0 + fr(20), fr(300 - 20) + 1.0, g=0.55, f_start=62, f_end=78)
engines(cast, 4.5, g=0.45, f_start=78, f_end=52, pan=0.4)
pop(cast, 0.5); whoosh(cast + 0.1, 1.5, 0.45)
# glider (POV): desis udara halus (bukan siulan bernada) + detak jantung + statis radio tipis + derit airframe pelan
n_gl = int((T["GLIDER"] / FPS) * SR)
tt = np.arange(n_gl) / SR
tch = touch - g0
ex_in = T["GL"]["extIn"] / FPS; ex_out = T["GL"]["extOut"] / FPS
cock = ((tt < ex_in - 0.05) | (tt > ex_out + 0.05)).astype(float)
cock = lp(cock, 8, 1)
for ch in range(2):
    brown = np.cumsum(rng.standard_normal(n_gl)); brown -= lp(brown, 40, 1); brown /= (np.std(brown) + 1e-9)
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * tt + ch * 1.1) * np.sin(2 * np.pi * 0.09 * tt + 0.4)
    ramp = np.clip(tt / 5.0, 0.3, 1.0)
    rush = lp(brown, 900) * 0.55 + lp(rng.standard_normal(n_gl), 1800) * 0.07
    rush = hp(rush, 40) * gust * (0.45 + 0.7 * ramp)
    # statis radio: derau pita sempit + letupan acak
    stat = bp(rng.standard_normal(n_gl), 2200, 7000) * 0.05
    crk = (rng.random(n_gl) > 0.9992) * rng.standard_normal(n_gl) * 2.2
    stat = (stat + hp(crk, 1500) * 0.12) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.23 * tt + ch) ** 2) * cock
    bed = (rush + stat) * np.where(tt > tch + 0.12, np.exp(-(tt - tch) / 0.35), 1.0)  # semua berhenti saat benturan
    amb[ch, int(g0 * SR): int(g0 * SR) + n_gl] += bed[: N - int(g0 * SR)] * 0.5
# detak jantung: makin cepat mendekati benturan, hanya di kokpit
tb = 0.4
while tb < tch - 0.2:
    bpm = 62 + 52 * min(1, tb / tch)
    for k, (dt, gg) in enumerate(((0.0, 1.0), (0.17, 0.7))):
        if (tb + dt) > ex_in and (tb + dt) < ex_out: continue
        n = int(0.22 * SR); t_ = np.arange(n) / SR
        beat = np.sin(2 * np.pi * (58 - 18 * t_ / 0.22) * t_) * np.exp(-t_ / 0.06)
        add(sfx, beat, g0 + tb + dt, 0.55 * gg)
    tb += 60.0 / bpm
for off in (30, 104, 170): creak(g0 + fr(off), dur=1.0, g=0.12, f0=140)
# cutaway luar: kepakan sayap
ex0 = g0 + fr(T["GL"]["extIn"]); ex1 = g0 + fr(T["GL"]["extOut"])
whoosh(ex0, 1.4, 0.55); whoosh(ex0 + 0.7, 1.6, 0.4)
nflap = int((ex1 - ex0 + 0.4) * SR); tf = np.arange(nflap) / SR
add(sfx, bp(rng.standard_normal(nflap), 80, 600) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * tf)) ** 2 * 0.4, ex0, 0.5)
# benturan
crash(touch, 1.0)
ring(touch + 0.1, 4.5, 0.1)
# bayangan sunyi: angin pelan kembali
for ch in range(2):
    k0 = int((touch + 1.6) * SR); m = N - k0
    amb[ch, k0:] += bp(rng.standard_normal(m), 150, 700) * np.minimum(1, np.arange(m) / (2 * SR)) * 0.05

# ---------------------------------------------------------------- reverb & mix
def reverb(x, secs=2.2, wet=0.3):
    n = int(secs * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for ch in range(2):
        ir = lp(rng.standard_normal(n) * np.exp(-t / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
        out[ch] = x[ch] + signal.fftconvolve(x[ch], ir)[: x.shape[1]] * wet
    return out
music = reverb(music, 3.0, 0.45)
sfx = reverb(sfx, 1.4, 0.18)
duck = np.ones(N)
for t0_, a_ in ((touch, 1.0), (cast, 0.6), (S["hook"], 0.0)):
    if a_ <= 0: continue
    i = int(t0_ * SR); n = int(2.2 * SR)
    seg = 1 - 0.8 * a_ * np.exp(-np.arange(n) / SR / 0.7)
    if t0_ == touch:  # musik benar-benar hilang sesaat setelah benturan
        seg = 1 - 0.97 * np.exp(-np.arange(n) / SR / 1.1)
    duck[i:i + n] = np.minimum(duck[i:i + n], seg[: len(duck[i:i + n])])
mix = music * duck * 0.55 + sfx * 0.75 + amb * 0.9
end = int(DUR * SR)
fade = np.ones(N); fi = int(0.05 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo = int(2.5 * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = (mix * fade)[:, :end]
peak = np.max(np.abs(mix)); mix = np.tanh(mix / peak * 1.25) * 0.92
wavfile.write(sys.argv[2], SR, (mix.T * 32767).astype(np.int16))
print("ok", round(DUR, 1), "s")
