---
title: Slate applyBatch should own exact-path set_node batching behind editor.apply
date: 2026-03-31
category: docs/solutions/performance-issues
module: Slate batch engine
problem_type: performance_issue
component: tooling
symptoms:
  - "`Transforms.applyBatch(...)` needed exact-path `set_node` speed without bringing back a second public batch API"
  - "Custom `editor.apply` wrappers still had to see each operation in order"
  - "Benchmark numbers became nonsense when the harness replaced `editor.apply` with a copied implementation"
root_cause: missing_tooling
resolution_type: code_fix
severity: high
tags:
  - slate
  - batching
  - applyBatch
  - apply
  - performance
  - set-node
  - benchmark
---

# Slate applyBatch should own exact-path set_node batching behind editor.apply

## Problem

Slate needed exact-path `set_node` batching in the old `setNodesBatch` performance class, but the public surface had to stay:

- `editor.apply(op)`
- `Editor.withBatch(editor, fn)`
- `Transforms.applyBatch(editor, ops)`

The wrong answers were obvious:

- no second public exact-path batch API
- no array-based `editor.apply`
- no “safe wrapper” side-channel that plugin authors would need to learn

The engine also needed to preserve two real semantics:

- transparent `editor.apply` wrappers still see each op in order
- previously published node refs stay immutable even when later ops touch the same logical node

## Solution

Keep batching behind `editor.apply` and move exact-path `set_node` speed into a private draft plus snapshot model:

- `Editor.withBatch(...)` owns the lifecycle boundary
- `Transforms.applyBatch(...)` just runs through that boundary
- `applyOperationInBatch(...)` stages exact-path `set_node` ops into draft state
- `editor.children` is accessor-backed through `packages/slate/src/core/children.ts`
- external reads during a batch are an observation barrier:
  - the live draft is normalized in place
  - normalize-generated ops still flow through `editor.apply` wrappers
  - internal engine reads bypass that barrier so the engine does not self-observe
- non-`set_node` tree ops now write to a generic private draft root instead of committed children
- mixed exact-set-node + structural-op batches promote from the exact-set-node overlay into that generic draft root
- once observation has promoted text state into generic draft children, later `insert_text` and `remove_text` ops still apply through `applyTextBatchToChildren(...)` instead of falling back to generic `Transforms.transform(...)`
- default explicit-path `Transforms.mergeNodes(editor, { at })` now fast-paths direct previous-sibling merges, which trims normalize-heavy text observation without widening the public seam
- observed text-sibling `merge_node` ops generated during live normalize no longer requeue live merge dirty paths after the parent normalizer already handled that paragraph

The exact-set-node tree rewrite lives in:

- `packages/slate/src/core/batching/exact-set-node-children.ts`

The important architectural point is that batching stays an engine concern. Plugin authors still only deal with `editor.apply(op)`.

## What mattered

Two details made the difference.

### 1. The benchmark had to stop lying

The first version of `packages/slate/test/perf/set-nodes-bench.js` wrapped `editor.apply` with a copied implementation of the old single-op phases. That completely broke the new one-seam architecture and made `applyBatch(...)` look much slower than it really was.

The fix was simple:

- real benchmark lanes measure wall time only
- helper timings live in a separate breakdown pass
- benchmark code never swaps in a fake `apply`

### 2. Draft staging had to stop copying the op list

The first draft implementation appended staged `set_node` ops like this:

```ts
BATCH_EXACT_SET_NODE_OPS.set(editor, [...ops, op]);
```

That is brutal at `5,000` ops because it turns staging into `O(n²)` array copying.

The fix is to mutate the private draft array in place:

```ts
const ops = BATCH_EXACT_SET_NODE_OPS.get(editor);

if (ops) {
  ops.push(op);
} else {
  BATCH_EXACT_SET_NODE_OPS.set(editor, [op]);
}
```

Because the array is internal draft state, mutating it is correct. The published immutable contract applies to nodes and snapshots, not to hidden batch bookkeeping.

## Result

Verified on `packages/slate/test/perf/set-nodes-bench.js` at `5,000` blocks:

| Lane                                                                  | Flat       | Grouped    |
| --------------------------------------------------------------------- | ---------- | ---------- |
| `Transforms.setNodes(...)` inside `Editor.withoutNormalizing(...)`    | `63.26 ms` | `36.35 ms` |
| `editor.apply(set_node)` loop inside `Editor.withoutNormalizing(...)` | `55.29 ms` | `6.73 ms`  |
| `Transforms.applyBatch([...set_node])`                                | `4.17 ms`  | `4.38 ms`  |

Helper breakdown for the exact-path batch lane:

- flat:
  - `refs`: `0.24 ms`
  - `dirtyPaths`: `0.72 ms`
  - `stage`: `0.14 ms`
  - `finalize`: `0.26 ms`
  - `materialize`: `0.39 ms`
  - `commit`: `0.39 ms`
- grouped:
  - `refs`: `0.13 ms`
  - `dirtyPaths`: `1.01 ms`
  - `stage`: `0.03 ms`
  - `finalize`: `0.23 ms`
  - `materialize`: `0.50 ms`
  - `commit`: `0.38 ms`

That puts the one-seam design back in the right performance class without bringing back a public `setNodesBatch(...)`.

The newer mixed and generic lanes make the remaining gap obvious too:

