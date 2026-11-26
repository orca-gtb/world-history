"""Pemrosesan radio WWII: tiap sampel suara -> radio_processed.wav (+mp3) dan radio_with_static.wav (+mp3).
Tiga karakter transmisi berbeda (tetap satu identitas audio dokumenter), suara tetap terbaca (bandpass lebar, distorsi ringan).
Pakai: python3 scripts/ww2-radio.py"""
import glob, os, subprocess, json
R = "assets/ww2/radio"; S = R + "/sfx/"
CH = {  # nation: (highpass, lowpass, softclip, hiss dB, crackle dB, karakter)
    "us": (300, 3400, 0.75, -36, -40, "FM SCR-300: jernih, tipis, desis rendah"),
    "germany": (350, 3000, 0.58, -31, -36, "AM Torn.Fu: lebih sempit, desis sedang, gigi gergaji halus"),
    "soviet": (400, 2800, 0.46, -28, -32, "AM 13-R: paling sempit, distorsi dan retak lebih banyak"),
}
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
def run(cmd): subprocess.run(["ffmpeg", "-v", "error", "-y"] + cmd, check=True)
out = []
for nation, (hp, lp, sc, hiss, crk, desc) in CH.items():
    for f in sorted(glob.glob(f"{R}/voices/{nation}/*.wav")):
        sid = os.path.basename(f)[:-4]; d = f"{R}/processed/{nation}/{sid}"; os.makedirs(d, exist_ok=True)
        chain = f"highpass=f={hp},lowpass=f={lp},acompressor=threshold=0.09:ratio=5:attack=5:release=70:makeup=3,asoftclip=type=tanh:threshold={sc},alimiter=limit=0.9"
        fc = (f"[0]{chain}[v];[1]atrim=0:0.45,afade=t=out:st=0.3:d=0.15,highpass=f=500,lowpass=f={lp+300},volume=-4dB[a];"
              f"[2]atrim=0:1.0,afade=t=out:st=0.4:d=0.6,highpass=f=500,lowpass=f={lp+300},volume=-5dB[b];[a][v][b]concat=n=3:v=0:a=1,loudnorm=I=-20:TP=-2:LRA=7[o]")
        p = f"{d}/radio_processed.wav"
        run(["-i", f, "-i", S + "transmission_start.wav", "-i", S + "transmission_end.wav", "-filter_complex", fc, "-map", "[o]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", p])
        D = dur(p); q = f"{d}/radio_with_static.wav"
        bed = (f"[1]highpass=f=300,lowpass=f={lp},volume={hiss}dB[h];[2]agate=threshold=0.55:ratio=9000:attack=1:release=8,highpass=f=1200,lowpass=f={lp},volume={crk}dB[c];[0][h][c]amix=inputs=3:normalize=0:duration=first[o]")
        run(["-i", p, "-f", "lavfi", "-i", f"anoisesrc=d={D:.2f}:c=pink:a=0.5:r=48000", "-f", "lavfi", "-i", f"anoisesrc=d={D:.2f}:c=white:a=0.9:r=48000", "-filter_complex", bed, "-map", "[o]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", q])
        for w in (p, q): run(["-i", w, "-b:a", "192k", w[:-4] + ".mp3"])
        out.append({"id": sid, "nation": nation, "character": desc, "clean": f, "processed": p, "with_static": q, "duration_clean": round(dur(f), 2), "duration_radio": round(D, 2)})
        print(sid, round(dur(f), 2), "->", round(D, 2))
json.dump(out, open(R + "/processing_report.json", "w"), indent=1, ensure_ascii=False)
