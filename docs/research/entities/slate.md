---
title: Slate
type: entity
status: partial
updated: 2026-04-14
related:
  - docs/research/sources/editor-architecture/candidates.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
  - c70bacbd4a:docs/plite-draft/decorations-annotations-cluster.md
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
- `udecode/slate@f0e5ad1ae7caa14027dc57bc38bd457909bd4b97:packages/slate/src/interfaces/editor.ts`
- `udecode/slate@f0e5ad1ae7caa14027dc57bc38bd457909bd4b97:packages/slate-react/src/projection-store.ts`
- `c70bacbd4a:docs/plite-draft/decorations-annotations-cluster.md`

## Limits

- upstream Slate’s README still reflects broad flexibility more than final
  architecture discipline
- the research value is in inheritance pressure and local v2 proof, not blind
  preservation
