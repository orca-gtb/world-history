# Bobruisk Pilot — rencana produksi (±3:40)

Naskah: `longform-script-v1.md` (dikunci dulu sebelum VO). Aset gambar: `public/stills/bobruisk/` (9 file dari Angie).

## 1. Audit gambar
| File | Dipakai di | Catatan akurasi/kebijakan | Status |
|---|---|---|---|
| 01_battlefield_aftermath | Act I (pembuka), Act VIII (penutup) | tank Jerman hancur generik | OK |
| 02_soviet_artillery | Act II | **gayanya sangat mirip foto arsip asli** (bukan ciri AI seperti yang lain). Angie perlu memastikan gambar ini benar hasil generate; kalau foto asli, butuh sumber + lisensi | **Cek Angie** |
| 03_infantry_breakthrough | Act III | T-34 bernomor generik | OK |
| 04_soviet_armored_exploitation | Act III | T-34 dengan pasukan di atas tank: cocok "exploitation" | OK |
| 05_marsh_terrain | Act IV | cocok narasi jalan rawa | OK |
| 06_german_encirclement | Act V | perwira dengan Iron Cross polos (tanpa swastika); Balkenkreuz di kendaraan | OK (bukan simbol terlarang) |
| 07_german_retreat_breakout | Act VI | elang di dada buram, **swastika tidak terlihat** (dicek perbesaran 3×) | OK |
| 08_urban_battle | Act VII (puncak) | papan "Бобруйск"; tank tipe Tiger generik (jenis tank di Bobruisk belum bersumber, jadi tidak disebut di narasi) | OK |
| 08b_urban_retreat_street | Act VII | Panzer IV + truk Jerman di jalan kota | OK |
Semua: resolusi 1672×941 → di-upscale ke 1080p; gaya foto hitam-putih realistis → **wajib label "AI RECONSTRUCTION" di layar** dan centang "altered or synthetic content" di YouTube, supaya tidak dikira foto arsip.

**Aturan gerak gambar:** mengikuti aturan Nanda (CLAUDE.md, 22 Nov): gambar diam, tanpa animasi atau push-in. Variasi lewat potongan (cut) ke crop diam dan transisi gelap perlahan. Brief Angie meminta zoom/pan pelan dan mempertahankan "tracer animasi"; tracer di gambar-gambar ini sudah terlukis di gambarnya sendiri, jadi tetap terlihat tanpa ditambah apa pun.

## 2. Timeline adegan (perkiraan; disetel ulang ke durasi VO nyata)
| Waktu | Act | Visual | Suara (lapisan) |
|---|---|---|---|
| 0:00–0:12 | I | 01 Aftermath (diam → crop tank) | angin, gemuruh rendah, ledakan sangat jauh |
| 0:12–0:30 | I | dip → peta WIDE: Army Group Centre, Bobruisk, 9th Army | ambience jauh (preset far) |
| 0:30–0:42 | II | dip → 02 Artillery | tembakan meriam beruntun, desis, dentum tanah |
| 0:42–0:55 | II | peta: garis awal 24 Jun, kilatan artileri sepanjang front, rencana "dua rahang" (dua panah putus-putus) | artileri jauh |
| 0:55–1:05 | III | 03 Infantry | tembakan senapan/otomatis, langkah, ledakan jauh |
| 1:05–1:12 | III | peta OPERASIONAL: terobosan utara, 134 ID mundur | far |
| 1:12–1:20 | III | 04 Armour | mesin tank, rantai, akselerasi |
| 1:20–1:30 | IV | 05 Marsh | angin hutan, langkah di air, tembakan jauh |
| 1:30–1:45 | IV | peta selatan: 65th Army, KMG ke Slutsk, zona menyebar | far |
| 1:45–2:00 | V | peta LOKAL: kantong 27 Jun, serangan udara | menengah (mid) |
| 2:00–2:10 | V | 06 Encirclement | artileri jauh, radio statis, perintah jauh tak jelas (rekonstruksi) |
| 2:10–2:22 | VI | peta: panah terobosan 28 Jun, 12th Pz dari barat | mid → far |
| 2:22–2:35 | VI | 07 Retreat | mesin truk, kendaraan, tembakan, ledakan, jalan berlumpur (set SFX retreat yang sudah disetujui) |
| 2:35–2:52 | VII | 08 Urban (puncak) → cut 08b | tembakan kota, senjata otomatis, ledakan berat, api, puing, tank, artileri jauh |
| 2:52–3:00 | VII | peta kota: kantong merah, "BOBRUISK FALLS" | mereda |
| 3:00–3:30 | VIII | peta WIDE akhir → 01 Aftermath → hitam → "BOBRUISK — 1944" | angin, sunyi |

## 3. Musik (Mixkit, lisensi harus dibaca Nanda)
Act I rendah/atmosferik → Act II–III naik → Act IV turun (napas) → Act V tegang → Act VI mendesak → Act VII puncak → Act VIII mereda ke sunyi. Musik di −8 s.d. −12 dB di bawah narasi (ducking otomatis), tidak ada musik di detik-detik ledakan dekat.

## 4. SFX: tersedia vs perlu dibuat
| Kebutuhan | Tersedia | Perlu dibuat (ElevenLabs, ±17 kredit/take) |
|---|---|---|
| Ambience, angin, gemuruh, ledakan jauh/dekat, puing, radio | ya | — |
| Set retreat (truk, lumpur, langkah, peralatan, napas, teriakan, MG jauh, desis) | ya | — |
| Meriam beruntun (artillery battery firing) | — | 1 |
| Mesin tank + rantai | — | 1 |
| Tembak-menembak di kota (dekat, gema bangunan) | — | 1 |
| Kobaran api/kendaraan terbakar | — | 1 |
| Perintah jauh tak jelas (rekonstruksi, bahasa tak terbaca) | sebagian (el-shouts) | 0–1 |
| **Total tambahan** | | **±4–5 take ≈ 70–85 kredit** |

## 5. Kredit total perkiraan
Narasi ±2.600 + SFX ±85 = **±2.700 kredit** dari sisa 16.999.

## 6. Checklist produksi
1. [ ] Naskah dikunci (Nanda/Angie)
2. [ ] Angie konfirmasi 02_soviet_artillery hasil generate
3. [ ] VO per Act (8 file), cek pengucapan (Rokossovsky, Bobruisk, Berezina, Pliyev, Rogachev)
4. [ ] SFX tambahan (4–5)
5. [ ] Peta: garis awal + kilatan artileri, panah "dua rahang", zona per fase, kantong, terobosan, kota jatuh
6. [ ] Render + mix (narasi jelas di atas SFX/musik, −16 LUFS)
7. [ ] QC: hitam, loudness, label AI, kredit
8. [ ] Nanda mendengarkan seluruh audio
9. [ ] Paket upload (judul, deskripsi bersumber, catatan rekonstruksi AI, kredit SFX/musik)
