---
date: 2026-04-19
topic: slate-core-perf-coverage
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate-v2-draft
  - /Users/zbeyens/git/plate-2
origin_refs:
  - /Users/zbeyens/git/plate-2/docs/slate-v2-draft/master-roadmap.md
  - /Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md
  - /Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md
  - /Users/zbeyens/git/slate-v2-draft/scripts/benchmarks/README.md
---

# Slate Core Perf Coverage Plan

## Goal

Before leaving `../slate-v2/packages/slate`, land a real core-performance
benchmark package that covers the hot `slate` engine families instead of one
lonely `#6038` lane.

The bar is not:

- benchmark every exported helper for sport
- prove `slate-react` already wins
- widen scope into browser/runtime packages

The bar is:

- measure every performance-relevant `slate` core family
- keep the benchmark surface stable and repo-owned
- compare current vs legacy on the blocker lanes that can still expose core
  regressions
- leave `slate-react` with a trustworthy core baseline instead of vibes

## Harsh Current Read

Today the live repo only has one runnable package-local perf command:

- `bun run bench:slate:6038:local`

That lane is useful, but too narrow:

- it only compares `Editor.withTransaction(...)` vs
  `Transforms.applyBatch(...)` inside current `slate`
- it does not compare current vs legacy
- it does not cover normalization, read-after-write observation, large-document
  typing, structural node transforms, or store/query/ref pressure

The draft repo already solved most of the benchmark shape problem:

- canonical folder layout in `scripts/benchmarks/`
- shared helpers
- current-only core lanes
- current-vs-legacy compare lanes

But that setup drifted:

- draft `repo-compare.mjs` assumes non-Yarn means `pnpm`
- live `slate-v2` is Bun-owned
- legacy `slate` is Yarn PnP

So the first honest task is not “add more benchmarks”.
It is “restore benchmark infrastructure that can run across current Bun and
legacy Yarn without lying”.

## Latest Slice

- landed live benchmark package structure in `../slate-v2/scripts/benchmarks/`
- landed shared helpers:
  - `shared/stats.mjs`
  - `shared/repo-compare.mjs`
- kept `bench:slate:6038:local` alive and added:
  - `bench:core:transaction:local`
  - `bench:core:normalization:local`
  - `bench:core:query-ref-observation:local`
  - `bench:core:node-transforms:local`
  - `bench:core:text-selection:local`
  - `bench:core:editor-store:local`
  - `bench:core:refs-projection:local`
  - `bench:core:normalization:compare:local`
  - `bench:core:observation:compare:local`
  - `bench:core:huge-document:compare:local`
- landed current-only core family owners:
  - transaction execution
  - normalization
  - query/ref observation
  - structural node transforms
  - text/selection
  - editor store
  - refs/projection
- landed current-vs-legacy compare owners:
  - normalization
  - observation
  - huge-document

## Current Measured Read

The benchmark package is live, and the regression picture is now split cleanly:

First compare read:

- normalization compare:
  - adjacent-text normalize: `+274.61ms`
  - inline flatten normalize: `+6144.98ms`
  - insert-text read-after-each: `+3184.18ms`
- observation compare:
  - `editor.children.length` after each write: `+2329.16ms`
  - `Editor.nodes(...)` after each write: `+2431.04ms`
  - `Editor.positions(...)` after each write: `+2519.43ms`
- huge-document compare:
  - start-block typing: `+4269.43ms`
  - middle-block typing: `+4216.04ms`

Latest compare read after the core text/normalize pivots:

- normalization compare:
  - adjacent-text normalize: `-7.01ms`
  - inline flatten normalize: `-86.58ms`
  - insert-text read-after-each: `+32.15ms`
- observation compare:
  - `editor.children.length` after each write: `+22.07ms`
  - `Editor.nodes(...)` after each write: `+16.44ms`
  - `Editor.positions(...)` after each write: `+59.98ms`
- huge-document compare:
  - start-block typing: `+22.32ms`
  - middle-block typing: `+20.97ms`

That means:

- the broad write-path catastrophe is no longer the main story
- explicit normalization is no longer the blocker
- the remaining gap is a bounded read/typing delta on current-vs-legacy compare
  lanes

## Current Status

- benchmark infra is landed
- full core benchmark family coverage is landed
- compare lanes are runnable
- benchmark-owner ledger is empty
- package-local closeout gate is still green:
  - `cd ../slate-v2 && bun test ./packages/slate/test`
  - `cd ../slate-v2 && bunx turbo build --filter=./packages/slate`
  - `cd ../slate-v2 && bunx turbo typecheck --filter=./packages/slate`
  - `cd ../slate-v2 && bun run lint:fix`
  - `cd ../slate-v2 && bun run lint`
- the earliest standalone core owner gate for the next engine pivot is still
  red on the current tree:
  - `cd ../slate-v2 && bun test ./packages/slate/test/snapshot-contract.ts --bail 1`
- this benchmark-coverage lane is complete
- any remaining performance gap now needs explicit accept/defer judgment, not
  more benchmark farming by default
- `continue` checkpoint:
  - the old benchmark-coverage prompt is now stale
  - the next honest prompt should be about residual-delta judgment or the next
    package, not missing benchmark owners
  - repeating the old benchmark-coverage prompt does not reopen this lane
  - repeated stale-prompt `continue` invocations should keep returning `replan`
  - execution-state `status: completed` overrides the pasted stale prompt
  - until the prompt changes, the valid verdict stays `replan`
  - additional repeats without a new execution-state file should receive the
    same `replan` verdict

## Pivot History

- landed the benchmark package first because missing ownership was the blocker
- rejected staying on benchmark-package work after the compare lanes turned
  catastrophically red
- rejected a first `public-state.ts` cut that removed the redundant
  previous-snapshot clone and whole-tree change diffing because it failed to
  move the red lanes enough and tripped the standalone snapshot owner
- reverted that failed cut
- kept course on the broader root cause and landed:
  - direct outer text-op fast path in `core/apply.ts`
  - cheap mutation-version change detection in `editor/normalize.ts`
- that second pivot materially collapsed:
  - write-path observation cost
  - huge-document core typing cost
  - read-after-each normalization cost

## Current Tactic

- keep the benchmark package as the stable truth surface
- stop adding lanes
- treat the benchmark package as complete
- only reopen `packages/slate` perf work if the bounded remaining gap is not
  acceptable
- keep the write-path fast path only because it measurably moved the right
  lanes

## Next Move

1. decide whether the remaining bounded gap is acceptable or should be deferred
2. use the package suite as the correctness floor:
   - `bun test ./packages/slate/test`
3. use the current compare owners as the truth:
   - `bun run bench:core:normalization:compare:local`
   - `bun run bench:core:observation:compare:local`
   - `bun run bench:core:huge-document:compare:local`
4. if the remaining gap is not acceptable, replan a narrower teardown lane

## Scope

In scope:

- `../slate-v2/scripts/benchmarks/**`
- `../slate-v2/package.json`
- benchmark-related docs in `plate-2`
- core `slate` lanes only

Out of scope:

- `slate-history` perf beyond keeping its future compare lane unblocked
- `slate-dom` and `slate-react` runtime/browser perf lanes
- example/browser replacement lanes, except where they are referenced as later
  dependencies

## Full Coverage Definition

“Full transforms/api coverage” does **not** mean one benchmark per exported
function.

That would be stupid and noisy.

For `packages/slate`, full coverage means every performance-relevant family has
an owner lane:

1. transaction and batch publication
2. explicit normalization and normalization-under-observation
3. read-after-write query/observation pressure
4. structural node-transform families
5. text + selection transform families
6. public snapshot/store surface
7. ref/bookmark/projection pressure
8. huge-document core typing compare vs legacy

Pure value helpers like `Path.equals(...)` or `Range.includes(...)` do not get
their own lanes unless a benchmark proves they are part of a real hot path.

## Source Of Truth

Architecture and proof owners:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Draft benchmark shape to reuse:

- [scripts/benchmarks/README.md](/Users/zbeyens/git/slate-v2-draft/scripts/benchmarks/README.md)
- `core/current/normalization.mjs`
- `core/current/query-ref-observation.mjs`
- `core/current/node-transforms.mjs`
- `core/compare/huge-document.mjs`
- `core/compare/observation.mjs`
- `core/compare/normalization.mjs`
- `shared/repo-compare.mjs`
- `shared/stats.mjs`

Existing live lane to preserve:

- [6038-transaction-execution.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/slate/6038-transaction-execution.mjs)

## Non-Negotiable Rules

1. Keep public command names stable once introduced.
2. Keep benchmark implementation under `scripts/benchmarks/`, not ad hoc files.
3. One lane must answer one performance decision.
4. Current-only dissection lanes and current-vs-legacy compare lanes are
   different things. Do not blur them.
5. A green current-only lane is not proof of no regression.
6. A current-vs-legacy lane is not enough if it only covers one tiny family.
7. Do not let benchmark work smuggle runtime/package scope creep into
   `slate-react`.
8. If a compare harness cannot run current Bun + legacy Yarn honestly, fix the
   harness first.

## Target Benchmark Package

### Family 1: Transaction / Batch

Purpose:

- measure the public batch and commit writer path

Lanes:

- keep existing `#6038` lane as the stable transaction smoke owner
- add a general current-only transaction lane if `#6038` stays too issue-shaped

Surfaces covered:

- `Editor.withTransaction(...)`
- `Transforms.applyBatch(...)`
- direct `editor.apply(...)`
- mixed text + structural batch publication

Current owner input:

- `../slate-v2/scripts/benchmarks/slate/6038-transaction-execution.mjs`

### Family 2: Normalization

Purpose:

- measure explicit normalization and write-observe-normalize pressure

Lanes:

- `core/current/normalization.mjs`
- `core/compare/normalization.mjs`

Surfaces covered:

- `Editor.normalize(...)`
- adjacent text merge behavior
- inline flatten behavior
- observed writes during transaction

Draft source:

- `../slate-v2-draft/scripts/benchmarks/core/current/normalization.mjs`
- `../slate-v2-draft/scripts/benchmarks/core/compare/normalization.mjs`

### Family 3: Query / Observation / Ref Pressure

Purpose:

- measure the cost of reading committed state after writes

Lanes:

- `core/current/query-ref-observation.mjs`
- `core/compare/observation.mjs`

Surfaces covered:

- `editor.children`
- `Editor.nodes(...)`
- `Editor.positions(...)`
- `Editor.pathRef(...)`
- `Editor.rangeRef(...)`
- `Editor.rangeRefs(...)`

Draft source:

- `../slate-v2-draft/scripts/benchmarks/core/current/query-ref-observation.mjs`
- `../slate-v2-draft/scripts/benchmarks/core/compare/observation.mjs`

### Family 4: Structural Node Transforms

Purpose:

- measure the expensive shape-changing transforms directly

Lanes:

- port `core/current/node-transforms.mjs`
- add a second structural lane if the first one stays too narrow

Surfaces that must be represented before this family is called complete:

- `insertFragment`
- `insertNodes`
- `setNodes`
- `moveNodes`
- `splitNodes`
- `mergeNodes`
- `removeNodes`
- `wrapNodes`
- `unwrapNodes`
- `liftNodes`

Decision:

- port the draft lane first
- then widen it with the missing structural families instead of adding five
  tiny one-off scripts

Draft source:

- `../slate-v2-draft/scripts/benchmarks/core/current/node-transforms.mjs`

### Family 5: Text + Selection Transforms

Purpose:

- cover hot editing flows not cleanly owned by the structural lane

New lane:

- `core/current/text-selection.mjs`

Surfaces covered:

- `insertText`
- `delete`
- `select`
- `setSelection`
- `setPoint`
- `move`
- `collapse`

Reason:

- current benchmark corpus does not yet give this family a dedicated owner
- these are common hot paths and part of the public transforms surface

### Family 6: Snapshot / Store / Editor Public Surface

Purpose:

- measure the public accessor/store layer that future `slate-react` should lean
  on

New lane:

- `core/current/editor-store.mjs`