| Lane                                                                                                               | Flat / Empty |
| ------------------------------------------------------------------------------------------------------------------ | ------------ |
| `Transforms.applyBatch([...set_node, insert_node])` on flat `5,000` blocks                                         | `6.49 ms`    |
| `Transforms.applyBatch([...set_node, ...move_node])` on flat `5,000` blocks                                        | `123.63 ms`  |
| `Transforms.applyBatch([...insert_node])` on an empty `5,000`-node build-up                                        | `394.97 ms`  |
| `Transforms.applyBatch([...prepend insert_node])` on an empty `5,000`-node build-up                                | `380.33 ms`  |
| `editor.apply(insert_node)` loop inside `Editor.withoutNormalizing(...)` on an empty `5,000`-node build-up         | `2551.51 ms` |
| `editor.apply(prepend insert_node)` loop inside `Editor.withoutNormalizing(...)` on an empty `5,000`-node build-up | `2617.48 ms` |

That made the next target clearer:

- the widened same-parent `insert_node` cut is worth keeping
- it now handles prepend and other non-monotonic same-parent insert batches too
- append-heavy and prepend-heavy empty-document build-up both stay roughly `6x` to `7x` faster than replay
- insert-heavy workloads are still much slower than exact-path `set_node`, but they are no longer the kind of replay-class cliff that forces another public seam

The mixed-batch planner also earned its keep:

- `Transforms.applyBatch([...set_node, ...move_node])` on flat `5,000` blocks now lands at `123.63 ms`
- the pre-planner exploratory control for the same shape was `3129 ms`
- the first planner pass alone only cut that lane to `1603.58 ms`
- the real fix was specializing same-parent move dirty-path carry-over so dense child-path sets get remapped directly instead of replay-transforming every prior dirty path through every move op

The widened structural lanes made the real priority order obvious too:

| Lane                                 | Replay inside `Editor.withoutNormalizing(...)` | `Transforms.applyBatch(...)` |
| ------------------------------------ | ---------------------------------------------- | ---------------------------- |
| `split_node` on flat `5,000` blocks  | `9299.46 ms`                                   | `136.67 ms`                  |
| `merge_node` on flat `5,000` blocks  | `2820.19 ms`                                   | `77.89 ms`                   |
| `move_node` on flat `5,000` blocks   | `1692.25 ms`                                   | `126.46 ms`                  |
| `remove_node` on flat `5,000` blocks | `8.79 ms`                                      | `8.09 ms`                    |

That changed the roadmap again:

- `move_node` is no longer replay-class
- same-parent move dirty-path batching was enough to collapse the hot flat move lane without bypassing `editor.apply`
- `split_node` and `merge_node` stay expensive enough to revisit, but they are no longer the kind of fire that forces an immediate seam rewrite
- `insert_node` on empty-document build-up is still the slowest specialized single-family benchmark lane, but not enough to justify another public API
- mixed `set_node` plus `move_node` is no longer the planner-era hotspot once carried dirty paths are remapped directly
- `remove_node` still does not justify a dedicated optimizer

The next useful asymmetry was merge-specific:

- direct text `split_node` already had a private draft tree rewrite
- direct text `merge_node` did not
- merge batching was therefore only batching dirty paths while still paying per-op tree rewrites

The winning cut was to give distinct-parent text merges the same private draft shape as distinct-parent text splits:

- stage only direct text merges at depth `2`
- require distinct parent indexes inside the staged batch
- materialize through one helper that rewrites each touched paragraph once
- keep dirty-path batching exactly as before

That matters because it improves the real work instead of more planner bookkeeping.

Verified on the same `5,000`-block harness:

| Lane                                                                                             | Before      | After      |
| ------------------------------------------------------------------------------------------------ | ----------- | ---------- |
| `Transforms.applyBatch([...merge_node])` on flat merged-text blocks                              | `65.8 ms`   | `12.74 ms` |
| manual `Editor.withBatch([...merge_node])` on flat merged-text blocks                            | `66.16 ms`  | `13.25 ms` |
| `Transforms.applyBatch([...set_node, ...merge_node])` on flat merged-text blocks                 | `80.06 ms`  | `24.75 ms` |
| manual `Editor.withBatch([...set_node, ...merge_node])` on flat merged-text blocks               | `78.03 ms`  | `23.15 ms` |
| `Transforms.applyBatch([...move_node, ...merge_node])` on flat merged-text blocks                | `103.68 ms` | `44.78 ms` |
| manual `Editor.withBatch([...move_node, ...merge_node])` on flat merged-text blocks              | `103.51 ms` | `44.56 ms` |
| `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])` on flat merged-text blocks   | `98.02 ms`  | `48.51 ms` |
| manual `Editor.withBatch([...set_node, ...move_node, ...merge_node])` on flat merged-text blocks | `101.82 ms` | `46.1 ms`  |

That leaves merge-family batching where it should be:

- same one-seam API
- same wrapper semantics
- same immutable published-node contract
- much less actual tree rewrite work

One more semantic trap showed up while widening the wrapper-stack matrix:

- mixed text-selection-structural batches can legitimately record a normalize-generated `merge_node` in history after a `split_node`
- that is not a batch bug
- it is replay-equivalent history
- the right assertion for those wrapper-stack cases is `batchEditor.history === replayEditor.history`, not a hand-written expected op list that ignores normalize work

React had one separate seam too:

- `withReact` is not just `withDOM + nicer exports`
- batched `move_node` coverage needs to prove chunk-tree reconcile equivalence with replay, because `withReact` mutates `movedNodeKeys` before downstream `apply`
- the useful assertion there is not only final `editor.children`; it is reconcile output and reconcile callbacks matching replay for both `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)`

One more benchmarking trap showed up on the split lane:

