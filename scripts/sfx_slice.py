"""Potong efek multi-tembakan jadi 'one-shot' lewat deteksi onset, supaya tiap kejadian di layar punya suaranya sendiri.
Hasil: assets-src/sfx/slices/<nama>-<n>.wav + slices/index.json (offset asal, durasi). Pakai: python3 scripts/sfx_slice.py"""
import json, subprocess, numpy as np, os
S = "assets-src/sfx/"; OUT = S + "slices/"; os.makedirs(OUT, exist_ok=True)
JOBS = {"el2-artillery": (0.55, 2.6), "el2-mg42": (0.45, 1.6), "el2-bullet-whizz": (0.30, 1.2), "el2-katyusha": (1.2, 5.0), "el2-urra": (99, 8.0), "el2-t34-gun": (99, 4.0), "el2-shell-incoming": (99, 6.0)}
idx = {}
for name, (gap, maxd) in JOBS.items():
    sr = 16000
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", S + name + ".mp3", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
    hop = int(sr * 0.01); e = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) + 1e-6 for i in range(0, len(a) - hop, hop)]); db = 20 * np.log10(e)
    on = []; floor = np.percentile(db, 30)
    for i in range(10, len(db)):
        if db[i] - np.min(db[i - 10:i]) > 9 and db[i] > floor + 8 and (not on or (i - on[-1]) * 0.01 > gap): on.append(i)
    starts = [max(0.0, o * 0.01 - 0.04) for o in on] or [0.0]
    D = len(a) / sr; idx[name] = []
    for n, t0 in enumerate(starts):
        t1 = min(D, t0 + maxd, starts[n + 1] + 0.05 if n + 1 < len(starts) else D)
        f = f"{OUT}{name}-{n}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", S + name + ".mp3", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-af", "afade=t=out:st=%.3f:d=0.08" % max(0, t1 - t0 - 0.08), f], check=True)
        idx[name].append({"file": f"slices/{name}-{n}.wav", "src_t0": round(t0, 2), "dur": round(t1 - t0, 2)})
    print(name, len(starts), "irisan:", [(round(x["src_t0"], 1), x["dur"]) for x in idx[name]])
json.dump(idx, open(OUT + "index.json", "w"), indent=1)
