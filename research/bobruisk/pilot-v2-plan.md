# Pilot v2 — Bobruisk: rencana produksi (peta operasional + adegan still bersuara)

Dibuat 22 Nov 2026 oleh Claude, menjawab "Additional Creative & Production Direction" (Angie/Nanda).
Status: **RENCANA** (belum diproduksi). Target durasi pilot: ±3 menit, 1920×1080, tanpa VO narator.

## 0. Pembagian kerja (sesuai brief, dengan satu catatan)
| Peran | Siapa | Catatan |
|---|---|---|
| Riset, rekonstruksi, storyboard, cue sheet suara, verifikasi | Claude | |
| Prompt + gambar rekonstruksi AI, evaluasi visual | Angie | |
| Perakitan, animasi peta, integrasi SFX, mix, render, QC teknis | Claude (pipa Remotion + ffmpeg yang sudah ada) | "Operator" di brief kuambil, kecuali menilai suara |
| **Mendengarkan dan menilai suara** | **Nanda** | Claude tidak bisa mendengar audio. Tiap adegan bersuara butuh satu kali dengar dari manusia |

## 1. Storyboard (±3:00)
| # | Waktu | Jenis | Isi | Bukti/status |
|---|---|---|---|---|
| S1 | 0:00–0:15 | Still | Cold open: jalan penuh kendaraan Jerman yang hancur dekat Bobruisk + kutipan Vasily Grossman (diatribusikan) | Kutipan: Wikipedia/Grossman (V). **Foto: butuh sumber + lisensi** |
| S2 | 0:15–0:35 | Peta teater | Zoom out: tonjolan Army Group Centre, garis 22 Jun, 4 Front Soviet, panah besar Bagration | Peta West Point + peta Soviet (pembanding). Perlu jiplakan garis 22 Jun |
| S3 | 0:35–0:55 | Peta sektor | Deployment 24 Jun 04:00: ±10 divisi Jerman + 4 Army Soviet + korps mobil di belakang | Label divisi dari peta referensi (V-peta) |
| S4 | 0:55–1:20 | Peta | Gempuran artileri (kilatan sepanjang garis), serangan utara tertahan, lalu terobosan 3rd Army; 134 ID kolaps | Wikipedia (V) |
| S5 | 1:20–1:35 | Still | Rekonstruksi: pasukan Soviet melewati rawa dengan jalan balok kayu (65th Army) | **Rekonstruksi AI (Angie), diberi label**. Detail jalan balok: halaman Batov (V) |
| S6 | 1:35–2:00 | Peta | 25→26 Jun: 20th Pz berbalik ke selatan, terobosan 65th Army, KMG Pliyev ke barat; garis front berubah 25 → 26 Jun | Peta referensi + Wikipedia |
| S7 | 2:00–2:25 | Peta (zoom) | 27 Jun: kantong terbentuk, serangan udara 16th Air Army (kilatan), upaya lolos | Peta referensi (kantong 27 Jun 21:00) |
| S8 | 2:25–2:40 | Still | Rekonstruksi: pos komando Jerman, radio. Teks: "Good to see you — Ninth Army no longer exists!" (kepala staf 9th Army kepada komandan 12th Pz, 28 Jun) | Kutipan: Wikipedia (V, satu sumber). **Rekonstruksi AI (Angie)** |
| S9 | 2:40–3:00 | Peta → kartu | 28–29 Jun: terobosan ke arah 12th Pz, Bobruisk jatuh; kartu angka korban sebagai RENTANG bersumber | Wikipedia (K: angka berbeda antar sumber) |

## 2. Kepadatan visual (yang didukung bukti)
| Formasi | Muncul di | Sumber |
|---|---|---|
| Jerman: 707, 57, 134, 45 (2 bagian), 296, 6 ID; 20th PzD; sisa 35/129/102 ID; XXXV AK; LV AK; Gruppe Schirmer | S3–S7 | Label peta referensi 24–27 Jun |
| Jerman: 383 ID (Bobruisk), 12th PzD, Gruppe Lindig, Gruppe Bickel | S8–S9 | Peta referensi 27 Jun–1 Jul + Wikipedia (383, 12 Pz) |
| Soviet: 3rd, 48th, 65th, 28th Army | S3–S9 | Wikipedia + peta |
| Soviet: 1st Guards Tank Corps, 1st Mech Corps, 4th Gds Cavalry Corps (KMG) | S6–S9 | Peta referensi 2 + Wikipedia |
| Soviet: korps tank di utara (peta referensi 2 menulis "9. Garde Pz. K."; Wikipedia menyebut 9th Tank Corps) | S7 | **Tidak sesuai antar sumber** → label "9th Tank Corps" hanya bila Angie menemukan sumber kedua |
| "18. Pz. D." dekat Bychow (peta 1) | — | **Tidak dipakai**: belum diverifikasi |
| Elemen tambahan: kilatan artileri, ikon serangan udara, simbol perlawanan (garis bergerigi), panah mundur putus-putus, sungai Berezina sebagai rintangan, jalan rel/jalan utama (modern, jadi hanya bila sumber 1944 mendukung) | | |

Aturan keterbacaan: maksimum ±14 kotak di layar sekaligus; label hanya untuk unit yang sedang dibicarakan, selebihnya kotak tanpa label.