- a generic per-op breakdown lies for staged split batches
- the useful split-specific phases are refs, draft staging, live split dirty-path staging, finalize bookkeeping, materialize, and dirty-path flush
- those phases are all cheap at `5,000` blocks
- a fake standalone “normalize” phase is worse than useless here; outside the real batch-exit environment it produces nonsense numbers
- if split needs more work, the next profiler has to measure the real batch-exit normalize path instead of pretending isolated helper timings explain it
- once that real profiler was wired into `core/batch.ts`, the answer got blunt:
  - flat `Transforms.applyBatch([...split_node])`: `40.82 ms`
  - flat manual `Editor.withBatch([...split_node])`: `40.62 ms`
  - staged split work was still tiny:
    - `refs`: `0.21 ms`
    - `stageDraft`: `0.33 ms`
    - `stageDirtyPaths`: `0.09 ms`
    - `finalize`: `0.51 ms`
    - `materialize`: `1.84 ms`
    - `dirtyPathFlush`: `2.6 ms`
  - the actual remaining tax was the real batch-exit normalize pass itself:
    - `flushBeforeNormalize`: `2.46 ms`
    - `normalize`: `24.91 ms`
  - so the next split-family win, if any, is not another planner or draft rewrite; it lives in normalize-generated merge work

One more benchmarking trap showed up after the merge cut:

- warmed `applyBatch` and manual `withBatch` text lanes are effectively in the same class
- unwarmed runs made `applyBatch` look meaningfully slower on observed text batches
- that difference was mostly JIT/order bias from timing the first variant cold and the second one hot

The harness fix is small and worth keeping:

- run one untimed warmup pass per selected benchmark lane before the measured repeats
- keep using medians across repeats
- do not treat tiny `applyBatch` vs `withBatch` gaps as meaningful unless they survive warmed runs

Verified on warmed merged-text `insert_text` lanes at `5,000` blocks:

| Lane                                                                         | Duration   |
| ---------------------------------------------------------------------------- | ---------- |
| `Transforms.applyBatch([...insert_text])`                                    | `31.66 ms` |
| manual `Editor.withBatch([...insert_text])`                                  | `29.7 ms`  |
| `Transforms.applyBatch([...insert_text])` with read-after-each observation   | `44.41 ms` |
| manual `Editor.withBatch([...insert_text])` with read-after-each observation | `48.15 ms` |

That is the right conclusion:

- text batching still has real cost
- but it is not hiding a second-class `applyBatch(...)` entrypoint anymore
- the remaining work is the engine itself, not the public sugar

The warmed split lanes tell the same story:

| Lane                                                                  | Duration   |
| --------------------------------------------------------------------- | ---------- |
| `Transforms.applyBatch([...split_node])`                              | `35.2 ms`  |
| manual `Editor.withBatch([...split_node])`                            | `40.71 ms` |
| `Transforms.applyBatch([...set_node, ...split_node])`                 | `40.38 ms` |
| manual `Editor.withBatch([...set_node, ...split_node])`               | `38.79 ms` |
| `Transforms.applyBatch([...move_node, ...split_node])`                | `65.14 ms` |
| manual `Editor.withBatch([...move_node, ...split_node])`              | `61.87 ms` |
| `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`   | `65.08 ms` |
| manual `Editor.withBatch([...set_node, ...move_node, ...split_node])` | `69.01 ms` |

Same conclusion:

- `applyBatch(...)` is not the problem anymore
- manual `withBatch(...)` is not hiding a secret faster engine
- the remaining cost is the transform family itself

That should change how future work gets judged:

- if a new optimization only shuffles planner paths or entrypoint bookkeeping, it is unlikely to matter
- the next worthwhile cuts have to reduce raw split/text transform work or normalize work directly

One more ugly bottleneck showed up after that: same-parent `insert_node` batching still looked too slow on empty-document build-up even though the private insert draft itself was cheap.

The actual cause was dumb:

- `canStageInsertNodeOperation(...)` cloned the full staged insert op list on every insert
- then `canApplyInsertNodeBatchToChildren(...)` rescanned that growing list just to confirm the new insert still targeted the same parent path

That meant append and prepend-heavy insert batches were paying accidental `O(n²)` validation cost before the real draft logic even had a chance to help.

The fix was to store the staged insert parent path directly in batch state and compare the next op against that path:

- no cloned op arrays
- no rescanning the whole staged batch
- same behavior, less self-harm

Verified on the same `5,000`-block harness:

| Lane                                                                                                  | Before       | After        |
| ----------------------------------------------------------------------------------------------------- | ------------ | ------------ |
| `Transforms.applyBatch([...insert_node])` on an empty document                                        | `394.97 ms`  | `13.22 ms`   |
| `Transforms.applyBatch([...prepend insert_node])` on an empty document                                | `380.33 ms`  | `5.5 ms`     |
| `editor.apply(insert_node)` loop inside `Editor.withoutNormalizing(...)` on an empty document         | `2551.51 ms` | `2468.22 ms` |
| `editor.apply(prepend insert_node)` loop inside `Editor.withoutNormalizing(...)` on an empty document | `2617.48 ms` | `2603.8 ms`  |

That is the clean result you want:

- the batch engine keeps the one-seam design
- the insert optimizer stays private
- the remaining gap was bookkeeping, and killing it brought empty-doc insert into the same general performance class as the rest of the specialized batch executor

Observation-heavy lanes turned out to matter enough to measure directly:

