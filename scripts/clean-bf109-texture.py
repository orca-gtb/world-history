"""UJI PRIBADI: hapus Balkenkreuz & swastika dari albedo model Bf 109 (GRIP420, CC-BY-NC) dengan menimpa daerahnya
memakai warna tepi sekitar + derau. Hasil: public/models/bf109-albedo-clean.jpg (tidak di-commit)."""
from PIL import Image, ImageFilter
import numpy as np
im = Image.open("assets-src/glb/tex0.jpg").convert("RGB"); a = np.array(im).astype(np.float32)
H, W, _ = a.shape; rng = np.random.default_rng(3)
# (cx, cy, half) dalam piksel 2048: salib sayap/badan + swastika sirip
BOX = [(982, 1030, 118), (982, 1216, 118), (432, 1530, 118), (1322, 1530, 118), (416, 1888, 118), (1344, 1888, 118), (1478, 352, 46), (1478, 1178, 46)]
mask = np.zeros((H, W), np.float32)
for cx, cy, h in BOX:
    y0, y1, x0, x1 = max(cy - h, 0), min(cy + h, H), max(cx - h, 0), min(cx + h, W)
    ring = np.concatenate([a[max(y0 - 14, 0):y0, x0:x1].reshape(-1, 3), a[y1:min(y1 + 14, H), x0:x1].reshape(-1, 3), a[y0:y1, max(x0 - 14, 0):x0].reshape(-1, 3), a[y0:y1, x1:min(x1 + 14, W)].reshape(-1, 3)])
    med = np.median(ring, axis=0)
    fill = med + rng.normal(0, 4.5, (y1 - y0, x1 - x0, 1))
    a[y0:y1, x0:x1] = fill; mask[y0:y1, x0:x1] = 1
out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
out.save("public/models/bf109-albedo-clean.jpg", quality=92); print("ok")
