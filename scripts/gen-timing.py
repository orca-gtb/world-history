"""Hasilkan src/longform/timing.json dari durasi VO (longform/vo/sentences.json).
frames bab = pre(9) + ceil(dur*30) + 18 ; kartu bab = CARD frame sebelum bab (kecuali c00) ; end card di akhir.
Pakai: python3 scripts/gen-timing.py [cardFrames=45] [endFrames=300] [--check]"""
import json, math, sys
args = [a for a in sys.argv[1:] if not a.startswith("--")]
CARD = int(args[0]) if args else 45; END = int(args[1]) if len(args) > 1 else 300
S = json.load(open("longform/vo/sentences.json")); old = json.load(open("src/longform/timing.json"))
PRE, TAIL, FPS = 9, 18, 30
t = 0; chs = []
for i, k in enumerate(sorted(S)):
    d = S[k]["dur"]; frames = PRE + math.ceil(d * FPS) + TAIL
    if i == 0: cs, st = None, 0
    else: cs, st = t, t + CARD
    chs.append({"id": k, "cardStart": cs, "start": st, "frames": frames, "voStart": st + PRE, "dur": d}); t = st + frames
out = {"fps": FPS, "pre": PRE, "cardFrames": CARD, "endStart": t, "endFrames": END, "total": t + END, "chapters": chs}
if "--check" in sys.argv:
    same = all(a == b for a, b in zip(chs, old["chapters"])) and out["total"] == old["total"]
    print("cocok dengan timing.json lama:", same, out["total"], old["total"]); sys.exit(0 if same else 1)
json.dump(out, open("src/longform/timing.json", "w"), separators=(",", ":")); print("timing ok", out["total"], "frame =", round(out["total"] / FPS, 1), "dtk")
