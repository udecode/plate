---
title: Table fragment semantics raw source pointers
type: source
status: partial
updated: 2026-06-12
source_refs:
  - ../../../../docs/slate-v2/research/2026-06-12-table-fragment-semantics/README.md
---

# Table Fragment Semantics Raw Source Pointers

Raw bulk is intentionally not copied into `docs/slate-v2/research/**`.

Local source checkouts used by the 2026-06-12 Slate v2 research packet:

| Repo | Local path | Use |
|------|------------|-----|
| ProseMirror tables | `/Users/zbeyens/git/prosemirror-tables` | Primary table rectangle, copy/paste, span split, and cell-selection invariant source. |
| Tiptap | `/Users/zbeyens/git/tiptap` | Confirms Tiptap OSS table extension delegates table editing semantics to `prosemirror-tables`. |
| Lexical | `/Users/zbeyens/git/lexical` | Secondary contrast for table selection shape, DOM import/export, and clipboard selected-node strategy. |
| Slate v2 lab | `/Users/zbeyens/git/plate-2/.tmp/slate-v2` | Target proof surface and current skipped table-fragment fixtures. |

