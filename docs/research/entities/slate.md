---
title: Slate
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - docs/slate-v2/decorations-annotations-cluster.md
---

# Slate

Type: inheritance and proof-substrate reference

Slate matters here because it is both the inheritance pressure and the thing
being rewritten.

## Why it matters

- legacy Slate shows exactly why `decorate` became a bad abstraction boundary
- local Slate v2 already proves runtime ids, bookmarks, and projection slices
- the best architecture here is a hard cut from the weakest legacy assumptions

## Strongest local evidence

- `../slate/Readme.md`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate-react/src/projection-store.ts`
- `docs/slate-v2/decorations-annotations-cluster.md`

## Limits

- upstream Slate’s README still reflects broad flexibility more than final
  architecture discipline
- the research value is in inheritance pressure and local v2 proof, not blind
  preservation