Surfaces covered:

- `getChildren`
- `setChildren`
- `getSnapshot`
- `replace`
- `reset`
- `subscribe`
- commit publication fanout

Reason:

- the current package has the right store primitives now
- there is no dedicated benchmark owner for them yet

### Family 7: Projection / Bookmark / RangeRef

Purpose:

- measure the future overlay-facing core semantics without dragging runtime
  logic into core

New lane:

- `core/current/refs-projection.mjs`

Surfaces covered:

- `Editor.projectRange(...)`
- `Editor.bookmark(...)`
- `Editor.rangeRef(...)`
- transaction publication of ref state under text and structural edits

Reason:

- this is the core-owned part of the overlay architecture
- it should be measured before `slate-react` tries to build locality on top

### Family 8: Core Huge-Document Compare

Purpose:

- prove whether large-document core typing is actually better, equal, or worse
  than legacy before runtime packages pile on top

Lane:

- `core/compare/huge-document.mjs`

Surfaces covered:

- repeated typing at start block
- repeated typing at middle block
- large committed tree pressure

Draft source:

- `../slate-v2-draft/scripts/benchmarks/core/compare/huge-document.mjs`

## Implementation Units

### Unit 1: Restore Canonical Benchmark Infra

Files:

- `../slate-v2/scripts/benchmarks/README.md`
- `../slate-v2/scripts/benchmarks/shared/stats.mjs`
- `../slate-v2/scripts/benchmarks/shared/repo-compare.mjs`
- `../slate-v2/package.json`

Plan:

- recreate the draft benchmark folder layout in live `slate-v2`
- move or wrap `#6038` so it lives inside the canonical structure
- port `shared/stats.mjs`
- port `shared/repo-compare.mjs`, but fix package-manager handling for:
  - current repo: Bun
  - legacy repo: Yarn PnP

Critical implementation decision:

- do **not** rely on external temp files outside the target repo
- legacy Yarn PnP package resolution will break that shape
- the helper should materialize temporary runner files inside the repo being
  benchmarked, or keep inline execution that resolves inside repo boundaries

Verification:

- each helper-backed lane runs under current Bun
- compare helper can build current `slate-v2` and legacy `slate`

### Unit 2: Restore Current-Only Core Lanes

Files:

- `../slate-v2/scripts/benchmarks/core/current/transaction-execution.mjs`
  or equivalent wrapper for `#6038`
- `../slate-v2/scripts/benchmarks/core/current/normalization.mjs`
- `../slate-v2/scripts/benchmarks/core/current/query-ref-observation.mjs`
- `../slate-v2/scripts/benchmarks/core/current/node-transforms.mjs`

Plan:

- port the three draft current-only core lanes
- keep the existing `#6038` artifact and command alive
- normalize artifact naming under `tmp/`

Verification:

- each lane writes a stable JSON artifact
- current-only commands run from repo root

### Unit 3: Land the Missing Current-Only Family Owners

Files:

- `../slate-v2/scripts/benchmarks/core/current/text-selection.mjs`
- `../slate-v2/scripts/benchmarks/core/current/editor-store.mjs`
- `../slate-v2/scripts/benchmarks/core/current/refs-projection.mjs`

Plan:

- add the three missing owner lanes that the draft corpus never finished for
  today’s stronger `slate` public surface
- derive scenarios from live contract owners, not imagination:
  - `transaction-contract.ts`
  - `surface-contract.ts`
  - `range-ref-contract.ts`
  - `bookmark-contract.ts`
  - `clipboard-contract.ts`
  - `transforms-contract.ts`

Verification:

- one benchmark script per missing family
- scenarios produce observable, validated postconditions

### Unit 4: Restore Current-vs-Legacy Compare Lanes

Files:

- `../slate-v2/scripts/benchmarks/core/compare/normalization.mjs`
- `../slate-v2/scripts/benchmarks/core/compare/observation.mjs`
- `../slate-v2/scripts/benchmarks/core/compare/huge-document.mjs`

Plan:

