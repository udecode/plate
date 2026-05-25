---
title: ProseMirror
type: entity
status: partial
updated: 2026-04-15
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# ProseMirror

Type: editor engine reference

ProseMirror is the main overlay-discipline benchmark in this research lane.

## Why it matters

- strongest reference for mapped decoration data
- strongest reference for bookmark-style durable anchors
- strongest pressure against callback-only decoration APIs

## Strongest local evidence

- `../prosemirror/view/src/decoration.ts`
- `../prosemirror/view/src/viewdesc.ts`
- `../prosemirror/state/src/selection.ts`

## Limits

- not the main React DX benchmark
- not the right lower-bound reference for lightweight surfaces
- still the harder benchmark on explicit document-view diff discipline
