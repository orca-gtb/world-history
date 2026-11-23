"""Timeline Bagration Part 1 v2 -> src/conquer/part1-timeline.json (dipakai Part1.tsx dan mix_part1.py).
VO lama dipotong di jeda kalimat; klip tambahan disisipkan. Semua waktu dihitung dari urutan ini."""
import json, subprocess
def dur(k): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"vo-bagration-p1/{k}.mp3"]))
CH = 5.2   # jeda antar bab (peta/gambar bernapas)
IN = 0.55  # jeda sisipan
SEQ = [("gap", 2.4), ("p1_0",), ("gap", 0.4), ("title", 5.7), ("gap", 0.5),
  ("p1_1",), ("gap", CH), ("p1_1b",), ("gap", CH), ("p1_2",), ("gap", CH), ("p1_2b",), ("gap", 0.7), ("p1_2c",), ("gap", CH),
  ("p1_3",), ("gap", CH), ("p1_3b",), ("gap", CH), ("p1_4",), ("gap", CH), ("p1_5", 0, 7.95), ("gap", 2.6), ("p1_5", 7.95, None), ("gap", CH),
  ("p1_6", 0, 13.59), ("gap", IN), ("p1_6a",), ("gap", IN), ("p1_6", 13.59, 26.52), ("gap", IN), ("p1_6b",), ("gap", IN), ("p1_6", 26.52, None), ("gap", 0.9), ("p1_6c",), ("gap", CH),
  ("p1_7", 0, 10.62), ("gap", IN), ("p1_7a",), ("gap", IN), ("p1_7", 10.62, 16.93), ("gap", IN), ("p1_7b",), ("gap", IN), ("p1_7", 16.93, None), ("gap", CH),
  ("p1_8", 0, 12.14), ("gap", IN), ("p1_8a",), ("gap", 0.8), ("p1_8", 12.14, None), ("gap", 0.9), ("p1_8b",), ("gap", CH),
  ("p1_9",), ("gap", 0.5), ("end", 10.4)]
t = 0.0; vo = []; pieces = {}; marks = {}
for it in SEQ:
    if it[0] == "gap": t += it[1]; continue
    if it[0] in ("title", "end"): marks[it[0]] = (t, t + it[1]); t += it[1]; continue
    f = it[0]; d = dur(f); a = it[1] if len(it) > 1 else 0.0; b = (it[2] if len(it) > 2 and it[2] is not None else d)
    vo.append({"file": f, "start": round(t, 3), "ss": a, "to": round(b, 3), "dur": round(b - a, 3)})
    pieces.setdefault(f, []).append((a, b, t)); t += b - a
TOTAL = round(t, 2)
def o(f, x):
    for a, b, s in pieces[f]:
        if a - 0.01 <= x <= b + 0.01: return round(s + x - a, 2)
    raise ValueError((f, x))
st = lambda f: o(f, 0.0)
end = lambda f: round(pieces[f][-1][2] + pieces[f][-1][1] - pieces[f][-1][0], 2)
ev = dict(
  losses=o("p1_0", 12.4), trap_set=o("p1_0", 25.2),
  south=o("p1_1", 4.65), north=o("p1_1", 9.46), between=o("p1_1", 12.9), strong=o("p1_1", 20.76), notstrong=o("p1_1", 22.7), moved=o("p1_1", 23.9), sectors=o("p1_1", 32.2),
  forts=o("p1_1b", 4.17), held=o("p1_1b", 11.9), jordan=o("p1_1b", 15.74), jquote=o("p1_1b", 20.08),
  reserves=o("p1_2", 7.85), mask=o("p1_2", 13.06), tankarmies=o("p1_2", 20.3), night=o("p1_2", 24.9), bluff=o("p1_2", 29.47), centre=o("p1_2", 31.5), rush=o("p1_2", 33.6), south2=o("p1_2", 36.0),
  buildup=o("p1_2b", 2.38), warn14=o("p1_2b", 8.41), air19=o("p1_2b", 15.18), noreason=o("p1_2b", 24.34), undetected=o("p1_2b", 27.69), g6=o("p1_2c", 4.2),
  name=o("p1_3", 0.2), odds=o("p1_3", 7.38), facing=o("p1_3", 17.12),
  deep=o("p1_3b", 0.2), brk=o("p1_3b", 4.03), exploit=o("p1_3b", 6.47), pinc=o("p1_3b", 14.96), pincV=o("p1_3b", 17.2), pincB=o("p1_3b", 19.6), hold=o("p1_3b", 22.0),
  rail=o("p1_4", 5.79), cleared=o("p1_4", 11.98), enough=o("p1_4", 14.04), trains=o("p1_4", 15.64),
  probe=o("p1_5", 0.3), dawn=o("p1_5", 8.12), broken=o("p1_5", 12.5),
  vit=o("p1_6", 0.2), pz3=o("p1_6", 5.7), fronts=o("p1_6", 10.74), fast=o("p1_6a", 0.1), n43=o("p1_6a", 3.69), surr=o("p1_6", 13.71), d206=o("p1_6", 20.1),
  para=o("p1_6b", 0.1), rein=o("p1_6b", 6.56), late=o("p1_6", 26.64), goll=o("p1_6", 30.42), bo=o("p1_6", 37.24), lw4=o("p1_6", 40.58), gone=o("p1_6", 47.97), shat=o("p1_6c", 0.1), gap=o("p1_6c", 3.71),
  hwy=o("p1_7", 0.2), depth=o("p1_7", 4.99), s78=o("p1_7a", 0.1), eng=o("p1_7", 10.74), mines=o("p1_7b", 0.1), headway=o("p1_7b", 2.58), breach=o("p1_7b", 6.55), racing=o("p1_7b", 11.22), orsha=o("p1_7", 17.05), berez=o("p1_7", 19.82),
  a4=o("p1_8", 0.2), pz39=o("p1_8", 5.8), warnb=o("p1_8a", 0.1), mart=o("p1_8a", 5.69), proverb=o("p1_8a", 11.42), nofurther=o("p1_8a", 15.2),
  a49=o("p1_8", 12.26), task=o("p1_8", 16.82), tipp=o("p1_8", 25.29), refused=o("p1_8", 30.52), anyway=o("p1_8", 31.78), back=o("p1_8", 33.33), hitler=o("p1_8", 37.68), late2=o("p1_8", 42.0), cross=o("p1_8", 43.79),
  mfall=o("p1_8b", 0.1), garrison=o("p1_8b", 2.38), mkill=o("p1_8b", 6.83),
  roads=o("p1_9", 0.2), cut=o("p1_9", 4.53), reach=o("p1_9", 7.17), escape=o("p1_9", 12.99), trap=o("p1_9", 14.98), jaw=o("p1_9", 17.31), end9=end("p1_9"),
  v0=st("p1_0"), v1=st("p1_1"), v1b=st("p1_1b"), v2=st("p1_2"), v2b=st("p1_2b"), v3=st("p1_3"), v3b=st("p1_3b"), v4=st("p1_4"), v5=st("p1_5"), v6=st("p1_6"), v7=st("p1_7"), v8=st("p1_8"), v9=st("p1_9"),
  title=marks["title"][0], endcard=marks["end"][0])