- port the draft compare lanes after infra is fixed
- replace stale `pnpm` assumptions with current package-manager-aware plumbing
- keep outputs stable:
  - `tmp/slate-normalization-compare-benchmark.json`
  - `tmp/slate-core-observation-benchmark.json`
  - `tmp/slate-core-huge-document-benchmark.json`

Verification:

- each compare command builds and runs against:
  - `/Users/zbeyens/git/slate-v2`
  - `/Users/zbeyens/git/slate`
- summary includes current, legacy, and delta

### Unit 5: Command Surface And Baseline Capture

Files:

- `../slate-v2/package.json`

Plan:

- add stable commands for every kept lane
- keep `bench:slate:6038:local`
- add family-shaped commands for the new package:
  - `bench:core:normalization:local`
  - `bench:core:query-ref-observation:local`
  - `bench:core:node-transforms:local`
  - `bench:core:text-selection:local`
  - `bench:core:editor-store:local`
  - `bench:core:refs-projection:local`
  - `bench:core:normalization:compare:local`
  - `bench:core:observation:compare:local`
  - `bench:core:huge-document:compare:local`

Verification:

- command names are stable
- each command writes its expected JSON artifact

### Unit 6: Proof-Doc Sync

Files:

- `../slate-v2/scripts/benchmarks/README.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/slate-tranche-3-execution.md`
  if the tranche record needs a perf-package addendum

Plan:

- document the live core benchmark package
- update the proof docs so the command reality is no longer “only broad test
  gates plus one narrow 6038 lane”

Verification:

- docs list the real runnable commands
- docs distinguish:
  - current-only dissection lanes
  - current-vs-legacy compare lanes
  - still-missing `slate-react` and overlay-local runtime lanes

## Sequencing

1. restore canonical benchmark infra
2. port current-only draft lanes
3. add missing current-only family owners
4. port compare lanes
5. add stable commands
6. run all core lanes once and capture baselines
7. sync proof docs
8. only then decide whether `packages/slate` can be left

Anything else is backwards.

## Verification Package

Benchmark infra/package verification:

- run every new `bench:core:*` and `bench:slate:6038:local` command once
- confirm each command writes the expected `tmp/*.json` artifact

Regression verification:

- `cd ../slate-v2 && bun test ./packages/slate/test`
- `cd ../slate-v2 && bunx turbo build --filter=./packages/slate`
- `cd ../slate-v2 && bunx turbo typecheck --filter=./packages/slate`
- `cd ../slate-v2 && bun run lint:fix`
- `cd ../slate-v2 && bun run lint`

## Exit Criteria

`packages/slate` perf measurement is good enough to leave only when all of
this is true:

1. canonical benchmark structure exists in live `slate-v2`
2. `#6038` still runs
3. current-only core family owners exist for:
   - transaction
   - normalization
   - query/ref observation
   - structural transforms
   - text/selection
   - editor store
   - refs/projection
4. compare lanes exist and run for:
   - normalization
   - observation
   - huge-document
5. stable package commands exist for all kept lanes
6. baseline artifacts have been captured once on the live tree
7. proof docs name the package honestly

That bar is **not** met on the current tree because the compare lanes expose
major regressions vs legacy.

## Risks

### Risk 1: Benchmark sport

Failure mode:

- too many tiny scripts
- no decision owner

Counter:

- benchmark by family, not by helper

### Risk 2: Stale draft plumbing

Failure mode:

- `pnpm` assumptions break Bun
- temp-file execution breaks Yarn PnP

Counter:

- fix infra first

### Risk 3: Fake “full coverage”

Failure mode:

- we benchmark current-only lanes and still claim no regression

Counter:

- keep compare lanes as explicit required owners

### Risk 4: Scope creep into `slate-react`

Failure mode:

- runtime/browser work slips into this batch

Counter:

- keep this package core/headless only
- leave rerender breadth and overlay-local browser lanes for the later
  `slate-react` tranche

## Final Take

This is worth doing before moving on.

The current repo has enough `slate` correctness proof to leave the package, but
not enough `slate` perf proof to say the core is fully measured.

So the next honest `packages/slate` batch is not more contract recovery.
It is this benchmark package.
