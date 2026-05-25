---
date: 2026-04-23
topic: editor-architecture-raw-ingest
status: complete
source_skill: research-wiki full
scope:
  - Lexical
  - ProseMirror
  - Tiptap
  - Tiptap Docs
---

# Editor Architecture Raw Ingest Plan

## Goal

Normalize full raw evidence families under `../raw` for Lexical,
ProseMirror, Tiptap, and Tiptap Docs, then compile architecture-focused source
summaries into `docs/research`.

## Source Truth

Official source origins:

- Lexical: `https://github.com/facebook/lexical.git`
- ProseMirror umbrella: `https://github.com/ProseMirror/prosemirror.git`
- ProseMirror packages: `https://code.haverbeke.berlin/prosemirror/prosemirror-*.git`
- Tiptap source: `https://github.com/ueberdosis/tiptap.git`
- Tiptap Docs: `https://github.com/ueberdosis/tiptap-docs.git`

Normalized raw entrypoints:

- Lexical: `../raw/lexical`
- ProseMirror: `../raw/prosemirror`
- Tiptap source and docs: `../raw/tiptap`

## Phases

1. Create or refresh raw source families under `../raw`. Complete.
2. Generate raw README metadata and catalogs for each corpus. Complete.
3. Inspect existing compiled coverage and strongest local raw hits. Complete.
4. Compile architecture source summaries for Lexical, ProseMirror, and Tiptap.
   Complete.
5. Update source README/index/log entrypoints. Complete.
6. Close every corpus with an evidence disposition ledger. Complete.

## Research Questions

- What should Slate v2 steal from each architecture?
- What should Slate v2 explicitly not copy?
- Which claims are raw-backed, compiled-backed, or still open?

## Status

- Phase 1: complete.
- Phase 2: complete.
- Phase 3: complete.
- Phase 4: complete.
- Phase 5: complete.
- Phase 6: complete.

## Raw Ingest Result

Created or refreshed:

- `../raw/lexical/repo`
- `../raw/prosemirror/repo`
- `../raw/prosemirror/packages/*`
- `../raw/tiptap/repo`
- `../raw/tiptap/docs`

Generated:

- `../raw/lexical/README.md`
- `../raw/lexical/catalog.md`
- `../raw/prosemirror/README.md`
- `../raw/prosemirror/catalog.md`
- `../raw/tiptap/README.md`
- `../raw/tiptap/catalog.md`

Updated:

- `../raw/log.md`

## Compiled Output

Added:

- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
- `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`

Updated:

- `docs/research/sources/editor-architecture/README.md`
- `docs/research/index.md`
- `docs/research/log.md`
- `docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`

## Corpus Dispositions

- Lexical: evidenced.
- ProseMirror: evidenced.
- Tiptap/Tiptap Docs: evidenced.

No raw gap remains for this scoped read/update architecture pass.
