"""Awan kartun bertekstur (cel 3 nada + tekstur kuas + garis tepi tipis), hasil: public/clouds/c<i>.png. Buatan sendiri (prosedural)."""
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_erosion, zoom
rng = np.random.default_rng(11)
def noise(h, w, s):
    n = rng.random((h // s + 2, w // s + 2)); return zoom(n, s, order=3)[:h, :w]
def cloud(W, H, seed, flat):
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    field = np.zeros((H, W), np.float32); light = np.zeros((H, W), np.float32)
    base = H * 0.78
    n = r.integers(7, 12)
    for i in range(n):
        u = (i + 0.5) / n
        cx = W * (0.1 + 0.8 * u) + r.normal(0, W * 0.03)
        rad = H * (0.16 + 0.26 * np.sin(np.pi * u) ** 1.2) * r.uniform(0.75, 1.15) * (0.75 if flat else 1)
        cy = base - rad * r.uniform(0.45, 0.85)
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / rad
        f = np.clip(1 - d, 0, 1); field = np.maximum(field, f)
        # cahaya dari kiri atas per gumpalan
        nx, ny = (xx - cx) / rad, (yy - cy) / rad
        lit = np.clip(-0.55 * nx - 0.8 * ny + 0.35, 0, 1) * (d < 1)
        light = np.where(f >= field - 1e-6, lit, light)
        for k in range(r.integers(2, 4)):  # gumpalan kecil di atas (kembang kol)
            a = r.uniform(-2.4, -0.7); rr = rad * r.uniform(0.35, 0.55)
            cx2, cy2 = cx + np.cos(a) * rad * 0.75, cy + np.sin(a) * rad * 0.75
            d2 = np.sqrt((xx - cx2) ** 2 + (yy - cy2) ** 2) / rr; f2 = np.clip(1 - d2, 0, 1) * 0.9
            nx2, ny2 = (xx - cx2) / rr, (yy - cy2) / rr
            lit2 = np.clip(-0.55 * nx2 - 0.8 * ny2 + 0.35, 0, 1) * (d2 < 1)
            light = np.where(f2 > field, lit2, light); field = np.maximum(field, f2)
    field = np.where(yy > base, field * np.clip(1 - (yy - base) / (H * 0.05), 0, 1), field)
    field = gaussian_filter(field + (noise(H, W, 18) - 0.5) * 0.05 * (field > 0), 1.5)
    mask = field > 0.035
    tone = gaussian_filter(light, 5) + (noise(H, W, 14) - 0.5) * 0.07
    tone = tone - np.clip((yy - (base - H * 0.12)) / (H * 0.25), 0, 1) * 0.5  # bawah lebih gelap
    q = np.digitize(tone, [0.18, 0.5])  # 3 nada
    pal = np.array([[178, 196, 214], [222, 233, 243], [252, 253, 255]], np.float32)
    rgb = pal[q]
    rgb = gaussian_filter(rgb, (1.2, 1.2, 0))
    brush = (noise(H, W, 3) - 0.5) * 10 + (noise(H, W, 40) - 0.5) * 8
    rgb = np.clip(rgb + brush[..., None], 0, 255)
    soft = gaussian_filter(mask.astype(np.float32), 1.2)
    edge = mask & ~binary_erosion(mask, iterations=3)
    rgb[edge] = rgb[edge] * 0.55 + np.array([140, 162, 184]) * 0.45
    a = np.clip(soft * 255, 0, 255)
    return Image.fromarray(np.dstack([rgb, a]).astype(np.uint8), "RGBA")
for i in range(6):
    im = cloud(1200, 520, 100 + i, flat=i >= 4); im = im.crop(im.getbbox()); im.save(f"public/clouds/c{i}.png"); print(i, im.size)
