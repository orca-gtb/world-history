"""Hapus Balkenkreuz + tanda swastika dari tekstur GLB (CC-BY: hasil modifikasi harus dicatat 'changes made').
Menimpa kotak dengan median warna tepi + derau, lalu tulis ulang GLB ke public/models/<nama>.glb. Pakai: python3 scripts/clean-glb-insignia.py"""
import json, struct, io
import numpy as np
from PIL import Image
rng = np.random.default_rng(5)
BOXES = {  # nama: {indeks gambar: [(x0,y0,x1,y1), ...]}
    "bf109g6": {0: [(180, 178, 254, 252), (642, 178, 716, 252), (196, 368, 284, 456), (612, 368, 700, 456), (518, 710, 584, 774), (518, 864, 584, 928), (652, 772, 704, 822), (652, 926, 704, 976)]},
    "ju87": {3: [(345, 135, 475, 255), (22, 645, 158, 770)], 0: [(515, 845, 650, 915), (915, 880, 1024, 960), (20, 355, 95, 425)], 4: [(345, 135, 475, 255), (22, 645, 158, 770)]},
}
def fix(img, boxes):
    a = np.array(img.convert("RGB")).astype(np.float32); H, W, _ = a.shape
    for x0, y0, x1, y1 in boxes:
        x1, y1 = min(x1, W), min(y1, H)
        ring = np.concatenate([a[max(y0-10,0):y0, x0:x1].reshape(-1,3), a[y1:min(y1+10,H), x0:x1].reshape(-1,3), a[y0:y1, max(x0-10,0):x0].reshape(-1,3), a[y0:y1, x1:min(x1+10,W)].reshape(-1,3)])
        a[y0:y1, x0:x1] = np.median(ring, axis=0) + rng.normal(0, 2.5, (y1-y0, x1-x0, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
for name, per in BOXES.items():
    d = open(f"assets-src/glb/{name}.glb", "rb").read()
    jl = struct.unpack("<I", d[12:16])[0]; j = json.loads(d[20:20+jl]); off = 20 + jl + 8
    bl = struct.unpack("<I", d[20+jl:24+jl])[0]; binc = d[off:off+bl]
    views = j["bufferViews"]; newbin = bytearray(); newviews = {}
    imgviews = {im["bufferView"]: i for i, im in enumerate(j["images"]) if "bufferView" in im}
    for vi, v in enumerate(views):
        raw = binc[v.get("byteOffset", 0): v.get("byteOffset", 0) + v["byteLength"]]
        if vi in imgviews and imgviews[vi] in per:
            img = fix(Image.open(io.BytesIO(raw)), per[imgviews[vi]]); b = io.BytesIO(); img.save(b, "PNG"); raw = b.getvalue()
            j["images"][imgviews[vi]]["mimeType"] = "image/png"
        while len(newbin) % 4: newbin.append(0)
        newviews[vi] = (len(newbin), len(raw)); newbin += raw
    for vi, (o, l) in newviews.items(): views[vi]["byteOffset"] = o; views[vi]["byteLength"] = l
    while len(newbin) % 4: newbin.append(0)
    j["buffers"][0]["byteLength"] = len(newbin)
    js = json.dumps(j, separators=(",", ":")).encode()
    while len(js) % 4: js += b" "
    out = b"glTF" + struct.pack("<II", 2, 12 + 8 + len(js) + 8 + len(newbin)) + struct.pack("<I", len(js)) + b"JSON" + js + struct.pack("<I", len(newbin)) + b"BIN\0" + bytes(newbin)
    open(f"public/models/{name}.glb", "wb").write(out); print("ok", name, len(out))
