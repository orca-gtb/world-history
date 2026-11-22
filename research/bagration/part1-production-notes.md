# Bagration Part 1 "The Trap" — catatan produksi v1 (22 Nov 2026)

| Item | Nilai |
|---|---|
| Durasi | 7:26 (446 dtk). VO 6:41 (13 bab, Liam Dale, 1 take) |
| Kredit EL | VO 6.032 + SFX 3×17 = ±6.083 |
| Loudness | −16,1 LUFS, true peak −1,7 dBFS |
| Narasi vs bed | median 30 dB di atas bed; cold open ±9 dB (artileri sengaja padat, hanya mengisi jeda) |
| Render | `npx remotion render src/conquer/index.tsx BagrationPart1 out/conquer/part1-muted.mp4 --gl=angle --muted` lalu `python3 scripts/mix_part1.py 3 mux` |

## Kenapa 7:26, bukan 8:30–9:00
Naskah ±6.040 karakter dibaca Liam Dale lebih cepat dari estimasi (6:41). Jeda peta/gambar sudah ±45 dtk total.
Tidak kupanjangkan dengan jeda kosong: padding menurunkan AVD. Kalau mau ±9 menit, tambah isi (mis. bab Polotsk atau
kesaksian), bukan diam.

## Aturan yang diterapkan
- Gambar Angie DIAM, transisi gelap perlahan (22 titik dip).
- Sebelum 22 Juni peta tanpa suara tempur (angin/hum/radio). Bed tembakan jauh baru masuk saat serangan dibuka.
- Jarak kamera = jarak suara: teater = far, Vitebsk = mid, gambar = dekat.
- Label "AI ILLUSTRATION" di semua gambar, kecuali P1-01 (label sudah tertanam dari Angie).
- Angka di layar sesuai sumber: 1.670.300 → "1,670,000"; 486.000 combat; 495 tank & StuG operasional; 5.818; 7.799;
  4.500 dari 11.000 pesawat (19 Juni); ⅓ artileri, 88% tank; "almost 30,000" LIII Corps.
- Kutipan Jordan di layar = kata-kata sumber (Wikipedia), VO = parafrase.

## Gambar
P1-01 sudah dipakai. P1-02..P1-10 masih PLACEHOLDER di `public/stills/bagration/`. Cukup timpa file `P1-0x.jpg`
(1920×1080, gaya sketsa sama dengan P1-01) lalu render ulang; timeline tidak perlu diubah.

| Kode | Muncul | Durasi | Adegan |
|---|---|---|---|
| P1-05 | 0:00 | 13,9 dtk | langit malam artileri/Katyusha (cold open) |
| P1-04 | 1:07 | 8,1 | parit Jerman fajar |
| P1-01 | 1:44 | 9,0 | meja staf Soviet ✅ |
| P1-02 | 2:09 | 5,1 | tank di bawah jaring kamuflase |
| P1-03 | 3:54 | 12,0 | partisan memasang peledak di rel, malam |
| P1-06 | 4:55 | 6,8 | Vitebsk terbakar, Dvina |
| P1-07 | 5:15 | 7,5 | kolom Jerman menerobos hutan barat Vitebsk |
| P1-08 | 5:42 | 6,1 | zeni Soviet membersihkan ranjau dekat jalan raya |
| P1-09 | 5:55 | 4,3 | kendaraan Jerman terbakar di jalan raya |
| P1-10 | 6:43 | 7,7 | pasukan Soviet menyeberangi Dnieper dengan perahu/rakit |

## Data peta
- Garis depan 22 Juni: `research/bagration/front-22jun.json` (dijiplak dari peta Soviet "Белорусская операция", affine 9 kota,
  galat maks 0,26° bujur) + sektor selatan dari pilot Bobruisk.
- Sungai & rel: Natural Earth 10m (domain publik), rel dipotong hanya di belakang garis Jerman.
- Posisi unit perkiraan; ada label "POSITIONS APPROXIMATE · AFTER PERIOD MAPS".
