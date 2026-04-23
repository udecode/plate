---
title: Plate `nodeId` should use `setNodesBatch` only for live normalization
date: 2026-03-31
category: docs/solutions/performance-issues
module: NodeId normalization
problem_type: performance_issue
component: tooling
symptoms:
  - "Plate had a fast pure initial-value `nodeId` normalization path and a slower live transform path that still called `setNodes` once per node"
  - "Porting the new Slate-side batch API into Plate risked collapsing those two paths into one abstraction and dragging editor operations into initialization"
  - "The local `@platejs/slate` wrapper needed a production-safe batch seam without pretending it could transparently reuse Slate private internals"
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - plate
  - slate
  - nodeid
  - set-node
  - batching
  - history
  - normalization
  - performance
---

# Plate `nodeId` should use `setNodesBatch` only for live normalization

## Problem

Plate needed the new batched `set_node` fast path inside its local
`@platejs/slate` package, but `nodeId` had two different workloads:

- initial-value normalization, where the plugin already owns `editor.children`
- live normalization, where the plugin intentionally uses editor transforms

Those workloads look similar on paper and they are not the same seam. Reusing
the public batch API for both would have made initialization noisier and less
honest.

## Symptoms

- `nodeId` already had a good pure initial-value path through
  `transformInitialValue`, but the live `nodeId.normalize()` transform still
  paid the per-node `setNodes` cost.
- The new `setNodesBatch` API lived in Plate's local `packages/slate`, not only
  in the separate `../slate-v2` prototype repo, so the adoption work could happen
  immediately.
- Plate's local Slate wrapper does not expose Slate's private dirty-path weak
  maps, so a direct copy of the upstream prototype would have been half true and
  half bullshit.

## What Didn't Work

- Replacing the `nodeId` initial-value transform with
  `editor.tf.setNodesBatch(...)`. That would manufacture operations, history
  boundaries, and change notifications during initialization even though the
  plugin already owns the initial value.
- Pretending the local `@platejs/slate` package could safely deep-import Slate
  private internals for dirty-path updates. The published `slate` package ships
  a bundled runtime, not a clean public deep-import surface for those helpers.

## Solution

Keep the abstractions honest.

### 1. Add `editor.tf.setNodesBatch(...)` to `@platejs/slate`

The local Slate package now exposes an explicit exact-path batch API. It keeps
the one-pass tree rewrite from the upstream prototype and records ordinary
`set_node` operations for history and change detection.

The focused tests live in:

- [setNodesBatch.spec.tsx](/Users/zbeyens/git/plate-2/packages/slate/src/internal/transforms/setNodesBatch.spec.tsx)
- [with-history.spec.tsx](/Users/zbeyens/git/plate-2/packages/slate/src/slate-history/with-history.spec.tsx)

### 2. Keep history behavior explicit

`withHistory` now understands `setNodesBatch` as one logical change:

- merge into the current undo batch when the current tick is still open
- start a new batch inside `withNewBatch`
- honor `withoutSaving`

That keeps the batch API fast without pretending it is the same thing as a loop
of ordinary `apply(...)` calls.

### 3. Use the batch API only for live `nodeId.normalize()`

The `nodeId` plugin now collects missing-id updates first and applies them with
one `editor.tf.setNodesBatch(...)` call under `withoutSaving`.

`transformInitialValue` stays on the pure returned-value path, controlled by the
`initialValueIds` option.

That split matters:

- live normalization is a transform problem, so the transform API is the right
  seam
- initial normalization is a value-ownership problem, so a pure value transform
  is the right seam

## Why This Works

The speedup comes from rewriting shared ancestors once instead of once per
`set_node` operation.

The semantic win comes from not overusing that API. `setNodesBatch` is a
runtime transform surface. Initial normalization is not.

The local Plate port keeps the fast rewrite, saves history explicitly, and runs
a local dirty-path normalization queue for the batch. That keeps the feature
production-safe without lying about access to Slate internals.

The local micro-benchmark kept the real performance win on a flat huge-document
shape:

| Blocks | `setNodes` | `setNodesBatch` | Speedup |
| ------ | ---------- | --------------- | ------- |
| `1000` | `18.56 ms` | `2.63 ms`       | `7.05x` |
| `5000` | `118.54 ms`| `4.92 ms`       | `24.10x` |

## Prevention

- If a plugin already owns `editor.children` during initialization, do not
  route that work back through editor operations just to reuse a runtime API.
- Keep exact-path batch APIs explicit. They are valuable because they are
  stricter than broad traversal transforms, not because they hide inside them.
- When porting upstream transform work into Plate's local Slate wrapper, verify
  what private Slate machinery is actually reachable from the published package
  before assuming parity.
- Keep focused tests around history behavior. Undo bugs are where "fast"
  optimizations go to die.

## Related Issues

- Related learning: [2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-03-31-slate-applybatch-should-own-the-exact-path-set-node-fast-path.md)
- Related learning: [plate-vs-slate-benchmarks.md](/Users/zbeyens/git/plate-2/docs/performance/plate-vs-slate-benchmarks.md)
