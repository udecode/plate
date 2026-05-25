---
date: 2026-04-03
topic: slate-v2-final-synthesis
---

# Slate v2 Final Synthesis

> Archive only. Historical/reference doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the settled read after the comparison pass.

It answers one question:

- what is the best `slate-v2` direction after looking at the actual alternatives instead of fantasizing about them?

## Status

Historical synthesis doc.

Use this for why the architecture settled where it did.
Do not use it as the live release verdict, live family ledger, or live queue.

For current truth, start with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## Inputs

- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [cohesive-program-plan.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/cohesive-program-plan.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [slate-v2-plate-v2-architecture-research.md](/Users/zbeyens/git/plate-2/docs/analysis/slate-v2-plate-v2-architecture-research.md)
- [slate-v2-gap-matrix.md](/Users/zbeyens/git/plate-2/docs/analysis/slate-v2-gap-matrix.md)

## What The Comparison Work Confirmed

1. Keep the split package architecture.

   - `slate`
   - `slate-dom`
   - `slate-react`
   - `slate-history`

2. Keep `slate-v2` data-model-first and op-first externally.

3. Keep transactions as the internal execution model.

4. Keep `slate-react` explicitly React `19.2+`, selector-first, and snapshot-driven.
   Large-document behavior is part of the default runtime target, not a later courtesy pass.

5. Keep `slate-dom` as the browser boundary owner.

6. Keep history transaction-aware and separate from the core runtime.

7. Keep adapters explicit.
   Headless references were useful, but none of them justified collapsing ownership back into one bucket.

## What The Comparison Work Rejected

1. Do not collapse everything into a single headless package.
   `edix` was useful. It was not a blueprint for the whole stack.

2. Do not pivot the core toward ProseMirror or Lexical-style identity/model semantics.
   They validated package discipline and update semantics, not a full ontology swap.

3. Do not treat Tiptap packaging wins as engine wins.
   That belongs to future `plate-v2`, not `slate-v2`.

4. Do not move pagination, measurement, or page composition into `slate-v2`.
   `Pretext` and `Premirror` made that line much clearer, not fuzzier.

5. Do not pull semantic-service architecture into `slate-v2`.
   `TanStack DB`, `urql`, `VS Code`, and `LSP` all point upward into `plate-v2`.

6. Do not treat lightweight text surfaces as a reason to dilute Slate core.
   `rich-textarea` is a good native-surface model.
   `markdown-editor` is a good warning.

7. Do not treat `EditContext` as magic.
   It is a future DOM/input candidate, not a substitute for selection, clipboard, accessibility, or undo.

## The Settled Package Read

### `slate`

Owns:

- document semantics
- operations
- transactions
- immutable committed snapshots
- runtime identity sidecar

Does not own:

- DOM translation
- React subscription policy
- pagination
- semantic-service architecture

### `slate-dom`

Owns:

- DOM point/path translation
- selection bridge
- composition and `beforeinput`
- clipboard browser boundary
- nested editor and shadow DOM rules

Later import worth watching:

- `EditContext`, if browser support and accessibility story become strong enough

### `slate-react`

Owns:

- snapshot store wiring
- selector subscriptions
- stable editor instance semantics
- controlled replacement
- React-lifecycle wiring for the DOM bridge
- default large-document-safe rendering posture

Does not own:

- browser semantics
- DOM point translation
- effect-driven editor mirroring

Default posture:

- active-slice invalidation
- semantic render islands
- active editing corridor
- default occlusion outside the corridor

Measurement split:

- active corridor uses live DOM geometry
- inactive islands may use deterministic planning geometry
- `Pretext` is a candidate for that planning layer, not a replacement for DOM truth

Not:

- broad rerender then rescue it with chunking

### `slate-history`

Owns:

- transaction-aware undo units
- grouping rules
- committed-state restore

Later import worth watching:

- ProseMirror-style selection bookmarks
- Lexical-style update tags and dirty summaries

## The Remaining Slate v2 Structural Work

The original open structural seams are now proved in code:

- explicit clipboard boundary
- render-time projection store
- durable range refs
- persistent `RangeRef`-backed projections
- zero-width DOM selection bridge normalization
- packaged `slate-react` renderer/runtime stack through `EditableBlocks`
- mixed-inline fragment semantics:
  - one-block
  - multi-block top-level
- explicit-at rebasing for the current proved mixed-inline shapes
- nested simple block-container fragment semantics
- nested simple block-container explicit-at rebasing
- nested mixed-inline block-container fragment semantics
- nested mixed-inline block-container explicit-at rebasing
- richer-inline descendant block geometry via recursive text-leaf mapping
- richer-inline explicit-at rebasing at top level and inside nested containers
- top-level wrapper block units around paragraph descendants
- wrapper units that mix paragraph and nested-list descendants
- wrapper units that mix paragraph and quote descendants
- wrapper units that mix paragraph, nested-list, and quote descendants
- sibling complex wrapper-list fragments built from already-proved list-item units
- sibling complex wrapper-list fragments still hold when those inner child
  containers become multi-block
- nested wrapper stacks that still reduce to the current inner block geometry
- deeper wrapper stacks that still reduce to the current inner block geometry
- direct default-stack browser proof on `rich-inline` now covers:
  - type/edit
  - copy/paste
  - undo/redo
  - reset/load
  - blur/focus selection recovery
  - one outer transaction as one history step

## Execution Hand-Off

Use this file for settled architecture, not queue ownership.

Current operating rule:

1. use [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md) for the live verdict
2. use [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md) for the live family truth
3. use [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) for the live evidence board
4. use [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md) only if package-level or `Target B` work reopens

Current durable read:

- the narrowed replacement gate is green:
  - `Target A`: `Go`
- the blanket replacement gate is still red:
  - `Target B`: `No-Go`
- the default recommendation is explicit:
  - `Slate`
  - `EditableBlocks`
  - `withHistory(createEditor())`
- large-document behavior remains part of the default runtime target
- performance wording remains intentionally limited to the frozen placeholder
  and huge-document lanes
- next work should be:
  - implementation
  - shipping
  - or selective `Target B` family work

Historical slice-by-slice execution chronicle is intentionally omitted here.
That history lives in the repo plan docs and git history, not in the front-door
architecture read.
`Path | Point | Range | null` support plus exact node-range selection from
paths and collapsed selection creation from points

- the next `delete(...)` starter slice is now real too:
  exact `{ at: Path }` support plus live draft-tree deletion inside outer
  transactions
- the next collapsed `delete(...)` follow-on is now real too:
  `reverse` / `distance`, explicit `Point`, current collapsed selection
  support, mixed-inline sibling-leaf crossings inside one supported top-level
  block, and `Editor.before(...)` / `Editor.after(...)`-backed targeting
- the next cross-block collapsed `delete(...)` follow-on is now real too:
  adjacent supported top-level block-boundary crossings with same-type /
  same-props block merges
- the next explicit-range `delete(...)` follow-on is now real too:
  explicit non-empty `Range`, current non-empty selection when `at` is omitted,
  and adjacent mixed-inline sibling-leaf crossings inside one supported
  top-level block
- the next cross-block explicit-range `delete(...)` follow-on is now real too:
  adjacent supported top-level block-boundary crossings with same-type /
  same-props block merges
- the next wider mixed-inline-range `delete(...)` follow-on is now real too:
  fully covered interior descendants between the start/end edges inside one
  supported top-level block
- the roadmap/doc stack is now coherent enough to stop default roadmap grooming
- the default next work is implementation or shipping, not more roadmap churn

Strong rule:

- do not pretend FEFF-like sentinels can die everywhere until the renderer and IME proofs say so
- do not confuse “more tests” with “better tests”
- the testing roadmap should optimize for meaningful public-behavior coverage, not vanity percentages
- do not spend proof budget on cousin geometry unless a later lane actually
  forces it

## What Belongs To Plate v2 Instead

The comparison work made this much clearer.

### 1. Layout And Pagination

- deterministic measurement
- page composition
- paged editing UX

This is where `Pretext` still points mostly upward into `plate-v2`.

But the comparison work also says one narrower thing for `slate-react`:

- use `Pretext` selectively for inactive-region planning
- do not turn it into the active editing geometry source

## Replacement Candidate Posture

The current repo split is now explicit:

- `/Users/zbeyens/git/slate-v2` is the replacement candidate
- `/Users/zbeyens/git/slate` is the legacy oracle for semantics, benchmarks,
  and comparison only
- the replacement candidate already runs on the modern runtime baseline:
  React `19.2` and Next `16.2.2`

That means future comparison work should not re-import legacy package surfaces
into the replacement repo.

### 2. Semantic-Service Layer

- diagnostics
- completions
- analyzers
- AI tooling
- relation-aware derived views

This should probably smell like:

- TanStack DB projections
- urql-style execution stages
- VS Code per-feature hosting
- LSP-shaped service contracts

### 3. Lightweight Native Surfaces

- decorated textareas
- native suggestions
- masking
- rich-enough inputs that should never become full Slate editors

This should bias toward:

- native `input` / `textarea`
- overlay or future platform primitives
- Open UI Richer Text Fields

Not:

- contenteditable hack stacks by default

## Bottom Line

The best `slate-v2` did not get more exotic after comparison.

It got stricter.

And the executed proof stack has kept pushing in the same direction:

- prove one sharper document shape at a time
- package only what the browser proofs made true
- refuse fake generality until the next geometry seam is actually green

The final read is:

- keep the core boring and strong
- keep the package boundaries explicit
- keep top-level docs synced to real proof status
- use [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/package-end-state-roadmap.md)
  as the gate for future package slices
- make active-slice performance the default runtime posture
- do not let Plate concerns leak downward
- treat the remaining zero-width question as renderer and IME policy, not generic bridge confusion

That is the highest-confidence `slate-v2` direction we have now.
