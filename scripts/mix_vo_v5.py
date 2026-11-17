"""Campur bed (musik+SFX) dengan 5 baris VO Liam Dale, ducking otomatis.
Pakai: python3 scripts/mix_vo_v5.py out/aces-v5-bed.wav vo out/aces-v5-mix.wav"""
import sys, subprocess, numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000
bed_path, vo_dir, out = sys.argv[1:4]
sr, bed = wavfile.read(bed_path); bed = bed.astype(np.float64).T / 32768
N = bed.shape[1]
# jadwal VO (detik): L1 hook, L2 papan, L3 sorotan (misi -> kemenangan terakhir), L4 blueprint (tulip), L5 penutup (ledger)
START = {"l1": 0.12, "l2": 3.95, "l3": 15.0, "l4": 27.9, "l5": 37.9}
vo = np.zeros(N)
for k, t0 in START.items():
    wav = f"{vo_dir}/{k}.48k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{vo_dir}/{k}.mp3", "-ac", "1", "-ar", str(SR), wav], check=True)
    r, x = wavfile.read(wav); x = x.astype(np.float64) / 32768
    x = signal.sosfilt(signal.butter(2, 70, "high", fs=SR, output="sos"), x)
    x *= 0.12 / (np.sqrt(np.mean(x ** 2)) + 1e-9)          # samakan level antar baris
    i = int(t0 * SR); vo[i:i + len(x)] += x[: N - i]
# ruang tipis supaya suara menyatu dengan bed
n = int(0.9 * SR); t = np.arange(n) / SR
ir = signal.sosfilt(signal.butter(2, 4500, "low", fs=SR, output="sos"), np.random.default_rng(5).standard_normal(n) * np.exp(-t / 0.18)); ir /= np.sqrt(np.sum(ir ** 2))
vo = vo + 0.10 * signal.fftconvolve(vo, ir)[:N]
# ducking: envelope VO -> bed turun ~7 dB saat ada suara
h = int(SR * 0.01); m = N // h
e = np.sqrt((vo[: m * h].reshape(m, h) ** 2).mean(1)); e = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1)
a_, r_ = 1 - np.exp(-1 / (0.08 / 0.01)), 1 - np.exp(-1 / (0.45 / 0.01)); g = np.zeros(m); cur = 0.0
for i in range(m): cur += (a_ if e[i] > cur else r_) * (e[i] - cur); g[i] = cur
duck = np.interp(np.arange(N) / SR, np.arange(m) * 0.01, 1 - 0.55 * np.clip(g * 2.5, 0, 1))
mix = np.stack([bed[0] * duck, bed[1] * duck]) * 0.8 + vo * 1.0
wavfile.write(out, SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16))
print("mix ok")