## 3. Garis front per fase (pekerjaan tambahan)
Jiplak juga garis 25 Jun 21:00 dan 26 Jun 21:00 versi Soviet (garis merah putus-putus di peta 1), serta garis 22 Jun skala teater (peta West Point/Soviet). Wilayah Soviet diperbarui per fase (bukan hanya garis awal).

## 4. Cue sheet suara (lapisan 1–6 dari brief)
| Adegan | Ambient (1) | Jauh (2) | Depan (3) | Komunikasi/manusia (4) | Efek (5) | Transisi (6) | Intensitas |
|---|---|---|---|---|---|---|---|
| S1 aftermath | angin, hutan | ledakan sisa sangat jauh | logam berderit pelan | — | — | sunyi 1 dtk sebelum teks | rendah |
| S2 teater | ruang peta (room tone) | — | — | — | dentum rendah saat panah muncul | swoosh zoom | sedang |
| S3 deployment | hening tegang | — | — | — | ketukan tiap kotak muncul | — | rendah→sedang |
| S4 artileri | — | rentetan artileri jauh | ledakan per kilatan | — | dentum besar saat terobosan | naik | tinggi |
| S5 rawa | hutan basah, angin | artileri jauh | langkah di air/lumpur, kayu | perintah pendek dalam bahasa Rusia (**rekonstruksi**) | — | — | sedang |
| S6 manuver | — | tank/mesin jauh | — | — | ketukan gerak kotak | — | sedang |
| S7 kantong | — | pesawat lewat, ledakan | — | radio berderak | ledakan per kilatan udara | naik ke puncak | tinggi |
| S8 pos komando | ruangan, radio statis | dentum jauh | kertas peta, peralatan | suara radio Jerman (**rekonstruksi**, teks layar hanya kutipan bersumber) | — | sunyi setelah kutipan | rendah, tegang |
| S9 akhir | angin | tembakan sisa jauh | — | — | — | memudar ke sunyi | turun |

Aturan: tidak ada loop "perang generik" sepanjang video; tiap lapisan punya tujuan; sunyi dipakai sengaja (S1, S8).
Suara manusia yang direkonstruksi: tidak berisi kalimat yang diklaim historis, volumenya latar, dan disebut "reconstructed atmosphere" di deskripsi.

## 5. Sumber SFX (dicek 22 Nov 2026)
| Kebutuhan | Mixkit (gratis) | Celah |
|---|---|---|
| Ledakan, ledakan jauh, artileri | ada (kategori Warfare/Explosion, mis. "Distant war explosions", "War field explosion") | — |
| Pasukan berbaris | "Big army crowd marching" | — |
| Radio statis | ada beberapa ("Radio static fx", "Radio noise static and crackles") | — |
| Angin, hutan | ada ("Wind in the forest", "Breeze through the trees") | — |
| Mesin tank, rantai, senapan mesin, pesawat era WW2, kuda, air/lumpur, perintah Rusia/Jerman | **tidak ditemukan** di kategori yang kucek | Opsi: generate SFX ElevenLabs (makan kredit; perkiraan biaya dicek dulu dengan estimate_only, minta izin sebelum generate) |
| Lisensi | Halaman lisensi "Sound Effects Free License" ada, tapi teksnya tampil lewat JavaScript dan **belum terbaca** dari sini | **Nanda baca dan simpan screenshot** sebelum dipakai |

## 6. Permintaan aset
| Aset | Dari | Syarat |
|---|---|---|
| Foto S1 (aftermath jalan dekat Bobruisk) | Nanda/Angie | Sumber + lisensi tercatat (mis. Bundesarchiv di Commons CC BY-SA, atau foto Soviet dengan status jelas). Dua foto yang dikirim 22 Nov belum punya sumber → belum boleh dipakai. Commons diblokir 429 dari container, jadi Nanda yang unduh |
| Rekonstruksi S5 (rawa, jalan balok, infanteri Soviet) | Angie (AI) | 1920×1080 atau lebih; gaya konsisten antar adegan; tanpa wajah tokoh nyata; tanpa simbol Nazi; diberi label "AI RECONSTRUCTION" di layar |
| Rekonstruksi S8 (pos komando Jerman, malam, radio) | Angie (AI) | idem; tanpa swastika/lambang; tanpa wajah yang bisa dikira tokoh nyata |
| Brief prompt | Claude → Angie | Kutulis setelah gaya visual peta disetujui |

## 7. Kepatuhan
- YouTube: centang "altered or synthetic content" bila memakai rekonstruksi AI yang tampak realistis.
- Label di layar: "AI RECONSTRUCTION" untuk still AI, "RECONSTRUCTED ATMOSPHERE" tidak perlu di layar (cukup deskripsi).
- Tidak ada dialog yang disajikan sebagai rekaman arsip.

## 8. Urutan kerja yang kusarankan
1. Nanda dan Angie menyetujui storyboard ini (boleh dipotong).
2. Claude: jiplak garis 22/25/26 Jun, tambah formasi, kilatan artileri/udara, kamera teater → sektor → kantong (render tanpa suara dulu).
3. Angie: dua gambar rekonstruksi. Nanda: foto S1 + lisensi Mixkit.
4. Claude: cue sheet → mix suara per lapisan; perkiraan kredit ElevenLabs untuk celah SFX, minta izin.
5. Nanda mendengarkan; revisi; render final pilot.
