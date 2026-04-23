---
date: 2026-04-09
topic: slate-v2-operation-history-collaboration-integrity-completion
status: completed
---

# Slate V2 Operation / History / Collaboration Integrity Completion Plan

## Goal

Close the `operation-history-collaboration integrity` lane in
[master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
and turn the corresponding open bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
from `partial` to closed-by-proof.

For this lane, "100% completion" means:

1. operation records are honest enough to support history and external
   collaboration layers
2. history batching and undo/redo stay anchored to committed transactions, not
   callback luck
3. the collaboration story is explicit about what the repo itself proves versus
   what external adapters like `slate-yjs` own
4. the lane closes on invariant integrity, not on building more demos

## Problem Frame

The current repo already has strong ingredients:

- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
  proves raw operation behavior
- [history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)
  proves undo/redo, batching, `writeHistory(...)`, and selection restoration
- [Operation API](/Users/zbeyens/git/slate-v2/docs/api/operations/operation.md)
  now documents real invertibility limits
- the collaboration walkthrough points to external `slate-yjs`, not a local
  package

So this lane is not open because there is no operation or history model.

It is open because the current proof and docs still stop short of one clean
statement:

- local `slate-v2` proves the operation/history substrate that collaboration
  layers depend on
- local `slate-v2` does **not** ship its own Yjs adapter or cursor stack
- the lane should close on that substrate integrity, not on demo breadth

Right now that story is still split across:

- a partial `history/collab` row in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- operation-level fixes in isolated docs and tests
- a collaboration walkthrough that talks about external `slate-yjs` but does
  not clearly mark the boundary between local proof and external adapter work

## Planning Decision

Do **not** try to close this lane by adding a local Yjs package or a new
multiplayer demo inside `slate-v2`.

Do **not** treat collaboration integrity as “ship more collaborative UI”.

Close the lane on the current contract:

- `slate` owns operation meaning and integrity
- `slate-history` owns commit-based batch capture and undo/redo correctness
- external collaboration adapters consume that substrate
- docs state that boundary plainly

That matches the current repo reality:

- `slate-v2` ships `slate`, `slate-history`, `slate-dom`, `slate-react`,
  `slate-browser`, and `slate-hyperscript`
- it does **not** ship `slate-yjs`

## Scope

### In scope

- operation integrity needed by history and collaboration consumers
- history batch integrity at the commit boundary
- truth pass for collaboration docs that rely on external adapters
- one dedicated owner proof file that ties the lane together

### Out of scope

- building a local Yjs package
- new collaboration demos or cursor overlays
- browser-first multiplayer proof
- broader helper/API width that belongs to the public-surface lane

## Relevant Current Truth

### Already recovered

- [2026-04-09-slate-selection-ops-must-carry-before-and-after-to-make-inversion-real.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-selection-ops-must-carry-before-and-after-to-make-inversion-real.md)
  restored honest `set_selection` inversion
- [2026-04-03-slate-history-capture-must-anchor-to-commit-subscribers-not-onchange-order.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-history-capture-must-anchor-to-commit-subscribers-not-onchange-order.md)
  moved history capture to the commit subscriber boundary
- [2026-04-09-slate-history-withnewbatch-must-split-at-the-commit-writer.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-history-withnewbatch-must-split-at-the-commit-writer.md)
  restored `withNewBatch(...)`, `withoutMerging(...)`, and `writeHistory(...)`
  on the real write boundary
- [2026-04-09-slate-v2-history-helper-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-history-helper-recovery.md)
  already widened the public history helper surface

### Relevant learnings

- [2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
  proves core owns fragment meaning while DOM owns browser transport
- [2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md)
  proves editor-owned runtime handles must be documented as editor-owned
- [2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md)
  proves durable anchors depend on transaction-aware updates, not eager per-op
  mutation

### Current pressure points

- the proof ledger still has only one partial `history/collab` owner row
- the collaboration guide is external-adapter-heavy but does not sharply state
  the repo-local boundary
- the line between “history/collab integrity” and “public-surface width” is
  still blurry enough to waste future batches

## Completion Criteria

This lane is done when all of the following are true:

1. one explicit owner proof file exists for operation/history/collaboration
   integrity
2. that owner file proves the current substrate story across:
   - operation records
   - history batches
   - selection before/after integrity
   - commit-order integrity
3. `operations-contract.ts` and `history-contract.ts` are treated as direct
   supporting proof, not unrelated partial rows
4. the collaboration walkthrough clearly states that local `slate-v2` proves
   the substrate while external `slate-yjs` owns CRDT/provider integration
5. the proof ledger can close the lane without claiming repo-local multiplayer
   support
6. whatever broader width still remains is clearly handed to the
   `broad API / public surface reconciliation` lane

## Implementation Units

### Unit 1. Give the lane one real owner

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/integrity-contract.ts` (new)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

Work:

- create one dedicated owner file instead of leaving the lane as a partial
  history row plus scattered operation fixes
- make that file tie together current `slate` operations with current
  `slate-history` batch behavior

Reason:

- the current proof exists
- the missing part is one auditable statement of what collaboration-safe
  substrate integrity means in this repo

### Unit 2. Prove operation-to-history integrity directly

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/integrity-contract.ts` (new)
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)
- [packages/slate-history/src/history-state.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/history-state.ts)

Work:

- prove one integrated flow where operation records become history batches with
  honest before/after selection state
- make the owner file assert the pieces collaboration consumers actually depend
  on, not just undo UX

Required test scenarios:

- `set_selection` operations carry `properties` and `newProperties`, and
  history batches preserve the resulting selection boundaries
- `insert_fragment` remains a valid batch/history record even though
  `Operation.inverse(...)` throws for raw op inversion
- commit-time history capture sees committed operations before userland
  `onChange()` can interfere
- `writeHistory(...)` remains the real stack-write override point
- undo/redo restore the committed before/after snapshots that the batch claims

### Unit 3. Mark the collaboration boundary honestly in docs

Files:

- [docs/walkthroughs/07-enabling-collaborative-editing.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md)
- [docs/api/operations/operation.md](/Users/zbeyens/git/slate-v2/docs/api/operations/operation.md)
- [docs/api/operations/README.md](/Users/zbeyens/git/slate-v2/docs/api/operations/README.md)
- [packages/slate-history/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-history/Readme.md)

Work:

- keep the collaboration walkthrough, but state clearly that:
  - `slate-v2` proves the local operation/history substrate
  - external `slate-yjs` owns CRDT/provider/cursor integration
  - repo-local proof for this lane is about invariant integrity, not about a
    built-in multiplayer package
- keep operation/history docs aligned with that same boundary

Required doc outcome:

- no reader confuses the external adapter guide with a repo-local package claim
- the operation/history substrate reads as collaboration-relevant for the right
  reason

### Unit 4. Close the lane cleanly

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Work:

- close the lane only if the owner file plus the operation/history support rows
  and docs truth pass are enough to defend the sentence
- keep the remaining gap explicit:
  - broader helper/API width stays in the public-surface lane
  - external collaboration adapters remain external

## Recommended Order

1. create the dedicated integrity owner file
2. prove operation-to-history integrity there
3. refresh the collaboration/docs truth
4. then close the history/collab lane in the live docs

## Verification Targets

Primary proof surfaces:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/integrity-contract.ts`
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [history-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts)

Required verification before declaring the lane closed:

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate-history/test/integrity-contract.ts`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/operations-contract.ts ./packages/slate-history/test/history-contract.ts`
- `yarn test:custom`
- `yarn lint:typescript`

## Hard Rules

- do not build a local Yjs adapter just to turn this row green
- do not let this lane quietly absorb broad helper/API work that belongs to the
  public-surface lane
- do not confuse collaboration integrity with more demo coverage
- do not close the lane on docs alone; one dedicated owner test file has to
  earn it

## Result

- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/integrity-contract.ts`
  now owns the lane directly
- the lane closes on local operation/history substrate integrity plus docs truth
  for the external collaboration boundary
- broader helper/API width still stays in the public-surface lane

## Verification

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate-history/test/integrity-contract.ts`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/operations-contract.ts ./packages/slate-history/test/history-contract.ts`
- `yarn test:custom`
- `yarn lint:typescript`
