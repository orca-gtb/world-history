"""Campur bed long-form dengan 13 bab VO (ducking otomatis).
Pakai: python3 scripts/mix_vo_longform.py out/longform-bed.wav longform/vo out/longform-mix.wav"""
import sys, json, subprocess, numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000
bed_path, vo_dir, out = sys.argv[1:4]
T = json.load(open("src/longform/timing.json"))
sr, bed = wavfile.read(bed_path); bed = bed.astype(np.float32).T / 32768
N = bed.shape[1]
vo = np.zeros(N, dtype=np.float32)
for c in T["chapters"]:
    k = c["id"]; wav = f"/tmp/{k}.48k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{vo_dir}/{k}.mp3", "-ac", "1", "-ar", str(SR), wav], check=True)
    r, x = wavfile.read(wav); x = x.astype(np.float32) / 32768
    x = signal.sosfilt(signal.butter(2, 70, "high", fs=SR, output="sos"), x).astype(np.float32)
    x *= 0.12 / (np.sqrt(np.mean(x ** 2)) + 1e-9)
    i = int(c["voStart"] / T["fps"] * SR); vo[i:i + len(x)] += x[: N - i]
n = int(0.9 * SR); t = np.arange(n) / SR
ir = signal.sosfilt(signal.butter(2, 4500, "low", fs=SR, output="sos"), np.random.default_rng(5).standard_normal(n) * np.exp(-t / 0.18)); ir /= np.sqrt(np.sum(ir ** 2))
vo = vo + (0.10 * signal.fftconvolve(vo, ir.astype(np.float32))[:N]).astype(np.float32)
h = int(SR * 0.01); m = N // h
e = np.sqrt((vo[: m * h].reshape(m, h) ** 2).mean(1)); e = np.clip(e / (np.percentile(e[e > 1e-4], 95) + 1e-9), 0, 1)
a_, r_ = 1 - np.exp(-1 / 8), 1 - np.exp(-1 / 45); g = np.zeros(m, dtype=np.float32); cur = 0.0
for i in range(m):
    cur += (a_ if e[i] > cur else r_) * (e[i] - cur); g[i] = cur
duck = np.interp(np.arange(N) / SR, np.arange(m) * 0.01, 1 - 0.55 * np.clip(g * 2.5, 0, 1)).astype(np.float32)
mix = np.stack([bed[0] * duck, bed[1] * duck]) * 0.8 + vo
wavfile.write(out, SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16))
print("mix ok", round(N / SR, 1), "s")
