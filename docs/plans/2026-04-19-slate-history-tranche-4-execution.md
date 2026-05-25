---
date: 2026-04-19
topic: slate-history-tranche-4-execution
status: completed
execution_repo: /Users/zbeyens/git/slate-v2
control_repo: /Users/zbeyens/git/plate-2
scope_lock:
  - /Users/zbeyens/git/slate-v2/packages/slate-history/**
---

# Slate History Tranche 4 Execution

## Goal

Close `packages/slate-history` honestly on top of the settled `slate` core
claim:

- keep undo/redo and selection restore anchored to committed transaction truth
- preserve kept legacy + draft history behavior where it still earns its keep
- do not drag retired timing heuristics or wrapper-era assumptions back into
  core

## Current Read

- `slate` core is now settled enough to unblock tranche 4:
  - [2026-04-19-slate-absolute-api-replan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-absolute-api-replan.md)
- `slate-history` now has one direct proof owner landed:
  - `packages/slate-history/test/history-contract.ts`
- `slate-history` now also has the second direct proof owner landed:
  - `packages/slate-history/test/integrity-contract.ts`
- the package owner gate is green again:
  - `bun test ./packages/slate-history/test/index.spec.ts`
- the package closeout gate stack is green in the same turn:
  - `bun test ./packages/slate-history/test/history-contract.ts`
  - `bun test ./packages/slate-history/test/integrity-contract.ts`
  - `bunx turbo build --filter=./packages/slate-history`
  - `bunx turbo typecheck --filter=./packages/slate-history`
  - `bun run lint:fix`
  - `bun run lint`
- the missing history compare owner is now recovered:
  - `bun run bench:history:compare:local`
- the first red cluster was real and shared one cause:
  - transaction-owned delete / join / insert-break undo rows were missing
    history capture because capture still sat on the old write seam
- that owner is now fixed:
  - history capture is anchored to the committed publish seam instead of legacy
    per-op `editor.apply(...)` interception
- direct proof-owner coverage is now live for:
  - kept undo / redo parity rows
  - transaction-owned undo-unit capture
  - merge / save / split flags
  - stack-write override seam
  - commit-before-onChange history capture

## Current Tactic

- treat `slate-history` as the first real proof that the settled core commit /
  transaction model survives contact with a support package
- keep history on the committed capture seam
- keep the explicit skips explicit
- do not reopen deleted legacy timing / fragment rows unless new evidence
  proves they belong in the kept claim

## Rejected Tactics / Pivot History

- rejected: patching failing undo fixtures one by one while the same
  transaction-owned family stays red
- rejected: treating the missing `history-contract.ts` file as the main problem
  when the current package gate is already proving a deeper runtime bug
- rejected: reopening `packages/slate/**` unless a kept history row proves the
  bug really lives in core

## Remaining Kept-Owner Ledger

None blocking this `slate-history` lane.

Deferred / carried forward:

- legacy timing-based contiguous / non-contiguous insert heuristics stay
  explicit-skip unless later evidence proves they earn their keep
- wider deleted delete / fragment rows stay explicit-skip unless later evidence
  proves they belong in the kept live claim

## Perf Owner Status

- live history compare owner is now wired again:
  - `bun run bench:history:compare:local`
- latest history compare read:
  - typing undo: `+29.35ms`
  - typing redo: `+20.04ms`
  - fragment undo: `+25.29ms`
  - fragment redo: `+31.77ms`
- current read:
  - still slower than legacy
  - no longer the catastrophic multi-second regression shape
  - back in the low-tens-of-ms band for typing / fragment history ops
- current shared core regression floor still applies if any `packages/slate/**`
  file changes:
  - `bun run bench:slate:6038:local`
  - `bun run bench:core:normalization:compare:local`
  - `bun run bench:core:observation:compare:local`
  - `bun run bench:core:huge-document:compare:local`

## Current Gates

- correctness owner:
  - `bun test ./packages/slate-history/test/index.spec.ts`
- direct proof owner:
  - `bun test ./packages/slate-history/test/history-contract.ts`
  - `bun test ./packages/slate-history/test/integrity-contract.ts`
- package closeout gates:
  - `bunx turbo build --filter=./packages/slate-history`
  - `bunx turbo typecheck --filter=./packages/slate-history`
  - `bun run lint:fix`
  - `bun run lint`
- perf owner:
  - `bun run bench:history:compare:local`

## Next Move

1. treat `slate-history` as settled enough to stop blocking tranche 4
2. carry its explicit-skip and bounded-perf read forward
3. move to `slate-hyperscript` as the next package in order

## Continue Checkpoint

- verdict:
  - `replan`
- latest landed API redesign owner:
  - `slate-history` now captures undo units from the committed publish seam
  - direct kept-row proof now exists in:
    - `history-contract.ts`
    - `integrity-contract.ts`
  - `slate-history` now also has a runnable compare owner again:
    - `bench:history:compare:local`
- latest hard-cut or demotion decision:
  - do not revive legacy timing heuristics or wider delete / fragment rows by
    default
- remaining unresolved API decisions:
  - no blocking `slate-history` package decisions remain in this lane
  - only carried-forward explicit-skip judgment remains
- latest current-vs-legacy compare read:
  - `slate-history` compare owner is live again
  - typing undo: `+29.35ms`
  - typing redo: `+20.04ms`
  - fragment undo: `+25.29ms`
  - fragment redo: `+31.77ms`
- drift read:
  - current work still points toward the better API
  - the main drift risk now is reopening already-classified history rows or
    stalling before `slate-hyperscript`
- next move after this checkpoint:
  - stop here for this execution owner
  - create or switch to the next tranche/package owner when the user wants

## Repeated Continue Rule

- this execution owner is complete
- repeated `continue` calls against this same owner without a new scope or new
  contrary evidence should return:
  - `replan`
- reason:
  - the next honest move changes package ownership
  - more `packages/slate-history` churn here would be invented work, not
    progress
- repeat-count:
  - `1`
- latest reaffirmation:
  - repeated `continue` was received against the same completed owner with no
    new scope, contrary evidence, or blocker change
  - verdict stays `replan`