| Lane                                                                                                                     | Duration    |
| ------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `Transforms.applyBatch([...set_node])` on flat `5,000` blocks                                                            | `9.1 ms`    |
| manual `Editor.withBatch(...)` exact `set_node` loop on flat `5,000` blocks                                              | `5.95 ms`   |
| `Transforms.applyBatch([...set_node])` with read-after-each observation on flat `5,000` blocks                           | `32.1 ms`   |
| manual `Editor.withBatch(...)` exact `set_node` loop with read-after-each observation on flat `5,000` blocks             | `19.05 ms`  |
| `Transforms.applyBatch([...set_node, ...move_node])` on flat `5,000` blocks                                              | `166.53 ms` |
| manual `Editor.withBatch(...)` exact `set_node + move_node` loop on flat `5,000` blocks                                  | `179.29 ms` |
| `Transforms.applyBatch([...set_node, ...move_node])` with read-after-each observation on flat `5,000` blocks             | `187.94 ms` |
| manual `Editor.withBatch(...)` exact `set_node + move_node` loop with read-after-each observation on flat `5,000` blocks | `178.92 ms` |
| `Transforms.applyBatch([...interleaved insert_node, move_node])` on empty `5,000`-node build-up                          | `79.26 ms`  |
| manual `Editor.withBatch(...)` interleaved `insert_node + move_node` loop on empty `5,000`-node build-up                 | `79.08 ms`  |
| `Transforms.applyBatch([...set_node])` with duplicate target paths on flat `5,000` blocks                                | `8.54 ms`   |
| manual `Editor.withBatch(...)` duplicate exact `set_node` loop on flat `5,000` blocks                                    | `7.12 ms`   |
| `Transforms.applyBatch([...set_node])` with wrapper read-after-each observation on flat `5,000` blocks                   | `16.97 ms`  |
| manual `Editor.withBatch(...)` exact `set_node` loop with wrapper read-after-each observation on flat `5,000` blocks     | `20.96 ms`  |
| `Transforms.applyBatch([...insert_text])` on merged-text flat `5,000` blocks                                             | `85.08 ms`  |
| `Transforms.applyBatch([...insert_text])` with read-after-each observation on merged-text flat `5,000` blocks            | `82.06 ms`  |

That split is useful, not weird:

- `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)` stay in the same performance class, so the public sugar is not hiding a second-class executor
- exact-path `set_node` no longer falls off a cliff under read-after-each observation on the hot root/block-only lanes
- the mixed `set_node + move_node` lane stays in the same class for both entrypoints once live move dirty-path batching is in place, so `Editor.withBatch(...)` is no longer hiding a replay-class cliff there
- the interleaved same-parent `insert_node + move_node` lane stays in the same class for both entrypoints once the insert prefix can seed the same live dirty-path batch, so `Editor.withBatch(...)` is no longer hiding a replay-class cliff there either
- the merged-text `insert_text` hot lane is fixed, and the read-after-each observed lane is back in the same performance class instead of exploding under wrapper reads
- observation-heavy workloads are their own benchmark dimension and need to stay in the harness

The final observation-heavy move win came from two narrow fixes, not a new abstraction:

- root/block-only normalize now validates only the directly affected child slot for direct-child `set_node` / `insert_node` / `move_node` / `remove_node` work
- single same-parent observed `move_node` flushes now remap child indexes directly instead of rebuilding a full sibling-order array on every read

Another planner-specific cliff showed up once the obvious hot lanes were fixed:

- mixed exact `set_node` prefixes followed by independent-parent `merge_node` or `split_node` segments
- the tree transforms themselves were not the real problem
- the planner was replay-transforming every carried dirty path through every op in the later segment

That is needless work for independent-parent structural batches. Each carried dirty path can only be affected by:

- no later op at all, or
- the one later op whose parent path prefixes that dirty path

The winning cut was to stop treating those segments like generic path-transform loops:

- build a map from parent-path key to op
- when updating carried dirty paths, walk the dirty path prefixes
- if no parent-path matches, return the dirty path unchanged

One more split-specific tax was still hanging around after that:

- live split batching only stages direct text splits
- but the independent-parent split dirty-path helper was still hardcoding structural split dirty paths instead of using Slate's actual `editor.getDirtyPaths(op)` semantics
- the first parent-only shortcut looked clever and bought perf, but it broke element-split cases like `splitNodeThenSetSelection`
- the correct fix is:
  - keep the cheap parent-prefix transform for carried dirty paths
  - derive each split op's new dirty paths from `editor.getDirtyPaths(op)`
- that keeps the semantic fix and still trims the hot split lane

Verified on the flat `5,000`-block harness with `repeats=5`:

| Lane                                                    | Before      | After       |
| ------------------------------------------------------- | ----------- | ----------- |
| `Transforms.applyBatch([...split_node])`                | `110.96 ms` | `91.12 ms`  |
| manual `Editor.withBatch([...split_node])`              | `176.32 ms` | `100 ms`    |
| `Transforms.applyBatch([...set_node, ...split_node])`   | `129.82 ms` | `109.93 ms` |
| manual `Editor.withBatch([...set_node, ...split_node])` | `125.07 ms` | `98.43 ms`  |

The same principle applied one step later to merge:

- text-sibling `merge_node` ops do not need dirty-path staging just because they happen outside observed normalize
- the observation-only special-case was leaving cheap wins on the table
- widening that skip to all text-sibling merges kept the merge matrix green and trimmed the merged-text lanes again

Verified on the flat merged-text `5,000`-block harness with `repeats=5`:

| Lane                                                                       | Before      | After      |
| -------------------------------------------------------------------------- | ----------- | ---------- |
| `Transforms.applyBatch([...merge_node])`                                   | `82.83 ms`  | `76.19 ms` |
| manual `Editor.withBatch([...merge_node])`                                 | `79.17 ms`  | `64.78 ms` |
| `Transforms.applyBatch([...insert_text])` with read-after-each observation | `101.82 ms` | `84.41 ms` |

One more large gap showed up only on triple mixed lanes:

- `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`
- `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`

The problem was not the live engine. It was planner overhead:

- segment planning split those shapes into generic-before, move-middle, generic-after runs
- manual `Editor.withBatch(...)` was already faster on the whole batch
- forcing segment execution there just paid extra orchestration tax for no win

The right fix was not a new planner trick. It was a deopt:

- if segment planning yields three or more segments
- and every segment is `generic`, `move`, or `same-parent-move`
- skip segmented execution and run the whole batch through the live engine

Verified on the `5,000`-block harness with `repeats=5`:

