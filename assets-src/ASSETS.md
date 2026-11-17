# Aset sumber (kiriman Nanda, 18 Nov 2026) — status lisensi & akurasi

| File | Isi | Status | Catatan |
|---|---|---|---|
| angie/sheet1-4 | Lembar aset buatan AI (Angie): siluet, parasut, peta, ilustrasi | AI-generated | Peta = referensi gaya saja (geografi/garis depan tidak akurat; Maykop di wilayah Soviet padahal Okt 1942 dikuasai Jerman). Ilustrasi resolusi kecil (±380 px), tanpa simbol. Butuh file asli beresolusi ≥1920 px bila mau dipakai. |
| ref-silhouettes-angie.png | Siluet Bf 109, Fw 190, Me 262 | AI-generated | Dipakai (public/silhouettes). Bentuk mirip aslinya, bukan jiplakan gambar teknik. |
| ref-p51-silhouettes.jpg | Siluet Mustang X, P-51B, Mustang III | Tercantum "GVG / PD / 1.0" (domain publik) | P-51B dipakai (Lt. Goebel menerbangkan P-51B). Verifikasi sumber aslinya. |
| ref-ju87-silhouettes.jpg | Siluet Ju 87 (4 varian) | Sumber BELUM DICATAT | Varian teratas dipakai. Cek lisensi. |
| ref-yak9-3view.jpg | Gambar 3-view Yak-9 | Sumber BELUM DICATAT | Tampak samping diubah jadi siluet. Cek lisensi. |
| ref-bf109-blue-drawing.jpg | Gambar teknik Bf 109 G (putih di biru) | Sumber BELUM DICATAT | Belum dipakai. Cek lisensi sebelum dipakai. |
| ne/ne_50m_admin_0_countries.geojson | Natural Earth 50m | Domain publik | Dipakai untuk peta (src/longform/mapdata.ts). Batas negara = batas modern. |

## Referensi gaya (tidak disimpan di repo)
- "German Air Force in WW1 and WW2 — Animated edit (The Red Baron)": Short 9:16 buatan pihak lain, dikirim Nanda 18 Nov 2026 sebagai referensi gaya animasi dogfight. Gaya: kartun 2D cel-shaded detail (bukan pixel art). Karya berhak cipta, TIDAK dipakai/disalin; berisi lambang Nazi yang tidak boleh ada di video kita.
- Perbandingan: animasi siluet kita (src/longform/Scenes.tsx) belum setara. Opsi peningkatan: sprite cel-shaded dari gambar garis (cek lisensi), model .glb + 3D, atau klip generator video AI (perlu label synthetic content).
