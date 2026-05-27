---
title: use-editable
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
---

# use-editable

Type: lightweight editable-surface reference

use-editable is the clean hook-shaped lower-bound reference in this lane.

## Why it matters

- useful for small code/prose surfaces
- explicit about caret restoration and React reconciliation tricks
- good evidence for what should stay out of a full editor architecture

## Strongest local evidence

- `../use-editable/README.md`

## Limits

- not a durable document-engine model
- not a source of truth for comment/annotation ownership