| Lane                                                                  | Before      | After       |
| --------------------------------------------------------------------- | ----------- | ----------- |
| `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`   | `338.31 ms` | `99.75 ms`  |
| manual `Editor.withBatch([...set_node, ...move_node, ...merge_node])` | `203.87 ms` | `89.69 ms`  |
| `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`   | `199.49 ms` | `117.62 ms` |
| manual `Editor.withBatch([...set_node, ...move_node, ...split_node])` | `140.68 ms` | `110.28 ms` |

That cut worked, but it also exposed something uglier:

- once live `split_node` and `merge_node` batching was strong enough, the planner-owned independent-parent segment path had become dead weight
- it was more code
- it was slower than just letting the live engine handle those families

Hard-cutting that planner path was the right move. Verified on the same `5,000`-block harness:

| Lane                    | `Transforms.applyBatch(...)` | manual `Editor.withBatch(...)` |
| ----------------------- | ---------------------------- | ------------------------------ |
| `merge_node`            | `70.4 ms`                    | `70.68 ms`                     |
| `split_node`            | `145.36 ms`                  | `158.33 ms`                    |
| `set_node + merge_node` | `83.92 ms`                   | `73.35 ms`                     |
| `set_node + split_node` | `165.49 ms`                  | `141.54 ms`                    |

That is the cleaner architecture lesson:

- once the live engine owns an op family well enough, delete the planner clone
- `Transforms.applyBatch(...)` should stay a thin planner over the same batch engine, not a second implementation playground

The next broad structural win came from the base `move_node` transform itself, not from another batch-only seam:

- same-parent moves were still paying for two parent rewrites
- the old transform removed the child with one `modifyChildren(...)` pass, then reinserted it with another
- the common same-parent move shape only needs one parent clone and two `splice(...)` calls

That cut landed in `packages/slate/src/interfaces/transforms/general.ts`, and the numbers moved hard:

| Lane                                                                                              | Duration    |
| ------------------------------------------------------------------------------------------------- | ----------- |
| `Transforms.applyBatch([...move_node])` on flat `5,000` blocks                                    | `28.84 ms`  |
| `Transforms.applyBatch([...set_node, ...move_node])` on flat `5,000` blocks                       | `48.28 ms`  |
| `Transforms.applyBatch([...move_node, ...merge_node])` on flat `5,000` blocks                     | `83.3 ms`   |
| manual `Editor.withBatch([...move_node, ...merge_node])` on flat `5,000` blocks                   | `86.21 ms`  |
| `Transforms.applyBatch([...move_node, ...split_node])` on flat `5,000` blocks                     | `174.9 ms`  |
| manual `Editor.withBatch([...move_node, ...split_node])` on flat `5,000` blocks                   | `152.66 ms` |
| `Transforms.applyBatch([...interleaved insert_node, move_node])` on empty `5,000`-node build-up   | `53.85 ms`  |
| manual `Editor.withBatch([...interleaved insert_node, move_node])` on empty `5,000`-node build-up | `70.68 ms`  |

That changed the roadmap again:

- move-family work is in good shape
- the next honest hotspot is split-family cost, especially mixed structural batches that still pay too much around split work

The first real split-family cut was not another split-specific planner trick. It was smaller and better:

- `Transforms.applyBatch(...)` was still paying segment-planning overhead on batches that contained no insert or move families at all
- for `set_node + split_node`, the planner could not specialize anything, so the work was pure tax
- the right fix was to bypass segment planning entirely for no-insert/no-move batches and let `Editor.withBatch(...)` drive the live engine directly

Verified on the same `5,000`-block harness:

| Lane                     | `Transforms.applyBatch(...)` | manual `Editor.withBatch(...)` |
| ------------------------ | ---------------------------- | ------------------------------ |
| `set_node + split_node`  | `143.28 ms`                  | `145.67 ms`                    |
| `move_node + split_node` | `172.75 ms`                  | `176.65 ms`                    |
| `split_node`             | `126.54 ms`                  | `120 ms`                       |

That is the maintainable lesson:

- only pay planner cost when the planner can actually do something
- generic batches should just use the batch engine, not march through a fake optimization prepass
- do not replace that path with blanket dirty-path simulation:
  - same-parent `split_node` is a real counterexample because later split paths only exist after earlier transforms
  - observed `split_node + set_selection` is another one because the draft must normalize against the live transformed tree, not a simulated dirty-path replay

One more split cut was worth keeping too, but for a different reason:

- live split dirty-path batching had been implicitly assuming distinct parent paths
- that is true for the hot benchmark lane, but it is not a safe universal rule
- the fix was to make the distinction explicit:
  - distinct-parent split batches use the cheap parent-prefix dirty-path transform
  - same-parent split batches fall back to the generic dirty-path simulation

That did not produce some dramatic benchmark spike. It produced something better:

- clearer semantics
- a smaller lie surface in the live split code
- direct coverage for same-parent split dirty-path equivalence between `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)`
- if the dirty path equals the matched parent path, return it unchanged
- if the dirty path sits inside the matched parent subtree, transform it through that one op only

That keeps the public seam boring and collapses the mixed planner cliff:

| Lane                                                                         | Before       | After       |
| ---------------------------------------------------------------------------- | ------------ | ----------- |
| `Transforms.applyBatch([...set_node, ...merge_node])` on flat `5,000` blocks | `1083.61 ms` | `186.9 ms`  |
| `Transforms.applyBatch([...set_node, ...split_node])` on flat `5,000` blocks | `1284.46 ms` | `257.59 ms` |

The next split-specific win came from staging live `split_node` dirty paths for manual `Editor.withBatch(...)` loops instead of letting them fall back to the generic tail:

