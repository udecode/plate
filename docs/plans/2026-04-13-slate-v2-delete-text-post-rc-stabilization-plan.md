---
date: 2026-04-13
topic: slate-v2-delete-text-post-rc-stabilization
status: active
---

# Slate v2 `delete-text.ts` Post-RC Stabilization Plan

## Purpose

Stabilize and simplify
[delete-text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text/delete-text.ts)
after RC recovery work.

This is a structure plan, not a semantics plan.

The goal is:

- keep current green behavior
- reduce local policy sprawl
- make future delete work less likely to reopen legacy recovery debt

## Current Read

The file is functionally green and structurally ugly.

Current evidence already banked:

- `pnpm --filter slate test`
- `SLATE_RUN_LEGACY_TRANSFORM_AUDIT=1 pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/legacy-transforms-fixtures.ts`
- `pnpm exec turbo build --filter=./packages/slate --filter=./packages/slate-history`
- `pnpm exec turbo typecheck --filter=./packages/slate --filter=./packages/slate-history`
- `pnpm lint:fix`

Current reality:

- current `slate` suite is green
- legacy delete transform rows are green
- the file still mixes too many concerns in one routine:
  - target coercion
  - start/end delete edges
  - covered-node removal
  - cross-block merge policy
  - empty-structure cleanup
  - preserved empty-start restoration
  - final caret normalization

## Non-Goals

This plan does **not** do any of these:

- widen or narrow the public delete API
- change legacy recovery scope
- redesign the transaction engine
- chase delete perf without evidence
- reopen already-closed delete semantics

## Freeze Rule

Before any refactor step:

1. treat behavior as frozen
2. do not add new delete recovery
3. do not change proof expectations unless the runtime was already wrong

Lock set:

- `pnpm --filter slate test`
- legacy delete transform rows in
  [legacy-transforms-fixtures.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-transforms-fixtures.ts)

## Refactor Target Shape

Turn one large routine into one coordinator plus four private phases.

### 1. `resolveDeleteTarget(...)`

Own:

- point/range/path coercion
- collapsed-selection expansion
- `void` and `elementReadOnly` nudging
- hanging and unhang behavior

It should return one explicit internal object instead of mutating ad hoc locals.

### 2. `removeDeleteContents(...)`

Own:

- start-edge text removal
- covered-node collection and removal
- end-edge text removal

It should also return the minimal facts later phases need:

- surviving refs or points
- removed text
- whether interior element siblings were fully removed

### 3. `reconcileDeleteStructure(...)`

Own:

- cross-block merge behavior
- empty-artifact cleanup
- preserved empty-start block restoration
- optional adjacent text merge

This is where the policy split must become explicit:

- generic runtime cleanup
- legacy-compat recovery exceptions

### 4. `resolveDeleteSelection(...)`

Own:

- collapsed target choice
- caret normalization
- final `set_selection`

This is where forward/reverse inline spacer rules belong.
They should not stay smeared across content-removal or structure-reconcile code.

## Explicit Internal Control Object

Build one small internal plan object and pass it through the helpers.

Minimum fields:

- `start`
- `end`
- `isSingleText`
- `isAcrossBlocks`
- `preserveEndBlock`
- `preserveEmptyStartBlockPath`
- `removedInteriorElementSiblingStructure`
- `startNonEditable`
- `endNonEditable`

Rule:

- compute once
- pass forward
- stop recomputing the same meaning in multiple branches

## Mandatory Helper Extractions

These should exist as private helpers, not repeated local policy blobs:

1. adjacent text merge predicate
2. empty-structure cleanup
3. preserved empty-start block restoration
4. “keep split text after fully removed interior element sibling” decision
5. final inline-boundary caret normalization

## Compatibility Rule

Legacy recovery rules are allowed to survive, but they must be named as such.

Examples:

- `shouldPreserveEmptyStartBlockForHangingRange(...)`
- `shouldKeepSplitTextAfterInteriorElementRemoval(...)`

Bad shape:

- unnamed special cases hidden in branch order
- repeated `if` ladders that encode the same policy three times

## Execution Order

### Phase 0. Lock and Snapshot

- rerun the lock set
- record current green state

### Phase 1. Extract the control object

- no behavior changes
- only move derived booleans and core paths into one named object

### Phase 2. Extract target resolution

- move all coercion/nudge logic into `resolveDeleteTarget(...)`
- keep output byte-for-byte equivalent

### Phase 3. Extract content removal

- move start-edge, interior-node, and end-edge removal into
  `removeDeleteContents(...)`
- keep refs and removed-text bookkeeping intact

### Phase 4. Extract structure reconciliation

- move merge/cleanup/preserve logic into `reconcileDeleteStructure(...)`
- do not change any current cleanup decision until the helper boundary is proven

### Phase 5. Extract selection resolution

- move final caret normalization and `set_selection` into
  `resolveDeleteSelection(...)`
- make the reverse/forward boundary cases readable and isolated

### Phase 6. Trim duplicate policy

- remove repeated reinsertion and merge checks
- keep one authoritative place for each decision

## Perf Rule

Do **not** optimize blindly.

After the structural refactor, measure only these three delete lanes:

1. interior element range delete
2. cross-block join delete
3. large hanging multi-block delete

Decision rule:

- if numbers stay flat, stop
- if numbers improve, bank it
- if numbers regress materially, revert or refine before keeping the refactor

## Verification

Required after each meaningful phase:

- focused delete proof rows

Required at the end:

- `pnpm exec turbo build --filter=./packages/slate --filter=./packages/slate-history`
- `pnpm exec turbo typecheck --filter=./packages/slate --filter=./packages/slate-history`
- `pnpm lint:fix`
- `pnpm --filter slate test`
- `SLATE_RUN_LEGACY_TRANSFORM_AUDIT=1 pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/legacy-transforms-fixtures.ts`

## Stop Conditions

Stop the refactor immediately if any of these happens:

- current `slate` suite reopens
- legacy delete rows reopen
- a helper extraction forces new public semantics
- the file starts getting longer instead of simpler

## Success Criteria

This plan is complete when:

1. behavior is still green
2. `delete-text.ts` is split into named local phases
3. duplicated delete policy is reduced
4. compatibility rules are explicit instead of hidden
5. the three delete perf lanes do not regress materially

## Blunt Read

This should be done **after RC**, not before.

The current file is ugly but green.
That is acceptable for RC.

This plan exists so the team does not confuse “green” with “finished”.
