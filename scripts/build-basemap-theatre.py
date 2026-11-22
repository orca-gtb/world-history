"""Natural Earth 10m (domain publik) -> src/conquer/basemap-theatre.json: sungai + rel kereta untuk Bagration Part 1."""
import json
BB = (22.0, 49.0, 35.0, 57.5)
RB = (26.3, 52.0, 32.5, 56.4)   # rel hanya di wilayah Belarus
def inb(p, b, m=0.2): return b[0]-m <= p[0] <= b[2]+m and b[1]-m <= p[1] <= b[3]+m
def lines(g): return [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"] if g["type"] == "MultiLineString" else []
def clip(files, b, keep=None, step=1):
    out = []
    for f in files:
        for ft in json.load(open(f"assets-src/ne/{f}.geojson"))["features"]:
            nm = ft["properties"].get("name") or ""
            if keep and not keep(ft["properties"]): continue
            for l in lines(ft["geometry"]):
                seg = []
                for p in l[::step] + [l[-1]]:
                    if inb(p, b): seg.append([round(p[0], 3), round(p[1], 3)])
                    elif seg: out.append({"name": nm, "pts": seg}); seg = []
                if len(seg) > 1: out.append({"name": nm, "pts": seg})
    return [o for o in out if len(o["pts"]) > 1]
rv = clip(["ne_10m_rivers_europe", "ne_10m_rivers_lake_centerlines"], BB)
rl = clip(["ne_10m_railroads"], RB, step=4)
# Rail War = di belakang garis Jerman: simpan hanya titik di sisi barat garis depan 22 Juni
F = json.load(open("research/bagration/front-22jun.json"))["front_22jun"]
POLY = F + [[20, 48.3], [20, 57.8], [28.55, 57.8]]
def inside(p, poly=POLY):
    x, y = p; c = False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
r2 = []
for o in rl:
    seg = []
    for q in o["pts"]:
        if inside(q): seg.append(q)
        elif len(seg) > 1: r2.append({"name": o["name"], "pts": seg}); seg = []
        else: seg = []
    if len(seg) > 1: r2.append({"name": o["name"], "pts": seg})
rl = r2
json.dump({"source": "Natural Earth 10m rivers + railroads (public domain)", "rivers": rv, "rail": rl}, open("src/conquer/basemap-theatre.json", "w"))
print(len(rv), sorted({o["name"] for o in rv}), len(rl), sum(len(o["pts"]) for o in rl))