| Lane                                                                         | Result      |
| ---------------------------------------------------------------------------- | ----------- |
| `Transforms.applyBatch([...split_node])` on flat `5,000` blocks              | `184.3 ms`  |
| `Editor.withBatch([...split_node])` on flat `5,000` blocks                   | `171.12 ms` |
| `Transforms.applyBatch([...set_node, ...split_node])` on flat `5,000` blocks | `295.95 ms` |
| `Editor.withBatch([...set_node, ...split_node])` on flat `5,000` blocks      | `150.81 ms` |

One subtle semantic bug mattered there:

- root-parent structural ops still need to participate in carried dirty-path remapping
- a split at `[0]` has parent path `[]`
- if the parent-prefix matcher never checks the empty prefix, a carried dirty path like `[1]` never remaps to `[2]`
- the result looks deceptively close, but replay-equivalent text merges are skipped in later paragraphs

That is not optional bookkeeping. It is the difference between manual batched `split_node` staying in the right performance class and silently diverging from replay semantics on mixed root-level batches.

The merge-side equivalent was lower drama:

- flat merged-text `merge_node` batches are independent-parent work
- the tree mutation was already fine
- the waste was recomputing `editor.getDirtyPaths(op)` for every merge during live flush

Building dirty-path state directly for independent-parent merge ops and reusing the same parent-prefix transform keeps the flat merge lane in the same class as manual batching:

| Lane                    | `Transforms.applyBatch(...)` | manual `Editor.withBatch(...)` |
| ----------------------- | ---------------------------- | ------------------------------ |
| `merge_node`            | `71.37 ms`                   | `67.62 ms`                     |
| `split_node`            | `129.1 ms`                   | `131.07 ms`                    |
| `set_node + split_node` | `139.11 ms`                  | `128.67 ms`                    |

That also exposed a useful cleanup rule:

- once live `split_node` and live `merge_node` batching were good enough, the old planner-owned independent-parent `split` / `merge` fast path stopped earning its keep
- it was slower than simply routing `Transforms.applyBatch(...)` through the same live engine that manual `Editor.withBatch(...)` already used
- hard-cutting that planner path made the code easier to follow and improved the numbers at the same time

Current `5,000`-block checkpoint after that cut:

| Lane                                                  | Result      |
| ----------------------------------------------------- | ----------- |
| `Transforms.applyBatch([...merge_node])`              | `70.4 ms`   |
| `Editor.withBatch([...merge_node])`                   | `70.68 ms`  |
| `Transforms.applyBatch([...split_node])`              | `145.36 ms` |
| `Editor.withBatch([...split_node])`                   | `158.33 ms` |
| `Transforms.applyBatch([...set_node, ...merge_node])` | `83.92 ms`  |
| `Editor.withBatch([...set_node, ...merge_node])`      | `73.35 ms`  |
| `Transforms.applyBatch([...set_node, ...split_node])` | `165.49 ms` |
| `Editor.withBatch([...set_node, ...split_node])`      | `141.54 ms` |

The split-family cut that actually survived after that was narrower than a new split engine:

- direct-child text splits can stage tree mutation into a private split draft
- but that only earns its keep if live split dirty-path batching stays underneath it
- the first version that staged split drafts and paid per-op dirty paths was dramatically slower and got cut immediately
- the winning shape was: private split draft for tree mutation, existing live split batch for dirty paths

Current `5,000`-block checkpoint after that cut:

| Lane                                                   | Result      |
| ------------------------------------------------------ | ----------- |
| `Transforms.applyBatch([...split_node])`               | `114.68 ms` |
| `Editor.withBatch([...split_node])`                    | `108.06 ms` |
| `Transforms.applyBatch([...set_node, ...split_node])`  | `126.19 ms` |
| `Editor.withBatch([...set_node, ...split_node])`       | `112.99 ms` |
| `Transforms.applyBatch([...move_node, ...split_node])` | `158.83 ms` |
| `Editor.withBatch([...move_node, ...split_node])`      | `140.92 ms` |

That is the important lesson:

- a private structural draft can be worth it
- draft-only optimization is bullshit if it throws away the dirty-path batching that made the lane cheap
- the stale independent-parent split replay path should stay dead
- pure split is no longer the honest hotspot

The next useful checkpoint was not another optimization. It was a composability check:

| Lane                                                                | Result      |
| ------------------------------------------------------------------- | ----------- |
| `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])` | `120 ms`    |
| `Editor.withBatch([...set_node, ...move_node, ...merge_node])`      | `117.53 ms` |
| `Transforms.applyBatch([...set_node, ...move_node, ...split_node])` | `153.22 ms` |
| `Editor.withBatch([...set_node, ...move_node, ...split_node])`      | `149.09 ms` |

That matters because it says something simple:

- the planner is no longer hiding some giant triple-family cliff
- if there is another meaningful hotspot, it is not “can the planner compose three families at all?”
- the next honest target is merged-text normalize cost, not more planner cleverness

One semantic wrinkle matters here too:

- mixed `set_node + merge_node` on merged-text paragraphs is not a plain replay-oracle scenario
- ordinary unbatched `editor.apply(set_node)` eagerly normalizes and can collapse adjacent text siblings before the later `merge_node`
- the correct contract to test is `Transforms.applyBatch(...)` equivalence with manual `Editor.withBatch(...)`, not equivalence with plain per-op replay

The last text-op gap was not the leaf rewrite anymore. It was the normalize tail:

- staged `insert_text` and `remove_text` ops need their own private draft
- staged text ops still have to transform `editor.selection`, or mixed text-selection batches freeze the cursor at stale offsets
- observed batch reads must flush staged live move / merge / insert+move dirty-path batches before and after normalize, then keep draining dirty paths until clean
- otherwise a text-first batch can look correct on the first read and still leak stale merge dirty paths into the next structural op

One smaller cut was still worth taking after that:

