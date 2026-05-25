---
date: 2026-04-19
topic: slate-hyperscript-tranche-4-execution
status: completed
execution_repo: /Users/zbeyens/git/slate-v2
control_repo: /Users/zbeyens/git/plate-2
scope_lock:
  - /Users/zbeyens/git/slate-v2/packages/slate-hyperscript/**
---

# Slate Hyperscript Tranche 4 Execution

## Goal

Close `packages/slate-hyperscript` honestly on top of the settled `slate` core
and `slate-history` claims:

- keep fixture/runtime construction behavior
- keep the small public creation surface honest
- stop relying on stale Mocha-era proof language

## Current Read

- `slate-history` is no longer the tranche-4 blocker:
  - [2026-04-19-slate-history-tranche-4-execution.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-history-tranche-4-execution.md)
- `slate-hyperscript` now has both direct owners live:
  - `packages/slate-hyperscript/test/index.spec.ts`
  - `packages/slate-hyperscript/test/smoke-contract.ts`
- the package closeout stack is green in the same turn:
  - `bun test ./packages/slate-hyperscript/test/index.spec.ts`
  - `bun test ./packages/slate-hyperscript/test/smoke-contract.ts`
  - `bunx turbo build --filter=./packages/slate-hyperscript`
  - `bunx turbo typecheck --filter=./packages/slate-hyperscript`
  - `bun run lint:fix`
  - `bun run lint`
- the real gap was proof-owner honesty, not runtime breakage:
  - the active corpus carried draft `smoke.js` behavior
  - the direct Bun-owned smoke owner now exists
  - the tranche docs no longer need to lean on older Mocha-era closure language

## Current Tactic

- keep the package narrow
- recover a direct Bun-owned smoke proof owner for the draft `smoke.js` rows
- sync tranche docs and ledgers to the current owner stack
- do not invent runtime churn if the package behavior is already honest

## Remaining Kept-Owner Ledger

None blocking this `slate-hyperscript` lane.

No current `explicit-cut` or `post RC` rows were needed for package closure.

## Current Gates

- correctness owner:
  - `bun test ./packages/slate-hyperscript/test/index.spec.ts`
- direct smoke owner:
  - `bun test ./packages/slate-hyperscript/test/smoke-contract.ts`
- package closeout gates:
  - `bunx turbo build --filter=./packages/slate-hyperscript`
  - `bunx turbo typecheck --filter=./packages/slate-hyperscript`
  - `bun run lint:fix`
  - `bun run lint`

## Next Move

1. treat `slate-hyperscript` as settled enough to stop blocking tranche 4
2. carry its kept small-surface/runtime-construction claim forward
3. move to `slate-dom` as the next package in order

## Continue Checkpoint

- verdict:
  - `replan`
- latest landed API redesign owner:
  - draft smoke rows are now directly owned by
    `packages/slate-hyperscript/test/smoke-contract.ts`
  - fixture parsing and cursor/selection construction remain owned by
    `packages/slate-hyperscript/test/index.spec.ts`
- latest hard-cut or demotion decision:
  - none were needed for this package lane
- remaining unresolved API decisions:
  - no blocking `slate-hyperscript` package decisions remain in this lane
- latest current-vs-legacy compare read:
  - no dedicated `slate-hyperscript` compare owner exists or is needed for the
    current claim width
- drift read:
  - current work still points toward the better API
  - more `packages/slate-hyperscript` churn here would be invented work, not progress
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
  - more `packages/slate-hyperscript` churn here would be invented work, not
    progress
- repeat-count:
  - `0`
