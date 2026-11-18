"""v4 (kamera GSAP). Soundtrack prosedural episode Pegasus Bridge — musik + SFX, tanpa narator, bebas lisensi.
Pakai: python3 scripts/soundtrack.py timing.json public/audio/soundtrack.wav
timing.json dihasilkan dari src/timing.ts (lihat scripts/export-timing.sh)."""
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(352)
FPS = 30.0
import json as _j
_T=_j.load(open("src/longform/timing.json"))
TOTAL = _T["total"]
DUR = TOTAL / FPS
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


# ---------------------------------------------------------------- MESIN TIK & KERTAS
def typekey(t0, g=0.5, pan=0.0, heavy=False):
    """Satu ketukan mesin tik: transien tajam + resonansi batang logam + gedebuk platen."""
    n = int(0.09 * SR); t = np.arange(n) / SR
    click = hp(rng.standard_normal(n), 3500) * np.exp(-t / 0.0018)
    f1 = rng.uniform(1700, 2100); f2 = f1 * rng.uniform(1.72, 1.85)
    metal = (np.sin(2 * np.pi * f1 * t) + 0.5 * np.sin(2 * np.pi * f2 * t)) * np.exp(-t / 0.014) * 0.35
    thump = np.sin(2 * np.pi * np.cumsum(170 + 90 * np.exp(-t / 0.006)) / SR) * np.exp(-t / (0.02 if heavy else 0.012)) * (0.9 if heavy else 0.5)
    add(sfx, click + metal + thump, t0 + rng.uniform(-0.008, 0.008), g * rng.uniform(0.8, 1.1), pan)
def rustle(t0, g=0.5, dur=0.75):
    """Kertas dibalik/digeser: butiran kresek acak di bawah selubung halus + desir rendah."""
    n = int(dur * SR); t = np.arange(n) / SR
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2 * (1 + 0.6 * np.sin(2 * np.pi * rng.uniform(5, 9) * t))
    grains = np.zeros(n)
    for _ in range(int(140 * dur)):
        i = rng.integers(0, n - 400); L = rng.integers(60, 400)
        grains[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 4)) * rng.uniform(0.3, 1.0)
    crinkle = bp(grains, 1800, 9000) * 1.4
    swish = bp(rng.standard_normal(n), 400, 2500) * 0.45
    add(sfx, (crinkle + swish) * shape, t0, g, pan=rng.uniform(-0.35, 0.35))