- `insert_text` and `remove_text` were still reporting `Path.levels(path)` as dirty
- for core Slate normalization, that meant every observed text edit revisited the text leaf and the editor root even though the real work was at the parent element
- narrowing text dirty paths to `Path.parent(path)` cut that dead normalize work without changing replay semantics

Targeted direct instrumentation on the merged-text read-after-each lane showed the result:

| Lane                                                                                                          | Before                                                  | After                                                   |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `Transforms.applyBatch([...insert_text])` with read-after-each observation on merged-text flat `5,000` blocks | `3234.12 ms` total / `3169.85 ms` in `editor.normalize` | `2510.37 ms` total / `2387.83 ms` in `editor.normalize` |

That is not the final answer for observation-heavy text workloads. It is just the honest next cut:

- normalize still dominates
- observation-heavy text reads are still expensive
- but the leaf and root dirty paths were wasted work, and trimming them bought a real win for free

The next two small cuts were to stop throwing away the text fast path and to stop paying for fake second passes:

- the first observed read can promote text state into generic draft children
- if later text ops fall back to generic `Transforms.transform(...)`, the lane bleeds time for no semantic reason
- applying later `insert_text` and `remove_text` ops through `applyTextBatchToChildren(...)` on that generic draft root keeps the same public behavior and avoids the generic tree-transform tax
- default explicit-path `merge_node` normalization also needed its own cheap path, because every observed text edit on a merged-text paragraph can record one of those merges
- profiling showed the real remaining cliff after that: every observed `insert_text` still paid a second observed normalize pass with `dirty:3`
- that second pass came from requeued live merge dirty paths after a text-sibling `merge_node` generated during the first pass
- the right cut was to decide _before_ applying the merge whether it was an observed text-sibling merge and skip staging those live merge dirty paths entirely

Verified on the same merged-text `5,000`-block harness:

| Lane                                                                                                          | Duration   |
| ------------------------------------------------------------------------------------------------------------- | ---------- |
| `Transforms.applyBatch([...insert_text])` on merged-text flat `5,000` blocks                                  | `85.08 ms` |
| `Transforms.applyBatch([...insert_text])` with read-after-each observation on merged-text flat `5,000` blocks | `82.06 ms` |

Two follow-up findings are worth keeping:

- the text helper can keep one generic tree path here; a bespoke direct-child/distinct-parent fast path did not produce a durable win and was not worth the extra branchiness
- this lane is noisy enough that `repeats=3` can tell ghost stories; use at least `repeats=5` before treating merged-text microbench numbers as signal

One more observation-barrier bug surfaced after the matrix got wide enough:

- `Transforms.setNodes(...)` wraps its work in `Editor.withoutNormalizing(...)`
- a second `Transforms.setNodes(...)` inside the same outer batch reads `editor.children` while queued batch normalize debt still exists
- the observation barrier tried to force normalize anyway
- but `Editor.isNormalizing(editor)` was `false`, so `Editor.normalize(...)` returned immediately and the barrier kept looping on the same dirty paths forever

The fix is simple and correct:

- if a batched `editor.children` read happens while normalization is currently suspended, return the current draft as-is
- keep the queued batch normalize debt intact
- let the enclosing `withoutNormalizing(...)` boundary flush it later

That keeps replay semantics for explicit observed reads, but it stops transform-internal reads from eating their own queued normalize debt when the caller already asked Slate not to normalize yet.

That was the real replay drift behind the failing mixed and DOM matrices:

- DOM pending diffs were surviving batched text ops even though replay already cleared them
- a text-first `insert_text -> move_node` pair could read cleanly after the text op, then still merge an unrelated paragraph on the later move because the observation barrier had not finished the normalize work

The fix kept the same one-seam design:

- text stays private batch state
- observation stays the public `editor.children` seam
- normalize-generated ops still flow through `editor.apply`
- the observed normalize loop simply stops bailing early

The next real mixed-op hotspot was interleaved same-parent `insert_node + move_node` on an empty document.

The first planner pass still left it ugly:

| Lane                                                                                  | Before targeted mixed-op planner cut |
| ------------------------------------------------------------------------------------- | ------------------------------------ |
| `Transforms.applyBatch([...interleaved insert_node, move_node])` on an empty document | `6063.77 ms`                         |

Measuring the generic path showed the same old villain again:

- refs: cheap
- transform: acceptable
- finalize: noise
- dirty paths: absolutely cursed

The fix was not a second draft overlay. That would have been cute and wrong.

One testing wrinkle turned out to matter too:

- when a mixed pair starts with `insert_text` or `remove_text` on a paragraph with adjacent text leaves, Slate may normalize those leaves immediately by recording an internal `merge_node`
- that changes internal operation ordering without changing public behavior
- pairwise mixed-op coverage should compare final tree, selection, and other public state first
- exact `editor.operations` ordering is still worth asserting for the stable families, but not for every pair containing those text-first normalization cases

Error-path coverage mattered too:

- exact-path `set_node` staging must validate root-path and forbidden-property errors before mutating batch draft state
- otherwise the batch can look fine until some later `editor.children` read materializes the draft and explodes

Direct children assignment needed a stronger rule too.

- `editor.children = ...` inside `Editor.withBatch(...)` is a hard reset, not “just another write”
- stale pre-assignment `editor.operations` must be dropped
- stale live move / live insert-move dirty-path batches must be discarded
- history must trim the just-recorded undo ops that the assignment overwrote
- DOM wrapper pending selection / diff transforms must be cleared because they now point at the wrong tree

That also forced one architectural cleanup:

- internal transform-owned `editor.children` writes cannot trigger the hard reset
- the engine now marks those writes with `withInternalBatchWrites(...)`
- only external assignment gets the reset semantics

Without that distinction, normal structural transforms started clearing their own queued normalize and pending ops, which is obviously garbage.

