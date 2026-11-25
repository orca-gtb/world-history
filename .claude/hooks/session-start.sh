#!/bin/bash
# SessionStart: pasang dependency Remotion kalau container baru, lalu ingatkan Claude soal skill wajib.
set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  hashes=node_modules/.session-start.sha256
  if ! sha256sum --check --status "$hashes" 2>/dev/null; then
    rm -f "$hashes"
    npm install --no-audit --no-fund >&2
    sha256sum .claude/hooks/session-start.sh package.json package-lock.json 2>/dev/null > "$hashes" || rm -f "$hashes"
  fi
fi

# Teks di stdout masuk ke konteks sesi.
cat <<'MSG'
[Aturan skill World History] Pakai skill berikut OTOMATIS tanpa menunggu Nanda mengetik "/":
- Hook 0-30 dtk: wtf-hook-akademi + viral-hooks
- Naskah/struktur: art-of-storytelling + storytelling + dumbify
- Teks layar, judul, deskripsi: copywriting + anti-ai-writing (filter terakhir)
- Animasi Remotion: motion-design (3 lapis gerak, easing, aturan 1/3)
- Rencana konten/seri: content-strategy
- Riset web: firecrawl-build-search/scrape hanya kalau ada API key Firecrawl; selain itu WebSearch/WebFetch.
Skill lokal: .claude/skills/<nama>/SKILL.md (baca langsung kalau Skill tool menolak namanya).
MSG
