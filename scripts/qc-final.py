"""Quality check otomatis video long-form final. Pakai: python3 scripts/qc-final.py <video.mp4> [laporan.md]
Memeriksa: wadah/stream, loudness & true peak, jeda sunyi, frame hitam, frame beku, lint spec/timing, kecocokan kredit di paket upload.
Tidak menilai selera (audio/visual); itu tetap perlu mata dan telinga manusia."""
import sys, json, re, subprocess
v = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else None
T = json.load(open("src/longform/timing.json")); SP = json.load(open("longform/spec.json")); FPS = T["fps"]
L = []; bad = []
def say(s=""): L.append(s)
def run(args): return subprocess.run(args, capture_output=True, text=True)
def sec(f): return f / FPS
def mmss(x): return f"{int(x // 60)}:{int(x % 60):02d}"

# 1. wadah
pr = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels,duration", "-of", "json", v]).stdout)
vs = next(s for s in pr["streams"] if s["codec_type"] == "video"); au = next(s for s in pr["streams"] if s["codec_type"] == "audio")
dur = float(pr["format"]["duration"]); tot = T["total"] / FPS
say("## 1. Wadah"); say(f"- Video: {vs['codec_name']} {vs['width']}x{vs['height']} {vs['r_frame_rate']}; audio: {au['codec_name']} {au['sample_rate']} Hz {au['channels']} ch")
say(f"- Durasi file {dur:.2f} dtk; durasi dari timing.json {tot:.2f} dtk; selisih {abs(dur - tot):.2f} dtk")
if (vs["width"], vs["height"]) != (1920, 1080): bad.append("resolusi bukan 1920x1080")
if abs(dur - tot) > 0.2: bad.append("durasi tidak cocok timing.json")
if abs(float(au.get("duration", dur)) - float(vs.get("duration", dur))) > 0.3: bad.append("durasi audio ≠ video")

# 2. loudness
r = run(["ffmpeg", "-hide_banner", "-i", v, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
sm = r[r.rfind("Summary:"):]
I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", sm).group(1)); LRA = float(re.search(r"LRA:\s+([\d.]+) LU", sm).group(1)); PK = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", sm).group(1))
say("\n## 2. Loudness"); say(f"- Integrated {I} LUFS (target −16), LRA {LRA} LU, true peak {PK} dBFS (batas aman ≤ −1)")
if abs(I + 16) > 0.7: bad.append(f"loudness {I} LUFS menyimpang dari −16")
if PK > -0.5: bad.append(f"true peak {PK} dBFS terlalu tinggi")

# 3. jeda sunyi
r = run(["ffmpeg", "-hide_banner", "-i", v, "-af", "silencedetect=noise=-48dB:d=1.2", "-f", "null", "-"]).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]; du = [float(x) for x in re.findall(r"silence_duration: ([\d.]+)", r)]
say("\n## 3. Jeda sunyi (> 1,2 dtk di bawah −48 dB)")
if not st: say("- tidak ada")
for a, b in zip(st, du):
    tag = "akhir video (wajar)" if a > dur - 12 else "PERIKSA"
    say(f"- {mmss(a)} ({a:.1f}s), {b:.1f} dtk — {tag}")
    if tag == "PERIKSA": bad.append(f"jeda sunyi {b:.1f}s di {mmss(a)}")

# 4. frame hitam
r = run(["ffmpeg", "-hide_banner", "-i", v, "-vf", "blackdetect=d=0.4:pix_th=0.06", "-an", "-f", "null", "-"]).stderr
bl = re.findall(r"black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)", r)
say("\n## 4. Frame hitam (≥ 0,4 dtk)")
if not bl: say("- tidak ada")
for a, b, d in bl:
    a = float(a); note = "awal/akhir (wajar)" if a < 1.0 or a > dur - 2.0 else "PERIKSA"
    say(f"- {mmss(a)} ({a:.1f}s), {float(d):.1f} dtk — {note}")
    if note == "PERIKSA": bad.append(f"frame hitam {float(d):.1f}s di {mmss(a)}")

# 5. frame beku
r = run(["ffmpeg", "-hide_banner", "-i", v, "-vf", "freezedetect=n=-55dB:d=5", "-an", "-f", "null", "-"]).stderr
fs = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", r)]; fd = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", r)]
say("\n## 5. Gambar nyaris diam ≥ 5 dtk (hipotesis retensi, bukan error)")
if not fs: say("- tidak ada")
for a, b in zip(fs, fd): say(f"- {mmss(a)} ({a:.1f}s), {b:.1f} dtk")

# 6. lint spec/timing
say("\n## 6. Lint spec & timing")
for i, (c, sp) in enumerate(zip(T["chapters"], SP)):
    d = c["dur"]; sh = sp["shots"]; n = len(sp["cards"])
    ts = [x["t"] for x in sh]
    if ts != sorted(ts): bad.append(f"{c['id']}: shot tidak berurutan")
    if any(x["card"] >= n for x in sh): bad.append(f"{c['id']}: shot menunjuk kartu tidak ada")
    used = {x["card"] for x in sh}
    if used != set(range(n)): bad.append(f"{c['id']}: kartu {sorted(set(range(n)) - used)} tidak pernah ditampilkan")
    for k, card in enumerate(sp["cards"]):
        for ln in card.get("lines", []) + card.get("foot", []):
            if ln["at"] > d + 0.5: bad.append(f"{c['id']}: teks '{ln['t'][:28]}' muncul setelah narasi selesai ({ln['at']} > {d})")
    import math
    if c["frames"] != 9 + math.ceil(d * FPS) + 18: bad.append(f"{c['id']}: frames tidak cocok durasi VO")
say(f"- {len(T['chapters'])} bab, {sum(len(s['shots']) for s in SP)} shot, {sum(len(s['cards']) for s in SP)} kartu diperiksa")
sc = [c for s in SP for c in s["cards"] if c["k"] == "scene"]
import os
miss = [c["id"] for c in sc if not os.path.exists(f"public/scenes/{c['id']}.mp4")]
say(f"- Adegan 3D: {len(sc)} kartu, klip hilang: {miss or 'tidak ada'}")
if miss: bad.append(f"klip adegan hilang: {miss}")
if any(c["k"] == "sil" for s in SP for c in s["cards"]): say("- Masih ada kartu siluet datar (catatan gaya)")

# 7. kredit
say("\n## 7. Kredit di paket upload vs yang dipakai")
pk = open("longform/upload-package.md").read()
need = {"Bf 109 G-6": "Galuppo", "Junkers Ju 87 Stuka": "scorpion81", "P-51-B SP": "APlainPlane", "Yak1": "manilov.ap", "Fallen (Asper)": "Mininni", "Echoes": "Andrew Ev", "We Will Get It": "Mininni", "Epical Drums 04": "Nuzhny", "Unforgiven": "Ramir", "Ich hatt' einen Kameraden": "Silcher"}
for k, a in need.items():
    ok = k in pk and a in pk; say(f"- {'OK ' if ok else 'HILANG'} {k} / {a}")
    if not ok: bad.append(f"kredit hilang di upload-package: {k}")
say("\n## Ringkasan")
say("LULUS otomatis" if not bad else "PERLU TINDAKAN:\n" + "\n".join(f"- {b}" for b in bad))
txt = "\n".join(L)
print(txt)
if out: open(out, "w").write(f"# QC otomatis — {v}\n\n" + txt + "\n")
sys.exit(1 if bad else 0)
