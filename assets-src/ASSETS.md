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

## Model 3D (GLB)
| File | Lisensi | Status |
|---|---|---|
| BF 109 – Messerschmitt, GRIP420 (Sketchfab, bf109-grip420.glb) | **CC-BY-NC-4.0 (non-komersial)** — terbaca dari metadata file | **TIDAK BOLEH dipakai di video yang dimonetisasi.** Hanya dipakai untuk uji pribadi (tidak di-commit; ada di .gitignore). Texture membawa Balkenkreuz + swastika (dihapus di salinan uji). Gear terpasang permanen (satu mesh). |
Syarat model pengganti: lisensi **CC0** atau **CC-BY** (kredit penulis di deskripsi). Hindari NC (non-komersial), ND (tanpa turunan), dan SA. Cek juga: texture tanpa lambang (atau bisa dihapus), gear bisa disembunyikan, ≥ 15k poligon untuk close-up.

## Sprite cel-shaded (public/sprites/*.png) — dari model 3D CC-BY 4.0
Dirender dengan `scripts/render-sprites.mjs` (src/sprites/Sprite.tsx: toon shading + outline), tekstur dibersihkan `scripts/clean-glb-insignia.py` (Balkenkreuz/tanda swastika dihapus), roda pendarat dipotong (clip) di Bf 109, P-51, Yak-1; pilot Yak-1 disembunyikan. File GLB sumber TIDAK di-commit (public/models, assets-src/glb di .gitignore).
Syarat CC BY 4.0: kredit + tautan lisensi + sebutkan perubahan → WAJIB masuk deskripsi video:

```
3D models (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/), modified (toon-shaded, textures edited, parts removed):
• "Bf 109 G-6" by Arthur C. Galuppo — https://sketchfab.com/3d-models/bf-109-g-6-83f837ee67474a4fb2752240b71d8bab
• "Junkers Ju 87 Stuka" by scorpion81 — https://sketchfab.com/3d-models/junkers-ju-87-stuka-80fe9909938a44159d1906a81092c006
• "P-51-B SP" by APlainPlane — https://sketchfab.com/3d-models/p-51-b-sp-92aa0d75ff9248738452f959b8f9bed6
• "Yak1" by manilov.ap — https://sketchfab.com/3d-models/yak1-fa960d51684f4b70acb5e4cb414941df
```
Catatan: sprite Soviet = Yak-1 (stand-in untuk Yak-9; model Yak-9 kiriman Nanda berlisensi CC-BY-NC → tidak dipakai). Adegan Brno memakai Yak-1 dengan label "Yak-9" di video — sebut "illustrative" (sudah ada label ILLUSTRATIVE RECONSTRUCTION).
Yak-9 yang tepat: cari model CC0/CC-BY di Sketchfab, kirim .glb, tinggal render ulang.
