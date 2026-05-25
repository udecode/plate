---
title: Lexical
type: entity
status: partial
updated: 2026-04-15
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# Lexical

Type: editor engine reference

Lexical is the strongest modern runtime challenger in this lane.

## Why it matters

- separates mark ids from comment/thread stores
- separates decorator UI from text overlays
- gives a better invalidation/runtime posture than legacy Slate

## Strongest local evidence

- `../lexical/packages/lexical/src/LexicalUpdates.ts`
- `../lexical/packages/lexical-mark/src/MarkNode.ts`
- `../lexical/packages/lexical-playground/src/commenting/index.ts`
- `../lexical/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx`
- `../lexical/packages/lexical-react/src/useLexicalSubscription.tsx`

## Limits

- not a reason to copy Lexical’s whole node model
- playground comment code is product evidence, not universal law
- the strongest challenge here is the explicit dirty-node reconcile model
