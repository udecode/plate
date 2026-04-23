---
date: 2026-04-09
topic: slate-v2-readonly-surface-recovery
status: completed
---

# Slate v2 ReadOnly Surface Recovery

## Goal

Restore `readOnly` on the structured editing surface so apps do not need to fake
the editor root by hand.

## Result

- restored `readOnly` on `EditableBlocks` / `EditableTextBlocks`
- widened runtime proof so the structured surface blocks paste/input and exposes
  the correct read-only hook state
- simplified the read-only example to use the real public surface instead of a
  hand-built fake editor root

## Verification

- `yarn workspace slate-react run test`
- `yarn test:custom`
- `yarn lint:typescript`
