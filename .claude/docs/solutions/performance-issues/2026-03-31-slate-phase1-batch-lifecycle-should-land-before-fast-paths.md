---
title: Slate batch lifecycle should land before fast paths
date: 2026-03-31
category: docs/solutions/performance-issues
module: Slate batch engine
problem_type: performance_issue
component: tooling
symptoms:
  - "The only proven speedup initially lived behind a narrow exact-path batch prototype, which was the wrong long-term public shape"
  - "Batching semantics were split across `apply`, `addMark`, `removeMark`, and the old exact-path batch flush behavior"
  - "Design discussion kept getting stuck on plugin override compatibility before a generic engine seam existed"
root_cause: missing_tooling
resolution_type: code_fix
severity: high
tags:
  - slate
  - batching
  - apply
  - performance
  - transforms
  - history
  - api-design
---

# Slate batch lifecycle should land before fast paths

## Problem

Slate had already proved a real performance seam for repeated exact-path `set_node` updates, but the only fast implementation was a narrow exact-path batch prototype, which was too narrow to be the permanent design.

The missing piece was a generic batch lifecycle. Without that, every future optimization would stay a one-off API or a wrapper hack.

That seam also needs honest instrumentation. The rule is simple: public lanes
measure wall time through the real engine, and any helper timings live in a
separate breakdown pass.

## Symptoms

- The early exact-path batch prototype showed the speedup, but it did not create a reusable engine seam.
- Plugin-override discussions kept circling around "`editor.apply` vs batch APIs" before there was any generic batch boundary to anchor the design.
- Flush and normalize behavior were duplicated across:
  - `packages/slate/src/core/apply.ts`
  - `packages/slate/src/editor/add-mark.ts`
  - `packages/slate/src/editor/remove-mark.ts`
  - the exact-path batching helpers that now live under
    `packages/slate/src/core/children.ts`

## What Didn't Work

- Jumping straight from the early exact-path batch prototype to a final fast-path design. That skips the boring part that actually makes the engine extensible.
- Treating `applyBatch` as a second plugin seam. That just recreates the same compatibility mess in a different shape.
- Assuming Phase 1 needed to be fast already. It didn’t. Phase 1 needed to be honest.

## Solution

Land the generic lifecycle seam first:

- `Editor.withBatch(editor, fn)`
- `Transforms.applyBatch(editor, ops)`

Phase 1 behavior stays conservative on purpose:

- `Transforms.applyBatch(...)` replays ordinary `editor.apply(op)` inside `Editor.withBatch(...)`
- normalization is deferred until the outer batch boundary
- `onChange` flush is deferred until the outer batch boundary
- `editor.apply` overrides still see each individual op in Phase 1

Implementation shape:

- new batch state in `packages/slate/src/utils/weak-maps.ts`
- shared batch helpers in `packages/slate/src/core/batch.ts`
- `Editor.withBatch(...)` exported via `packages/slate/src/editor/with-batch.ts`
- `Transforms.applyBatch(...)` added in `packages/slate/src/interfaces/transforms/general.ts`
- `packages/slate/src/core/apply.ts` split into reusable internal phases:
  - ref transforms
  - dirty-path updates
  - tree mutation
  - operation finalization
- the exported base `apply` path now dispatches explicitly between normal
  single-op execution and batched execution instead of hiding that choice in one
  monolith
- shared flush scheduling reused by:
  - `apply.ts`
  - `add-mark.ts`
  - `remove-mark.ts`
  - the exact-path draft commit path
- `normalize.ts` queues normalization instead of running it eagerly during a batch
- `packages/slate/test/perf/set-nodes-bench.js` measures real wall time for the
  public lanes and reports helper timings separately

Focused regression coverage:

- `packages/slate/test/with-batch.ts`
- exact-path batch coverage in `packages/slate/test/apply-batch-exact-set-node.ts`
- exact-path history coverage in `packages/slate-history/test/apply-batch-exact-set-node.ts`

## Why This Works

This slice solves the right problem first.

It does **not** try to beat the current optimized exact-path batch timings yet. It creates the engine contract that later fast paths can plug into without inventing another public special case.

It also proves an important compatibility point: Phase 1 batching can preserve the existing `editor.apply` override model because it still replays each op through `editor.apply`. That keeps the design stable while the lower-level batch executor is still being designed.

## Prevention

- Do the seam-laying slice before the fast-path slice. Otherwise every benchmark win turns into another permanent API.
- Keep `Editor.withBatch(...)` as the lifecycle boundary and `Transforms.applyBatch(...)` as the execution entry point. Do not make both of them plugin override seams.
- Keep explicit tests for:
  - deferred normalization
  - deferred flush
  - nested batch behavior
  - `editor.apply` override compatibility
  - manual `Editor.withBatch(...)` loops that call custom `editor.apply`
    wrappers and then read the updated tree
- Keep the benchmark honest. If it swaps in a fake `apply`, it is measuring the
  harness, not Slate.
- Treat the original exact-path batch seam as proof of the performance target, not proof of the final API.

## Related Docs

- [2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md)
- [slate-batch-engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/slate-batch-engine.md)
