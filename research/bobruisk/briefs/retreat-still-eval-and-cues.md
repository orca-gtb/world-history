# Still "Retreat under artillery" (Angie v1) — evaluasi + cue sheet suara

File: `still-retreat-angie-v1.png` (1672×941). Dievaluasi 22 Nov 2026 oleh Claude.

## A. Evaluasi
| Pertanyaan Angie | Jawaban | Catatan |
|---|---|---|
| 1. Konsisten dengan gaya peta? | **Cukup, dengan penjembatan.** Palet redup cocok; tekstur painterly berbeda dari peta vektor, dan itu wajar untuk dokumenter (peta = analitis, still = emosional) | Samakan: grain dan vignette yang sama, grading sedikit ke olive/coklat peta (gambar sekarang agak ungu-abu), tipografi tanggal/label yang sama, label "AI RECONSTRUCTION" |
| 2. Transisi peta → still natural? | **Ya**, bila kamera peta mendorong searah panah terobosan ke barat, lalu dilarutkan ke gambar yang titik hilangnya di tengah (truk menjauh ke kedalaman) | Suara masuk 1 dtk sebelum potongan (J-cut), keluar 1 dtk setelahnya (L-cut) |
| 3. Terbaca sebagai retreat/breakout? | **Ya.** Punggung ke penonton, berlari mengejar truk yang menjauh, peluru tracer dari kiri DAN kanan (kesan terkepung), ledakan di sisi jalur | Tidak ada rear guard yang menembak balik dan kelompok terputus dari brief awal; dengan pilihan "Soviet di luar frame" ini masih bisa diterima |
| 4. Yang perlu diperbaiki | (1) **Daun kuning/coklat = kesan musim gugur.** Adegan 28 Juni → daun birch hijau musim panas. Ini perbaikan utama. (2) Resolusi 1672×941 < 1920×1080 → generate ulang lebih besar atau upscale. (3) Jalan berlumpur: tidak salah, cuaca hari itu belum bersumber; biarkan | Senjata, helm, truk: generik, tanpa lambang. Bagus. Wajah tidak detail. Bagus |

Gerak kamera di still: geser lateral pelan tanpa ubah skala (aturan zoom kanal), atau parallax 2.5D bila Angie bisa memberi lapisan terpisah.
Teks layar usulan: kicker "28 JUNE 1944 · WEST OF BOBRUISK", satu baris "The trapped divisions try to break out. Only part of them get through." (V untuk terobosan; "only part" sejalan sumber, tanpa angka).

## B. Cue sheet suara (adegan 14 dtk; t=0 = potongan ke still)
Level target relatif (dB) sebelum master; pan: −1 kiri … +1 kanan.

| Lapisan | Suara | Mulai–selesai (dtk) | Level | Pan | Perlakuan | Aset |
|---|---|---|---|---|---|---|
| 1 Ambience | Angin lapangan terbuka | −1,0 – 15,0 | −16 | 0 | fade in 1 dtk | Mixkit "Wind blowing ambience" (tersedia) |
| 1 Ambience | Gemuruh rendah jauh (artileri jauh) | −1,0 – 15,0 | −20 | 0 | lowpass 150 Hz | Mixkit "Thunder rumble during a storm" (tersedia, dipakai sebagai gemuruh) |
| 2 Retreat | Mesin truk tua menderu di gigi rendah, menjauh | −1,0 – 14,0 | −14 → −24 | +0,2 | naik 0–3 dtk, lalu lowpass menyapu 8 kHz → 1,5 kHz dari 9 dtk (menjauh) | **ElevenLabs SFX** (Mixkit hanya truk modern) |
| 2 Retreat | Roda di jalan berlumpur, suspensi berderak | 0,5 – 12,0 | −20 | +0,2 | ikut sapuan menjauh | **ElevenLabs SFX** |
| 2 Retreat | Truk kedua lebih jauh | 0 – 13,0 | −26 | +0,4 | lowpass 2 kHz | Mixkit "Truck driving steady" (modern, dikaburkan) |
| 3 Manusia | Langkah lari di lumpur | 1,5 – 9,0 | −18 | −0,4 → 0 | | **ElevenLabs SFX** |
| 3 Manusia | Peralatan berderak saat berlari | 1,5 – 9,0 | −22 | −0,3 | | **ElevenLabs SFX** |
| 3 Manusia | Napas berat, jarang | 3,0 – 7,0 | −26 | −0,2 | secukupnya | **ElevenLabs SFX** |
| 3 Manusia | Teriakan pendek tak jelas | 2,4 · 8,2 | −22 | ±0,3 | jarak menengah, tanpa kata yang terbaca | **ElevenLabs SFX** |
| 4 Soviet (luar frame) | Tembakan senapan/MG jauh | 0,8 · 3,6 · 6,9 · 11,0 | −20 | kiri/kanan bergantian (sesuai tracer) | | **ElevenLabs SFX** |
| 4 Soviet | Desis peluru artileri datang | 4,6 – 5,6 | −18 | +0,5 | mendahului ledakan dekat | **ElevenLabs SFX** (Mixkit "Air whoosh and whistle" kandidat cadangan) |
| 5 Impact | Ledakan jauh | 1,8 | −18 | +0,6 | | Mixkit "Far away war explosions" (ada) |
| 5 Impact | **Ledakan dekat** | 5,6 | −8 | +0,5 | lapis: "War field explosion" + "Explosion in battle", sub-bass | Mixkit (ada) |
| 5 Impact | Puing dan tanah berjatuhan | 5,8 – 7,5 | −18 | +0,3 | | Mixkit "Stone debris falling" (tersedia) |
| 5 Efek | **Momen teredam** | 5,7 – 6,9 | — | — | semua lapisan selain ledakan: lowpass 400 Hz, lalu kembali dalam 1 dtk | proses |
| 5 Impact | Ledakan sedang | 10,2 | −14 | −0,4 | | Mixkit "Bomb distant explotion" (ada) |
| 5 Impact | Ledakan jauh di belakang | 12,6 | −20 | 0 | | Mixkit (ada) |
| Transisi | Gemuruh berlanjut ke peta | 14,0 – 15,0 | −20 | 0 | L-cut | — |

Progresi: awal artileri jauh + ambience → truk menguat → langkah, napas, tembakan dari luar frame → desis → ledakan dekat → teredam → ambience kembali → truk dan langkah menjauh, bombardemen tetap di belakang.
Jarak antar ledakan: 1,8 / 5,6 / 10,2 / 12,6 dtk (tidak monoton, ada ruang untuk suara truk).

## C. Aset yang perlu dibuat
| SFX ElevenLabs (1 take masing-masing) | Perkiraan kredit |
|---|---|
| Mesin truk tua 1940-an menderu, menjauh | ±27–55 |
| Roda di lumpur, suspensi berderak | ±27–55 |
| Langkah lari di lumpur | ±27–55 |
| Peralatan militer berderak saat berlari | ±27–55 |
| Napas berat | ±27–55 |
| Teriakan pendek tak jelas (jarak menengah) | ±27–55 |
| Tembakan senapan/MG jauh, burst pendek | ±27–55 |
| Desis peluru artileri datang | ±27–55 |
| **Total** | **±220–440 kredit** (≈1–1,5% kuota bulanan Starter) |
Perkiraan resmi ElevenLabs untuk satu SFX contoh: 27,5 kredit (durasi bawaan); SFX lebih panjang lebih mahal.
Catatan: suara manusia/teriakan = **reconstructed atmosphere**, bukan rekaman arsip; disebut di deskripsi.
