---
title: EditContext
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
---

# EditContext

Type: platform primitive reference

EditContext is the future-facing platform primitive in this lane.

## Why it matters

- makes IME text updates, selection updates, layout updates, and text-format
  feedback explicit
- proves IME-owned formatting is its own lane, not just another decoration hack

## Strongest local evidence

- `../edit-context/dev-design.md`

## Limits

- not mature enough to be today’s foundation
- track it aggressively, but do not bet the current runtime on it
