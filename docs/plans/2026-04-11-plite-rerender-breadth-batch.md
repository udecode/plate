---
date: 2026-04-11
topic: plite-rerender-breadth-batch
status: completed
source_repos:
  - /Users/zbeyens/git/plite
  - /Users/zbeyens/git/plate-2
---

# Plite Rerender Breadth Batch

## Goal

Measure whether `plite-react` still has broad invalidation in the three issue
families we care about before escalating to islands:

- `#5131` selection-driven breadth
- `#3656` many-leaf breadth inside one block
- `#4141` ancestor-chain breadth on deep edits

## Kept Work

- added [slate-react-rerender-breadth-benchmark.tsx](/Users/zbeyens/git/plite/scripts/benchmarks/browser/react/rerender-breadth.tsx)
- added `pnpm bench:react:rerender-breadth:local` in
  [package.json](/Users/zbeyens/git/plite/package.json)

The lane reuses the same render-count ideas already present in
[runtime.tsx](/Users/zbeyens/git/plite/packages/plite-react/test/runtime.tsx),
but writes stable JSON to
`packages/plite-react/tmp/slate-react-rerender-breadth-benchmark.json`.

## Result

### `#5131` selection-driven breadth

- `usePlite()` subscriber rerenders once per selection change:
  - `20` selection changes -> `20` broad rerenders
- `usePliteSelection()` subscriber rerenders once per selection change:
  - `20` selection changes -> `20` selection rerenders
- unrelated top-level block slices:
  - left block rerenders: `0`
  - right block rerenders: `0`

### `#3656` many-leaf breadth

- edited leaf rerenders: `1`
- sibling leaves rerender: `0`
- parent block rerenders: `0`

### `#4141` deep ancestor breadth

- deep edited leaf rerenders: `1`
- rerendered ancestors: `0`
- sibling branch rerenders: `0`

### annotation-backed widget breadth

- edited left text rerenders: `1`
- inline projection rerenders: `1`
- annotation sidebar rerenders: `1`
- annotation-backed widget rerenders: `1`
- unrelated right text rerenders: `0`
- edit mean: `0.29ms`

## Verdict

The runtime is mostly green on local invalidation.

The only broad thing still showing up is the broad hook itself:
`usePlite()` rerenders on selection changes because it is subscribed to the
whole snapshot version.

That means the next honest move is **not** another generic rerender-breadth
cleanup pass. The next honest move is **Phase 4**:

- semantic islands
- active editing corridor
- adaptive occlusion

If `usePlite()` broadness becomes a product problem later, that is a narrower
hook-contract decision, not evidence that descendant invalidation is still
failing across the runtime.

The overlay family read is broader now too:

- decoration-source toggle locality is explicit
- hidden-pane `Activity` resume behavior is explicit
- annotation-backed widget rebasing is explicit
