---
date: 2026-04-09
topic: slate-v2-live-shape-register
---

# Slate v2 Live Shape Register

> Reference doc. Not a live queue owner. For current queue and roadmap truth,
> see [../master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

Named register for allowed non-canonical live shapes in the `True Slate RC`
program.

This exists so maintainers can audit:

- why a non-canonical shape is allowed
- where it is allowed
- what boundary canonicalizes it
- which proof rows keep it safe

## Rule

If a live shape is not listed here, it is not an allowed intentional exception.

## Allowed Non-Canonical Live Shapes

### 1. Adjacent compatible text siblings in inline-style containers

Why it exists:

- forcing live text coalescing after ordinary edits kept breaking split/merge
  and delete proof
- the better value is to keep live editing stable and canonicalize only when
  the caller asks for heavier cleanup

Where it is allowed:

- ordinary committed snapshots
- ordinary live transactions
- inline-style containers only

What canonicalizes it:

- explicit `Editor.normalize()`
- import/load boundaries when app code chooses to normalize
- app-owned custom `normalizeNode(...)`

Proof rows:

- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
  — explicit adjacent-text cleanup owner rows
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
  — explicit adjacent-text cleanup rebasing row
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
  — broad mixed-inline proof stays green because this is not default live
  cleanup
- [app-owned-customization.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/app-owned-customization.tsx)
  — runtime selection/render proof stays green because this is not default live
  cleanup

### 2. Block-wrapper descendants inside inline-style containers

Why it exists:

- broad live flattening kept breaking mixed-inline clipboard and runtime proof
- the better value is to keep the default live path safe and flatten only on
  explicit canonicalization boundaries

Where it is allowed:

- ordinary committed snapshots
- ordinary live transactions
- inline-style containers, outside the direct-child node-op seam that is
  already proved safe to flatten

What canonicalizes it:

- explicit `Editor.normalize()`
- import/load boundaries when app code chooses to normalize
- app-owned custom `normalizeNode(...)`

Proof rows:

- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
  — explicit inline-container flattening owner row
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
  — explicit inline-container flattening rebasing row
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
  — broad mixed-inline proof stays green because broad live flattening is not
  default
- [primitives-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/primitives-contract.tsx)
  — mixed-inline runtime/selection proof stays green because broad live
  flattening is not default

## Not Allowed By Default

These are explicitly outside the default live contract unless reopened with a
better design and fresh proof:

- broad always-on live inline-container coercion
- broad always-on live adjacent-text cleanup
- blanket child-family coercion as a general invariant
