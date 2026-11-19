# Quality check — Hartmann long-form v3.5 (19 Nov 2026)

Bagian A = otomatis (skrip `scripts/qc-final.py`). Bagian B = pemeriksaan visual manual (97 frame sampel, tiap 5 detik, plus frame kunci adegan baru).

# A. Otomatis

## 1. Wadah
- Video: h264 1920x1080 30/1; audio: aac 48000 Hz 2 ch
- Durasi file 485.27 dtk; durasi dari timing.json 485.27 dtk; selisih 0.00 dtk

## 2. Loudness
- Integrated -16.1 LUFS (target −16), LRA 4.1 LU, true peak -1.4 dBFS (batas aman ≤ −1)

## 3. Jeda sunyi (> 1,2 dtk di bawah −48 dB)
- tidak ada

## 4. Frame hitam (≥ 0,4 dtk)
- tidak ada

## 5. Gambar nyaris diam ≥ 5 dtk (hipotesis retensi, bukan error)
- 7:55 (475.9s), 8.9 dtk

## 6. Lint spec & timing
- 13 bab, 54 shot, 50 kartu diperiksa
- Adegan 3D: 12 kartu, klip hilang: tidak ada

## 7. Kredit di paket upload vs yang dipakai
- OK  Bf 109 G-6 / Galuppo
- OK  Junkers Ju 87 Stuka / scorpion81
- OK  P-51-B SP / APlainPlane
- OK  Yak1 / manilov.ap
- OK  Fallen (Asper) / Mininni
- OK  Echoes / Andrew Ev
- OK  We Will Get It / Mininni
- OK  Epical Drums 04 / Nuzhny
- OK  Unforgiven / Ramir
- OK  Ich hatt' einen Kameraden / Silcher

## Ringkasan
LULUS otomatis


# B. Pemeriksaan visual manual
Cara: 97 frame sampel tiap 5 detik (frame di antaranya tidak kulihat), ditambah frame kunci tiap adegan 3D baru. Audio tidak bisa kudengar.

## Lolos
- Hook: counter 352 → teaser 3D → foto. Caption "Historians have criticised it" terbaca, tidak menutupi pesawat.
- 12 adegan 3D tampil di kartu yang benar; caption tidak terpotong; label ILLUSTRATIVE RECONSTRUCTION ada di semuanya.
- Tabrakan Stuka ke gubuk (12,2 dtk), P-51, Galland/unit di darat, Alfred (Ju 87) tampil sesuai narasi.
- HUD jujur: FUEL: EMPTY, ≤ 20 m (HIS OWN ACCOUNT), 3,700 m. Bar 345 vs 7. "posthumously" tampil di timeline 1997.
- Nilai akhir counter dicek ke sumber: 148 (Knight's Cross), 301, 116. (Frame sampel sering menangkap angka di tengah animasi hitung, itu bukan salah.)
- Kartu bab 1,5 dtk terbaca; end card 10 dtk.

## Temuan yang BELUM diperbaiki (butuh keputusanmu)
1. **100 detik terakhir (±6:13–7:53, bab 10–12) murni kartu teks/bar/timeline, tanpa gerak aksi.** Ini bagian paling dingin secara visual. Usulan: adegan 3D/peta untuk "Soviet custody", "Years in prison", "After the war". Tidak kukerjakan karena tidak ada di daftar prioritas, tetapi inilah sisa titik drop terbesar menurut evaluasi.
2. **Kartu "black tulip" masih siluet datar** (pesawat putih-biru dengan tulip kuning), berbeda gaya dari 3D di sekitarnya. Itu diagram fungsional (menunjuk kap mesin), jadi sengaja tidak kuganti.
3. **Label "REPORTEDLY"** (kotak kecil) di kartu Wolf's Lair. Aturan Nanda: tidak ada kata "credited/not proven/confirmed" dan tidak ada stempel. "Reportedly" bukan kata yang dilarang, tetapi bentuknya kotak berbingkai seperti cap. Keputusan: pertahankan (penanda ketidakpastian yang jujur) atau ganti jadi teks biasa di dalam kalimat.
4. **Narasi tidak menyebut bahwa teknik 20 m dipelajari dari Krupinski** (lihat `source-ledger.md` #7). Mengubahnya butuh VO baru bab 4.

## Tidak bisa kupastikan
- Kualitas suara narator, tiga take baru (bab 0, 9, 11), kecocokan musik per bab, dan transisi ke lagu Silcher di ±6:52. Harus didengar manusia.
- Keberhasilan peta dinamika audio (hening sebelum tulip di 3:55, puncak di 301 dan Brno). Aku hanya bisa memverifikasi levelnya secara numerik, bukan rasanya.
- LRA 4,1 LU (lebih sempit dari versi sebelumnya): narasi mendominasi level; kontras antarbagian terutama datang dari musik, yang mungkin terdengar halus.