- failure tests should assert the earlier successful prefix still commits, draft state is cleared, and `onChange` still flushes once after the thrown error

The fix was:

- detect contiguous same-parent mixed `insert_node + move_node` runs in the planner
- keep routing each op through `editor.apply`
- batch dirty paths once with a dedicated same-parent simulation

That simulation tracks:

- final positions of original siblings
- final positions of inserted nodes
- final inserted descendant paths
- remapping of previously dirty original descendant paths by final original index

Verified on the same `5,000`-block harness:

| Lane                                                                | Replay / generic loop | Optimized `Transforms.applyBatch(...)` |
| ------------------------------------------------------------------- | --------------------- | -------------------------------------- |
| interleaved same-parent `insert_node + move_node` on empty document | `8898.41 ms`          | `77.33 ms`                             |

That is the right kind of win:

- no public API change
- no second plugin seam
- no bypass of transparent `editor.apply` wrappers
- just a planner segment that stops doing dirty-path math the dumbest possible way

One extra lesson from the failed follow-up slice:

- a naive distinct-parent `split_node` overlay was not good enough
- it added snapshot/materialization cost without meaningfully paying down the real split hot path
- that shape was hard-cut instead of rationalized into the codebase

One more lesson from the observation bug:

- a shadow-normalize getter is fake correctness
- if a batch read normalizes a throwaway shadow tree, later ops still run against the raw draft and diverge from replay
- the observation barrier has to normalize the live draft itself
- if the live normalize path bypasses `editor.apply`, wrapper-visible normalize ops diverge from replay too
- internal engine reads need their own bypass, or the getter turns into a self-triggered normalize trap

One more lesson from the move follow-up:

- a generic local dirty-path simulation for `move_node` batches is semantically clean, but it was only a small trim
- the real win came from specializing same-parent move dirty paths
- for same-parent moves, the final dirty set is just `Path.levels(parent)` plus the final slots of the nodes that actually moved
- that turns the flat `5,000`-block move lane from `1692.25 ms` to `126.46 ms` without changing the one-seam design

## Prevention

- Do not benchmark a batch engine by replacing `editor.apply` with a copied implementation. That measures the harness, not the engine.
- Private batch bookkeeping can mutate in place. Published Slate nodes and snapshots cannot.
- Keep exact-path batching behind `editor.apply`, `Editor.withBatch(...)`, and `Transforms.applyBatch(...)`. A benchmark seam is not a public API.
- Generic draft-root correctness should come before op-family optimization. Once the semantics are right, the benchmarks tell you which family earns the next fast path.
- Do not normalize a throwaway shadow tree on batch reads and call it done. If later ops still execute against the old draft, observation semantics are bullshit.
- Do not let internal engine reads share the same getter semantics as public observation. Batch engines need a real distinction between internal reads and observation barriers.
- Do not treat observed-read performance as a semantic afterthought. Some families collapse under repeated live-draft normalization, while others get cheaper because the normalize cliff gets amortized. Keep those lanes in the benchmark harness and measure them explicitly.
- Do not guess about batch-exit normalize cost from isolated helper timings. Add a tiny trace seam to the real batch-exit loop and time that. Split looked like a draft problem until the real numbers showed normalize was the actual tax.
- When manual `Editor.withBatch(...)` loops fall behind `Transforms.applyBatch(...)`, check whether the gap is dirty-path batching before redesigning the executor. The `set_node + move_node` cliff collapsed once consecutive live `move_node` ops stopped paying dirty-path churn one op at a time.
- When a same-parent insert prefix eventually turns into an interleaved `insert_node + move_node` run, do not throw away the staged insert prefix and start over. Promote that prefix into the same live dirty-path batch, or manual `Editor.withBatch(...)` falls straight back into multi-second generic sludge.
- When a family optimizer starts working, the next bottleneck often becomes dirty-path propagation across optimized segments. Measure mixed lanes before inventing another overlay, then specialize the carry-over path instead of piling on another public API.
- If a batch family still looks slow after the real draft executor lands, measure the staging guard too. It is embarrassingly easy to hide an `O(n²)` list-clone in “cheap validation” code and then blame the tree rewrite.
- For mixed-op hotspots, do not jump straight to a new draft layer. If refs and transform are cheap, fix dirty paths first. A good planner segment plus a final-position simulation can buy you orders of magnitude without touching the plugin seam.
- Do not let batch-engine coverage rot into hand-written spot tests. Use a replay-oracle matrix helper, count the declared cells, and make CI prove the declared matrix is actually running.
- Do not scatter matrix counts across ten files. Keep one shared registry and make a central test scan the matrix specs for helper usage, or the suite will slowly start lying again.
- Do not leave the perf harness as an undocumented pile of CLI-only lanes either. Export the benchmark registry, keep an explicit required-lane list, and make one small test fail when a real perf lane disappears.
- Do not over-assert `editor.operations` order for mixed structural batches unless that order is a real public contract. `split_node` can synthesize internal ops, and batched execution may preserve behavior while reordering those internals.
- Do not assume single-wrapper coverage proves wrapper composition. `withHistory` and `withReact` need their own combined matrix because rewrite wrappers, snapshot reads, and history recording all meet there.
- Do not stop at React/history composition. `withDOM` has its own batch-sensitive bookkeeping: pending selections, pending diffs, and node-key repair. That seam needs a dedicated matrix too, because tree equality alone will happily miss a broken DOM state cache.

## Related Docs

- [2026-03-31-slate-phase1-batch-lifecycle-should-land-before-fast-paths.md](/Users/zbeyens/git/plate-2/.claude/docs/solutions/performance-issues/2026-03-31-slate-phase1-batch-lifecycle-should-land-before-fast-paths.md)
- [slate-batch-engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/slate-batch-engine.md)
