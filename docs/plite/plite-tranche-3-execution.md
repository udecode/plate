---
date: 2026-04-19
topic: plite-slate-tranche-3-execution
status: superseded
---

# Plite Tranche 3 Execution

## Goal

Do an honest tranche-3 review for `packages/plite` against:

- live `plate-2` tranche/ledger docs
- current `packages/plite/**`
- missing draft-backed proof owners from the archived draft package corpus
- missing perf gate ownership

This file is prior context only now.

The mutable execution-state owner was moved to:

- [2026-04-19-slate-absolute-api-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-absolute-api-replan.md)

## Execution Model

- control/docs repo: `plate-2`
- execution repo: `Plate repo root`
- package scope: `packages/plite/**`

## Current Tactic

- burn down the missing tranche-3 kept owners from smallest honest slice to
  largest
- prefer owner files that either:
  - prove an already-existing seam, or
  - expose one narrow missing public seam without dragging in a broader lane

## Pivot History

- rejected the false “package-local suite green means tranche complete” read
- rejected starting with bookmarks first because that would blob together API,
  refs, durability semantics, and later decoration pressure
- chose `text-units` before `interfaces-contract` because it was the smallest
  real missing public seam plus missing proof owner
- chose `transaction-contract` before bookmarks because it could expose
  core-owned transaction drift without reopening broader API/design lanes
- chose `headless-contract` before bookmarks because it was small enough to
  falsify package-local ownership and exposed a narrow static-surface gap
- pivoted out of the cheap owner-file phase once the driver gate returned to a
  real core normalization row
- replan triggered after full package-local gates went green again while the
  remaining-owner ledger stayed non-empty
- pivoted away from `range-ref-contract.ts` as the next slice because the first
  probe exposed a deeper public-vs-internal ref publication design seam

## Questions

1. What is actually still missing for `packages/plite`?
2. Which missing items are package-local proof/contract gaps vs broader
   migration-program gaps?
3. Which live `plate-2` docs drifted into a false “`slate` is done” story?
4. What should the roadmap say now?

## Method

1. Read live tranche-3 owner docs in `plate-2`.
2. Inventory current `plite/packages/plite/test/**` and
   `plite/packages/plite/src/**`.
3. Compare against the draft-backed proof-owner list already named in
   `slate-legacy-draft-contract-corpus.md`.
4. Classify missing items:
   - package-local must-have now
   - package-local maybe later / `post RC`
   - broader non-`slate` program work
5. Rewrite live docs to match the honest classification.

## Findings

### Draft-backed proof owners already named by the corpus

The corpus doc says tranche 3 keeps these proof-owner lanes alive:

- `query-contract.ts`
- `legacy-editor-nodes-fixtures.ts`
- `interfaces-contract.ts`
- `legacy-interfaces-fixtures.ts`
- `transforms-contract.ts`
- `operations-contract.ts`
- `legacy-transforms-fixtures.ts`
- `surface-contract.ts`
- `transaction-contract.ts`
- `snapshot-contract.ts`
- `bookmark-contract.ts`
- `range-ref-contract.ts`
- `clipboard-contract.ts`
- `normalization-contract.ts`
- `headless-contract.ts`
- `text-units-contract.ts`

### Current read

- package-local owner files are landed
- package-local correctness/build/type/lint gates are green
- the `#6038` benchmark lane exists and runs
- the broad standalone oracle file
  `packages/plite/test/snapshot-contract.ts`
  is **not** part of the package-closeout proof by default and is currently red
  when run directly

## Remaining Items

### Package-local must-have now

- none

## Perf Owner Status

- landed:
  - `#6038` benchmark lane for transaction execution and mixed structural
    updates
- command:
  - `bun run bench:plite:6038:local`

## Current Gates

- targeted correctness:
  - `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`
- package closeout gates:
  - `cd Plate repo root && bun test ./packages/plite/test`
  - `cd Plate repo root && bunx turbo build --filter=./packages/plite`
  - `cd Plate repo root && bunx turbo typecheck --filter=./packages/plite`
  - `cd Plate repo root && bun run lint:fix`
  - `cd Plate repo root && bun run lint`

