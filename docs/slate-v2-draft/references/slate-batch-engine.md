---
date: 2026-04-07
topic: slate-v2-slate-batch-engine
---

# Slate Batch Engine Plan

> Historical/reference doc. The batch-engine retrofit is not a live
> zero-regression remaining-work lane. For current queue and roadmap truth, see
> [../master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This is the lossless checkpoint for the retrofit batch-engine work in
`/Users/zbeyens/git/slate-v2`.

Use it for:

- current engine state
- planner / executor ownership
- batch-lifecycle and perf-shape decisions

Do not use it as the live replacement verdict or the current remaining-work
queue.

For that, start with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## Current checkpoint

Current hard read:

- this file is preserved for historical engine context
- it is not an active blocker owner for the current browser/input parity work
- if engine work reopens later, it should reopen intentionally instead of being
  inferred from this reference doc

The exact-path `set_node` rewrite is now in the right architectural shape locally in `../slate-v2`:

- `Editor.withBatch(editor, fn)` is the lifecycle boundary
- `Transforms.applyBatch(editor, ops)` is the public batch entry point
- `editor.apply(op)` stays the only plugin seam
- `editor.children` is accessor-backed through `packages/slate/src/core/children.ts`
- exact-path batched `set_node` ops stage into a private draft and materialize immutable snapshots on read
- generic batched tree ops write to a private draft root instead of committed children
- `Transforms.applyBatch(...)` routes through ordinary `editor.apply(op)` wrappers and still keeps exact-path fast-path performance
- public `setNodesBatch(...)` is deleted
- the old `batch-safe apply` gate and `wrapExactSetNodeBatch(...)` bridge are deleted
- `packages/slate/src/core/apply.ts` is back to being a thin dispatch layer:
  - `packages/slate/src/core/batching/planner.ts` owns batch segmentation rules
  - `packages/slate/src/core/batching/executor.ts` owns batched execution and dirty-path strategies
  - `packages/slate/src/core/batching/` is the namespace for batch-only internals, so reviewers do not have to infer which helpers are part of ordinary single-op apply
- external `editor.children` reads during a batch now act as a real observation barrier:
  - the live draft is normalized in place
  - normalize-generated ops still flow through `editor.apply` wrappers
  - staged live move / merge / insert+move dirty-path batches are flushed before and after the observed normalize work
  - the observation loop keeps draining dirty paths until clean, so normalize-generated merge ops do not leak stale normalize debt into later ops
  - internal engine reads bypass that barrier so the engine does not accidentally self-observe

The remaining work is narrower now:

- keep broadening mixed-op coverage and perf lanes where the declared matrix still has holes
- optimize the remaining live in-batch cliffs, especially where manual `Editor.withBatch(...)` still falls back to generic per-op work
- harden the weird cases like direct assignment, observation churn, and error paths
- finish the remaining integration matrix layers instead of hand-written coverage islands

Insert-family checkpoint:

- same-parent `insert_node` batches now use a private insert draft instead of replay-class committed-tree mutation
- prepend and other non-monotonic same-parent insert batches stay on that private draft too
- same-parent insert staging now tracks its parent path directly instead of cloning and rescanning the full staged op list on every insert
- same-parent interleaved `insert_node + move_node` runs now have their own planner segment and cheap dirty-path simulation
- exact `set_node` plus structural tail batches still stay in the same fast-path performance class
- empty-document insert build-up is no longer a meaningful hotspot on either append or prepend-heavy workloads
- a naive distinct-parent `split_node` overlay was tested and hard-cut because it made the hot lane worse, not better
- structural dirty-path batching now lands at the right lifecycle point, so `split_node` and `merge_node` batches no longer leave stale dirty paths behind after normalize
- that dirty-path fix turned out to be a real optimizer too, not just cleanup: `merge_node` and `split_node` dropped out of replay-class latency
- same-parent `move_node` dirty-path batching is now in too, which drops the hot flat move lane out of replay-class latency without widening the public API or bypassing `editor.apply`
- `applyBatch(...)` now has a mixed-batch planner that can keep specialized runs hot inside one outer batch instead of deopting the whole batch immediately
- same-parent move segments now remap carried dirty child paths directly instead of replaying every prior dirty path through every move op
- the planner-owned independent-parent `split_node` / `merge_node` segment path is gone:
  - once the live engine owned those families well enough, the planner copy just became slower extra code
  - `Transforms.applyBatch(...)` now stays on the same engine as manual `Editor.withBatch(...)` for those lanes
- same-parent `move_node` now rewrites through one parent clone in `interfaces/transforms/general.ts` instead of separate remove-then-insert tree rewrites
- move-heavy mixed structural lanes are no longer the dominant hotspot; split-family cost is
- distinct-parent text `merge_node` batches now have the same kind of private draft tree rewrite that distinct-parent text `split_node` batches already had:
  - `merge_node` no longer batches only dirty paths while still paying per-op tree rewrites
  - pure merge and merge-heavy mixed lanes dropped back into the same class as the rest of the structural engine
- `Transforms.applyBatch(...)` now skips segment planning completely when a batch contains no insert/move families:
  - if the planner cannot specialize anything, it should not tax the generic batch
  - generic `set_node + split_node` style workloads now go straight through `Editor.withBatch(...)`
- do not route those no-insert/no-move batches through blanket dirty-path simulation:
  - same-parent `split_node` and observed `split_node + set_selection` are valid counterexamples
  - the safe path there is still `Editor.withBatch(...)` driving the live engine directly
- live split batching now makes its assumption explicit:
  - distinct-parent split batches use the cheap parent-prefix dirty-path transform
  - same-parent split batches deopt to the generic dirty-path simulation instead of pretending the parent-prefix shortcut is always correct
- extra coverage now pins that same-parent split case directly
- independent-parent live `merge_node` batches now build dirty-path state directly instead of recomputing `editor.getDirtyPaths(op)` for every op during flush

## Decision

Keep the current public API and finish the rewrite under it. Do not widen it again.

- `editor.apply(op)` stays single-op
- `Editor.withBatch(editor, fn)` stays the explicit transaction boundary
- `Transforms.applyBatch(editor, ops)` stays the public batch entry point

Do **not** widen public API again.
Do **not** make plugins learn arrays.
Do **not** reintroduce a second plugin seam or a public exact-path helper.

The final engine should look like this:

- every batched tree op uses a private draft root
- `editor.children` exposes immutable snapshots of that draft on reads
- exact-path `set_node` remains the first optimized op-family sub-path
- not-yet-optimized families still use the generic draft root instead of falling back to committed-tree mutation
- any operation mix must be supported semantically through one batch engine
- optimized executors should compose inside the same batch when the mix stays within supported boundaries
- when a mix crosses out of an optimized region, the engine should deopt to the generic draft-root path without losing correctness or changing public semantics

This is the real end goal:

- support any combination of operations correctly under `Editor.withBatch(...)` / `Transforms.applyBatch(...)`
- optimize common op families incrementally behind the same engine
- never require plugin authors to learn a second batching seam
- never reintroduce a public one-off helper for a single op family

## Current facts

### Public and internal state today

Current local Slate checkpoint in `../slate-v2`:

- `Editor.withBatch(editor, fn)` exists
- `Transforms.applyBatch(editor, ops)` exists
- public `setNodesBatch(...)` is deleted
- exact-path `set_node` batching lives behind `applyBatch(...)` and `Editor.withBatch(...)`
- the batch executor is owned by `packages/slate/src/core/apply.ts`
- draft storage and snapshot materialization live in `packages/slate/src/core/children.ts`
- exact-set-node tree rewriting lives in `packages/slate/src/core/batching/exact-set-node-children.ts`
- transparent `editor.apply` wrappers still see each op in order
- previously published node refs stay immutable
- the benchmark harness measures real wall time again and reports helper breakdowns separately
- the benchmark harness now does one untimed warmup run per lane before timing:
  - small `applyBatch` vs `withBatch` deltas on text lanes were mostly order/JIT noise without that warmup
  - treat sub-10ms gaps with suspicion unless they survive warmed repeated runs
- mixed batches can now be segmented into specialized contiguous runs under one outer `Editor.withBatch(...)`
- generic non-tree batches are now covered too: `insert_text`, `remove_text`, `set_selection`, and a mixed text-selection-node batch all match replay semantics
- text batching now stages into its own private draft instead of replaying leaf mutation one op at a time
- staged text ops still transform `editor.selection`, so mixed text-selection-node batches do not freeze the cursor in stale offsets
- text ops now dirty only their parent element path instead of the full `Path.levels(path)` chain, because core text normalization work lives at the ancestor element, not at the text leaf or editor root
- once observation has promoted a text batch into generic draft children, later `insert_text` and `remove_text` ops still apply through the text batch helper instead of falling straight back to generic `Transforms.transform(...)`
- default explicit-path `Transforms.mergeNodes(editor, { at })` now fast-path direct previous-sibling merges, which trims normalize-heavy observed text batches without widening the public seam
- observed text-sibling `merge_node` ops generated during live normalize no longer queue a redundant second observed normalize pass; the skip decision is made before the merge transform runs, while the pre-merge sibling paths still exist
- history coverage now includes a mixed text-selection-node batch and keeps the existing Slate rule that `set_selection` affects `selectionBefore` but is not itself stored in undo operations
- replay-oracle matrix coverage is now landing in the actual suite instead of only existing as a plan:
  - exact-path `set_node` now runs through a generated 48-cell family matrix
  - generic non-tree ops now use the same helper for both `applyBatch(...)` and manual `withBatch(...)` across 8 declared cells
  - generic tree ops now have a 44-cell family matrix plus a 44-cell observation matrix and a 6-cell rewrite matrix
  - mixed-op pair coverage now exists as a 144-cell ordered family-pair replay-oracle matrix instead of ad hoc spot cases
  - mixed-op triple coverage now exists as an 8-cell replay-oracle matrix plus a 32-cell observation matrix, and it finally includes insert+move structural triples instead of pretending set+move is the whole story
  - history now covers both `applyBatch(...)` and manual `withBatch(...)` across 8 declared manifest cells, plus the explicit merge/new-batch edge cases
- the combined `withHistory + withReact` wrapper stack now runs through a 48-cell replay-oracle matrix with history assertions, instead of pretending the single-wrapper manifests prove composition
- React-only batch coverage now lives in `packages/slate-react/test/chunking.spec.ts`:
  - batched `move_node` replay equivalence is pinned for both `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)`
  - the assertion is chunk-tree reconcile equivalence, not just final Slate children
  - that matters because `withReact` owns chunk-tree `movedNodeKeys`, which is a real seam separate from history
- DOM wrapper bookkeeping now runs through a 48-cell matrix across `withDOM` and `withDOM + withHistory`, covering pending selection transforms, pending diff transforms, node-key stability, and both observed-read modes
- failure semantics now run through a 60-cell unwind matrix across exact `set_node`, `insert_node`, `move_node`, `split_node`, `merge_node`, and a mixed text-selection-node prefix:
  - both `applyBatch(...)` and manual `withBatch(...)`
  - transparent and rewriting `editor.apply` wrappers
  - no observation, read-after-each observation, and persisted-ref observation where the scenario shape makes that meaningful
- the matrix helper counts declared cells so the manifest is explicit
- the declared manifest counts now live in one shared registry at `packages/slate/test/utils/batch-matrix-manifest.js`
- the matrix specs assert against that shared registry instead of scattering magic numbers inline
- `packages/slate/test/batch-matrix-manifest.js` now scans the Slate, Slate History, and Slate React test trees for `assertBatchMatrixManifest(...)` calls and fails if the registry and helper usage drift
- `packages/slate/test/perf/set-nodes-bench.js` now exports its benchmark registry and a required-lane list instead of hiding them behind CLI-only state
- `packages/slate/test/perf-benchmark-manifest.js` now fails if a required perf lane disappears or if the benchmark prototype equivalence check stops matching replay
- direct `editor.children = ...` inside `Editor.withBatch(...)` is now treated as a hard batch reset:
  - stale pre-assignment `editor.operations` are dropped
  - stale exact-set, insert, live-move, and live-insert-move batch bookkeeping is discarded
  - batch reads after the reset continue from the replacement tree only
- direct-assignment coverage is no longer a couple of lucky tests:
  - `with-batch-direct-assignment.js` now declares an explicit 16-cell direct-assignment matrix plus a 4-cell persisted-ref observation subset
  - history now proves direct assignment drops stale undo state and keeps only post-assignment ops
  - DOM now proves direct assignment clears stale pending selection/diff bookkeeping under both `withDOM` and `withDOM + withHistory`

### The remaining architectural gap

The hard exact-path design is implemented. The remaining gap is now clear:

- generic draft-root batching is in place for non-`set_node` tree ops
- only exact-path `set_node` has an optimized op-family executor
- mixed-batch planning exists, and same-parent move carry-over is now specialized too
- direct assignment and error semantics need to be made explicit instead of merely “working today”
- observation semantics are now correct for normalize-sensitive mixed ops, but still worth pressure-testing across more planner families if new optimizers land
- internal engine writes now have a real distinction from external assignment:
  - internal `editor.children` writes during tree transforms run under `withInternalBatchWrites(...)`
  - hard-reset semantics apply only to external assignment, not to ordinary transform-owned tree mutation
- the merged-text text helper should stay boring:
  - mutating the hidden per-branch `ops` array in place is fine
  - a bespoke direct-child / distinct-parent fast path did not buy a durable win and was hard-cut

### Semantic constraint that cannot be hand-waved away

Slate node references are treated as immutable once published.

We already have repo evidence that shared node graphs blow up Slate assumptions:

- [2026-03-27-version-history-demo-must-clone-snapshots-per-editor.md](/Users/zbeyens/git/plate-2/docs/solutions/ui-bugs/2026-03-27-version-history-demo-must-clone-snapshots-per-editor.md)

If code:

1. reads a node from `editor.children`
2. stores that reference
3. later mutates the same logical node during the same batch

the old reference must stay unchanged.

Any plan that mutates published node objects in place is wrong.

### Performance constraint

The whole point of this rewrite is twofold:

- keep exact-path `set_node` in the old `setNodesBatch` performance class
- make batching semantically uniform for all tree ops without forcing plugin authors onto a second seam

Current measured proof from the existing micro-benchmark at `5,000` blocks:

- flat `Transforms.applyBatch([...set_node])`: `5.84 ms`
- grouped `Transforms.applyBatch([...set_node])`: `4.87 ms`
- flat `Transforms.applyBatch([...set_node, insert_node])`: `6.49 ms`
- flat `Transforms.applyBatch([...set_node, ...move_node])`: `123.63 ms`
- empty `Transforms.applyBatch([...insert_node])`: `13.22 ms`
- empty `Transforms.applyBatch([...prepend insert_node])`: `5.5 ms`
- empty `Transforms.applyBatch([...interleaved insert_node, move_node])`: `77.33 ms`
- empty `editor.apply(insert_node)` loop inside `Editor.withoutNormalizing(...)`: `2551.51 ms`
- empty `editor.apply(prepend insert_node)` loop inside `Editor.withoutNormalizing(...)`: `2617.48 ms`
- empty `editor.apply([...interleaved insert_node, move_node])` loop inside `Editor.withoutNormalizing(...)`: `8898.41 ms`
- flat `editor.apply(set_node)` loop inside `Editor.withoutNormalizing(...)`: `62.81 ms`
- flat `Transforms.setNodes(...)` loop inside `Editor.withoutNormalizing(...)`: `66.24 ms`

Observation-heavy lanes are now measured too, not guessed:

- flat `Transforms.applyBatch([...set_node])`: `9.1 ms`
- flat manual `Editor.withBatch(...)` exact `set_node` loop: `5.95 ms`
- flat `Transforms.applyBatch([...set_node])` with read-after-each observation: `32.1 ms`
- flat manual `Editor.withBatch(...)` exact `set_node` loop with read-after-each observation: `19.05 ms`
- flat `Transforms.applyBatch([...set_node, ...move_node])`: `166.53 ms`
- flat manual `Editor.withBatch(...)` exact `set_node + move_node` loop: `179.29 ms`
- flat `Transforms.applyBatch([...set_node, ...move_node])` with read-after-each observation: `187.94 ms`
- flat manual `Editor.withBatch(...)` exact `set_node + move_node` loop with read-after-each observation: `178.92 ms`
- empty `Transforms.applyBatch([...interleaved insert_node, move_node])`: `79.26 ms`
- empty manual `Editor.withBatch(...)` interleaved `insert_node + move_node` loop: `79.08 ms`
- flat merged-text `Transforms.applyBatch([...insert_text])`: `85.08 ms`
- flat merged-text `Transforms.applyBatch([...insert_text])` with read-after-each observation: `82.06 ms`
- flat `Transforms.applyBatch([...set_node])` with duplicate target paths: `8.54 ms`
- flat manual `Editor.withBatch(...)` duplicate exact `set_node` loop: `7.12 ms`
- flat `Transforms.applyBatch([...set_node])` with wrapper read-after-each observation: `16.97 ms`
- flat manual `Editor.withBatch(...)` exact `set_node` loop with wrapper read-after-each observation: `20.96 ms`

That split matters:

- read-after-each observation is no longer a catastrophic replay cliff on the root/block-only lanes
- `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)` still stay in the same performance class on both the hot lane and the observation-heavy lane
- the mixed `set_node + move_node` lane now stays in the same performance class for both entrypoints too; live move dirty-path batching closed the old manual-`withBatch` replay cliff without deferring tree mutation
- the interleaved same-parent `insert_node + move_node` lane now stays in the same class for both entrypoints too; promoting the insert prefix into one live insert+move dirty-path batch closed the old multi-second manual `withBatch` cliff
- the merged-text `insert_text` hot lane is fixed, and the observed lane is back in the same class instead of blowing up under wrapper reads
- the remaining win came from two narrow cuts, not another seam change:
  - root/block-only normalize now validates only the directly affected child slot for direct-child `set_node` / `insert_node` / `move_node` / `remove_node` work
  - single same-parent observed `move_node` flushes now remap indexes directly instead of rebuilding a full sibling-order array on every read
- observed reads now drain staged live dirty-path batches until clean, so text-first batches do not leak stale merge debt into later structural ops
- observation-heavy workloads are therefore a real perf dimension, not just a semantic edge case
- independent-parent `split_node` and `merge_node` segments no longer replay-transform every carried dirty path through every op during `applyBatch(...)`
- the planner now matches carried dirty paths to at most one structural op by parent-path prefix lookup, which collapses the old mixed exact-set prefix cliff without widening the public seam
- that cut matters specifically for planner-owned mixed batches:
  - flat `Transforms.applyBatch([...set_node, ...merge_node])`: `1083.61 ms` -> `186.9 ms`
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `1284.46 ms` -> `257.59 ms`
  - flat pure `Transforms.applyBatch([...merge_node])`: `113.2 ms`
  - flat pure `Transforms.applyBatch([...split_node])`: `177.06 ms`
- manual `Editor.withBatch(...)` split loops now stay in the same class too once live split ops stage their dirty paths instead of paying the generic per-op tail:
  - flat manual `Editor.withBatch([...split_node])`: `171.12 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `150.81 ms`
- the semantic trap there was root-parent structural ops:
  - a split at `[0]` has parent path `[]`
  - the carried dirty-path transform must still match that empty parent prefix
  - otherwise prior dirty path `[1]` never remaps to `[2]`, and later normalize misses replay-equivalent text merges
- mixed `set_node + merge_node` is a valid batch-only workload but not a plain replay-oracle case:
  - ordinary per-op replay eagerly normalizes each `set_node`, which can collapse adjacent text children before the later `merge_node`
  - the right semantic guardrail there is `Transforms.applyBatch(...)` equivalence with manual `Editor.withBatch(...)`, not equivalence with plain unbatched replay
- the same history caveat showed up in the wrapper-stack matrix:
  - mixed text-selection-structural batches can record normalize-generated `merge_node` ops in undo history
  - the right assertion there is batch-history equivalence with replay-history, not a hand-written op list that pretends normalize stayed asleep
- distinct-parent text `merge_node` is now a real draft family, not just a dirty-path batching trick:
  - `children.ts` stages those merges into a private draft exactly the way direct text splits already worked
  - the generic-tree observation matrix now includes the two-op `mergeNodeDirtyPaths` case under read-after-each and persisted-ref observation
  - that matters because the private merge draft has to preserve the same published-node immutability and wrapper-read semantics as the other batch drafts
- once live `split_node` / `merge_node` batching matured, the planner-owned independent-parent segment path became a net loss:
  - it was more code
  - it was slower than just letting `Editor.withBatch(...)` drive the live engine
  - hard-cutting that planner path brought `Transforms.applyBatch(...)` back into the same class as manual batching
- current `5,000`-block checkpoint after the hard cut:
  - flat `Transforms.applyBatch([...merge_node])`: `70.4 ms`
  - flat manual `Editor.withBatch([...merge_node])`: `70.68 ms`
  - flat `Transforms.applyBatch([...split_node])`: `145.36 ms`
  - flat manual `Editor.withBatch([...split_node])`: `158.33 ms`
  - flat `Transforms.applyBatch([...set_node, ...merge_node])`: `83.92 ms`
  - flat manual `Editor.withBatch([...set_node, ...merge_node])`: `73.35 ms`
- current `5,000`-block checkpoint after the direct-text merge draft:
  - flat `Transforms.applyBatch([...merge_node])`: `12.74 ms`
  - flat manual `Editor.withBatch([...merge_node])`: `13.25 ms`
  - flat `Transforms.applyBatch([...set_node, ...merge_node])`: `24.75 ms`
  - flat manual `Editor.withBatch([...set_node, ...merge_node])`: `23.15 ms`
  - flat `Transforms.applyBatch([...move_node, ...merge_node])`: `44.78 ms`
  - flat manual `Editor.withBatch([...move_node, ...merge_node])`: `44.56 ms`
  - flat `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`: `48.51 ms`
  - flat manual `Editor.withBatch([...set_node, ...move_node, ...merge_node])`: `46.1 ms`
  - flat `Transforms.applyBatch([...split_node])`: `36.92 ms`
  - flat manual `Editor.withBatch([...split_node])`: `38.41 ms`

That changes the remaining target again:

- merge-family work is no longer the problem
- the remaining live engine cost is mostly split-heavy and merged-text transform work
- planner deltas are now mostly noise compared to the raw transform cost on those lanes
- warmed text baselines make the remaining picture clearer:
  - flat `Transforms.applyBatch([...insert_text])`: `31.66 ms`
  - flat manual `Editor.withBatch([...insert_text])`: `29.7 ms`
  - flat `Transforms.applyBatch([...insert_text])` with read-after-each observation: `44.41 ms`
  - flat manual `Editor.withBatch([...insert_text])` with read-after-each observation: `48.15 ms`
  - so the remaining text cost is real engine/normalize work, not `applyBatch(...)` sugar overhead
- warmed split baselines say the same thing:
  - flat `Transforms.applyBatch([...split_node])`: `35.2 ms`
  - flat manual `Editor.withBatch([...split_node])`: `40.71 ms`
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `40.38 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `38.79 ms`
  - flat `Transforms.applyBatch([...move_node, ...split_node])`: `65.14 ms`
  - flat manual `Editor.withBatch([...move_node, ...split_node])`: `61.87 ms`
  - flat `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`: `65.08 ms`
  - flat manual `Editor.withBatch([...set_node, ...move_node, ...split_node])`: `69.01 ms`
  - so split-family work is also no longer hiding a second-class `applyBatch(...)` path; the remaining cost is the live transform itself
- the split perf harness is now honest about the staged batch work too:
  - refs, draft staging, finalize bookkeeping, materialize, and live split dirty-path flush are all single-digit-millisecond work at `5,000` blocks
  - do not fake a standalone split normalize phase in the harness; the naive simulation explodes into nonsense because it does not match the real batch-exit environment
  - if split still needs another win, profile the real batch-exit normalize path instead of cargo-culting isolated helpers
- the real batch-exit split profiler is now wired through `core/batch.ts`, not guessed from helper timings:
  - flat `Transforms.applyBatch([...split_node])`: `40.82 ms`
  - flat manual `Editor.withBatch([...split_node])`: `40.62 ms`
  - staged split work stays cheap:
    - `refs`: `0.21 ms`
    - `stageDraft`: `0.33 ms`
    - `stageDirtyPaths`: `0.09 ms`
    - `finalize`: `0.51 ms`
    - `materialize`: `1.84 ms`
    - `dirtyPathFlush`: `2.6 ms`
  - the remaining split cost is mostly real batch-exit normalize work:
    - `flushBeforeNormalize`: `2.46 ms`
    - `normalize`: `24.91 ms`
    - the post-normalize flush/commit phases were effectively noise on this lane
  - that means the next split-family win, if any, has to come from normalize-generated merge work or inline normalization shape, not another draft/planner trick

That changes the optimization bar:

- small new helpers now have to beat already-warmed, already-equivalent `applyBatch(...)` vs `withBatch(...)` lanes
- if a change does not reduce the raw transform family cost itself, it is probably just engine noise and should be cut
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `165.49 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `141.54 ms`
- the next broad structural win came from the base `move_node` transform itself, not another batch seam:
  - same-parent moves now clone the parent once, splice the child out, then splice it back in at the remapped index
  - that removes the old double tree rewrite for the common same-parent move shape
- current `5,000`-block checkpoint after that move rewrite:
  - flat `Transforms.applyBatch([...move_node])`: `28.84 ms`
  - flat `Transforms.applyBatch([...set_node, ...move_node])`: `48.28 ms`
  - flat `Transforms.applyBatch([...move_node, ...merge_node])`: `83.3 ms`
  - flat manual `Editor.withBatch([...move_node, ...merge_node])`: `86.21 ms`
  - flat `Transforms.applyBatch([...move_node, ...split_node])`: `174.9 ms`
  - flat manual `Editor.withBatch([...move_node, ...split_node])`: `152.66 ms`
- current `5,000`-block checkpoint after reverting the bad blanket simulation cut and tightening live independent-parent merge batching:
  - flat `Transforms.applyBatch([...merge_node])`: `71.37 ms`
  - flat manual `Editor.withBatch([...merge_node])`: `67.62 ms`
  - flat `Transforms.applyBatch([...split_node])`: `129.1 ms`
  - flat manual `Editor.withBatch([...split_node])`: `131.07 ms`
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `139.11 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `128.67 ms`
  - empty `Transforms.applyBatch([...interleaved insert_node, move_node])`: `53.85 ms`
  - empty manual `Editor.withBatch([...interleaved insert_node, move_node])`: `70.68 ms`
- that changed the priority again:
  - move-family work is in good shape
  - the next honest hotspot is split-family cost, especially mixed structural batches that still pay too much around split work
- the first split-family fix was not a new split executor at all:
  - the real waste on `set_node + split_node` was planner overhead on a batch the planner could not specialize
  - bypassing segment planning for no-insert/no-move batches pulled `Transforms.applyBatch(...)` back into the same class as manual batching
- current `5,000`-block checkpoint after that cut:
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `143.28 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `145.67 ms`
  - flat `Transforms.applyBatch([...move_node, ...split_node])`: `172.75 ms`
  - flat manual `Editor.withBatch([...move_node, ...split_node])`: `176.65 ms`
  - flat `Transforms.applyBatch([...split_node])`: `126.54 ms`
  - flat manual `Editor.withBatch([...split_node])`: `120 ms`
- the follow-up split dirty-path helper made the live split path more honest than magical:
  - distinct-parent split batches stay cheap
  - same-parent split batches fall back to the generic transform path
  - that cut is more about maintainability and explicit semantics than a giant benchmark jump
- the split-family cut that was actually worth keeping was narrower than a new generic split engine:
  - direct-child text splits can stage tree mutation into a private split draft
  - that only works if live split dirty-path batching stays in place underneath it
  - the first version that staged split drafts but paid per-op dirty paths was garbage and deserved to die
  - the winning shape was: draft tree rewrite plus existing live split dirty-path batch
- current `5,000`-block checkpoint after that cut:
  - flat `Transforms.applyBatch([...split_node])`: `114.68 ms`
  - flat manual `Editor.withBatch([...split_node])`: `108.06 ms`
  - flat `Transforms.applyBatch([...set_node, ...split_node])`: `126.19 ms`
  - flat manual `Editor.withBatch([...set_node, ...split_node])`: `112.99 ms`
  - flat `Transforms.applyBatch([...move_node, ...split_node])`: `158.83 ms`
  - flat manual `Editor.withBatch([...move_node, ...split_node])`: `140.92 ms`
- strong take:
  - the obsolete independent-parent split replay path should stay dead
  - split-family work is no longer the blocker
  - the next honest hotspot is broader mixed structural work, not pure split
- the first triple-family checkpoint says the planner is at least composable enough to stop panicking about:
  - flat `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`: `120 ms`
  - flat manual `Editor.withBatch([...set_node, ...move_node, ...merge_node])`: `117.53 ms`
  - flat `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`: `153.22 ms`
  - flat manual `Editor.withBatch([...set_node, ...move_node, ...split_node])`: `149.09 ms`
- that also deserved real semantic coverage, not just stopwatch worship:
  - both triple-family shapes now have matrix coverage across `applyBatch` and manual `withBatch`
  - observation modes: `readAfterEach`, `persistRef`
  - wrapper modes: `plain`, `rewrite`
- stronger take:
  - the planner is no longer the next villain
  - merged-text normalize cost is the more honest next target
- the observation barrier must respect `Editor.withoutNormalizing(...)`: if normalization is suspended for the current transform, `editor.children` reads must return the current draft without trying to force observed normalization, or batched transforms like back-to-back `Transforms.setNodes(...)` spin forever on queued dirty paths before the second op even reaches `editor.apply`
- the observation-heavy text lane only stays cheap if two things remain true together:
  - once normalize has promoted text state into generic draft children, later text ops still use the text-batch helper
  - observed text-sibling merges do not requeue a second full observed normalize pass after the parent normalizer already handled that paragraph

Targeted direct instrumentation on the merged-text observation lane made the remaining text cost less mysterious:

- before narrowing text dirty paths: `Transforms.applyBatch([...insert_text])` with read-after-each observation spent about `3234.12 ms` total, including `3169.85 ms` inside `editor.normalize`
- after narrowing text dirty paths to the parent element only: the same lane spent about `2510.37 ms` total, including `2387.83 ms` inside `editor.normalize`

That matters because the cost is still normalize-heavy, but the leaf and root dirty paths were dead work. Cutting them buys a real win without widening the engine or lying about semantics.

Current merged-text checkpoint on the same `5,000`-block harness:

- flat merged-text `Transforms.applyBatch([...insert_text])`: `85.08 ms`
- flat merged-text `Transforms.applyBatch([...insert_text])` with read-after-each observation: `82.06 ms`

Do not overreact to short perf samples on that lane:

- `repeats=3` wandered enough to tell conflicting stories
- `repeats=5` is the minimum sane sample before treating merged-text numbers as real

The key fix there was not another text overlay. It was deleting the fake second pass:

- every observed `insert_text` already normalizes its parent paragraph in the first pass
- that pass may generate one internal text-sibling `merge_node`
- if that `merge_node` requeues live merge dirty paths, the wrapper read after the top-level text op forces a second observed normalize for no semantic gain
- skipping that dirty-path requeue for observed text-sibling merges keeps the public replay shape and collapses the observed lane back into the hot-path class

The exact-path one-seam design is still in the old `setNodesBatch` performance class. The widened insert draft is worth keeping too: both append and prepend-heavy empty-document build-up stay in the low-hundreds of milliseconds instead of multiple seconds, without widening the public API. The mixed-batch planner is worth keeping as well, and the same-parent move carry-over specialization finally proves it: `set_node` plus `move_node` is no longer replay-class once the engine stops re-transforming dense carried dirty paths the dumb way.

The next real split win also turned out to be dirty-path bookkeeping, not tree rewriting:

- live split batching only stages direct text splits
- but the independent-parent split dirty-path helper was still baking in structural split dirty paths instead of using Slate's actual `editor.getDirtyPaths(op)` semantics
- the first "parent-only for everything" shortcut was too aggressive and broke element-split cases like `splitNodeThenSetSelection`
- the correct cut is narrower:
  - keep the cheap carried-path prefix transform
  - derive each split op's _new_ dirty paths from `editor.getDirtyPaths(op)`
- that keeps the semantic fix while still cutting real cost on the flat `5,000`-block split lane:
  - `Transforms.applyBatch([...split_node])`: `110.96 ms` -> `91.12 ms`
  - manual `Editor.withBatch([...split_node])`: `176.32 ms` -> `100 ms`
  - `Transforms.applyBatch([...set_node, ...split_node])`: `129.82 ms` -> `109.93 ms`
  - manual `Editor.withBatch([...set_node, ...split_node])`: `125.07 ms` -> `98.43 ms`

Merge still had one last cheap cut too:

- text-sibling `merge_node` ops do not need dirty-path staging just because they happen outside observed normalize
- the old special-case only skipped those dirty paths during observation
- widening that cut to all text-sibling merges kept the matrix green and trimmed the merged-text lanes again:
  - `Transforms.applyBatch([...merge_node])`: `82.83 ms` -> `76.19 ms`
  - manual `Editor.withBatch([...merge_node])`: `79.17 ms` -> `64.78 ms`
  - `Transforms.applyBatch([...insert_text])` with read-after-each observation: `101.82 ms` -> `84.41 ms`

The next hotspot was not a tree helper at all. It was planner overreach on triple mixed lanes:

- `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`
- `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`

Those shapes were getting segmented into generic-before, move-middle, generic-after runs even though manual `Editor.withBatch(...)` was already faster on the full batch.

The fix is deliberately boring:

- if segment planning produces three or more segments
- and every segment is either `generic`, `move`, or `same-parent-move`
- prefer whole-batch execution through the live engine instead of forcing segmented planning

Verified on the `5,000`-block harness with `repeats=5`:

- `Transforms.applyBatch([...set_node, ...move_node, ...merge_node])`: `338.31 ms` -> `99.75 ms`
- manual `Editor.withBatch([...set_node, ...move_node, ...merge_node])`: `203.87 ms` -> `89.69 ms`
- `Transforms.applyBatch([...set_node, ...move_node, ...split_node])`: `199.49 ms` -> `117.62 ms`
- manual `Editor.withBatch([...set_node, ...move_node, ...split_node])`: `140.68 ms` -> `110.28 ms`

The remaining insert tax turned out to be self-inflicted bookkeeping, not tree rewriting:

- `canStageInsertNodeOperation(...)` cloned the entire staged insert op list on every insert
- then it rescanned that cloned list just to re-check “same parent”
- storing the staged parent path directly removed that accidental `O(n²)` check
- that collapsed empty-document insert batching from hundreds of milliseconds into the same general performance class as the other optimized families

The next mixed-op cliff was different:

- interleaved same-parent `insert_node + move_node` did not need another draft layer
- tree transform cost there was acceptable
- the real cliff was still dirty-path churn

The winning cut was to give that mixed pattern its own planner segment and a cheap same-parent dirty-path simulation:

- all ops stay under one parent path
- inserted nodes contribute final inserted paths plus descendants
- moved original nodes contribute their final slots
- previously dirty original descendant paths get remapped by final original index, not replay-transformed through every op

That dropped the empty-doc interleaved lane from multi-second garbage into double-digit milliseconds without changing the public seam or bypassing `editor.apply` wrappers.

## Recommendation

Keep the accessor-backed `editor.children` and private batch draft model. Generalize it instead of redesigning it again.

Strong take:

- `editor.children` should remain accessor-backed, not a raw mutable field
- batched downstream `apply` should write to a private draft root, not the committed snapshot
- external reads of `editor.children` during a batch should normalize the live draft in place and return replay-equivalent structure
- normalize-generated ops during that observation deopt should still pass through `editor.apply` wrappers
- later draft writes should never mutate already-published refs
- unsupported operations should deopt to the generic live draft path, not to committed-tree mutation

This is the cleanest design that satisfies all of the real constraints at once:

- one plugin seam: `editor.apply(op)`
- no array-based `apply`
- no second plugin hook
- correct read-after-downstream-apply semantics
- immutable previously-published refs
- exact-path `set_node` fast path already proven
- every other tree op should converge on the same draft-root semantics first, then get dedicated optimizers only if the benchmark says it matters

That means the optimizer strategy should be explicit:

- one generic batch engine supports every op mix
- op-family executors plug into that engine
- compatible executors should be able to run in the same batch without forcing a replay fallback
- incompatible or not-yet-optimized mixes should deopt to the generic draft-root executor, not to committed-tree mutation
- the architecture should make later optimizers additive instead of requiring another rewrite

## What this means mechanically

### `editor.children`

`editor.children` stops being the canonical mutable store.

Instead:

- the committed tree lives in internal storage
- `editor.children` getter returns current public tree state
- inside a batch, an external getter read is an observation barrier: it normalizes the live draft in place and returns that replay-equivalent state
- internal engine reads bypass the observation barrier and see the raw current draft state
- the setter updates the committed snapshot outside a batch
- inside a batch, raw assignment to `editor.children` should deopt or reset draft state explicitly, not silently corrupt it

This is a getter, yes. The mistake would be making every internal engine read look like a public observation. The batch engine needs a real distinction between internal reads and public observation.

### Batch draft

The final draft model has two layers:

1. generic draft root

- current private children root for the batch
- every tree op in a batch reads and writes against this draft root

2. op-family optimizer overlays

- exact-path `set_node` is the first one
- future families plug in only when they beat the generic draft-root path
- the long-term target is a planner/dispatcher that can combine compatible overlays in one batch and safely drop back to the generic draft root when needed

The draft should track:

- committed root
- current draft root
- draft version
- last materialized snapshot version
- optional exact-set-node pending ops or overlay state
- dirty paths
- whether the batch has switched from an optimized overlay back to plain draft-root mode

### Observation rule

When code reads `editor.children` during a batch:

- materialize an immutable snapshot from the current draft
- cache it for that draft version
- return it

If another op happens later:

- update the draft only
- bump the draft version
- do **not** mutate the previously materialized snapshot

If the batch hits an op family that is not optimized yet:

- materialize any active optimized overlay into the generic draft root
- continue on the generic draft root
- do **not** jump back to committed children just because the fast path ended

## Explicit non-goals

- no public `setNodesBatch(...)`
- no `editor.apply(ops[])`
- no second plugin-facing override seam
- no “optimize every op family at once” stunt
- no implicit or timing-based auto batching in this phase
- no full deep clone at batch start
- no proxy-based engine rewrite as the default first implementation

Immer-style batching is fine as a prototype if needed, but the production target should be a bespoke exact-path draft overlay with predictable semantics.

## Required semantic corrections before or during this phase

### 1. Duplicate-path rejection must go

Current exact-path batching rejects duplicate paths in one batch.

That is not acceptable for the long-term `applyBatch(...)` contract.

`Transforms.applyBatch(editor, ops)` must match sequential `editor.apply(op)` semantics.

So:

- duplicate exact paths must be allowed
- later ops win in the final tree
- original ops still remain in `editor.operations`
- history still records the original op list

The optimizer can fold duplicate writes internally. The public semantics cannot reject them.

### 2. The old bridge code is gone

The old `markBatchSafeApply(...)` / `isBatchSafeApply(...)` gate and `wrapExactSetNodeBatch(...)` seam are deleted locally.

That is the right end state for exact-path `set_node`:

- built-ins wrap `editor.apply`
- custom wrappers still see each op
- batching stays an engine concern

## Phased rollout

### Phase 0: Freeze semantics and perf baselines

Status: done

Goal:

- lock the required semantics before rewriting internals

Implementation units:

- `packages/slate/test/with-batch.js`
- `packages/slate/test/apply-batch-exact-set-node.js`
- `packages/slate-history/test/apply-batch-exact-set-node.js`
- `packages/slate-react/test/apply-batch.spec.tsx`
- `packages/slate/test/perf/set-nodes-bench.js`

Tests to add first:

- duplicate exact paths apply sequentially and last write wins
- custom `editor.apply` wrapper can rewrite `"blue" -> "orange"` inside `Editor.withBatch(...)` and `Transforms.applyBatch(...)`
- wrapper can call downstream `apply(op)` and then read `editor.children`
- previously held node refs stay unchanged after later writes in the same batch
- unsupported op after draft-start deopts safely and still matches replay semantics

Benchmark lanes to freeze:

- flat replay loop
- grouped replay loop
- `Transforms.applyBatch([...exact set_node])`
- `Editor.withBatch(...)` manual `editor.apply(set_node)` loop
- mid-batch read lane
- duplicate-path lane
- wrapper-read lane

### Phase 1: exact-path `set_node` engine rewrite

Status: done

Goal:

- prove the engine shape on one high-value op family

Delivered:

- accessor-backed `editor.children`
- exact-path `set_node` draft overlay
- immutable snapshot materialization on read
- `Transforms.applyBatch(...)` exact-path fast path
- public `setNodesBatch(...)` removal

### Phase 2: generic draft-root semantics for all tree ops

Status: done

Goal:

- make every tree op batch against private draft state, even before it is optimized

Delivered:

- non-`set_node` tree ops write to private draft children during a batch
- mixed exact-`set_node` plus structural batches promote cleanly into the generic draft root
- history, React, and committed-snapshot invariants are covered for the current mixed cases

### Phase 3: op-family optimizer rollout

Status: in progress

Goal:

- keep correctness generic
- add structural fast paths family by family where the benchmark proves they matter

Rules:

- every new optimizer must preserve the same public semantics as sequential `editor.apply(op)`
- every new optimizer must prove immutability of previously published node refs
- every new optimizer must integrate with the same draft-root batch engine
- every new optimizer must coexist with other op families via composition or safe deopt

Current order:

1. exact-path `set_node` — done
2. narrow `insert_node` family — done for monotonic same-parent batches
3. benchmark `remove_node`, `move_node`, `merge_node`, and `split_node` before choosing the next optimizer
4. widen `insert_node` only if the measured workloads justify more than the current monotonic same-parent cut

Current measured priority at `5,000` ops:

1. `insert_node` on empty-document build-up — still the slowest remaining specialized workload
   - replay: `2757.86 ms`
   - batch: `281.86 ms`
2. cross-segment mixed structural work — now the more honest hotspot than pure split
   - flat `Transforms.applyBatch([...set_node, ...split_node])`: `165.49 ms`
   - flat manual `Editor.withBatch([...set_node, ...split_node])`: `141.54 ms`
3. `move_node` — fixed enough that it is no longer the urgent fire
   - replay: `1692.25 ms`
   - batch: `126.46 ms`
4. `merge_node` — in the same “worth measuring, not panicking” bucket
   - replay: `2820.19 ms`
   - batch: `77.89 ms`
5. `split_node` — no longer a blocker on either entrypoint
   - flat `Transforms.applyBatch([...split_node])`: `184.3 ms`
   - flat manual `Editor.withBatch([...split_node])`: `171.12 ms`
6. `remove_node` — still not worth a dedicated optimizer
   - replay: `8.79 ms`
   - batch: `8.09 ms`

Strong take:

- no structural family is replay-class anymore
- same-parent move dirty-path batching was the right slice at that point; it bought the big move win without a new seam
- live split batching killed the old manual `withBatch` split cliff without another public seam
- once live split/merge batching was fast enough, deleting the stale planner-owned independent-parent split/merge path was the right move; simpler code and better numbers is not subtle
- root-parent structural dirty-path remapping is a real invariant, not a corner case
- the next optimizer should be chosen by workload, not panic
- if we keep pushing immediately, broader `insert_node` planning and cross-segment mixed structural work are better candidates than pure split
- `split_node` and `merge_node` are now second-pass optimization candidates, not blockers
- `remove_node` does not earn special treatment yet
- do not retry the naive split overlay shape; it was slower than the baseline and deserved to die

### Phase 4: all-mix support hardening

Status: pending

Goal:

- prove the end goal, not just the first optimized family

Required coverage:

- any mixed batch must match sequential replay semantics
- optimized prefix followed by unsupported ops must deopt into the generic draft root without early commit
- multiple optimized families in one batch must either compose or deopt in a controlled, test-covered way
- errors inside a batch must not corrupt committed children, pending operations, or snapshot state
- direct `editor.children = ...` assignment inside a batch must have explicit and tested semantics

### Phase 5: broader performance justification

Status: pending

Goal:

- avoid optimizing op families that do not materially benefit

Required lanes:

- exact `set_node`
- mixed exact `set_node` plus structural tail ops
- monotonic same-parent `insert_node`
- grouped and flat insert workloads
- insert-only empty-document build-up lane
- observation-heavy mid-batch read lane
- representative mixed-op workloads once more than one family is optimized

Exit criteria:

- failing tests clearly describe the semantic target
- current perf baselines are captured before internals move

### Phase 1: Introduce accessor-backed committed children storage

Status: done

Goal:

- make `editor.children` observable without changing public API shape

Implementation units:

- `packages/slate/src/create-editor.ts`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/utils/weak-maps.ts`
- new internal helper, likely:
  - `packages/slate/src/core/children.ts`

Design:

- store committed children in internal editor state
- define `children` as an enumerable accessor on the editor instance
- outside batch, getter/setter behave exactly like the current raw property
- no normalize or flush side effects on getter access

Coverage:

- direct assignment `editor.children = [...]` still works
- direct reads outside batch are unchanged
- shape checks and editor creation stay compatible

Exit criteria:

- no user-facing API change
- plain non-batch editor behavior is unchanged

### Phase 2: Add the exact-path batch draft overlay

Status: done

Goal:

- make batched downstream `apply` own the fast path directly

Implementation units:

- `packages/slate/src/core/apply.ts`
- `packages/slate/src/core/batch.ts`
- `packages/slate/src/utils/weak-maps.ts`
- `packages/slate/src/core/children.ts`
- `packages/slate/src/core/batching/exact-set-node-children.ts`

Design:

- when batching and receiving supported exact-path `set_node` ops:
  - update the batch draft
  - append original ops to `editor.operations`
  - update dirty paths
  - do not mutate committed `children`
- preserve sequential op semantics
- support duplicate exact paths by storing per-path op lists or folding in order

This phase should make both paths use the same draft engine:

- `Transforms.applyBatch(editor, ops)`
- `Editor.withBatch(editor, () => editor.apply(op))`

Coverage:

- `Transforms.applyBatch(...)` and manual `Editor.withBatch(...)` loops share exact semantics
- duplicate path semantics match replay
- operations list preserves original op order
- no history regression yet

Perf target:

- no-observation exact-path lane stays in the current single-digit millisecond class on flat `5,000` blocks

Exit criteria:

- exact-path batch fast path no longer depends on public or semi-public secondary executors
- done locally

### Phase 3: Add snapshot materialization on `editor.children` reads

Status: done for exact-path `set_node`

Goal:

- preserve read-after-downstream-apply semantics without replay fallback

Implementation units:

- `packages/slate/src/core/children.ts`
- `packages/slate/src/core/batch.ts`
- `packages/slate/src/core/apply.ts`

Design:

- draft version increments on every supported batched write
- getter returns cached snapshot if versions match
- getter materializes a new immutable snapshot if draft version changed
- snapshots are immutable views over the draft state
- later draft writes never mutate already-published snapshot objects

Coverage:

- custom wrapper that calls downstream apply then reads `editor.children` sees the updated tree after each op
- previously persisted node refs remain unchanged after later writes
- repeated reads without draft changes return the same snapshot identity
- repeated reads after draft changes return fresh snapshot identity

Perf target:

- no-observation lane stays near current fast-path numbers
- observed-read lane may slow down, but should still be measured explicitly instead of guessed

Exit criteria:

- custom `editor.apply` wrappers no longer require replay fallback just to stay correct
- done locally for exact-path `set_node`

### Phase 4: Remove temporary gates and second internal seam

Status: done

Goal:

- collapse the bridge code into the final engine shape

Implementation units:

- `packages/slate/src/core/batch.ts`
- `packages/slate/src/create-editor.ts`
- `packages/slate-history/src/with-history.ts`
- `packages/slate-dom/src/plugin/with-dom.ts`
- `packages/slate-react/src/plugin/with-react.ts`

Delete or simplify:

- old marker-gate logic
- any marker propagation logic in built-in wrappers
- old secondary exact-batch wrapper seam

Built-ins should keep one seam:

- wrap `editor.apply`
- rely on the engine to handle batch mode correctly

Coverage:

- history undo/redo after observed mid-batch reads
- React wrapper chain still gets correct state
- DOM key bookkeeping still survives exact-path batched writes
- custom wrappers and built-in wrappers both behave correctly without the safety gate

Exit criteria:

- no internal compatibility crutch remains for exact-path batching
- done locally

### Phase 5: Lift all tree ops onto the generic draft root

Status: partly done

Goal:

- stop mutating committed children for non-`set_node` tree ops during batching

Implementation units:

- `packages/slate/src/core/children.ts`
- `packages/slate/src/core/apply.ts`
- `packages/slate/src/core/batch.ts`
- `packages/slate/src/interfaces/transforms/general.ts`
- tests in `packages/slate/test/with-batch.js`
- tests in `packages/slate/test/apply-batch-generic-tree-ops.js`

Design:

- introduce a generic `draftChildren` root in internal state
- while batching, any tree op that is not currently using an optimized overlay reads and writes against `draftChildren`
- if exact-path `set_node` overlay is active and a structural op arrives:
  - materialize the exact-set-node overlay into `draftChildren`
  - continue on `draftChildren`
- committed children are only updated at batch commit or hard internal deopt

Coverage:

- `insert_node`, `remove_node`, `merge_node`, `split_node`, and `move_node` inside `Editor.withBatch(...)` preserve read-after-apply semantics
- previously published node refs remain unchanged after later structural ops
- mixed exact-path `set_node` + structural-op batches match replay semantics
- `editor.operations`, dirty paths, and flush scheduling stay correct

Exit criteria:

- all tree ops batch against private draft state
- committed children are no longer the live mutation target during batching

Current checkpoint:

- generic draft-root support is in place locally for non-`set_node` tree ops
- mixed exact-path `set_node` + structural-op batches promote into generic draft state instead of mutating committed children
- direct `editor.children = ...` inside a batch currently lands in draft state
- broader structural-op and assignment coverage is now in place, but more history and perf lanes are still needed

### Phase 6: Optimize structural op families selectively

Status: pending

Goal:

- improve the hot structural families without reintroducing API or seam debt

Priority order:

1. `insert_node` / `remove_node`
2. `split_node` / `merge_node`
3. `move_node`
4. only then revisit text and selection families if numbers justify it

Design rule:

- the generic draft root is the correctness path
- an op-family optimizer is allowed only when:
  - it preserves replay semantics
  - it preserves immutable published refs
  - it materially beats the generic draft-root path in the benchmark

Coverage:

- family-specific replay equivalence
- duplicate and neighboring path stress cases
- undo/redo under `withHistory(...)`
- wrapper-read semantics under `withReact(...)` and `withDOM(...)`

Exit criteria:

- the measured hot families beat the generic path enough to justify their complexity

### Phase 7: Harden all-op deopt, observation, and assignment rules

Status: pending

Goal:

- make weird cases boring instead of surprising

Rules:

- raw `editor.children = ...` inside batch must have explicit semantics
- unsupported internal state must fail loudly, not half-commit
- observed-read workloads must stay correct even when snapshots are re-materialized repeatedly
- mixed-op batches must never jump back to committed children mid-flight

Coverage:

- mid-batch observation lane
- direct `editor.children = ...` during batch
- structural-op after exact-set-node overlay
- error paths do not corrupt `editor.operations`, dirty paths, or pending flush state

Exit criteria:

- unsupported cases are correct before they are fast

### Phase 8: Re-evaluate auto batching only after the engine is proven

Do not even touch this before Phases 0 through 7 are green and benchmarked.

If revisited later:

- only batch within deterministic Slate-owned boundaries
- do not use microtask or event-loop guessing
- do not introduce a second semantic model

## Coverage strategy

This work should be run strict TDD, not “add a benchmark and pray.”

Strong rule: `100% coverage` here does **not** mean “every theoretical permutation forever.” That’s fake precision. It means `100% of the declared matrix is generated, replay-oracled, and green`.

### Semantic oracle

Every matrix case must compare batched execution against one canonical oracle:

- same initial editor state
- same op list
- same wrapper stack
- replay through ordinary sequential `editor.apply(op)`
- compare:
  - final tree
  - selection
  - `editor.operations`
  - history shape where relevant
  - read-after-apply observations where relevant
  - immutability of previously published refs where relevant

Do not hand-write expected trees for broad matrix coverage. Use replay as the semantic oracle and reserve explicit expected trees for a few named evil cases only.

### Matrix dimensions

The matrix must be explicit. “Mixed ops” is not a dimension. It’s hand-waving.

#### Axis A: batch entry

- `Transforms.applyBatch(editor, ops)`
- `Editor.withBatch(editor, () => ops.forEach(editor.apply))`

#### Axis B: wrapper mode

- plain editor
- transparent `editor.apply` wrapper
- rewriting `editor.apply` wrapper
- built-in wrapper stacks:
  - `withHistory`
  - `withReact`
  - `withDOM`

#### Axis C: observation mode

- no reads during batch
- read `editor.children` after each op
- persist node ref, mutate same logical node later, verify old ref unchanged
- repeated reads without writes keep identity
- repeated reads after writes refresh identity

#### Axis D: op-family segment

- exact-path `set_node`
- `insert_node`
- `remove_node`
- `move_node`
- `merge_node`
- `split_node`
- `insert_text`
- `remove_text`
- `set_selection`

#### Axis E: batch shape

- single-family batch
- contiguous optimized segment then generic tail
- contiguous generic segment then optimized tail
- interleaved mixed segment
- duplicate-target / repeated-target segment

#### Axis F: path relationship

- same exact path
- same parent adjacent
- same parent sparse
- cross-parent siblings
- ancestor / descendant
- flat top-level
- nested grouped

#### Axis G: document shape

- empty
- flat wide
- grouped
- nested

#### Axis H: failure / mutation mode

- normal success
- direct `editor.children = ...` during batch
- downstream `apply` throws mid-batch

### Coverage tiers

Trying to full-cartesian every axis is how you build a heroic, useless test suite. Use tiers.

#### Tier 1: exhaustive family matrix

For each individual op family, generate the full cross-product of the smallest meaningful axes:

- batch entry
- wrapper mode: plain + rewriting wrapper
- observation mode
- path relationship
- document shape
- failure mode where applicable

This is the closest thing to honest `100%` and it is affordable because it stays family-local and uses tiny documents.

#### Tier 2: pairwise mixed-op matrix

For multi-family batches, require pairwise coverage across all axes and full coverage across:

- every op-family pair
- every planner boundary:
  - optimized -> optimized
  - optimized -> generic
  - generic -> optimized
  - generic -> generic
- every observation mode
- every wrapper mode

Use generated cases. No ad hoc “one mixed test should be enough” nonsense.

#### Tier 3: named evil cases

These stay explicit and permanent:

- duplicate exact paths
- read-after-downstream-apply in wrapper
- persisted ref then later mutation of same logical node
- mid-batch direct assignment
- throw after optimized prefix
- throw after snapshot materialization
- interleaved same-parent `insert_node + move_node`
- mixed text + selection + tree ops

The generator does not replace these. These are the scars.

#### Tier 4: perf matrix

Perf is not part of semantic `100%`, but it is part of rewrite acceptance.

### Generator design

Do not keep hand-writing cases forever. Add a small matrix generator helper and let specs declare dimensions.

Required shape:

- input:
  - initial document factory
  - op sequence factory
  - wrapper factory
  - observation hooks
  - expected mode: success or throw
- execution:
  - run replay oracle
  - run `applyBatch`
  - run manual `withBatch`
- assertions:
  - structural equivalence
  - selection equivalence
  - `editor.operations` equivalence
  - undo/redo equivalence where requested
  - published-ref immutability where requested

The generator must emit deterministic case names so failures are readable and bisectable.

### Matrix manifest and CI gate

The matrix must be enumerable, not implied.

Required:

- one matrix manifest per major test area
- the manifest returns the exact generated case count
- each spec asserts the generated count is non-zero and matches the declared manifest size
- the declared counts live in one shared registry, not scattered file-local constants
- CI runs a central manifest-registry test that scans the matrix specs and proves the registry and helper usage still match
- CI must run the full generated set, not a smoke subset

This prevents the classic rot:

- add a new optimizer
- forget to add matrix cells
- still claim “coverage”

If a new op family, wrapper mode, observation mode, or planner boundary is added, the manifest must change in the same patch.

### File plan

Keep broad matrix coverage split by concern instead of growing one monster file.

#### `packages/slate/test/with-batch.js`

Keep explicit seam tests here:

- lifecycle semantics
- wrapper read-after-downstream-apply
- direct assignment semantics
- throw/deopt semantics
- snapshot identity / immutability assertions

#### `packages/slate/test/apply-batch-exact-set-node.js`

This becomes the exhaustive family matrix for exact `set_node`.

Required generator dimensions:

- flat vs nested
- duplicate path vs unique path
- observation modes
- plain vs rewriting wrapper
- `applyBatch` vs manual `withBatch`

#### `packages/slate/test/apply-batch-generic-tree-ops.js`

This owns the exhaustive family matrices for:

- `insert_node`
- `remove_node`
- `move_node`
- `merge_node`
- `split_node`

And the pairwise mixed-tree matrix.

#### `packages/slate/test/apply-batch-generic-ops.js`

This owns non-tree and cross-domain mixes:

- `insert_text`
- `remove_text`
- `set_selection`
- text + selection
- text + tree
- selection + tree
- text + selection + tree

#### `packages/slate-history/test/apply-batch-exact-set-node.js`

History matrix, not just spot checks.

Required axes:

- single-family exact `set_node`
- structural-family sample
- mixed tree + selection sample
- observation before undo
- `withNewBatch(...)` split case
- throw case leaves undo stack sane

#### `packages/slate-react/test/chunking.spec.ts`

React-specific batch coverage, not just one smoke test.

Required axes:

- `Transforms.applyBatch(...)` move batches
- manual `Editor.withBatch(...)` move batches
- reconcile equivalence with replay
- chunk-tree insert/index-change callbacks stay replay-equivalent
- chunk-tree `movedNodeKeys` drains cleanly after reconcile

If DOM bookkeeping still has unique risk after that, add a dedicated DOM regression file. Do not pretend React coverage covers it.

### Perf coverage

`packages/slate/test/perf/set-nodes-bench.js` remains the source of truth.

The perf lane registry is explicit now:

- benchmark ids live in `packages/slate/test/perf/set-nodes-bench.js`
- required ids live in `REQUIRED_BENCHMARK_IDS`
- `packages/slate/test/perf-benchmark-manifest.js` fails if a required lane disappears
- the benchmark prototype equivalence check is part of that perf-manifest test, not just an ad hoc CLI preflight

Add or preserve lanes for:

- replay loop on flat docs
- replay loop on grouped docs
- `Transforms.applyBatch([...set_node])`
- `Editor.withBatch(...)` manual apply loop
- mixed exact-set-node + structural-op lane
- insert-only lane on an empty document
- prepend-insert lane on an empty document
- interleaved same-parent `insert_node + move_node` lane
- pure structural family lanes:
  - `insert_node`
  - `remove_node`
  - `merge_node`
  - `split_node`
  - `move_node`
- observed-read lane
- duplicate-path lane
- wrapper-read lane

Benchmark rule:

- real benchmark lanes must measure wall time without overriding `editor.apply`
- helper timing belongs in separate breakdown output, not in a wrapper that changes engine behavior

`site/examples/ts/huge-document.tsx` stays the manual/browser repro, not the primary performance oracle.

### Acceptance thresholds

Semantic acceptance:

- every declared Tier 1 family cell is generated and green
- every declared Tier 2 pairwise mixed cell is generated and green
- every Tier 3 evil case is explicit and green
- replay oracle is the only semantic source of truth for generated cases

Perf acceptance:

- exact-path no-observation workloads stay materially faster than replay, target at least `10x` on flat `5,000`
- grouped exact-path lane stays in the same performance class as current local numbers
- manual `Editor.withBatch(...)` loop and `Transforms.applyBatch(...)` stay in the same performance class
- generic structural batching must never regress into committed-tree mutation or obvious replay-class overhead
- observation-heavy lanes may be slower, but must be measured and reported

Completion rule:

- do not claim `100% matrix coverage` until the plan names the matrix, the generator enumerates it, and CI runs the whole declared set
- if a dimension is intentionally excluded, write that exclusion down explicitly instead of silently pretending it is covered
- if a new engine capability ships without a matching manifest delta, treat that as missing coverage, not follow-up polish

## File map

Primary implementation files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/utils/weak-maps.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/batch.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/transforms/general.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/children.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/batching/exact-set-node-children.ts`

Primary tests:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/with-batch.js`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-batch-exact-set-node.js`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-batch-generic-tree-ops.js`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-batch-generic-ops.js`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/children-accessor.js`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/apply-batch-exact-set-node.js`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/chunking.spec.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/perf/set-nodes-bench.js`

## Verification plan

- targeted unit tests in `packages/slate`
- targeted history safety spot-checks
- package build and typecheck for touched Slate packages
- focused perf runs with `packages/slate/test/perf/set-nodes-bench.js`
- manual sanity check with `site/examples/ts/huge-document.tsx`

## Risks

### Accessor compatibility risk

Some code may assume `children` is a plain data property.

Mitigation:

- define the accessor as enumerable
- keep normal assignment semantics outside batch
- add a compatibility test around `createEditor()` and direct assignment

### Snapshot churn risk

Observation-heavy batches may materialize many snapshots and lose some speed.

Mitigation:

- cache by draft version
- measure the observed-read lane explicitly
- accept deopt cost for read-heavy pathological cases instead of corrupting semantics

### Mixed-op scope creep

Trying to optimize all ops immediately will bury the work.

Mitigation:

- generic draft root first for all ops
- op-family optimizers only after measurement

## Final recommendation

Finish the rewrite in two layers:

1. generic correctness layer

- every batched tree op uses a private draft root
- `editor.children` exposes immutable snapshots
- one public seam stays: `editor.apply(op)`

2. measured optimization layer

- exact-path `set_node` stays optimized
- structural families get optimizers only when benchmarked workloads justify them
