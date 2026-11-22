# Prototype Bobruisk v2 (33 dtk) — catatan
File: `out/bobruisk-proto-v2.mp4` · Kode: `src/conquer/ProtoV2.tsx` · Mix: `scripts/mix_proto2.py <gain> mux`
Loudness −17,1 LUFS, LRA 18,2 LU, true peak −1,6 dBFS.

| Waktu | Visual | Suara (level terukur per detik) |
|---|---|---|
| 0:00–0:05.6 | Peta 25→26 Jun, zona menyebar, panah, unit bergerak | dengung + artileri jauh (−26 dB) |
| 0:05.6–0:12.4 | Kantong 27 Jun, zoom, 5 kilatan serangan udara | radio + ledakan sinkron (−18..−21) |
| 0:12.4–0:13.6 | Kamera mendorong ke arah terobosan barat laut, larut ke still | swoosh; suara still masuk 1 dtk lebih awal (J-cut) |
| 0:13.6–0:25.6 | Still retreat (Angie v1, digrading olive, geser lateral), teks 28 Jun, label AI RECONSTRUCTION | 5 lapisan: angin+gemuruh, truk menjauh+roda lumpur, langkah+peralatan+napas+teriakan, MG luar frame kiri/kanan, desis → ledakan dekat (−11) → 1,2 dtk teredam → ambience kembali |
| 0:25.6–0:29.6 | Kembali ke peta 28 Jun: panah terobosan Jerman (gelap) ke barat laut, 20th Panzer + XXXV Corps ikut | gemuruh berlanjut (L-cut), MG dan ledakan jauh (−26) |
| 0:29.6–0:33 | 29 Jun: kantong jadi merah, unit tertinggal memudar, "Bobruisk falls" | turun ke sunyi |

Sumber baru: panah terobosan dari peta referensi 2 (Wikipedia, tahap akhir), georef 5 kota rms ±4–5 km. 20th Panzer memimpin terobosan: Wikipedia (V).
Kredit ElevenLabs terpakai: 8 SFX × 17 = 136 (+1 estimasi gratis).
Masalah teknis yang ditemukan: pengukuran in-graph dengan adelay menyesatkan; mix sekarang memakai penggeseran timestamp + aresample async (diverifikasi; timing v1 tetap benar).
Yang masih harus Angie perbaiki di gambar: daun kuning (kesan musim gugur) → hijau Juni; resolusi ≥1920×1080.
