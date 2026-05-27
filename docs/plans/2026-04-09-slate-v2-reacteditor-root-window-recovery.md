---
date: 2026-04-09
topic: slate-v2-reacteditor-root-window-recovery
status: completed
---

# Slate v2 ReactEditor Root/Window Recovery

## Goal

Recover the remaining cheap, honest ReactEditor root/window helpers on top of
the mounted bridge.

## Current Batch

1. restore `getWindow`
2. restore `findDocumentOrShadowRoot`
3. restore `hasRange`
4. widen runtime proof and sync docs/ledgers

## Result

- restored `ReactEditor.getWindow`
- restored `ReactEditor.findDocumentOrShadowRoot`
- restored `ReactEditor.hasRange`
- widened runtime proof for both the mounted document seam and a mounted
  shadow-root seam
- updated the ReactEditor docs and RC ledgers to carry the recovered helper
  surface explicitly

## Verification

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
