import json
R="assets/ww2/radio"; rep=json.load(open(R+"/processing_report.json"))
T={
"us_01":"Able-One to Command, radio check. How do you read me? Over.",
"us_02":"Command, this is Able-One. Enemy armor spotted ahead, three tanks moving north along the road. Over.",
"us_03":"Able-One to Command. We are taking heavy fire. Requesting immediate reinforcement at grid four seven two six. Over.",
"us_04":"Able-One, this is Command. Attack at zero six hundred. I repeat, attack at zero six hundred. Out.",
"us_05":"Command, Able-One. Position secured. Two wounded, no losses. Ammunition running low. Over.",
"de_01":"Gefechtsstand, hier Falke Eins. Funkprobe. Wie hören Sie mich? Kommen.",
"de_02":"Gefechtsstand, hier Falke Eins. Feindliche Panzer gesichtet, drei Fahrzeuge, Richtung Norden auf der Straße. Kommen.",
"de_03":"Gefechtsstand, hier Falke Eins. Wir liegen unter starkem Feuer. Verstärkung im Planquadrat vier sieben zwei sechs anfordern. Kommen.",
"de_04":"Falke Eins, hier Gefechtsstand. Angriff um sechs Uhr null null. Ich wiederhole: Angriff um sechs Uhr. Ende.",
"de_05":"Gefechtsstand, hier Falke Eins. Stellung gehalten. Zwei Verwundete, keine Gefallenen. Munition wird knapp. Kommen.",
"su_01":"Штаб, я Сокол-один. Проверка связи. Как слышите? Приём.",
"su_02":"Штаб, я Сокол-один. Вижу танки противника, три машины, движутся на север по дороге. Приём.",
"su_03":"Штаб, я Сокол-один. Попали под сильный огонь. Прошу подкрепление в квадрат четыре семь два шесть. Приём.",
"su_04":"Сокол-один, я Штаб. В шесть ноль-ноль переходите в наступление. Повторяю: в шесть ноль-ноль в наступление. Приём.",
"su_05":"Штаб, я Сокол-один. Рубеж взят. Двое раненых, потерь нет. Боеприпасы на исходе. Приём."}
CAT=["initial_contact","enemy_spotted","request_reinforcement","attack_order","status_report"]
V={"us":("American English, original voice (Voice Design)","en"),"germany":("German, original voice (Voice Design)","de"),"soviet":("Russian, original voice (Voice Design)","ru")}
out=[]
for r in rep:
    k=r["id"][:5]; n=r["nation"]; p=r["id"]
    out.append({"id":p,"nation":n,"category":CAT[int(k[3:])-1],"language":V[n][1],"voice":V[n][0],"text":T[k],
      "pronunciation_check":"back-transcribed (ElevenLabs Scribe): matches script" if n!="us" else "n/a (English)",
      "transmission_character":r["character"],"duration_clean_s":r["duration_clean"],"duration_radio_s":r["duration_radio"],
      "paths":{"clean_master":r["clean"],"clean_mp3":r["clean"][:-4]+".mp3","radio_processed":r["processed"],"radio_with_static":r["with_static"],"preview_mp3":r["processed"][:-4]+".mp3"},
      "cloning_of_real_person":False})
json.dump({"voices":out,"sfx":["radio_on","radio_tuning","static_burst","transmission_start","transmission_end","radio_off"],"sfx_dir":R+"/sfx"},open("assets/ww2/metadata/radio.json","w"),indent=1,ensure_ascii=False)
print(len(out),"entries; total clean s:",round(sum(o["duration_clean_s"] for o in out),1))
