# Visual brief — Still "Breakout / Retreat", 28 Juni 1944 (untuk disepakati SEBELUM generate)

Ditulis Claude untuk Angie, 22 Nov 2026. Sketsa tata letak: `retreat-layout-sketch.png` (blok bentuk, bukan gambar final).

## 1. Fungsi adegan dalam cerita
- **Posisi:** setelah peta kantong 27 Jun (S7), sebelum Bobruisk jatuh (S9). Menggantikan still "pos komando" sebagai adegan utama; pos komando jadi opsional.
- **Yang harus dirasakan penonton:** pelarian yang terdesak. Sebagian lolos, sebagian tertinggal. Bukan pertahanan yang heroik.
- **Satu kalimat teks layar (usulan):** "28 June. The trapped divisions try to break out west. Most do not make it."
  - Status: terobosan 28 Jun ke arah 12th Panzer = **V** (Wikipedia). "Most do not make it" sejalan dengan "around 12,000 got out" vs puluhan ribu tewas/ditawan, tapi angkanya **K lemah**. Kalimat alternatif yang lebih aman: "Only part of them get through."

## 2. POV dan kamera
| Item | Keputusan |
|---|---|
| Sudut pandang | Pengamat netral di pinggir jalan, setinggi orang jongkok di parit, **di belakang/samping rear guard Jerman**. Bukan POV Soviet, bukan POV pahlawan |
| Lensa | Normal (35–50 mm), tanpa distorsi lebar |
| Horizon | ±40% tinggi gambar |
| Arah baca | Pengejar (Soviet) di **KIRI** latar belakang → kolom yang lolos bergerak ke **KANAN** menjauh (barat). Konsisten dengan peta: arah lolos = barat |
| Rasio | 16:9, minimal 1920×1080. Bila bisa, minta lapisan terpisah (latar depan / tengah / belakang) untuk parallax 2.5D halus |

## 3. Komposisi (lapisan)
| Lapisan | Isi | Bobot |
|---|---|---|
| **Latar depan kanan** (subjek utama) | 3 prajurit rear guard di parit/tanggul jalan, menghadap ke kiri, satu senapan mesin diarahkan ke pengejar. Tubuh siluet setengah gelap, wajah tidak detail (tertutup helm/bayangan) | 35% |
| **Tengah** | Jalan tanah berpasir melengkung dari kiri-bawah ke kanan-tengah; kolom truk dan kereta kuda menjauh, debu tebal di belakangnya. 1–2 kendaraan rusak ditinggal di bahu jalan | 30% |
| **Belakang kiri** | Tepi hutan pinus, asap; siluet tank dan infanteri Soviet kecil muncul dari asap; kilatan tembakan kecil | 15% |
| **Belakang kanan** | Kelompok kecil yang terputus di dekat rawa, dikelilingi asap, tidak ikut kolom (elemen "gagal lolos") | 10% |
| **Langit** | Kabut dan asap; 2 pesawat serang kecil sangat jauh (opsional) | 10% |

## 4. Gaya (mengikuti arahan Angie)
- Ilustrasi dokumenter sejarah yang **painterly**: guas/minyak tipis, sapuan terlihat, bukan foto.
- Palet redup: zaitun, coklat tanah, abu kabut, sedikit oker; satu titik warna hangat dari api/kilatan.
- Atmosfer: debu, asap, kabut medan perang, cahaya musim panas yang tertutup asap (akhir Juni).
- Detail rendah pada kulit dan wajah; kedalaman dibangun lewat kabut (atmospheric perspective).
- Konsisten untuk semua still pilot (S1, S5, adegan ini): gaya, palet, dan grain yang sama.

## 5. Akurasi (yang boleh dan tidak)
| Elemen | Status | Catatan |
|---|---|---|
| Medan: hutan pinus, jalan berpasir, rawa, ladang | V (Grossman menyebut pinus dan jelai hijau; rawa di halaman Batov) | |
| Musim: akhir Juni, kering-berdebu | V | |
| Kendaraan Jerman campur truk dan kereta kuda | Pengetahuan umum (divisi infanteri Jerman 1944 banyak memakai kuda) | **Belum bersumber spesifik**, tampil sebagai latar, bukan fokus |
| Sisa 20th Panzer memimpin terobosan dengan beberapa tank/assault gun | V (Wikipedia) | Boleh 1 kendaraan lapis baja di depan kolom, kecil |
| Tank Soviet = siluet T-34 umum | Pengetahuan umum | Tanpa nomor/tanda unit |
| Serangan udara terus-menerus | V | |
| **Dilarang** | swastika, lambang SS/unit, bendera; wajah realistis tokoh nyata; darah/korban grafis yang eksplisit; teks/tulisan acak di gambar | |
| Label di video | "AI RECONSTRUCTION" (pojok kanan bawah) + toggle synthetic content YouTube | |

## 6. Draf prompt (bahan untuk Angie, silakan diubah)
```
Painterly documentary history illustration, muted olive and earth palette, thin oil/gouache brushwork, atmospheric dust and smoke haze, cinematic depth, 16:9.
Summer 1944, Belarus, sandy forest road through pine woods near marshland.
Foreground right: three German rear-guard soldiers crouched in a roadside ditch, seen from behind and side, faces hidden by helmets and shadow, one machine gun aimed left toward the pursuers.
Middle ground: a column of trucks and horse-drawn carts moving away to the right along the road, thick dust trailing, one abandoned truck on the verge.
Background left: Soviet tanks and infantry emerging as small silhouettes from smoke at the forest edge, small muzzle flashes.
Background right: a small cut-off group near the marsh, surrounded by smoke.
Sky: hazy, two distant ground-attack aircraft.
No insignia, no flags, no swastikas, no text, no detailed faces, not photorealistic.
```
Negatif (bila alatnya mendukung): photorealistic, photograph, hyperrealistic skin, close-up faces, insignia, swastika, flag, text, gore.

## 7. Pasangan suara (dari cue sheet)
Angin + debu (ambient) · mesin truk dan derap kuda menjauh ke kanan (pan kanan) · senapan mesin rear guard (depan kiri, sedang) · tembakan dan ledakan pengejar (belakang kiri) · pesawat lewat sekali · tanpa musik. Celah: mesin truk era WW2, derap kuda, MG42 → butuh SFX ElevenLabs (minta izin kredit) atau Mixkit bila ditemukan.

## 8. Alur persetujuan
1. Angie/Nanda setujui sketsa + brief (atau revisi POV/komposisi).
2. Angie generate 2–3 variasi **thumbnail** dulu, bukan final.
3. Claude cek akurasi dan kecocokan dengan arah peta (kiri→kanan).
4. Baru generate final (dan lapisan parallax bila bisa).
