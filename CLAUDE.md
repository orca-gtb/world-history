# CLAUDE.md — World History (studio video)

Konteks tetap untuk sesi Claude di repo ini. Pemilik: Nanda (Orca / Lone Orca). Panggil Nanda atau Orca.

## Target pinned
- Monetisasi YouTube "World History" (@worldhistory_1wh), target YPP terbuka paling lambat akhir Des 2026.
- Audiens target RPM tinggi: US, UK, Eropa. Channel berbahasa Inggris.
- Angka dasar 17 Nov 2026: 75 subs, 36.731 views total, ≈97,5 jam tonton 12 bln (semua format), views Shorts 90 hari 5.763. Mayoritas penonton visible dari Indonesia.
- Jangan turunkan target. Kalau angka kurang, ubah taktik.
- Uang YPP dipakai dulu untuk tool penting (vidIQ Boost, konektor), bukan ditarik untuk dipakai lain.

## Suara
- ElevenLabs, British accent. Utama Liam Dale (`w2ZdKT3ghAOcMRbpjC3u`), cadangan Frederick Surrey (`j9jfwdrw7BRfcR43Qohk`), Daniel (`onwK4e9ZLuTAKqWW03F9`). 1 take per generate.

## Aturan kerja
1. Bahasa Indonesia santai, langsung, jujur. Tegur kalau strategi/pola pikir salah.
2. Data-driven: angka, tabel. Output rapi dan mudah disalin.
3. Jangan sarankan istirahat/turunkan goal. Jangan sarankan minta tolong orang lain (seed review dll).
4. Ritme fleksibel harian, bukan sprint kaku.

## Aturan konten
- Fakta wajib bersumber (status verified/corroborated/contested/unverified di `src/episodes/schema.ts`). Mode `final` menyembunyikan yang belum terkonfirmasi.
- Footage/foto asli hanya domain publik/berlisensi; catat sumber. Footage dan foto asli disediakan Nanda.
- Tiap video punya tesis sendiri; hindari kesan konten massal bertemplat (kebijakan inauthentic content).
- Tokoh Nazi: framing kritis/netral, tanpa simbol (swastika dll), jangan terkesan mengagumi.
- Gambar tokoh: ilustrasi/animasi bergaya (bukan kemiripan wajah) atau foto 2D dari foto asli yang disediakan.
- Preferensi Nanda (18 Nov 2026): JANGAN pakai kata/cap "credited", "not proven", "confirmed" di dalam video; caveat/perdebatan taruh di deskripsi atau komentar disematkan. Pakai istilah "aerial victories". Tidak ada stempel.
- Zoom kamera hanya untuk momen penting (angka hook, objek kunci seperti tulip). Selebihnya kamera meluncur tanpa mengubah skala.
- Gambar still dari Angie (rekonstruksi AI/ilustrasi) TIDAK boleh diberi animasi apa pun (asap, api, tracer, kilatan, guncangan, push-in). Tampil diam; boleh dipotong (cut) ke crop diam. Hidupkan lewat suara dan teks (preferensi Nanda 22 Nov 2026).
- Siluet pesawat: pakai profil samping berlengkung (src/aces/Profiles.tsx), bukan ikon garis lurus. Digambar dari proporsi, bandingkan dengan 3-view referensi sebelum publish.

## Jurnal (data penting per video)
- Folder `jurnal/` berisi entri per video (data, posisi di video, status D/K/I/?, sumber, kenapa penting, risiko). Kalau Nanda menyebut nama video dan bertanya kenapa suatu data penting, buka `jurnal/<video>.md` lebih dulu, lalu `longform/source-ledger.md` untuk detail sumber.
- Rencana upload + metadata: `upload/UPLOAD-PLAN.md`.
- Skill lokal repo: `.claude/skills/wtf-hook-akademi` (hook) dan `.claude/skills/art-of-storytelling` (naskah/cerita). Pakai untuk hook dan struktur sebelum menulis skrip baru.
