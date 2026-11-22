"""Garis depan 22 Jun 1944 (lon/lat, perkiraan) dicek di atas peta Soviet (affine dari kota)."""
import json, numpy as np
from PIL import Image, ImageDraw
# piksel di gambar asli ref-soviet-belorussian-op.jpg (crop 2x mulai x=800 -> asli = (px+800)/2, py/2)
T = {"Polotsk":((497,445),(28.80,55.49)),"Vitebsk":((700,500),(30.20,55.19)),"Orsha":((720,660),(30.42,54.51)),
     "Mogilev":((720,805),(30.33,53.90)),"Minsk":((340,808),(27.56,53.90)),"Borisov":((462,738),(28.50,54.23)),
     "Smolensk":((960,605),(32.05,54.78)),"Nevel":((655,310),(29.92,56.02)),"VLuki":((800,255),(30.53,56.34))}
src=np.array([[(p[0]+800)/2,p[1]/2,1] for p,_ in T.values()]); dst=np.array([g for _,g in T.values()])
A,res,_,_=np.linalg.lstsq(src,dst,rcond=None)      # px -> lonlat
B,_,_,_=np.linalg.lstsq(np.c_[dst,np.ones(len(dst))],src[:,:2],rcond=None)  # lonlat -> px
err=np.abs(src@A-dst).max(0); print("max err deg",err)
north=[[28.55,56.30],[28.75,56.0],[29.05,55.80],[29.45,55.66],[29.80,55.52],[30.05,55.42],[30.30,55.40],[30.45,55.30],[30.52,55.12],[30.68,54.95],[30.88,54.72],[30.98,54.45],[31.02,54.15],[31.05,53.92]]
ops=json.load(open("src/conquer/ops-bobruisk.json"))
south=ops["features"]["start_24jun"]
west=[[28.3,52.15],[27.3,51.95],[26.2,51.9],[25.2,51.85],[24.3,51.75],[24.9,50.6],[25.4,49.6],[25.1,48.3]]
front=north+south+west
json.dump({"note":"Garis depan 22 Jun 1944, perkiraan dari peta Soviet 'Белорусская операция' + peta West Point; selatan = start_24jun pilot","front_22jun":front},open("research/bagration/front-22jun.json","w"),indent=0)
im=Image.open("research/bobruisk/maps/ref-soviet-belorussian-op.jpg").convert("RGB"); d=ImageDraw.Draw(im)
px=[tuple(np.r_[p,1]@B) for p in front]; d.line(px,fill=(0,200,0),width=3)
for n,(p,g) in T.items(): q=tuple(np.r_[g,1]@B); d.ellipse([q[0]-4,q[1]-4,q[0]+4,q[1]+4],outline=(0,0,0),width=2)
im.crop((150,0,1077,600)).resize((1390,900)).save("/tmp/claude-0/-home-user/267031a5-7110-5417-9be4-16a0631cff09/scratchpad/front_chk.jpg",quality=85)
