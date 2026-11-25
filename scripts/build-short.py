"""Short builder: spec shorts/<id>.json + VO yang sudah ada -> src/shorts/<id>.timeline.json.
VO dipotong per KALIMAT (titik potong = tengah jeda senyap), kalimat boleh diurut ulang (cold open).
Waktu kata diperkirakan: proporsi karakter di antara jangkar jeda (akurasi ±0,15 dtk, tanpa biaya STT).
Pakai: python3 scripts/build-short.py s01"""
import json, re, subprocess, sys, itertools
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
def silences(f):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=n=-38dB:d=0.22", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r"silence_start: (-?[0-9.]+)", r)]; e = [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", r)]
    return list(zip(s, e + [None] * (len(s) - len(e))))
VO = {}
for k in ("research/bagration-part1-vo.json", "research/bagration-part2-vo.json"):
    d = json.load(open(k)); items = d if isinstance(d, list) else [dict(id=a, **(b if isinstance(b, dict) else {"text": b})) for a, b in d.items()]
    for it in items: VO[it["id"]] = it["text"]
def weights(words): return [len(w) + (6 if w.endswith((",", ":", ";")) else 0) + (10 if w.endswith((".", "?", "!")) else 0) for w in words]
def analyse(clip):
    f = clip + ".mp3"; key = clip.split("/")[-1]; text = VO[key]; D = dur(f)
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    sil = silences(f); lead = sil[0][1] if sil and sil[0][0] <= 0.05 and sil[0][1] else 0.0
    tail = sil[-1][0] if sil and sil[-1][1] is None else D
    inner = [(a, b) for a, b in sil if b is not None and a > lead + 0.3 and b < tail - 0.2]
    ws = [weights(s.split()) for s in sents]; tot = sum(sum(w) for w in ws); acc = 0; est = []
    for w in ws[:-1]: acc += sum(w); est.append(lead + (tail - lead) * acc / tot)
    m = len(est); best = None
    for combo in itertools.combinations(range(len(inner)), m) if m else [()]:
        err = sum(abs((inner[c][0] + inner[c][1]) / 2 - e) for c, e in zip(combo, est))
        if best is None or err < best[0]: best = (err, combo)
    cuts = [(inner[c][0] + inner[c][1]) / 2 for c in best[1]]
    starts = [lead] + [inner[c][1] for c in best[1]]; ends = [inner[c][0] for c in best[1]] + [tail]
    cb = [0.0] + cuts + [D]; out = []
    for i, s in enumerate(sents):
        words = s.split(); w = weights(words); T = sum(w); t = starts[i]; ww = []
        for a, b in zip(words, w):
            d = (ends[i] - starts[i]) * b / T; ww.append({"w": a, "t0": round(t, 3), "t1": round(t + d, 3)}); t += d
        out.append({"text": s, "speech": [round(starts[i], 3), round(ends[i], 3)], "cut": [round(cb[i], 3), round(cb[i + 1], 3)], "words": ww})
    return out
def main(sid):
    spec = json.load(open(f"shorts/{sid}.json")); cache = {}; cur = 0.0; vo = []; words = []; scenes = []; starts = []
    for n, it in enumerate(spec["items"]):
        S = cache.setdefault(it["clip"], analyse(it["clip"]))
        for si in it["sent"]:
            s = S[si]; a = max(s["cut"][0], s["speech"][0] - 0.12); b = min(s["cut"][1], s["speech"][1] + 0.18)
            vo.append({"file": it["clip"] + ".mp3", "start": round(cur, 3), "ss": round(a, 3), "to": round(b, 3), "dur": round(b - a, 3)})
            for w in s["words"]: words.append({"w": w["w"], "t0": round(cur + w["t0"] - a, 3), "t1": round(cur + w["t1"] - a, 3), "item": n})
            if n == 0 and si == it["sent"][0]: pass
            starts.append((n, round(cur, 3))); cur += b - a
        t0 = next(t for i, t in starts if i == n); scenes.append({"item": n, "id": it["scene"], "x": it["x"], "t0": t0, "t1": round(cur, 3)})
    # gabung adegan berurutan yang sama (lt terus berjalan)
    merged = []
    for s in scenes:
        if merged and merged[-1]["id"] == s["id"]: merged[-1]["t1"] = s["t1"]; merged[-1]["x"] = [merged[-1]["x"][0], s["x"][1]]
        else: merged.append(dict(s))
    total = round(cur + spec.get("tail", 1.2), 2); cards = []
    for c in spec["cards"]:
        c = dict(c)
        if "at_word" in c:
            w = next(w for w in words if w["item"] >= c.get("at_item", 0) and c["at_word"].lower() in w["w"].lower()); c["t0"] = round(w["t0"] + c.get("lead", -0.25), 2); c["t1"] = round(c["t0"] + c["dur"], 2)
        if "at2_word" in c:
            w2 = next(w for w in words if w["t0"] > c["t0"] and c["at2_word"].lower() in w["w"].lower()); c["t2"] = round(w2["t0"] - 0.1, 2)
        if c.get("end"): c["t0"] = round(total - c["dur"], 2); c["t1"] = total
        cards.append(c)
    out = {"id": sid, "fps": 30, "total": total, "vo": vo, "words": words, "scenes": merged, "cards": cards, "title": spec["title"]}
    json.dump(out, open(f"src/shorts/{sid}.timeline.json", "w"), indent=1, ensure_ascii=False)
    print(sid, "total", total, "s | VO", round(sum(v["dur"] for v in vo), 1), "s |", len(words), "kata |", [(s["id"], s["t0"], s["t1"]) for s in merged])
main(sys.argv[1])
