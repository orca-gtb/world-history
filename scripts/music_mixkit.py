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
# (id trek Mixkit atau 'kameraden', mulai (detik), offset detik dalam trek, nama)
PLAN = [("565", 0.0, 0.0, "Fallen (Asper)"), ("188", S(ch["c03"]["start"]), 0.0, "Echoes"), ("598", S(ch["c05"]["start"]), 0.0, "We Will Get It"),
        ("679", S(ch["c08"]["start"]), 0.0, "Epical Drums 04"), ("890", S(ch["c09"]["start"]), 0.0, "Unforgiven"), ("kameraden", S(ch["c11"]["voStart"]) - 12.0, 0.0, "Ich hatt' einen Kameraden (Silcher, synth)")]
MUSIC_RMS = 0.036; SFX_GAIN = 0.7; XF = 4.0
sr, sfx = wavfile.read(sys.argv[1]); sfx = sfx.astype(np.float32).T / 32768; N = sfx.shape[1]; DUR = N / SR
def load(tid):
    path = "out/kameraden-synth.wav" if tid == "kameraden" else f"{M}/{tid}.mp3"   # kameraden = hasil scripts/kameraden.py
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T.copy()
music = np.zeros((2, N), np.float32)
for i, (tid, t0, off, name) in enumerate(PLAN):
    t1 = PLAN[i + 1][1] if i + 1 < len(PLAN) else DUR
    x = load(tid)[:, int(off * SR):]
    x *= MUSIC_RMS / (np.sqrt((x ** 2).mean()) + 1e-9)
    n = int((t1 - t0 + XF) * SR)           # sedikit lewat batas untuk crossfade
    if x.shape[1] < n:
        if tid != "kameraden" or n - x.shape[1] > 8 * SR: raise SystemExit(f"trek {name} ({tid}) terlalu pendek: {x.shape[1]/SR:.0f}s < {n/SR:.0f}s")
        x = np.pad(x, ((0, 0), (0, n - x.shape[1])))   # potongan akhir lagu sudah fade sendiri
    seg = x[:, :n].copy()
    g = np.ones(n, np.float32)
    fi = int(XF * SR) if i > 0 else int(2.0 * SR)
    g[:fi] = np.sin(np.linspace(0, np.pi / 2, fi)) ; g[-int(XF * SR):] = np.cos(np.linspace(0, np.pi / 2, int(XF * SR)))
    s0 = int(t0 * SR); e = min(N, s0 + n); music[:, s0:e] += (seg * g)[:, : e - s0]
    print(f"{t0:6.1f}s-{t1:6.1f}s  {name} (#{tid}, offset {off:.0f}s)")
# ---- peta dinamika (#8): hening/puncak. (waktu detik, dB) linear antar titik. Tidak mengubah SFX/narasi.
SPEC = json.load(open("longform/spec.json"))
def vo(cid): return ch[cid]["voStart"] / fps
def counter301():
    for c in SPEC[8]["cards"]:
        if c["k"] == "counter" and c.get("to") == 301: return vo("c08") + c["at"], vo("c08") + c["end"]
    return None
ENV = [(0.0, -10.0), (5.6, -10.0), (6.8, 0.0)]                    # hook: musik menahan diri di bawah counter 352, naik di kalimat berikutnya
ENV += [(vo("c06") + 0.8, 0.0), (vo("c06") + 2.0, -7.0), (vo("c06") + 8.5, -7.0), (vo("c06") + 10.0, 0.0)]   # hening: sebelum black tulip
c3 = counter301()
if c3: ENV += [(c3[0] - 1.0, 0.0), (c3[0] + 0.8, 3.5), (c3[1] + 2.0, 3.5), (c3[1] + 4.0, 0.0)]            # puncak: 301 dalam sehari
ENV += [(vo("c09") + 6.2, 0.0), (vo("c09") + 7.0, 3.5), (vo("c09") + 9.0, 3.5), (vo("c09") + 11.0, 0.0)]   # puncak: kemenangan terakhir (Brno)
ENV += [(vo("c11") - 15.0, 0.0), (vo("c11") - 9.0, -5.0), (vo("c11") - 6.0, -5.0), (vo("c11") + 1.0, 0.0)]                          # sebelum Silcher: turun lalu lagu masuk
ENV.sort()
tt = np.arange(N) / SR; env_db = np.interp(tt, [e[0] for e in ENV], [e[1] for e in ENV], left=0.0, right=0.0)
music *= (10 ** (env_db / 20)).astype(np.float32)[None, :]
print("peta dinamika:", [(round(a, 1), b) for a, b in ENV])
end = int(DUR * SR); fo = int(4.0 * SR); music[:, end - fo:end] *= np.linspace(1, 0, fo) ** 1.5
mix = music + sfx * SFX_GAIN
wavfile.write(sys.argv[2], SR, (np.clip(mix, -1, 1).T * 32767).astype(np.int16)); print("bed mixkit ok", round(DUR, 1))
