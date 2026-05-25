---
title: Slate v2 huge-document paste should not rerender unchanged descendants
date: 2026-04-06
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: tooling
symptoms:
  - "The frozen huge-document benchmark still had Slate v2 losing badly on paste even after clipboard and core insert experiments"
  - "Engine-only `insertFragment` timing was roughly `1-2ms`, which did not match the browser benchmark bill"
  - "Top-level prepends caused unchanged text segments under `EditableBlocks` to rerender"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate
  - slate-v2
  - slate-react-v2
  - performance
  - paste
  - render
  - benchmark
  - runtime
---

# Slate v2 huge-document paste should not rerender unchanged descendants

## Problem

The huge-document browser lane kept showing Slate v2 losing on paste even after
the earlier clipboard and core insert experiments.

The trap was that the engine looked guilty because paste is an engine-shaped
operation. The measurements said otherwise.

## Symptoms

- `yarn bench:phase6:huge-document:local` previously showed v2 paste around the
  mid-`70ms` range while legacy sat around the high-`40ms` range
- a direct engine-only probe against `slate-v2` showed `insertFragment(...)`
  for the `200`-line payload costing about `1.5ms`
- a focused runtime proof showed that prepending top-level blocks through
  `EditableBlocks` rerendered unchanged trailing text segments

## What Didn't Work

- adding a dedicated multiline plain-text insert seam in `slate-v2`
- pushing harder on snapshot publication / index rebuild in `slate-v2`
- assuming the browser benchmark loser must still live in the core because the
  slow operation was "paste"

Those cuts made the architecture cleaner, but they did not move the benchmark
enough to keep.

## Solution

Keep the engine path as-is and cut the runtime rerender churn in
[`editable-text-blocks.tsx`](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/editable-text-blocks.tsx):

- wrap `EditableDescendantNode` in `React.memo(...)`
- stop treating path changes as mandatory subscriptions for every descendant
- only subscribe to `currentPathKey` when the caller actually needs path-based
  rendering data, such as `renderElement` or placeholder ownership

Add a focused runtime proof in
[`runtime.tsx`](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/test/runtime.tsx):

- prepending top-level blocks must not rerender unchanged trailing text
  segments under `EditableBlocks`

Measured result on the frozen huge-document lane after the kept cut:

- legacy paste mean: `48.13ms`
- v2 paste mean: `34.92ms`
- delta mean: `-13.21ms`

That is a real win, not noise.

## Why This Works

`EditableBlocks` only needs a structural rerender when the top-level runtime-id
list actually changes.

Before the fix, that structural rerender still forced the descendant render
spine to do extra work:

- the parent rerender recreated every `EditableDescendantNode`
- the descendant node was not memoized
- every descendant also subscribed to `currentPathKey`, so a prepend changed the
  path for all existing top-level descendants even when their text and child
  runtime ids were unchanged

That turned a top-level prepend into a broad React rerender even though the
engine mutation itself was cheap.

After the fix:

- unchanged descendants survive the parent structural rerender
- unchanged descendants do not self-rerender just because their path shifted
- path-driven rerenders still happen where path data is actually part of the
  rendering contract

So the runtime finally matches the transaction-first engine model instead of
fighting it.

## Prevention

- when a browser benchmark says "paste is slow", measure the engine path
  directly before rewriting core semantics
- if the engine is cheap, look for path-only or structure-only React rerenders
  before inventing new operations
- selector subscriptions are not enough on their own; structural parents still
  need memoized descendants or they will re-execute the whole subtree anyway
- treat path subscriptions as opt-in runtime data, not default baggage for every
  descendant

## Related Issues

- Related benchmark doc:
  [phase6-hardening.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/phase6-hardening.md)
- Related learning:
  [2026-03-31-slate-phase1-batch-lifecycle-should-land-before-fast-paths.md](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-03-31-slate-phase1-batch-lifecycle-should-land-before-fast-paths.md)
