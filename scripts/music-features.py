"""Fitur kasar trek musik (tanpa librosa): durasi, dinamika RMS, centroid, kepadatan onset (perkusif?), mayor/minor (chroma Krumhansl), loudness LUFS-ish.
Pakai: python3 scripts/music-features.py file1.mp3 file2.mp3 ..."""
import sys, subprocess, numpy as np
from scipy.signal import stft
SR = 22050
MAJ = np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); MIN = np.array([6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
def load(p):
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def feats(p):
    y = load(p); dur = len(y)/SR
    f, t, Z = stft(y, SR, nperseg=2048, noverlap=1536); M = np.abs(Z)+1e-9
    rms = np.sqrt((y[:len(y)//2048*2048].reshape(-1,2048)**2).mean(1))+1e-9; db = 20*np.log10(rms)
    cen = (M*f[:,None]).sum(0)/M.sum(0)
    flux = np.maximum(0, np.diff(M,axis=1)).sum(0); flux = flux/ (flux.mean()+1e-9)
    onset = (flux > 2.2).sum()/dur  # puncak flux per detik ~ kepadatan serangan
    chroma = np.zeros(12)
    for k in range(1, len(f)):
        if 55 < f[k] < 2000:
            n = int(round(12*np.log2(f[k]/440)+69))%12; chroma[n] += (M[k]**2).sum()
    best = max(((np.corrcoef(np.roll(MAJ,s),chroma)[0,1],'maj',s) for s in range(12)) , key=lambda x:x[0]); bm = max(((np.corrcoef(np.roll(MIN,s),chroma)[0,1],'min',s) for s in range(12)), key=lambda x:x[0])
    mode = 'minor' if bm[0] > best[0] else 'major'
    # tren energi: bagian kuartil awal/akhir vs rata-rata (dinamika naik?)
    q = np.array_split(db, 4); qs = [round(float(x.mean()),1) for x in q]
    return dict(dur=round(dur), loud=round(float(db.mean()),1), dyn=round(float(db.std()),1), cen=int(np.median(cen)), onset=round(float(onset),2), mode=mode, q=qs)
for p in sys.argv[1:]:
    r = feats(p); print(f"{p:12s} {r['dur']:4d}s loud={r['loud']:6.1f} dyn={r['dyn']:4.1f} cen={r['cen']:5d}Hz onset/s={r['onset']:4.2f} {r['mode']:5s} q={r['q']}")
