"""Bed long-form = trek Mixkit (Stock Music Free License) per segmen bab + SFX (out/longform-sfx.wav dari NO_PAD=1 soundtrack_longform.py).
Segmen diganti di batas bab (crossfade daya-sama 4 dtk), tiap trek dinormalkan RMS, fade-out di akhir.
Pakai: python3 scripts/music_mixkit.py out/longform-sfx.wav out/longform-bed-mixkit.wav"""
import sys, json, subprocess, numpy as np
from scipy.io import wavfile
SR = 48000
T = json.load(open("src/longform/timing.json")); fps = T["fps"]
ch = {c["id"]: c for c in T["chapters"]}
S = lambda f: f / fps
M = "assets-src/music"
# (id trek, mulai di bab, offset detik dalam trek, nama)
PLAN = [("565", 0.0, 0.0, "Fallen (Asper)"), ("188", S(ch["c03"]["start"]), 0.0, "Echoes"), ("598", S(ch["c05"]["start"]), 0.0, "We Will Get It"),
        ("679", S(ch["c08"]["start"]), 0.0, "Epical Drums 04"), ("890", S(ch["c09"]["start"]), 0.0, "Unforgiven"), ("565", S(ch["c12"]["start"]), 200.0, "Fallen (Asper)")]
MUSIC_RMS = 0.036; SFX_GAIN = 0.7; XF = 4.0
sr, sfx = wavfile.read(sys.argv[1]); sfx = sfx.astype(np.float32).T / 32768; N = sfx.shape[1]; DUR = N / SR
def load(tid):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{M}/{tid}.mp3", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T.copy()
music = np.zeros((2, N), np.float32)
for i, (tid, t0, off, name) in enumerate(PLAN):
    t1 = PLAN[i + 1][1] if i + 1 < len(PLAN) else DUR
    x = load(tid)[:, int(off * SR):]
    x *= MUSIC_RMS / (np.sqrt((x ** 2).mean()) + 1e-9)
    n = int((t1 - t0 + XF) * SR)           # sedikit lewat batas untuk crossfade
    if x.shape[1] < n: raise SystemExit(f"trek {name} ({tid}) terlalu pendek: {x.shape[1]/SR:.0f}s < {n/SR:.0f}s")
    seg = x[:, :n].copy()
    g = np.ones(n, np.float32)
    fi = int(XF * SR) if i > 0 else int(2.0 * SR)
    g[:fi] = np.sin(np.linspace(0, np.pi / 2, fi)) ; g[-int(XF * SR):] = np.cos(np.linspace(0, np.pi / 2, int(XF * SR)))
    s0 = int(t0 * SR); e = min(N, s0 + n); music[:, s0:e] += (seg * g)[:, : e - s0]
    print(f"{t0:6.1f}s-{t1:6.1f}s  {name} (#{tid}, offset {off:.0f}s)")
end = int(DUR * SR); fo = int(4.0 * SR); music[:, end - fo:end] *= np.linspace(1, 0, fo) ** 1.5
mix = music + sfx * SFX_GAIN
wavfile.write(sys.argv[2], SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16)); print("bed mixkit ok", round(DUR, 1))
