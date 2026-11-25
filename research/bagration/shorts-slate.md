# Bagration Shorts: slate (usulan, 26 Nov 2026) - semua dari VO yang SUDAH ADA, biaya kredit Rp0

Alat: `python3 scripts/build-short.py <id>` (potong VO per kalimat, boleh diurut ulang), komposisi `src/shorts/ShortComp.tsx`, mixer `scripts/mix_short.py`. Spec per Short di `shorts/<id>.json`.

| # | Hook (3 dtk pertama) | VO sumber | Perkiraan durasi | Visual | Status |
|---|---|---|---|---|---|
| s01 | "-300,000 men lost in two weeks" | p1_0 (kalimat diurut ulang) + p1_3 | 51 dtk | Diorama + grafik batang 1,5 jt vs <500 rb | **jadi, menunggu review Nanda/Dio** |
| s02 | "Fewer than 150 soldiers for every kilometre of front" | p1_1 (kalimat 6-8) + p1_1b | ±40 dtk | Diorama parit + angka | usulan |
| s03 | "Within days, 30,000 men ceased to exist" (Vitebsk) | p1_6 (kalimat akhir dulu, lalu kronologi) | ±45 dtk | peta Vitebsk (perlu mode vertikal peta) atau Diorama | usulan |
| s04 | "A German army was encircled in the marshes of Belarus" | p2_0 + p2_8 + p2_9 | ±36 dtk | Diorama kantong + angka 80.000 | usulan |
| s05 | "The Soviets hid a million men in plain sight" (maskirovka) | p1_2 | ±38 dtk | Diorama malam | usulan, cek klaim hook vs VO |
| s06 | "He pulled back anyway. His superior ordered him back into positions that no longer existed." | p1_8 (kalimat tengah) | ±30 dtk | Diorama | usulan |

Catatan jujur:
- Waktu per kata caption adalah perkiraan (proporsi karakter antar jeda), akurasi ±0,15 dtk. Kalau terasa meleset, pakai transkripsi ElevenLabs (STT).
- Peta (garis depan, panah, merah wilayah direbut) belum ada versi vertikal. s03 sebaiknya menunggu itu, atau pakai Diorama dulu.
- Data Shorts WH (vidIQ, 26 Nov 2026): satu Short (Goebbels, 22.939 views) = 62% dari semua views Shorts; median ±880. Judul tokoh/angka tajam lebih kuat dari ringkasan peristiwa. Sampel kecil dan umur video mengacaukan perbandingan.
