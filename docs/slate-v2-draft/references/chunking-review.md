---
date: 2026-04-03
topic: slate-v2-chunking-review
---

# Slate v2 Chunking Review

> Historical/reference doc. Chunking is not a live remaining-work lane. For
> current queue and roadmap truth, see
> [../master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Answer two questions:

1. what problem is chunking solving in current `slate-react`?
2. in `slate-react`, should chunking still be required?

## Short Answer

For the `#4141` family of problems, chunking should **not** be required anymore in v2.

For huge block-only documents, some chunking-like view optimization may still be useful, but only as a secondary tactic inside a runtime that is already large-document-safe by default, not as a core runtime crutch.

## Current Hard Read

- child-count chunking is legacy-only
- the live direction is selector-first rendering plus semantic islands
- if huge-document work reopens, it should reopen on islands/corridor/occlusion
  terms, not by reviving numeric chunk APIs

## Historical Chunking: What It Used To Do In `slate-react`

The deleted chunking tree in legacy `slate-react` used to:

- splits a node’s children into nested memoized chunk components
- is explicitly opt-in through `editor.getChunkSize(...)`
- only helps when a node’s children are all block elements
- is also used as the recommended carrier for `content-visibility: auto`

References:

- [09-performance.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md)
- [2026-04-09-slate-v2-slate-react-source-deleted-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-react-source-deleted-family-closure.md)
- [react-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts)

So chunking is doing two different jobs today:

1. reducing React rerender/reconcile work for broad subtree invalidation
2. creating coarse DOM islands so `content-visibility` is usable on huge docs

That distinction matters.

## Why Chunking Should Not Be Foundational In v2

The `#4141` benchmark seam is not really a “we need chunks” issue.

It is a **render breadth** issue:

- deeply nested block tree
- edit one low-level text node
- too many ancestors rerender

Reference:

- [#4141 benchmark note](/Users/zbeyens/git/plate-2/docs/slate-issues/benchmark-candidate-map.md#issue-4141)

`slate-react` is already aiming at the structural fix:

- committed immutable snapshots
- stable runtime ids
- `useSyncExternalStore` selectors
- narrow node/leaf subscriptions
- no half-mutated editor reads during render

Reference:

- [Part IV. React Runtime Spec](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md#part-iv-react-runtime-spec)

If that runtime lands correctly, the baseline expectation changes from:

- “one leaf edit causes broad ancestor rerenders, then chunking contains the blast radius”

to:

- “one leaf edit rerenders the affected leaf, maybe the directly affected element, and selection-aware UI”

That means chunking stops being the primary answer to nested render-depth pain.

If `slate-react` still needs chunking to survive ordinary nested edits, then the runtime redesign failed.

## What Should Replace “Chunking As The Main Story”

### 1. Local subscriptions first

This is the real fix.

- leaf subscribes to one text node by id
- element subscribes to one element node by id
- selection UI subscribes to selection
- toolbar/floating UI subscribes to derived selectors

Fix invalidation at the source before adding view-layer rescue structures.

### 2. Semantic islands instead of arbitrary child-count chunks

Coarse render islands should follow document semantics, not arbitrary counts.

Prefer boundaries like:

- top-level block
- section subtree
- table subtree
- void/embedded block
- maybe list subtree

Arbitrary `1000 children per chunk` is blunt. It knows nothing about editing semantics.

### 3. Active editing corridor

Keep a fully live corridor around:

- current selection
- active composition
- drag/drop target
- nearby siblings and ancestors needed for correctness

That corridor stays eager and fully materialized.

### 4. Adaptive occlusion outside the corridor

Outside the active corridor:

- `content-visibility: auto`
- `contain-intrinsic-size`
- deferred decorations/highlights
- cheaper render mode for distant semantic islands

This is much safer than full virtualization because DOM stays present.

This should be the default huge-document posture, not a niche mode.

### 5. Keep heavy overlay systems separate

Decorations, search highlights, diagnostics, and annotations should not force broad text-tree rerenders.

They should be projection layers over the committed snapshot model.

## Where Pretext Fits

`Pretext` should not be part of normal active editing flow.

It is interesting only for huge-document planning:

- estimating inactive island height
- stabilizing offscreen island sizes
- scroll-anchor preservation
- future paged/layout layers

The active editing corridor should still trust real DOM geometry and browser truth.

So the right model is hybrid:

- active zone: DOM truth
- inactive huge-doc planning: optional `Pretext`-backed estimates

## What Chunking Still Might Be Good For

Chunking still has a valid role for:

- huge block-only documents
- coarse paint skipping
- pairing with `content-visibility`
- transitional large-doc optimization before a stronger huge-doc layer exists

But that role should be:

- secondary
- large-doc focused
- downstream of the selector-first runtime

Not:

- a required performance primitive for normal editing

## Proposed v2 Posture

### Default runtime

- no chunking required
- selector-first subscriptions
- stable identity
- local rerender boundaries by data dependency
- semantic islands
- active editing corridor
- default occlusion outside the corridor

### Escalation layer

- optional chunk/container wrappers only where paint cost justifies them
- virtualization remains a separate opt-in layer

## Decision

1. Treat deleted child-count chunking as a historically useful optimization
   pattern, not a live foundational `slate-react` surface.
2. Do **not** make chunking foundational in `slate-react`.
3. Treat chunking in v2 as a secondary optimization inside a runtime that is already designed for huge documents by default.
4. Prioritize benchmarking `#4141`-style rerender breadth against the selector-first runtime before designing any v2 chunk API.

## Concrete Review Questions

1. Do you agree that the old chunking tree was compensating for broad invalidation more than solving a core semantic requirement?
2. Do you agree that `#4141` should become a runtime-subscription benchmark first, not a chunk-API benchmark first?
3. If chunking survives in v2, should it move from “numeric child bucketing” toward “semantic island boundaries”?
4. Would you want the huge-doc optimization layer to stay inside `slate-react`, or be pushed upward into a more optional product/view layer later?
