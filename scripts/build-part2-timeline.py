"""Timeline Bagration Part 2 -> src/conquer/part2-timeline.json.
Peta pilot (src/conquer/Pilot.tsx) dijalankan di 'waktu pilot' tau; anchors memetakan waktu baru tn -> tau (jeda = tahan posisi peta).
Pembuka = flash-forward kantong 27 Juni (tau 98-112), lalu kartu judul, lalu pilot dari awal."""
import json, subprocess, re
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
def sil(f):
    r=subprocess.run(["ffmpeg","-hide_banner","-i",f,"-af","silencedetect=n=-38dB:d=0.28","-f","null","-"],capture_output=True,text=True).stderr
    return [float(x) for x in re.findall(r"silence_end: ([0-9.]+)",r)]
P="vo-bagration-p2/"; O="vo-bobruisk/"
PS={"a1":2.0,"a2":32.5,"a3":58.0,"a4":79.0,"a5":99.0,"a6":122.5,"a7":146.0,"a8":164.5}
vo=[]; an=[]; ST={}; cur=0.0; INS={}
def ins(sec,id_):  # sisipan animasi tanpa VO: peta ditahan, adegan diorama
    global cur
    INS[id_]=(round(cur,3),round(cur+sec,3)); ST["ins_"+id_]=cur; cur+=sec; an.append([round(cur,3),an[-1][1]])
def mark(tau): an.append([round(cur,3),round(tau,3)])
def clip(name,key=None,to=None):
    global cur
    d=dur(P+name+".mp3"); d=d if to is None else to; ST[key or name]=cur; vo.append({"file":P+name,"start":round(cur,3),"ss":0.0,"to":round(d,3),"dur":round(d,3)}); s=sil(P+name+".mp3")
    ST[(key or name)+"_sil"]=[round(cur+x,2) for x in s]; cur+=d; return d
def pil(name,o0=0.0,o1=None,key=None):
    global cur
    f=O+name+".mp3"; d=dur(f); o1=d if o1 is None else o1; L=o1-o0; k=key or name
    ST[k]=cur; vo.append({"file":f,"start":round(cur,3),"ss":o0,"to":round(o1,3),"dur":round(L,3)}); cur+=L; return L
# ---- pembuka: gelap 2,4 dtk, hook flash-forward ----
mark(98.0); cur=2.4; mark(98.0)
d=clip("p2_0","hook"); mark(112.0)
cur+=0.4; mark(112.0)
T_title=cur; cur+=5.7; mark(112.0); mark(4.4)
cur+=0.5; mark(4.4)
# ---- a1 (peta teater) ----
ST["a1"]=cur; mark(4.4); a1=dur(O+"a1.mp3"); an.append([round(cur+10.35,3),12.35]); vo.append({"file":O+"a1","start":round(cur,3),"ss":0.0,"to":round(a1,3),"dur":round(a1,3)}); cur+=a1; mark(30.45)
cur+=0.5; mark(30.45)
ST["oob"]=cur; cur+=17.0; mark(30.45)
ins(16.0,"trench")
cur+=2.05; mark(32.5)
mark(32.5); pil("a2",0,9.85,"a2A"); mark(42.35)
cur+=0.4; mark(42.35)
clip("p2_1"); mark(42.35)
cur+=0.3; mark(42.35)
pil("a2",10.16,17.69,"a2B"); mark(44.4)
cur+=0.5; mark(44.4)
clip("p2_2"); mark(57.0)
ins(12.0,"barrage")
cur+=1.0; mark(58.0)
pil("a3"); mark(76.364)
cur+=0.5; B1=cur; mark(76.364); mark(69.35)
cur+=0.5; mark(69.35)
clip("p2_3"); mark(69.35)
ins(10.0,"armorB")
cur+=0.6; B2=cur; mark(69.35); mark(77.9)
cur+=1.1; mark(79.0)
pil("a4",0,5.30,"a4A"); mark(84.3)
cur+=0.3; mark(84.4)
clip("p2_4"); mark(90.86)
cur+=0.3; mark(90.86)
pil("a4",11.86,None,"a4B"); mark(97.29)
ins(12.0,"marshB")
cur+=1.71; mark(99.0)
pil("a5"); mark(120.55)
cur+=0.8; B3=cur; mark(120.55); mark(112.5)
cur+=0.5; mark(112.5)
clip("p2_6"); mark(112.5)
ins(11.0,"pocketB")
cur+=0.3; B4=cur; mark(112.5); mark(121.75)
cur+=0.75; mark(122.5)
pil("a6",0,9.78,"a6A"); mark(132.28)
cur+=0.5; mark(132.28)
clip("p2_7"); mark(132.28)
cur+=0.25; B5=cur; mark(132.28); mark(132.7)
cur+=0.2; mark(132.74)
pil("a6",10.24,None,"a6B"); mark(143.27)
ins(24.0,"citadel")
cur+=2.73; mark(146.0)
pil("a7"); mark(161.726)
ins(13.0,"ruins")
cur+=2.774; mark(164.5)
pil("a8",0,9.29,"a8A"); mark(173.79)
cur+=0.4; mark(173.79)
clip("p2_8"); mark(173.79)
cur+=0.3; B6=cur; mark(173.79); mark(174.2)
cur+=0.05; mark(174.24)
pil("a8",9.74,29.30,"a8B"); mark(193.8)
ins(14.0,"aftermathB")
cur+=0.6; BR=cur; mark(193.8); mark(37.6)
ST["recap"]=cur; cur+=34.0; mark(160.0)
cur+=0.6; BC=cur; mark(160.0); mark(194.5)
cur+=3.4; B7=cur; mark(197.9); mark(190.6)
cur+=0.5; mark(190.6)
clip("p2_9",to=8.15); mark(190.6)
cur+=0.7; B8=cur; mark(190.6)
cur+=21.0; TOTAL=round(cur,2); mark(190.6)
def inv(tau,after):
    for (t0,u0),(t1,u1) in zip(an,an[1:]):
        if t0<after-1e-6: continue
        if t1>t0 and u1>u0 and u0-1e-6<=tau<=u1+1e-6: return round(t0+(tau-u0)*(t1-t0)/(u1-u0),3)
    raise ValueError(tau)
