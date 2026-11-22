"""Timeline Bagration Part 1 -> src/conquer/part1-timeline.json (dipakai Part1.tsx dan mix_part1.py).
Waktu event = mulai VO bab + jeda kalimat (silencedetect)."""
import json, subprocess
V = {"p1_0": 1.5, "p1_1": 35.5, "p1_1b": 75.5, "p1_2": 104.5, "p1_2b": 145.0, "p1_3": 181.0, "p1_3b": 206.5,
     "p1_4": 235.0, "p1_5": 256.0, "p1_6": 275.0, "p1_7": 331.0, "p1_8": 359.5, "p1_9": 413.0}
def dur(k): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"vo-bagration-p1/{k}.mp3"]))
vo = {k: {"start": s, "dur": round(dur(k), 2)} for k, s in V.items()}
SEG = [(0, 13.9, "still", "P1-05"), (13.9, 29.3, "map", "open"), (29.3, 35.0, "title", "title"), (35.0, 67.2, "map", "bulge"),
       (67.2, 75.3, "still", "P1-04"), (75.3, 104.0, "map", "fortress"), (104.0, 113.0, "still", "P1-01"), (113.0, 128.9, "map", "decept"),
       (128.9, 134.0, "still", "P1-02"), (134.0, 234.5, "map", "plan"), (234.5, 246.5, "still", "P1-03"), (246.5, 294.6, "map", "attack"),
       (294.6, 301.4, "still", "P1-06"), (301.4, 315.3, "map", "vitebsk"), (315.3, 322.8, "still", "P1-07"), (322.8, 341.5, "map", "orsha"),
       (341.5, 347.6, "still", "P1-08"), (347.6, 355.0, "map", "orsha2"), (355.0, 359.3, "still", "P1-09"), (359.3, 403.0, "map", "mogilev"),
       (403.0, 410.7, "still", "P1-10"), (410.7, 435.6, "map", "trap"), (435.6, 446.0, "card", "end")]
segs = [{"t0": a, "t1": b, "kind": k, "id": i} for a, b, k, i in SEG]
dips = [s["t0"] for s in segs[1:]]
o = lambda k, x: round(V[k] + x, 2)
ev = dict(
  losses=o("p1_0", 12.4), trap_set=o("p1_0", 25.2),
  south=o("p1_1", 4.65), north=o("p1_1", 9.46), between=o("p1_1", 12.9), strong=o("p1_1", 20.76), notstrong=o("p1_1", 22.7), moved=o("p1_1", 23.9), sectors=o("p1_1", 32.2),
  forts=o("p1_1b", 4.17), held=o("p1_1b", 11.9), jordan=o("p1_1b", 15.74), jquote=o("p1_1b", 20.08),
  reserves=o("p1_2", 7.85), mask=o("p1_2", 13.06), tankarmies=o("p1_2", 20.3), night=o("p1_2", 24.9), bluff=o("p1_2", 29.47), centre=o("p1_2", 31.5), rush=o("p1_2", 33.6), south2=o("p1_2", 36.0),
  buildup=o("p1_2b", 2.38), warn14=o("p1_2b", 8.41), air19=o("p1_2b", 15.18), noreason=o("p1_2b", 24.34), undetected=o("p1_2b", 27.69),
  name=o("p1_3", 0.2), odds=o("p1_3", 7.38), facing=o("p1_3", 17.12),
  deep=o("p1_3b", 0.2), brk=o("p1_3b", 4.03), exploit=o("p1_3b", 6.47), pinc=o("p1_3b", 14.96), pincV=o("p1_3b", 17.2), pincB=o("p1_3b", 19.6), hold=o("p1_3b", 22.0),
  rail=o("p1_4", 5.79), cleared=o("p1_4", 11.98), enough=o("p1_4", 14.04), trains=o("p1_4", 15.64),
  probe=o("p1_5", 0.3), dawn=o("p1_5", 8.12), broken=o("p1_5", 12.5),
  vit=o("p1_6", 0.2), pz3=o("p1_6", 5.7), fronts=o("p1_6", 10.74), surr=o("p1_6", 13.71), d206=o("p1_6", 20.1), late=o("p1_6", 26.64), goll=o("p1_6", 30.42), bo=o("p1_6", 37.24), lw4=o("p1_6", 40.58), gone=o("p1_6", 47.97),
  hwy=o("p1_7", 0.2), depth=o("p1_7", 4.99), eng=o("p1_7", 10.74), orsha=o("p1_7", 17.05), berez=o("p1_7", 19.82),
  a4=o("p1_8", 0.2), pz39=o("p1_8", 5.8), a49=o("p1_8", 12.26), task=o("p1_8", 16.82), tipp=o("p1_8", 25.29), refused=o("p1_8", 30.52), anyway=o("p1_8", 31.78), back=o("p1_8", 33.33), hitler=o("p1_8", 37.68), late2=o("p1_8", 42.0), cross=o("p1_8", 43.79),
  roads=o("p1_9", 0.2), cut=o("p1_9", 4.53), reach=o("p1_9", 7.17), escape=o("p1_9", 12.99), trap=o("p1_9", 14.98), jaw=o("p1_9", 17.31))
json.dump({"total": 446.0, "vo": vo, "segments": segs, "dips": dips, "ev": ev}, open("src/conquer/part1-timeline.json", "w"), indent=1)
print("ok", sum(v["dur"] for v in vo.values()))
