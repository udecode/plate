---
title: Pretext
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/entities/premirror.md
  - docs/research/systems/editor-architecture-landscape.md
---

# Pretext

Type: text-measurement primitive

Pretext is the measurement and layout primitive in the candidate stack.

## Why it matters

- clean split between one-time text preparation and hot-path layout
- strong proof that measurement can be derived without DOM reflow
- useful for future large-doc and page-layout work

## Strongest local evidence

- `../pretext/README.md`

## Limits

- not a direct answer to annotation/comment ownership
- important for layout, not for legacy `decorate` replacement on its own
