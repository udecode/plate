---
date: 2026-04-09
topic: slate-v2-rendering-api-recovery
status: completed
---

# Slate v2 Rendering API Recovery

## Goal

Recover the remaining honest rendering seams that the docs still expect:
`renderText`, custom placeholder hosts, and `leafPosition` metadata.

## Result

- widened `renderLeaf` so callers receive:
  `attributes`, `leaf`, `text`, `segment`, and `leafPosition` when the text
  node is split
- restored `renderText` on `EditableText` and threaded it through
  `EditableBlocks` / `EditableTextBlocks`
- restored custom placeholder host rendering with `renderPlaceholder`
- widened runtime proof for:
  custom text hosts, custom placeholder hosts, `leafPosition`, and top-level
  forwarding through `EditableBlocks`
- aligned the rendering docs to the recovered surface

## Verification

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
