# Pakai: python3 scripts/sheet.py <dir> <out.jpg> [kolom]  -> lembar kontak semua s*.jpg
import sys, glob
from PIL import Image
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
n = sorted(glob.glob(f"{d}/s*.jpg")); w, h = 800, 450
S = Image.new("RGB", (cols * w, ((len(n) + cols - 1) // cols) * h))
for i, x in enumerate(n): S.paste(Image.open(x).resize((w, h)), ((i % cols) * w, (i // cols) * h))
S.save(out, quality=82)