## Latest Slice

- landed `packages/plite/src/text-units.ts`
- exported the seam from `packages/plite/src/index.ts`
- landed `packages/plite/test/text-units-contract.ts`
- landed `packages/plite/test/interfaces-contract.ts`
- landed `packages/plite/test/transaction-contract.ts`
- landed `packages/plite/test/headless-contract.ts`
- landed `packages/plite/test/bookmark-contract.ts`
- landed `packages/plite/test/normalization-contract.ts`
- landed `packages/plite/test/transforms-contract.ts`
- landed `packages/plite/test/extension-contract.ts`
- landed `packages/plite/test/surface-contract.ts`
- landed `packages/plite/test/clipboard-contract.ts`
- landed `packages/plite/test/range-ref-contract.ts`
- landed `scripts/benchmarks/slate/6038-transaction-execution.mjs`
- landed `package.json#bench:plite:6038:local`
- fixed transaction rollback in `packages/plite/src/core/public-state.ts` so
  restored draft state keeps the pre-transaction runtime-id index
- recovered missing static `Editor.getFragment(editor)` in
  `packages/plite/src/interfaces/editor.ts`
- recovered bookmark surface:
  - `packages/plite/src/interfaces/bookmark.ts`
  - `packages/plite/src/editor/bookmark.ts`
  - `Editor.bookmark(...)`
  - root `Bookmark*` exports through `interfaces/index.ts`
- verification:
  - `bun test ./packages/plite/test/text-units-contract.ts`
  - `bun test ./packages/plite/test/interfaces-contract.ts`
  - `bun test ./packages/plite/test/transaction-contract.ts`
  - `bun test ./packages/plite/test/headless-contract.ts`
  - `bun test ./packages/plite/test/bookmark-contract.ts`
  - `bun test ./packages/plite/test/normalization-contract.ts`
  - `bun test ./packages/plite/test/transforms-contract.ts`
  - `bun test ./packages/plite/test/extension-contract.ts`
  - `bun test ./packages/plite/test/surface-contract.ts`
  - `bun test ./packages/plite/test/clipboard-contract.ts`
  - `bun test ./packages/plite/test/range-ref-contract.ts`
  - `bun test ./packages/plite/test`
  - `bunx turbo build --filter=./packages/plite`
  - `bunx turbo typecheck --filter=./packages/plite`
  - `bun run lint:fix`
  - `bun run lint`
  - `bun run bench:plite:6038:local`
- current driver-gate return:
  - green again on the current tree after the normalization split repair

## Current Status

- package-local correctness/build/type/lint gates are green
- package-local benchmark owner exists and runs
- this closeout read is stale
- `packages/plite` is reopened under the absolute-api replan
- standalone broad-oracle proof from `snapshot-contract.ts` is green again
- the active remaining owner is API direction + explicit-cut classification,
  not missing package-local proof files
- package-local perf coverage is now tracked separately in:
  - `docs/plans/2026-04-19-slate-core-perf-coverage-plan.md`
- do **not** treat the old “move to tranche 4 next” read as the current
  execution order when that perf plan is active
- do **not** treat this file as permission to move to tranche 4

### Broader program work, not `packages/plite`-local

- support-package work remains blocked until the `slate` core redesign is
  honestly settled:
  - `plite-history`
  - `plite-hyperscript`
- tranche 5:
  - `plite-dom`
- tranche 6:
  - `plite-react`
- tranche 7+:
  - example parity
  - root proof closure
  - overlay / huge-document / locality benchmark lanes

## Live Doc Sync Applied

- synced live control docs to the completed `packages/plite` tranche-3 read:
  - `docs/plite/master-roadmap.md`
  - `docs/plite/replacement-gates-scoreboard.md`
  - `docs/plite/release-readiness-decision.md`
  - `docs/plite/ledgers/slate-transforms-api.md`
  - `docs/plite/ledgers/slate-editor-api.md`
  - `docs/plite/ledgers/slate-interfaces-api.md`

## Next Move

- follow:
  - [2026-04-19-slate-absolute-api-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-absolute-api-replan.md)
