---
date: 2026-04-09
topic: slate-v2-built-in-normalization-recovery-lane
status: completed
---

# Slate v2 Built-in Normalization Recovery Lane

## Goal

Recover enough of the legacy built-in normalization family to support the true
Slate claim without regressing the current clipboard and range-ref contract.

## Hard Constraint

Do **not** treat this as a quick helper port.

A naive transplant of legacy built-in normalization and `fallbackElement`
behavior already regressed:

- mixed-inline clipboard lanes
- wrapper-list clipboard lanes
- complex fragment selection rebasing
- range-ref proof over those same families

## Required Design Questions

1. Which legacy built-in constraints are still truly required for the v2 engine
   model?
2. Which current fragment / rebasing lanes depend on the broader tree shapes
   that the naive port destroyed?
3. Can `fallbackElement` be recovered as a scoped behavior without reintroducing
   blanket child-family coercion?
4. Which proofs must stay green while the lane lands?

## Required Proof Before Landing

- `yarn test:custom`
- `yarn workspace slate-react run test`
- any touched clipboard / range-ref rows in:
  - `packages/slate/test/clipboard-contract.ts`
  - `packages/slate/test/range-ref-contract.ts`

## Current Read

- custom `normalizeNode(...)` and `shouldNormalize(...)` are real
- safe built-in primitives now exist on the default normalizer:
  - empty-child repair
  - inline spacer insertion
  - direct-child block-only cleanup for current node-op seams
  - replace/manual-normalize block-only cleanup
- explicit-only cleanup is now a real lane:
  - `Editor.normalize(...)` marks the pass as explicit for heavier text cleanup
  - explicit normalize can also flatten inline-container block wrappers into
    inline-compatible descendants
- scoped `fallbackElement` recovery now exists for wrapping stray top-level or
  block-only text / inline children when app code delegates to the core
  normalizer
- broad live inline-container flattening is explicitly **not** part of the
  default live contract unless a better design survives the full clipboard /
  range-ref / runtime proof stack
- built-in normalization parity is still open
- blanket legacy child-family coercion is still explicitly outside the current
  proved surface
