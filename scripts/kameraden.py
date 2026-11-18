"""Render 'Ich hatt' einen Kameraden' (melodi Silcher 1825, aransemen MIDI CC0 dari Wikimedia Commons) dengan synth sendiri.
Jalur MIDI: 1 = melodi (horn), 2-3 = alto/tenor (string), 4 = bass (cello). Tempo & nada mengikuti file asli.
Pakai: python3 scripts/kameraden.py assets-src/music/kameraden.mid out/kameraden-synth.wav [detik_maks]"""
import sys, numpy as np, mido
from scipy import signal
from scipy.io import wavfile
SR = 48000
src, out = sys.argv[1:3]; maxsec = float(sys.argv[3]) if len(sys.argv) > 3 else None
rng = np.random.default_rng(1825)
mid = mido.MidiFile(src)
def notes_of(tr):
    t = 0; on = {}; res = []
    tempo = 500000; # tempo di jalur 0 -> konversi manual
    return res
tempo = next(x.tempo for x in mid.tracks[0] if x.type == "set_tempo"); spt = tempo / 1e6 / mid.ticks_per_beat
def get(tr):
    t = 0; on = {}; res = []
    for x in tr:
        t += x.time
        if x.type == "note_on" and x.velocity > 0: on[x.note] = (t, x.velocity)
        elif x.type in ("note_off", "note_on") and x.note in on:
            s, v = on.pop(x.note); res.append((s * spt, (t - s) * spt, x.note, v))
    return sorted(res)
voices = {k: get(mid.tracks[k]) for k in (1, 2, 3, 4)}
total = max(s + d for v in voices.values() for s, d, _, _ in v) + 3.0
if maxsec: total = min(total, maxsec)
N = int(total * SR)
f = lambda n: 440.0 * 2 ** ((n - 69) / 12)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x)
def tone(freq, dur, kind, vel):
    n = int((dur + 0.6) * SR); t = np.arange(n) / SR
    vib = 1 + 0.0035 * np.sin(2 * np.pi * 5.1 * t + rng.uniform(0, 6)) * np.clip(t / 0.5, 0, 1)
    if kind == "horn":
        ph = 2 * np.pi * np.cumsum(freq * vib) / SR; x = sum(np.sin(h * ph) / h ** 1.15 for h in range(1, 12))
        x = lp(x, 1500 + 600 * vel / 127); a, r = 0.09, 0.45
    elif kind == "string":
        x = 0
        for d in (-0.004, 0.0, 0.004):
            ph = 2 * np.pi * np.cumsum(freq * (1 + d) * vib) / SR; x = x + signal.sawtooth(ph) * 0.34
        x = lp(x, 1300); a, r = 0.25, 0.55
    else:  # bass / cello rendah
        ph = 2 * np.pi * np.cumsum(freq * vib) / SR; x = signal.sawtooth(ph) * 0.8 + np.sin(ph) * 0.5
        x = lp(x, 520); a, r = 0.12, 0.5
    env = np.ones(n); na = int(a * SR); env[:na] = np.linspace(0, 1, na) ** 1.5
    nr = int(r * SR); end = int(dur * SR); env[end:end + nr] = np.linspace(1, 0, min(nr, n - end))[: n - end] ** 1.4 if end < n else env[end:end + nr]; env[end + nr:] = 0
    return (x * env).astype(np.float32)
buf = np.zeros((2, N), np.float32)
CFG = {1: ("horn", 1.0, 0.18), 2: ("string", 0.55, -0.25), 3: ("string", 0.55, 0.25), 4: ("bass", 0.8, 0.0)}
for k, ns in voices.items():
    kind, g, pan = CFG[k]
    for s, d, n, v in ns:
        i = int(s * SR)
        if i >= N: continue
        x = tone(f(n), d * 0.98, kind, v) * g * (v / 90)
        e = min(N, i + len(x)); lpan = np.sqrt(0.5 * (1 - pan)); rpan = np.sqrt(0.5 * (1 + pan))
        buf[0, i:e] += x[: e - i] * lpan; buf[1, i:e] += x[: e - i] * rpan
# ruang (reverb) panjang & lembut
n = int(2.8 * SR); tt = np.arange(n) / SR; wet = np.zeros_like(buf)
for ch in range(2):
    ir = lp(rng.standard_normal(n) * np.exp(-tt / 0.65), 4200); ir /= np.sqrt((ir ** 2).sum())
    wet[ch] = signal.fftconvolve(buf[ch], ir)[:N]
mix = buf * 0.62 + wet * 0.5
fi = int(1.5 * SR); mix[:, :fi] *= np.linspace(0, 1, fi); fo = int(3.0 * SR); mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
mix = mix / np.abs(mix).max() * 0.85
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16)); print("kameraden ok", round(total, 1), "s")
