---
date: 2026-04-10
topic: slate-v2-normalization-baseline-matrix
---

# Slate v2 Normalization Baseline Matrix

> Archive only. Detailed baseline reference. For the live normalization read,
> see [../normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md).

## Purpose

Freeze the normalization comparison that the reopen batch is reasoning about:

- old broad built-ins from pinned baseline commit
  `f0258b58e7b0ab6357d253d8bc802abad2d0b353`
- current default live contract
- current explicit-only canonicalization
- current app-owned seams

This file is a maintainer artifact. It exists so later work does not drift into
fake “legacy parity” claims or re-derive the same boundary arguments from
scratch.

## Rule

When a behavior moves, update this matrix in the same patch as the proof and
docs that justify the move.

## Matrix

| Behavior | Old broad built-in baseline | Current default live | Current explicit / app-owned | Trigger surface | Current read |
| --- | --- | --- | --- | --- | --- |
| Empty child repair | built-in: empty elements get a text child in old core [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L106) and pinned old baseline `f0258b58e7b0ab6357d253d8bc802abad2d0b353:packages/slate/src/core/normalize-node.ts:38-43` | still built-in in current core [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L106) | app-owned wrappers can replace empty-body behavior through custom `normalizeNode(...)` [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L30) | `default live`, `app-owned` | keep as live safety |
| Top-level stray text cleanup | old broad core removed stray top-level text when editor must stay block-only in pinned old baseline `...normalize-node.ts:120-129` | still built-in on replace / node-op cleanup [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L174) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L194) | can wrap instead through delegated `fallbackElement` [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2714) | `default live`, `fallbackElement`, `app-owned` | keep as live safety |
| Top-level stray inline cleanup | old broad core removed or wrapped editor-level inline children in pinned old normalization fixtures `packages/slate/test/normalization/editor/remove-inline.tsx` and `...remove-inline-with-wrapping.tsx` | current contract still removes them by default [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L226) | can wrap instead through delegated `fallbackElement` [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2714) | `default live`, `fallbackElement`, `app-owned` | keep as live safety |
| Block-only direct child-family cleanup | old broad core removed or wrapped text/inline children under block-only parents in pinned old baseline `...normalize-node.ts:117-133` | current core keeps the direct-child seam hot, including op-scoped validation [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L196) and proof [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L265) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L296) | delegated wrapping remains supported [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L328) | `default live`, `operation-scoped`, `fallbackElement`, `app-owned` | keep as live safety; direct-child scope matters |
| Inline spacer insertion | old broad core enforced spacer text around inline nodes by default in pinned old baseline `...normalize-node.ts:86-105` | still built-in in current core [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L174) with current proof [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L386) | none needed beyond app overrides; ref-safe proof exists [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts#L2996) | `default live` | keep as live safety |
| Adjacent compatible text merge | old broad core merged adjacent matching text by default in pinned old baseline `...normalize-node.ts:62-84` | intentionally not default live now; this is an allowed non-canonical live shape in [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L26) | explicit-only in current contract [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L136) with proof [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L520) and [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L619) | `explicit` | explicit-only canonicalization; candidate promotion only if migration gates survive |
| Adjacent empty text cleanup | old broad core removed empty adjacent text by default in pinned old baseline `...normalize-node.ts:65-78` | intentionally not default live as part of the same live-shape exception [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L26) | explicit-only in current core [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L136) with proof [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L547) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L643) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L683) | `explicit` | explicit-only canonicalization; same promotion risk as adjacent merge |
| Inline-container flattening of block wrappers | old broad core unwrapped non-inline descendants inside inline-style containers by default in pinned old baseline `...normalize-node.ts:106-112` | intentionally not broad default live now; current docs mark this as an allowed non-canonical live shape [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L60) | explicit-only for broad flattening [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L118) with proof [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L575) | `explicit`; narrow `operation-scoped` direct-child flattening still exists by default | explicit-only except for the proved direct-child node-op seam |
| App-owned schema normalization | old fixtures relied on overrideable `normalizeNode` but broad built-ins did more work for free | current contract still treats wrapper-level `normalizeNode` as first-class [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L30) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L64) [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L88) | same seam also owns delegated `fallbackElement` [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L128) | `app-owned`, `fallbackElement` | veto gate; must not get harder to migrate |
| Pass control via `shouldNormalize` | old model had hardcoded iteration policy; later Slate added overrideable pass stop | current hook is pass-level, not per-entry, and explicit/manual-aware [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2565) [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2644) | can skip custom pass per transaction [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2596) | `default live`, `explicit`, `app-owned` | keep; redesign must preserve cadence contract |
| Outer termination guard | old known caveat was the `42 x dirty-path length` hard stop in older Slate docs/changelog | current engine no longer relies on the raw `100` stop; it now fails on semantic draft-state revisits and only falls back to a derived pass budget in [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L80) | pass-level `shouldNormalize` contract still stands [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2664) and scheduler-focused failure proof now exists [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2702) | engine-level | raw stop replaced; remaining question is whether the new failure semantics are good enough |

## Current Honest Read

- The current contract is not missing “most normalization.”
- It intentionally narrowed default live coercion and moved the heavier shape
  cleanup into explicit-only canonicalization or app-owned seams.
- The strongest remaining problem is not missing blanket legacy parity.
- The raw outer iteration stop is gone.
- The remaining redesign pressure is now the missing post-transaction /
  pre-publish boundary, not the old hardcoded tombstone.

## Candidate Promotion Order

If a future redesign survives migration gates, the first credible promotion
candidates are:

1. explicit adjacent-text cleanup / merge
2. explicit inline-container flattening

That order is safer than broad live coercion because both are already directly
proved as explicit-only behaviors in
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L520),
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L547),
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L575),
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L619),
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L643),
and
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L683).

Neither should move until the missing phase boundary is explicit and the
migration gates stay green.
