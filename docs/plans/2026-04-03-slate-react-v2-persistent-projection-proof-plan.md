---
date: 2026-04-03
topic: slate-react-v2-persistent-projection-proof-plan
status: completed
---

# Slate React v2 Persistent Projection Proof Plan

## Goal

Extend the `slate-react-v2` projection store so persistent annotation layers can
use durable `RangeRef`s directly instead of pretending every overlay is an
ephemeral `Range`.

## Working Hypothesis

The smallest honest public cut is:

- keep projection ownership in `slate-react-v2`
- allow each projection target to be either:
  - a plain `Range`
  - a durable `RangeRef`
- keep external add/remove of anchors explicit through existing `refresh()`

That gives persistent overlays a first-class path without inventing a comment
model or pushing overlay state into `slate-v2`.

## Proof Priorities

1. a persistent anchor based on `RangeRef` stays projected after text edits
2. a persistent anchor rebases across fragment insertion
3. removing the anchor plus `refresh()` removes the projection
4. unrelated slices still do not rerender

## Phases

### Phase 0

Freeze the projection target shape.

### Phase 1

Write the first failing runtime tests for `RangeRef`-backed projections.

### Phase 2

Implement the minimal store/type changes.

### Phase 3

Verify, deslop, re-verify, architect review, cleanup.

## Progress Log

### 2026-04-03

- grounded the seam from the approved projection proof and the approved
  `slate-v2` range-ref proof
- first attempt extended the headless projection store with direct `RangeRef`
  support
- architect rejected that boundary:
  persistent `RangeRef` integration was React-shaped, not headless-store-shaped
- fixed the seam by:
  - reverting the headless store to raw `Range` projections only
  - adding `useSlateRangeRefProjectionStore(editor, projections)` in
    `slate-react-v2`
  - making `refresh()` force-invalidating for explicit external refreshes
  - updating runtime tests to use rerendered anchor props instead of manual
    store refresh after `unref()`
- fresh verification evidence:
  - `zsh -lc 'yarn workspace slate-react-v2 test'`
  - `zsh -lc 'yarn build:rollup'`
  - `zsh -lc 'yarn lint:typescript'`
  - LSP diagnostics `0` on changed files
- final architect verdict: `APPROVE`
- reusable note captured in:
  [2026-04-03-persistent-range-ref-projections-belong-in-a-react-hook-not-the-headless-store.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-persistent-range-ref-projections-belong-in-a-react-hook-not-the-headless-store.md)
