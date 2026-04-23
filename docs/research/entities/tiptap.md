---
title: Tiptap
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Tiptap

Type: product-layer editor reference

Tiptap is the packaging and productization benchmark, not the engine winner.

## Why it matters

- comments, floating menus, and suggestions show product-layer pressure clearly
- node-range and focus helpers reinforce distinct overlay channels
- it turns ProseMirror primitives into shippable product surfaces

## Strongest local evidence

- `../tiptap/packages/extensions/src/focus/focus.ts`
- `../tiptap/packages/extension-node-range/src/helpers/getNodeRangeDecorations.ts`
- `../tiptap/demos/src/Extensions/CollaborationMapPositions/React/index.tsx`

## Limits

- most engine lessons here are really ProseMirror lessons
- not the best source for low-level runtime semantics
