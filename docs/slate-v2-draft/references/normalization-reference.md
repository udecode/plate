---
date: 2026-04-12
topic: slate-v2-normalization-reference
---

# Slate v2 Normalization Reference

## Purpose

Single live reference for the current Slate v2 normalization posture.

Use it when you need:

- the current default-vs-explicit normalization contract
- the current phase-boundary read
- the frozen baseline against old broad built-ins
- the current verdict on whether normalization work should reopen

This is reference truth, not current queue ownership.

For current queue and roadmap truth, use
[../master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Current Hard Read

- keep the default-vs-explicit normalization contract closed
- do not reopen broad default live coercion in the current tranche
- the current contract is intentionally narrower than old Slate
- the raw outer iteration stop is gone
- the real remaining design question is the missing commit-tier phase boundary,
  not “recover every old built-in by default”

## Contract Summary

Default live behavior keeps only the invariants needed for correctness:

- empty child repair
- top-level stray text and inline cleanup
- direct-child block-family cleanup
- inline spacer insertion

Heavier cleanup stays on explicit or app-owned seams:

- `Editor.normalize()`
- load / replace / reset
- import / paste ingestion
- app-owned custom `normalizeNode(...)`

Allowed non-canonical live shapes are governed by
[live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md),
not by ad hoc exceptions.

## Phase Boundary Read

The current engine still has one normalization phase before publish.

That means:

- publish is not a second normalization tier
- “commit canonicalization” does not exist yet
- promoting explicit-only cleanup into ordinary commit behavior would be a real
  public contract change

Before any explicit-only rule can be promoted, the design still needs to define:

1. where the new phase would run
2. whether range refs publish before or after it
3. whether listeners / `onChange()` observe pre- or post-canonicalized state
4. whether app-owned `normalizeNode(...)` participates in it

## Baseline Read

Against old broad built-ins:

- several safety behaviors still remain built-in
- adjacent text merge / empty cleanup are explicit-only now
- broad inline-container flattening is explicit-only now
- app-owned schema normalization remains first-class
- `shouldNormalize` stays pass-level and fallback-safe

That means the current normalization story is narrower on purpose, not
accidentally unfinished.

## Promotion Read

If normalization work reopens later, the first credible promotion candidate is:

1. explicit adjacent-text cleanup / merge

Not first:

- broad inline-container flattening
- broad always-on live coercion

Those stay closed until the boundary design is real and the migration gates
survive.

## Detail Docs

The detailed working notes now live in `archive/`:

- [archive/normalization-baseline-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/normalization-baseline-matrix.md)
- [archive/normalization-phase-boundary-note.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/normalization-phase-boundary-note.md)
- [archive/normalization-reopen-verdict.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/normalization-reopen-verdict.md)
