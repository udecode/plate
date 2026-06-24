---
date: 2026-04-03
topic: slate-react-v2-projection-proof-plan
status: completed
---

# Plite React v2 Projection Proof Plan

## Goal

Prove the first real runtime answer for decorations and selection-anchored
annotation overlays without smearing projection state back into `plite`.

The proof should show:

- `plite` owns pure range semantics and range-to-text-slice projection
- `plite-react-v2` owns the projection store and local subscription policy
- unrelated text slices do not rerender when overlay state changes elsewhere
- selection-anchored overlays can derive from committed snapshot state without
  global `decorate` churn

## Grounded Scope

- Primary owner:
  - `plite-react-v2`
- Secondary owner:
  - `plite` for pure range projection helpers only
- Explicitly out of scope:
  - persistent comment storage
  - full range-ref or bookmark semantics
  - DOM geometry and floating-position logic
  - browser selection repair
  - virtualization
  - full legacy `decorate` parity

## Why This Slice

The issue corpus is not subtle here:

- `#4483` is a renderer invalidation problem, not “decorations are vaguely slow”
- `#4477` says selection-anchored comment overlays are a real product seam
- `#5987` says async decoration updates must not destabilize the caret
- `#4392`, `#3382`, and `#3352` say cross-node projection is part of the shape,
  even if this first proof stays narrower

The current code also makes the next move obvious:

- `plite-react-v2` already has selector subscriptions and almost nothing else
- `plite` snapshots expose ids, paths, selection, and marks, but no overlay
  projection seam yet
- there is no honest way to prove local overlay subscriptions without adding a
  first-class projection layer

## Chosen Proof

### `plite`

Add one pure helper:

- `Editor.projectRange(editor, range)`

It returns per-text local segments keyed by runtime id.

The helper is semantic, not renderer-owned:

- input: logical Plite `Range`
- output: local text slices like `{ runtimeId, path, start, end }`
- no DOM
- no React
- no overlay storage

### `plite-react-v2`

Add one projection store:

- `createPliteProjectionStore(editor, source)`

Where `source(snapshot)` returns logical overlay ranges.

The store:

- recomputes when the editor snapshot commits
- can be refreshed when external decoration inputs change
- projects logical ranges through `Editor.projectRange(...)`
- publishes local slices by runtime id

Add one hook:

- `usePliteProjections(runtimeId)`

And wire the optional store through `<Plite ...>`.

## Why This Wins

This cut is small, honest, and future-proof enough:

- core keeps only pure document/range meaning
- React owns the projection cache and subscription breadth
- selection-anchored overlays can derive from snapshot state directly
- dynamic decorations from external state can invalidate the store explicitly
- the same seam can grow later toward async decoration sources, annotation
  layers, and eventually range refs if we need persistent anchors

## Rejected Shapes

### 1. Put overlay state in `EditorSnapshot`

Rejected because that makes core carry render-time junk it should not own.

### 2. Add a `decorate` prop directly to `<Plite>`

Rejected for the first proof because it reintroduces effect-mirroring pressure
and hides the real seam inside React component props.

### 3. Build persistent annotation anchors first

Rejected because that needs range-ref or bookmark semantics and will bloat the
first proof.

## TDD Plan

### Red 1

Add a `plite-react-v2` runtime test proving projection subscriptions stay
slice-scoped when projection output changes for one runtime id only.

Expected failure:

- `usePliteProjections(...)` does not exist
- no projection store exists

### Green 1

Implement the minimal projection store and hook until the local-rerender test
passes.

### Red 2

Add a runtime test proving a selection-derived annotation overlay source tracks
committed selection changes and only rerenders the affected text slices.

Expected failure:

- no `Editor.projectRange(...)`
- or no selection-driven projection recompute path

### Green 2

Implement pure range segmentation in `plite` and wire store recomputation on
editor commits.

### Refactor

Only after both tests pass:

- simplify projection data shape
- strip accidental abstraction
- keep cross-node ambitions out of the first proof unless the tests force it

## Initial Findings

1. `plite-react-v2` currently exposes only:
   - `Plite`
   - `usePliteSelector`
   - DOM ref hooks
   - replace hook
2. `usePliteSelector` already proves the subscription model; the missing piece
   is a second external store for overlays, not a new React philosophy.
3. `plite` already has stable runtime ids in `snapshot.index`, so the right
   overlay key is obvious.
4. The first proof should target selection-derived overlays and external-state
   decorations, not persistent comment models.

## Execution Phases

### Phase 0: Freeze the proof seam

- write this plan
- keep the proof smaller than “full comment system”

Acceptance:

- chosen seam is core projection + React store
- persistent anchors are explicitly deferred

### Phase 1: Write the red runtime tests

- add a local projection breadth test
- add a selection-derived annotation projection test

Acceptance:

- both fail for the expected missing-surface reasons

### Phase 2: Add the pure core helper

- implement `Editor.projectRange(editor, range)`
- keep it pure and snapshot-driven

Acceptance:

- tests can derive local segments without reading DOM or mutable editor fields

### Phase 3: Add the React projection store

- implement `createPliteProjectionStore(editor, source)`
- implement `usePliteProjections(runtimeId)`
- wire the store through `Plite` context

Acceptance:

- overlay updates rerender only intersecting runtime ids
- selection-derived overlays recompute on commit

### Phase 4: Verify and compound

- run focused runtime tests
- run focused `plite` tests if new pure helper needs them
- run diagnostics on touched files
- if the proof taught something reusable, write a solution note

## Progress Log

### 2026-04-03

- reloaded the v2 runtime docs and issue pressure after compaction
- confirmed the current seam is tiny: selector store exists, projection store does not
- chose the first proof cut:
  `Editor.projectRange(...)` plus a React-owned projection store
- landed the proof in `Plate repo root`:
  - `plite` pure range projection
  - `plite-react-v2` projection store, context wiring, and local projection hook
- verified with:
  - `npx -y node@20 /opt/homebrew/Cellar/yarn/1.22.22/libexec/bin/yarn.js workspace slate-react-v2 test`
  - `npx -y node@20 /opt/homebrew/Cellar/yarn/1.22.22/libexec/bin/yarn.js mocha --require ./config/babel/register.cjs ./packages/plite-v2/test/snapshot-contract.ts`
  - LSP diagnostics on all changed files
- captured the reusable seam rule in:
  [2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md)