S=[]
def sc(t0,t1,kind,id_): S.append({"t0":round(t0,2),"t1":round(t1,2),"kind":kind,"id":id_})
a1s=ST["a1"]
sc(0,T_title,"map","hook"); sc(T_title,T_title+5.7,"title2","")
I=INS
sc(T_title+5.7,inv(31.25,T_title),"map","I"); sc(inv(31.25,T_title),inv(37.6,T_title),"dio","barrageA")
sc(inv(37.6,T_title),inv(57.05,T_title),"map","II"); sc(I["barrage"][1],inv(60.4,I["barrage"][1]),"dio","assault")
sc(inv(60.4,I["barrage"][1]),inv(69.4,I["barrage"][1]),"map","III"); sc(inv(69.4,I["barrage"][1]),B1,"dio","armorA")
sc(B1,B2,"map","north"); sc(B2,inv(84.4,B2),"dio","marshA")
sc(inv(84.4,B2),inv(112.7,B2),"map","IV-V"); sc(inv(112.7,B2),B3,"dio","pocketA")
sc(B3,B4,"map","pocket"); sc(B4,B5,"map","VI")
sc(B5,I["citadel"][0],"dio","breakout"); sc(I["citadel"][1],inv(154.4,I["citadel"][1]),"dio","city")
sc(inv(154.4,I["citadel"][1]),inv(158.4,I["citadel"][1]),"dio","cityB"); sc(inv(158.4,I["citadel"][1]),B6,"map","VII-VIII")
sc(B6,inv(182.5,B6),"dio","aftermathA"); sc(inv(182.5,B6),BR,"map","VIII-end")
sc(BR,BC,"map","recap"); sc(BC,B7,"title",""); sc(B7,B8,"map","wide"); sc(B8,TOTAL,"dio","road")
# potong adegan yang tertimpa sisipan (rentang sisipan + celah pendek yang ikut diserap)
CUT={"trench":(I["trench"][0],inv(31.25,T_title)),"barrage":I["barrage"],"armorB":(I["armorB"][0],B2),"marshB":I["marshB"],"pocketB":(I["pocketB"][0],B4),"citadel":I["citadel"],"ruins":I["ruins"],"aftermathB":(I["aftermathB"][0],BR)}
for id_,(a,b) in CUT.items():
    out=[]
    for x in S:
        if x["t1"]<=a+1e-6 or x["t0"]>=b-1e-6: out.append(x); continue
        if x["t0"]<a-0.15: out.append({**x,"t1":round(a,2)})
        if x["t1"]>b+0.15: out.append({**x,"t0":round(b,2)})
    out.append({"t0":round(a,2),"t1":round(b,2),"kind":"dio","id":id_}); S=sorted(out,key=lambda x:x["t0"])
S=[x for x in S if x["t1"]-x["t0"]>0.15]
dips=[BR]
for a,b in zip(S,S[1:]):
    if a["kind"]=="map" and b["kind"]=="map": continue
    if a["t1"]<b["t0"]-0.01: print("CELAH",a,b)
    dips.append(b["t0"])
ev2={k:(round(v,2) if not isinstance(v,list) else v) for k,v in ST.items()}
json.dump({"total":TOTAL,"vo":vo,"scenes":S,"dips":dips,"anchors":an,"ev2":ev2},open("src/conquer/part2-timeline.json","w"),indent=1)
print("TOTAL",TOTAL,"=",int(TOTAL//60),":",int(TOTAL%60),"VO",round(sum(v["dur"] for v in vo),1))
for s in S: print(s)
