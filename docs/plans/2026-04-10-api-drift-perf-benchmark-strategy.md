---
date: 2026-04-10
topic: api-drift-perf-benchmark-strategy
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# API Drift Perf Benchmark Strategy

## Goal

Stop arguing about API drift from architecture taste alone.

Next step: benchmark the meaningful API drifts first, then decide which ones
deserve optimization work.

Execution register:

- [api-drift-perf-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/api-drift-perf-register.md)

## Rule

- API drift gets priority over non-API drift.
- Non-API drift matters only when it:
  - changes architecture direction
  - shows up inside a user-facing blocker lane
  - or contaminates an API drift benchmark enough to hide the real cause
- legacy black-box engines can be benchmark references without becoming design
  candidates

## Why This Order

The repo already has the right pattern in place:

- [performance-benchmark-spec.md](/Users/zbeyens/git/plate-2/docs/performance/performance-benchmark-spec.md)
  says fair comparisons need the same scenario, runtime, capture settings, and
  active profile.
- [editor-performance-next-phase-consensus.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-next-phase-consensus.md)
  says benchmarks decide sequencing and generic seams get fixed before wider
  blame spreads.
- [perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
  already separates blocker lanes from diagnostic-only lanes.
- [normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md)
  proves one API drift can be frozen as a contract matrix before optimization.

That should become the default workflow for all meaningful API drifts.

## What Counts As An API Drift Perf Lane

A drift deserves a perf lane when both are true:

1. it belongs to the kept public surface or a compatibility surface we still
   defend
2. it can plausibly affect either:
   - a default recommendation surface
   - a broader replacement claim
   - or a diagnostic engine cost that might later map upward into one of those

## Initial Drift Classes

### 1. Normalization / control surface

Primary examples:

- `Editor.normalize`
- `Editor.normalizeNode`
- `Editor.shouldNormalize`
- `Editor.withoutNormalizing`

This class already has the best existing pattern:

- contract matrix
- local diagnostic bench
- legacy compare bench
- reopen verdict

Use it as the template for the rest.

### 2. Query / traversal surface

Primary examples:

- `Editor.nodes`
- `Editor.positions`
- `Editor.fragment`
- ref/query helpers that now forward through current instance seams

Benchmark only the rows that sit on hot user flows or are called in tight
 loops. Do not benchmark the entire namespace just because it exists.

### 3. Transform / mutation surface

Primary examples:

- `setNodes`
- `insertFragment`
- `moveNodes`
- path/ref rebasing helpers when they materially change mutation cost

This class matters when public transform semantics are preserved but the new
engine topology may have changed cost shape.

Important constraint:

- benchmark against legacy `slate-batch-engine` behavior when useful
- do not treat that engine as something v2 should pull forward by default

### 4. React runtime public surface

Primary examples:

- `withReact`
- `Editable`
- `EditableBlocks`
- `useSlateSelector`
- `useElement`
- `useSelected`

This class should only be counted as API drift perf when the kept React/public
surface itself is the hot seam, not when a lower-level core issue is the real
culprit.

## Inventory Pass

Build the benchmark inventory from:

- [api-surface-keep-cut-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/api-surface-keep-cut-register.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

For each kept drift row, record:

- drift id
- surface class
- owning public API
- current proof owner
- whether it is blocker-facing or diagnostic-only
- existing command/artifact if one already exists
- missing benchmark lane if it does not

## Benchmark Shape Per Drift

Every drift lane should have the same structure:

1. contract freeze
   - what behavior is being preserved
   - what is intentionally non-claim
2. local benchmark
   - current repo only
   - stable scenario id
3. compare benchmark
   - current vs legacy/pinned baseline
4. user-facing mapping
   - does this stay diagnostic
   - or does it map into a blocker lane
5. cause split
   - init vs live
   - explicit vs implicit
   - read vs write
   - wrapper vs core
   - pure value transform vs editor-operation path

If a lane cannot answer the cause split, the lane is not ready to drive fixes.

## Immediate Sequence

### Phase 1. Inventory all meaningful API drifts

Produce one register row per kept drift class, not per symbol unless a symbol is
already known hot.

### Phase 2. Finish diagnostic commands before adding more fixes

Normalization already has:

- `pnpm bench:normalization:local`
- `pnpm bench:normalization:compare:local`

Mirror that pattern for the next API drift classes instead of inventing ad hoc
one-off scripts.

### Phase 3. Map diagnostic drift lanes upward

For each red diagnostic lane, answer:

- does it actually hit a user-facing blocker lane
- which one
- under what scenario

If it does not map upward, it stays diagnostic and should not hijack the whole
optimization queue.

### Phase 4. Run cause analysis on the mapped red lanes

Only after a drift maps upward:

- instrument call counts
- split init/live
- split wrapper/core
- split pure-data work vs operation work

This is the point where optimization work becomes real.

### Phase 5. Choose fixes by measured leverage

Fix order:

1. generic tax that contaminates multiple kept API drifts
2. drift-specific cost on a blocker-facing lane
3. diagnostic-only red lanes with clear future leverage

Architecture guard:

- a strong compare result against a legacy black-box implementation does not, by
  itself, justify importing that implementation model into v2

## Current Best Candidate Order

1. normalization / control surface
   - already benchmark-backed
   - already clearly an API drift
   - already has cause evidence
2. mainstream richtext blocker surface
   - already failing as a blocker lane
   - use this to see which kept API drift actually leaks upward
3. React public runtime surface
   - only after the blocker mapping says hooks/providers are the real bill
4. query / traversal and transform drifts
   - only the hot rows, not the whole namespace for sport

## Stop Conditions

- Do not optimize a drift just because the diff looks architecturally weird.
- Do not widen into non-API cleanup unless the measured blocker lane points
  there.
- Do not reopen broad contract changes from diagnostic perf alone.

## Output We Need Next

One benchmark register for kept API drifts with these columns:

- drift id
- public API / surface
- class
- blocker status
- local command
- compare command
- artifact path
- mapped user-facing lane
- current number
- baseline number
- cause hypothesis
- decision

That register is the thing that should drive the next optimization strategy
meeting, not another freehand debate about which drift “feels expensive.”
