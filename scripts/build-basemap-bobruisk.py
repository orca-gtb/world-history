"""Natural Earth 10m (domain publik) -> src/conquer/basemap-bobruisk.json: sungai di kotak Bobruisk."""
import json
BB = (27.6, 52.3, 31.3, 53.9)
def inb(p, m=0.3): return BB[0]-m <= p[0] <= BB[2]+m and BB[1]-m <= p[1] <= BB[3]+m
def lines(g):
    return [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"] if g["type"] == "MultiLineString" else []
out = []
for f, key in [("ne_10m_rivers_europe", None), ("ne_10m_rivers_lake_centerlines", None)]:
    gj = json.load(open(f"assets-src/ne/{f}.geojson"))
    for ft in gj["features"]:
        nm = ft["properties"].get("name") or ""
        for l in lines(ft["geometry"]):
            seg = []
            for p in l:
                if inb(p): seg.append([round(p[0], 4), round(p[1], 4)])
                elif seg: out.append({"name": nm, "pts": seg}); seg = []
            if len(seg) > 1: out.append({"name": nm, "pts": seg})
out = [o for o in out if len(o["pts"]) > 1]
json.dump({"source": "Natural Earth 10m rivers (public domain)", "bbox": BB, "rivers": out}, open("src/conquer/basemap-bobruisk.json", "w"))
print(len(out), sorted({o["name"] for o in out}))
