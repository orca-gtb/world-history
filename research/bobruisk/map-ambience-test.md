# Tes ambience peta (jarak kamera = jarak suara) — 22 Nov 2026
File: `out/bobruisk-proto-v2-mapamb.mp4` (visual sama dengan v2) · Mix: `scripts/mix_proto3.py <gain> mux`
Loudness −17,4 LUFS, LRA 18,1 LU, true peak −1,5 dBFS. SFX baru: `el-battle-distant`, `el-aircraft-distant` (ElevenLabs, 2 × 17 kredit).

## Preset jarak
| Preset | Dipakai saat | Proses |
|---|---|---|
| far | peta ikhtisar (0–5,6 dtk; 25,6–33 dtk) | lowpass ±1,1 kHz (2 tahap), highpass 40 Hz, gema 70/140 ms |
| mid | zoom ke kantong + serangan udara (5,6–12,4 dtk) | lowpass ±3,2 kHz, gema 45 ms |
| near | still retreat | tanpa lowpass (detail penuh), kecuali momen teredam |

## Lapisan peta
- Ikhtisar: bed pertempuran jauh (artileri teredam + tembakan kecil sangat jauh), dengung angin, 2 ledakan jauh kiri/kanan. Tanpa ledakan "di samping kamera".
- Zoom kantong: pesawat lewat (memuncak ±8 dtk, bersamaan serangan udara), radio statis tipis, 5 ledakan tingkat menengah.
- Kembali ke ikhtisar: bed jauh, MG dan ledakan jauh, pesawat menjauh.

## Bukti terukur (per detik)
| Bagian | Level RMS | Selisih level total vs >3 kHz (makin besar = makin jauh) |
|---|---|---|
| Peta ikhtisar | −25 s.d. −28 dB (tidak pernah sunyi) | 43–71 dB |
| Zoom kantong | −18 s.d. −27 dB | 24–35 dB |
| Still (dekat) | −11 s.d. −24 dB | 8–24 dB |
