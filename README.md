# World History — studio video (Remotion)

Template produksi untuk channel YouTube **World History** (@worldhistory_1wh). Bahasa Inggris, narasi ElevenLabs (British), target audiens US/UK/Eropa.

## Struktur
- `src/kit/` — komponen visual (kertas, kartu arsip, cap, kamera/film grain, light leak)
- `src/episodes/schema.ts` — skema data episode: tiap fakta punya `status` (verified / corroborated / contested / unverified) + sumber. `MODE="final"` menyembunyikan yang belum terkonfirmasi.
- `src/aces/` — episode Erich Hartmann (v1–v3)
- `src/v4/` — Hartmann v4: satu "meja" dunia, hanya kamera yang bergerak (GSAP timeline)
- `src/Scenes.tsx`, `src/three/` — Pegasus Bridge (dijeda)
- `scripts/` — render, still, dan sintesis audio prosedural (`soundtrack*.py`)

## Pakai
```
npm install
npx remotion studio src/v4/index.tsx        # v4
node scripts/stills-v4.mjs out/st4 40 100   # cek frame
npx remotion render src/v4/index.tsx AceHartmannV4 out/hartmann-v4.mp4 --gl=angle
```
Browser headless di container: `/opt/pw-browsers/chromium_headless_shell-*/...`. WebGL butuh `--gl=swangle`.
Audio (`public/audio/*.wav`) tidak di-commit: jalankan `python3 scripts/soundtrack_v4.py out/raw.wav` lalu normalisasi ke −16 LUFS.

## Aturan konten
- Tiap video punya tesis/sudut analisis sendiri (hindari kesan "konten massal bertemplat").
- Fakta wajib bersumber; foto/footage hanya domain publik atau berlisensi, catat sumbernya.
- Jangan masukkan simbol/atribut yang melanggar kebijakan platform.
