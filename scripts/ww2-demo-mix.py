"""Mix audio demo WW2: 3 panggilan radio (radio_with_static) + bunyi radio on/off + langkah, angin, MG saat tembak. Pakai: python3 scripts/ww2-demo-mix.py"""
import json, subprocess
R="assets/ww2/radio"; S="assets-src/sfx/"; D=19.0
I=json.load(open(S+"slices/index.json"))
cues=[ # (file, start, gain_dB, trim_dur or None, pan_l, pan_r)
 (f"{R}/sfx/radio_on.wav",0.15,-8,None),(f"{R}/processed/us/us_01_initial_contact/radio_with_static.wav",0.5,0,None),
 (f"{R}/sfx/radio_on.wav",5.85,-8,None),(f"{R}/processed/germany/de_01_initial_contact/radio_with_static.wav",6.2,0,None),
 (f"{R}/sfx/radio_on.wav",12.5,-8,None),(f"{R}/processed/soviet/su_01_initial_contact/radio_with_static.wav",12.9,0,None),
 (S+"el-footsteps-mud.mp3",0.0,-16,11.0),(S+"wind-blowing-ambience.mp3",0.0,-20,19.0)]
for i,t in enumerate([12.7,13.4,14.1,14.8,15.4]): cues.append((S+"slices/"+I["el2-mg42"][i%len(I["el2-mg42"])]["file"].split("/")[-1],t,-9,None))
for i,t in enumerate([13.0,14.3,15.6]): cues.append((S+"slices/"+I["el2-bullet-whizz"][i%3]["file"].split("/")[-1],t,-10,None))
a=["ffmpeg","-v","error","-y"]; fc=[]
for i,(f,t,g,d) in enumerate(cues):
    a+=["-i",f]; trim=f",atrim=0:{d},afade=t=out:st={d-1.0}:d=1.0" if d else ""
    fc.append(f"[{i}]aresample=48000,aformat=channel_layouts=stereo{trim},volume={g}dB,adelay={int(t*1000)}|{int(t*1000)},apad=whole_dur={D},atrim=0:{D}[c{i}]")
fc.append("".join(f"[c{i}]" for i in range(len(cues)))+f"amix=inputs={len(cues)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9[o]")
subprocess.run(a+["-filter_complex",";".join(fc),"-map","[o]","out/ww2-demo-audio.wav"],check=True)
subprocess.run(["ffmpeg","-v","error","-y","-i","out/ww2-demo-muted.mp4","-i","out/ww2-demo-audio.wav","-map","0:v","-map","1:a","-c:v","copy","-c:a","aac","-b:a","192k","-shortest","-movflags","+faststart","out/ww2-demo.mp4"],check=True)
print("ok")
