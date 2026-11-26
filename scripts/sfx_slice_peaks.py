"""Potong rekaman multi-tembakan senapan per puncak amplitudo (lebih peka daripada onset sfx_slice.py).
Hasil ditambahkan ke assets-src/sfx/slices/index.json. Pakai: python3 scripts/sfx_slice_peaks.py"""
import json, subprocess, numpy as np
S = "assets-src/sfx/"; OUT = S + "slices/"; idx = json.load(open(OUT + "index.json"))
for name, mind in (("el2-garand", 0.55), ("el2-kar98k", 0.7)):
    sr = 16000
    a = np.abs(np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", S + name + ".mp3", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout, np.float32))
    hop = int(sr * 0.005); e = np.array([a[i:i + hop].max() for i in range(0, len(a) - hop, hop)]); thr = 0.14 * e.max(); pk = []
    for i in range(2, len(e) - 2):
        if e[i] >= thr and e[i] == e[max(0, i - 40):i + 40].max() and (not pk or (i - pk[-1]) * 0.005 > mind): pk.append(i)
    starts = [max(0.0, p * 0.005 - 0.05) for p in pk]; D = len(a) / sr; idx[name] = []
    for n, t0 in enumerate(starts):
        t1 = min(D, t0 + 1.4, starts[n + 1] - 0.02 if n + 1 < len(starts) else D)
        f = f"{OUT}{name}-{n}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", S + name + ".mp3", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-af", "afade=t=out:st=%.3f:d=0.08" % max(0, t1 - t0 - 0.08), f], check=True)
        idx[name].append({"file": f"slices/{name}-{n}.wav", "src_t0": round(t0, 2), "dur": round(t1 - t0, 2)})
    print(name, len(starts), "irisan:", [(x["src_t0"], x["dur"]) for x in idx[name]])
json.dump(idx, open(OUT + "index.json", "w"), indent=1)