def bez(x1, y1, x2, y2):
    """cubic-bezier sama persis dengan Easing.bezier di src/kit/theme.ts (BZ)."""
    def fx(u): return 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3
    def fy(u): return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3
    def ev(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            (lo, hi) = (m, hi) if fx(m) < x else (lo, m)
        return fy((lo + hi) / 2)
    return ev
CE = bez(0.16, 1, 0.3, 1)
def count_ticks(total, f0, f1, base, min_gap=2):
    """Frame (absolut) tempat angka yang tampil berubah — tepat seperti layar, dibatasi min_gap frame."""
    out, prev, last = [], 0, -99
    for f in range(f0, f1 + 1):
        v = round(total * CE(min(1, max(0, (f - f0) / (f1 - f0)))))
        if v != prev and f - last >= min_gap: out.append(base + f); last = f
        prev = v
    return out

# ---------------------------------------------------------------- LONG-FORM: bed musik + SFX (tanpa VO)
SPEC = _j.load(open("longform/spec.json"))
sec = lambda f: f / FPS
CH = _T["chapters"]

# musik: pad muram berulang sepanjang video; tiap bab ganti akor, timpani di pembuka bab
CHORDS = [["D2", "A2", "D3"], ["Bb2", "F3", "Bb3"], ["G2", "D3", "G3"], ["A2", "E3", "A3"], ["D2", "A2", "F3"], ["G2", "D3", "Bb3"]]
import os
NO_PAD = os.environ.get("NO_PAD") == "1"   # NO_PAD=1: tanpa pad/horn sintesis (musik diganti trek pustaka, lihat scripts/music_mixkit.py)
t0 = 0.0; k = 0
while t0 < DUR and not NO_PAD:
    add(music, strings(CHORDS[k % len(CHORDS)], 8.0, a=2.2, r=2.6, bright=900 + 120 * (k % 3), g=0.5), t0, 1.0, pan=-0.1 if k % 2 else 0.1)
    t0 += 6.4; k += 1
hit(0.0 + sec(100), 0.9)                       # hantaman di angka 352
for c in CH:
    if c["cardStart"] is not None:
        timp(sec(c["cardStart"]), "D2", 0.5); rustle(sec(c["cardStart"]), 0.35); whoosh(sec(c["cardStart"]) + 0.1, 1.2, 0.3)
for nt, off in (("A3", 0.0), ("D4", 4.0), ("F4", 8.0)):   # bab puncak
    if not NO_PAD: add(music, horn(nt, 3.5, 0.55), sec(CH[8]["start"]) + off, 1.0)
timp(sec(_T["endStart"]), "D2", 0.6)
if not NO_PAD: add(music, strings(["D2", "A2", "D3"], 14.0, a=3.0, r=4.0, bright=700, g=0.6), sec(_T["endStart"]), 1.0)

# sfx: per bab -> gerak kamera, angka (mesin tik), baris penting
for ci, c in enumerate(CH):
    sp = SPEC[ci]; base = c["voStart"]
    for sh in sp["shots"][1:]:
        fr = base + int(sh["t"] * FPS)
        whoosh(sec(fr), 0.9, 0.22); paper(sec(fr - 3), 0.22)
    for card in sp["cards"]:
        if card["k"] == "counter":
            tot = card["to"] - card["from"]
            for fr in count_ticks(tot, int(card["at"] * FPS), int(card["end"] * FPS), base, min_gap=3 if tot > 60 else 5): typekey(sec(fr), 0.34, rng.uniform(-0.2, 0.2))
            typekey(sec(base + int(card["end"] * FPS)), 0.6, 0.0, heavy=True)
        if card["k"] == "bars":
            for r in card["rows"]:
                for fr in count_ticks(r["value"], int(r["at"] * FPS), int(r["end"] * FPS), base, min_gap=4): typekey(sec(fr), 0.3, rng.uniform(-0.2, 0.2))
                typekey(sec(base + int(r["end"] * FPS)), 0.5, 0.0, heavy=True)
        for l in card.get("lines", []) + card.get("foot", []):
            if l.get("hi"): pop(sec(base + int(l["at"] * FPS)), 0.35)
# adegan animasi: mesin, tembakan, benturan
def burst(t0, n, gap=0.075, g=0.5):
    for i in range(n):
        m = int(0.05 * SR); tt = np.arange(m) / SR
        add(sfx, hp(rng.standard_normal(m), 1200) * np.exp(-tt / 0.012) + lp(rng.standard_normal(m), 300) * np.exp(-tt / 0.03) * 0.6, t0 + i * gap, g, pan=rng.uniform(-0.15, 0.15))
vs = lambda ci, ts: sec(CH[ci]["voStart"]) + ts
engines(vs(3, 14.4), 11.5, g=0.22); whoosh(vs(3, 21.2), 0.8, 0.5); crash(vs(3, 24.9), 0.45)
engines(vs(4, 14.6), 8.0, g=0.22); burst(vs(4, 19.6), 13)
engines(vs(7, 10.0), 17.0, g=0.2); typekey(vs(7, 21.3), 0.7, 0.0, heavy=True); whoosh(vs(7, 22.5), 1.2, 0.35)
engines(vs(9, 4.7), 3.8, g=0.22); burst(vs(9, 6.95), 6)
engines(vs(0, 5.8), 7.1, g=0.18); whoosh(vs(0, 9.3), 0.9, 0.35)        # teaser hook (bab 0)
engines(vs(4, -0.3), 9.5, g=0.16)                                       # stalk (Roßmann)
engines(vs(4, 22.4), 8.0, g=0.15); engines(vs(4, 30.4), 8.8, g=0.15)    # flyby (Rall), closeup (Brown)

def reverb(x, secs=2.2, wet=0.3):
    n = int(secs * SR); t = np.arange(n) / SR; out = np.zeros_like(x)
    for ch in range(2):
        ir = lp(rng.standard_normal(n) * np.exp(-t / (secs / 5)), 5000); ir /= np.sqrt(np.sum(ir ** 2))
        out[ch] = x[ch] + signal.fftconvolve(x[ch], ir)[: x.shape[1]] * wet
    return out
music = reverb(music, 3.0, 0.45); sfx = reverb(sfx, 1.4, 0.18)
mix = music * 0.55 + sfx * 0.75 + amb
end = int(DUR * SR)
fade = np.ones(N); fade[:int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR)); fo = int(3.0 * SR); fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.5; fade[end:] = 0
mix = (mix * fade)[:, :end]
peak = np.max(np.abs(mix)); mix = mix / peak * 0.9
wavfile.write(sys.argv[1], SR, (mix.T * 32767).astype(np.int16))
print("bed ok", round(DUR, 1))