E_ = ev
B = [("map", "open", 0.0), ("title", "title", E_["title"]), ("map", "bulge", E_["title"] + 5.7),
     ("still", "P1-04", E_["sectors"] - 0.5), ("map", "fortress", E_["v1b"] - 0.2), ("still", "P1-01", E_["v2"] - 0.5), ("map", "decept", E_["v2"] + 8.5),
     ("still", "P1-02", E_["night"] - 0.5), ("map", "plan", E_["bluff"]), ("still", "P1-01b", E_["v3b"] - 0.6), ("map", "plan2", E_["brk"] - 0.1),
     ("still", "P1-03", E_["v4"] - 0.5), ("map", "attack", E_["v4"] + 11.5), ("still", "P1-05", E_["dawn"] - 2.9), ("map", "attack2", E_["broken"] - 0.4), ("map", "vit", E_["v6"] - 0.8),
     ("still", "P1-06", E_["d206"] - 0.5), ("map", "vit2", E_["para"] - 0.3), ("still", "P1-07", E_["lw4"] - 0.3), ("map", "ors", E_["gone"] - 0.2),
     ("still", "P1-09", E_["racing"] - 0.3), ("map", "ors2", E_["orsha"] - 0.3), ("map", "mog", E_["v8"] - 0.4), ("still", "P1-10", E_["cross"] - 0.5),
     ("map", "trap", E_["mfall"] - 0.3), ("card", "end", E_["endcard"])]
segs = [{"t0": round(b[2], 2), "t1": round(B[i + 1][2] if i + 1 < len(B) else TOTAL, 2), "kind": b[0], "id": b[1]} for i, b in enumerate(B)]
segs = [s for s in segs if s["t1"] > s["t0"]]
dips = sorted([s["t0"] for a, s in zip(segs, segs[1:]) if not (a["kind"] == "map" and s["kind"] == "map")] + [round(ev["v7"] - 2.6, 2), round(ev["v8"] - 2.6, 2)])
# merge map->map (no dip)
json.dump({"total": TOTAL, "vo": vo, "segments": segs, "dips": dips, "ev": ev}, open("src/conquer/part1-timeline.json", "w"), indent=1)
print("TOTAL", TOTAL, "VO", round(sum(v["dur"] for v in vo), 1)); [print(s) for s in segs]
# ---- peta waktu v1 -> v2 (untuk konstanta waktu lama di Part1.tsx) ----
old = json.loads(subprocess.check_output(["git", "show", "eb57459:src/conquer/part1-timeline.json"]))
A = sorted({(old["ev"][k], ev[k]) for k in old["ev"] if k in ev} | {(0.0, 0.0), (13.9, ev["losses"]), (29.3, ev["title"]), (35.0, ev["title"] + 5.7),
    (75.3, ev["v1b"] - 0.2), (104.0, ev["v2"] - 0.5), (113.0, ev["v2"] + 8.5), (128.9, ev["night"] - 0.5), (144.6, ev["v2b"] - 0.4),
    (178.7, ev["v3"] - CH), (234.5, ev["v4"] - 0.5), (246.5, ev["v4"] + 11.5), (256.0, ev["v5"]), (275.0, ev["v6"]),
    (331.0, ev["v7"]), (359.3, ev["v8"] - 0.2), (410.7, ev["mfall"] - 0.3), (413.0, ev["v9"]), (435.6, ev["endcard"]), (446.0, TOTAL)})
mono = []
for a, b in A:
    if not mono or (a > mono[-1][0] and b >= mono[-1][1]): mono.append([a, b])
d = json.load(open("src/conquer/part1-timeline.json")); d["remap"] = mono
json.dump(d, open("src/conquer/part1-timeline.json", "w"), indent=1)
print("remap anchors", len(mono), "dropped", len(A) - len(mono))
