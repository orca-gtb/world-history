"""Georeferensi peta referensi Bobruisk (24-27 Jun 1944) -> lon/lat, lalu tulis src/conquer/ops-bobruisk.json.
Affine (least squares, 10 kota bersumber Wikipedia) + koreksi residu IDW supaya kota kontrol tepat.
Garis/panah = jiplakan tangan dari peta referensi (perkiraan, bukan posisi terverifikasi)."""
import numpy as np, json

D = lambda d, m=0, s=0: d + m / 60 + s / 3600
TOWNS = {  # nama: lon, lat (Wikipedia), px di peta ref atau None
    "Bobruisk": (D(29, 14), D(53, 9), (362, 346)),
    "Rogachev": (D(30, 3), D(53, 6), (642, 374)),
    "Zhlobin": (D(30, 2), D(52, 54), None),
    "Parichi": (D(29, 25, 9), D(52, 48, 10), None),
    "Osipovichi": (D(28, 28, 32), D(53, 17, 36), (184, 279)),
    "Glusk": (D(28, 41, 32), D(52, 53, 22), (198, 490)),
    "Starye Dorogi": (D(28, 15, 54), D(53, 2, 22), None),
    "Kirovsk": (D(29, 28, 22.8), D(53, 16, 9.12), (454, 285)),
    "Bykhov": (D(30, 15), D(53, 31), (707, 147)),
    "Klichev": (D(29, 20), D(53, 29), (408, 169)),
    "Svetlogorsk": (D(29, 44), D(52, 38), (538, 628)),
    "Oktyabrsky": (D(28, 53), D(52, 38, 50), (258, 629)),
    "Kalinkovichi": (D(29, 20), D(52, 7.5), (409, 897)),
}
ctl = [(k, v) for k, v in TOWNS.items() if v[2]]
A = np.array([[v[0], v[1], 1] for _, v in ctl]); B = np.array([v[2] for _, v in ctl], float)
M = np.linalg.lstsq(A, B, rcond=None)[0]
R = A @ M - B  # residu px (prediksi - aktual)
Minv = np.linalg.inv(M[:2]); off = M[2]

def px2ll(x, y):
    p = np.array([x, y], float)
    d = np.hypot(*(B - p).T) + 1e-6; w = 1 / d ** 2
    p = p + (w[:, None] * R).sum(0) / w.sum()  # geser ke ruang affine
    lo, la = (p - off) @ Minv
    return [round(float(lo), 4), round(float(la), 4)]

F = {
    "start_24jun": [(940,15),(905,70),(860,130),(830,150),(760,160),(700,165),(660,220),(625,270),(610,320),(625,360),(640,380),(645,430),(645,480),(655,540),(620,560),(560,580),(500,605),(460,630),(420,690),(380,735),(320,750),(270,765),(245,800),(238,850)],
    "pocket_26jun": [(380,345),(420,320),(475,325),(512,362),(535,405),(547,475),(540,490),(505,500),(465,520),(445,530),(435,537),(415,535),(410,512),(405,480),(392,455),(382,420),(378,385)],
    "pocket_27jun": [(372,345),(395,333),(415,330),(427,326),(442,327),(450,335),(457,350),(467,367),(477,382),(482,395),(475,407),(452,417),(440,430),(430,437),(407,441),(390,437),(385,425),(380,405),(377,387),(372,370)],
    "arrow_3A": [(655,285),(585,255),(505,262),(462,282)],
    "arrow_48A": [(640,525),(565,505),(470,435)],
    "arrow_48A_b": [(610,385),(545,375),(470,372)],
    "arrow_65A": [(470,640),(400,560),(335,470),(330,380),(345,315),(440,292)],
    "arrow_28A": [(360,740),(325,620),(285,525),(250,495)],
    "arrow_KMG": [(300,700),(230,620),(205,495),(205,420),(170,372)],
}
LAB = {"DE 707 ID": (548,222), "DE 57 ID": (655,218), "DE 134 ID": (548,270), "DE 45 ID (part, N)": (592,378),
       "DE 296 ID": (600,423), "DE 6 ID": (632,545), "DE 45 ID (part, S)": (540,563), "DE 20 PzD": (395,382),
       "DE XXXV AK": (450,470), "DE LV AK": (180,650), "DE 35/129/102 ID remnants": (190,560),
       "SU 3 A": (680,272), "SU 48 A": (712,556), "SU 65 A": (545,683), "SU 28 A": (400,777)}
rms = float(np.sqrt((np.hypot(*R.T) ** 2).mean()))
out = {
    "note": "Hand trace of reference map 'Operation bagration bobruisk operation june 24-27 1944' (Wikipedia). Affine georef on 10 towns, rms %.1f px (~%.1f km) before IDW correction. Approximate." % (rms, rms / 4.85),
    "towns": {k: [round(v[0], 4), round(v[1], 4)] for k, v in TOWNS.items()},
    "features": {k: [px2ll(*p) for p in v] for k, v in F.items()},
    "labels_ref": {k: px2ll(*v) for k, v in LAB.items()},
}
json.dump(out, open("src/conquer/ops-bobruisk.json", "w"), indent=1)
print(out["note"]); print("Bobruisk check", px2ll(362, 346), out["towns"]["Bobruisk"])
