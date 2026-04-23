---
date: 2026-04-10
topic: slate-v2-normalization-reopen-verdict
---

# Slate v2 Normalization Reopen Verdict

> Archive only. Detailed reopen analysis. For the live normalization read, see
> [../normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md).

## Verdict

Keep the current default-vs-explicit normalization contract closed.

Do **not** reopen broad default live coercion in this batch.

The honest forward path is staged:

1. keep the public normalization contract unchanged
2. freeze the old-vs-current matrix and the missing phase boundary
3. keep the raw outer iteration stop dead and preserve debt/progress-aware
   termination
4. only then consider promoting one explicit-only rule if the migration gates
   stay green

## Why

### 1. The missing phase boundary is still real

The plan’s favored hybrid path only makes sense if a future `commit
canonicalization` pass has a real architectural boundary.

That boundary does not exist yet.

Current engine flow still has one normalization loop before publish in
[transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L70)
through
[transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L125).

The ordering is frozen explicitly in
[normalization-phase-boundary-note.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/normalization-phase-boundary-note.md).

Without a new boundary, “commit canonicalization” is just a prettier name for
changing the live loop and hoping refs, selection, runtime, and clipboard do not
notice.

That is bullshit, not architecture.

### 2. The current contract is intentionally narrower than old Slate

The old broad built-ins did more by default.

Current `slate-v2` intentionally does less by default and keeps heavier cleanup
on explicit/app-owned seams:

- live-shape exceptions are explicit in
  [live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L24)
- current core behavior matches that split in
  [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts#L94)
- the frozen comparison now lives in
  [normalization-baseline-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/normalization-baseline-matrix.md)

So the reopen question is not “can we recover old behavior?”

It is “can we beat the current migration-safe split without reopening the exact
lanes that forced the split?”

Right now, the answer is not yet proven.

### 3. Step 2 landed without widening the contract

The raw outer iteration stop is gone.

Current scheduler behavior now:

- detects revisited semantic draft states
- fails intentionally before blind raw-pass exhaustion
- keeps the pass-level `shouldNormalize` contract intact

Relevant proof / code:

- scheduler loop in
  [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts#L80)
- pass-level `shouldNormalize` proof in
  [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2565)
- intentional cycle failure proof in
  [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts#L2702)

That improves the engine debt without widening the public normalization claim.

### 4. Migration gates still dominate the decision

The veto condition remains unchanged:

- no regression that materially blocks migration to v2

The concrete migration gates are still the same proof owners:

- range refs
- clipboard
- runtime
- app-owned normalization seams

Those are called out in
[live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L47)
through
[live-shape-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/live-shape-register.md#L92).

No current evidence proves that promoting heavier canonicalization into the live
or commit path would keep those lanes green.

## What This Batch Did Prove

### Current-contract normalization owner coverage is stronger now

The owner file
[normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
is green on `22` rows after recovering current-contract gaps:

- top-level inline cleanup
- block-only `fallbackElement` wrapping
- interior spacer insertion between adjacent inline siblings
- explicit plain-text merge
- explicit empty-text cleanup before inline
- explicit empty-empty collapse
- explicit non-selectable-ancestor merge stall guard

Verification run:

- `pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/normalization-contract.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/slate`
- `pnpm turbo typecheck --filter=./packages/slate`
- `pnpm lint:fix`
- targeted `snapshot-contract.ts` rows for `shouldNormalize`,
  `withoutNormalizing`, the new composed `move_node` and
  `split_node-and-insert_node` normalization oracles, and the cycle-failure
  scheduler row
- migration gates in range refs, clipboard, and runtime after the scheduler
  change

### Most deleted normalization fixtures are not missing current truth

Many deleted rows were already:

- recovered in current owner files
- moved into snapshot/range-ref proof
- or intentionally dead because the current contract no longer claims broad
  default live coercion

That means “maximum that pass” is not the same as “re-add every deleted
fixture.”

## First Credible Promotion Candidate

If a future staged redesign survives the termination/boundary work and the
migration gates, the first credible promotion candidate is:

1. explicit adjacent-text cleanup / merge

Why this first:

- it is already directly proved as explicit behavior in
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L520),
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L547),
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L619),
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L643),
  and
  [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts#L683)
- it is narrower than broad inline-container flattening
- it is easier to reason about than blanket child-family coercion

Inline-container flattening is not the first candidate. The failure story there
is already worse and wider, as documented in
[2026-04-09-slate-inline-container-flattening-cannot-be-a-quick-built-in-normalization-win.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-inline-container-flattening-cannot-be-a-quick-built-in-normalization-win.md).

That is still not approved for promotion now.

It is only the first credible candidate after the missing phase boundary and
termination work are real.

## Next Honest Step

If execution continues, the next step should be:

1. add a concrete boundary note for where a future commit-tier pass would run
2. decide whether the new scheduler semantics are sufficient or need a cleaner
   debt model
3. use the composed oracles plus migration gates as the decision point for any
   later promotion work

## Non-claim

This verdict does **not** say the current normalization story is the final best
possible engine.

It says the default contract should stay closed until the staged prerequisites
exist and the migration gates survive them.
