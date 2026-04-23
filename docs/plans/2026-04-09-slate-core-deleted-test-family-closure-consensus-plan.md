---
date: 2026-04-09
topic: slate-core-deleted-test-family-closure-consensus-plan
status: approved
source: /Users/zbeyens/.codex/skills/ralplan/SKILL.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-core-deleted-test-family-closure-20260409T082526Z.md
---

# Slate Core Deleted Test-Family Closure Consensus Plan

## RALPLAN-DR Summary

### Principles

1. restore representative Slate value, not dead legacy bulk
2. every surviving gap must become an explicit better-cut
3. keep the current engine and proof stack stable while widening coverage
4. prefer code-bearing contract suites over doc-only confidence

### Decision Drivers

1. `packages/slate/test/**` is still the biggest deleted family bucket left
2. maintainers need evidence for what was recovered vs intentionally cut
3. the current restored slices already show a workable pattern:
   representative family contracts plus real package verification

### Viable Options

#### Option A: Keep restoring representative family contracts cluster by cluster

Pros:

- real package work
- keeps the proof stack readable
- scales better than resurrecting hundreds of tiny legacy fixtures

Cons:

- requires judgment about what is representative
- some maintainers may still ask for more raw legacy visibility

#### Option B: Bulk restore the deleted fixture tree as-is

Pros:

- maximum legacy visibility
- fewer decisions per file up front

Cons:

- huge volume, noisy maintenance cost
- reintroduces many rows that no longer map cleanly to the rewritten engine
- high risk of spending time proving dead seams

#### Option C: Stop restoring and better-cut the rest immediately

Pros:

- fastest path to a smaller surface
- avoids endless test-port work

Cons:

- too early while the maintainers-facing deletion bucket is still huge
- weak evidence if we cut families we have not sampled properly

### Chosen Option

- `Option A`

Why chosen:

- it is the best balance between real recovery and honest scoping

## Task Statement

Close the remaining `packages/slate/test/**` deleted-family bucket by mapping
every deleted row to current proof, restoring the uncovered current-value
clusters, then converting the incompatible residue into explicit skip entries
with better-cut rationale.

## Scope

### In Scope

- deleted `packages/slate/test/**` family closure
- representative contract suites for the still-open families
- any package code fixes needed to make those restored suites pass
- proof-ledger and file-review-ledger updates for each recovered family
- explicit better-cut decisions for families we decide not to restore further

### Out of Scope

- `packages/slate-react/test/**` deleted-family closure
- `packages/slate-history/test/**` deleted-family closure
- source-bucket restore-or-cut under `packages/slate/src/**`
- runtime quarantine work

## Decision

Treat deleted `packages/slate/test/**` closure as an uncovered-proof-delta
problem, not a family-ordering ritual.

Start with a classification pass for every remaining family:

1. `mirrored now`
   - already covered by `snapshot-contract.ts` or an existing contract file
2. `supportable next`
   - uncovered rows that still map cleanly to the current engine and public
     contract
3. `explicit skip`
   - legacy rows that no longer belong and should be called out directly

Use `explicit skip` as the accounting label and `better-cut rationale` as the
explanation attached to that label.

Then execute the remaining work in uncovered-delta order, not family-label
order:

1. classify the family
2. restore the highest-value uncovered cluster
3. extend an existing contract when that keeps proof closest to the live API
4. create a new contract file only when it isolates a real claim better
5. fix package code only if the restored proof exposes a real gap
6. rerun:
   - restored family tests
   - `yarn test:mocha`
   - `yarn workspace slate-react run test`
   - `yarn workspace slate-dom test`
   - `yarn test:custom`
   - `yarn lint:typescript`
7. update the proof + file-review ledgers
8. close the family with an explicit note:
   - uncovered public-value delta closed
   - remaining rows explicitly skipped
   - ledger reflects the final read

## Execution Model

### Phase 0: Classification Matrix

Goal:

- publish an auditable matrix for every still-open deleted family:
  `mirrored now`, `supportable next`, `explicit skip`

Families:

- `transforms/**`
- remaining deleted rows within `interfaces/**` after excluding claims already
  mirrored by current proof
- remaining deleted rows within `operations/**` after excluding claims already
  mirrored by current proof
- remaining deleted rows within `normalization/**` after excluding claims
  already mirrored by current proof
- remaining deleted rows within `utils/**` after excluding claims already
  mirrored by current proof
- `index.js`
- `jsx.d.ts`

Output:

- one written `Family Closure Matrix` inside the execution artifact with these
  columns:
  - `deleted path or cluster id`
  - `family`
  - `deleted count`
  - `legacy claim`
  - `current proof owner file#line`
  - `status`
  - `rationale`
  - `new proof file if any`
  - `ledger row touched`
- the matrix totals must reconcile exactly to the parent audit counts:
  - `interfaces/**` = `576`
  - `transforms/**` = `408`
  - `operations/**` = `31`
  - `normalization/**` = `20`
  - `utils/**` = `11`
  - `index.js` = `1`
  - `jsx.d.ts` = `1`
  - total `packages/slate/test/**` deleted rows = `1048`
- no restore work starts before this table exists

### Phase 1: Largest Uncovered Delta First

Goal:

- start with the family whose matrix shows the highest uncovered deleted count
  still marked `supportable next`

Important read:

- do not blindly start with `transforms/**`
- do not blindly assume `interfaces/**` is next
- `snapshot-contract.ts` already mirrors a large amount of transform and value
  semantics, so duplicated proof is failure, not progress

Exit:

- first uncovered high-value cluster is restored without duplicating existing
  snapshot proof

### Phase 2: Family-by-Family Delta Closure

Goal:

- keep restoring only uncovered supportable clusters until each family is
  exhaustively classified and honestly closed

Restore targets may land as:

- extensions to `snapshot-contract.ts`
- extensions to an existing contract file
- a new dedicated contract file when isolation is clearer than extension

Exit:

- every remaining family is classified
- every supportable uncovered cluster is either restored or reclassified to
  `explicit skip` with a stated incompatibility reason

### Phase 3: Entry-Point Residue Decisions

Goal:

- decide `packages/slate/test/index.js` and `packages/slate/test/jsx.d.ts`
  explicitly instead of leaving them as vague residue

Exit:

- each entrypoint is restored if still needed
- otherwise it is explicitly skipped in the ledgers and plan notes with
  better-cut rationale

### Phase 4: Closeout Notes

Goal:

- produce a maintainer-auditable closeout note per family

Each note must say:

- what was already mirrored
- what was restored
- what was explicitly skipped
- why no more restore work is needed

## Family Closure Matrix

Before any new restore lands, fill this matrix and keep it current.

| deleted path or cluster id                       | family             | deleted count | legacy claim                   | current proof owner file#line                                             | status (`mirrored now` / `supportable next` / `explicit skip`) | rationale                                                                                                                            | new proof file if any                                                                                                                                                      | ledger row touched                |
| ------------------------------------------------ | ------------------ | ------------: | ------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `packages/slate/test/interfaces/**:cluster-*`    | `interfaces/**`    |   `576 total` | value/query/runtime-guard rows | `snapshot-contract.ts`, `interfaces-contract.ts`                          | `mirrored now` + `explicit skip`                               | helper-heavy surface is already mirrored by current proof; only deleted `CustomTypes` declaration-merging rows are explicit skip     | [2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-interfaces-family-deleted-test-closure.md)       | `major file/test deletion review` |
| `packages/slate/test/transforms/**:cluster-*`    | `transforms/**`    |   `408 total` | helper transform rows          | `snapshot-contract.ts`, `clipboard-contract.ts`, `transforms-contract.ts` | `mirrored now` + `recovered now` + `explicit skip`             | current narrow transform contract is either already mirrored, directly recovered, or explicitly outside the live claim               | [2026-04-09-slate-v2-transforms-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-transforms-family-deleted-test-closure.md)       | `major file/test deletion review` |
| `packages/slate/test/operations/**:cluster-*`    | `operations/**`    |    `31 total` | raw operation rows             | `operations-contract.ts`                                                  | `recovered now` + `explicit skip`                              | current raw-operation seam is directly recovered; legacy custom-selection and null/undefined removal-sentinel rows are explicit skip | [2026-04-09-slate-v2-operations-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-operations-family-deleted-test-closure.md)       | `major file/test deletion review` |
| `packages/slate/test/normalization/**:cluster-*` | `normalization/**` |    `20 total` | normalization rows             | `normalization-contract.ts`                                               | `mirrored now`                                                 | current default-vs-explicit normalization split mirrors the deleted normalization rows without reopening broader always-on coercion  | [2026-04-09-slate-v2-normalization-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-normalization-family-deleted-test-closure.md) | `major file/test deletion review` |
| `packages/slate/test/utils/**:cluster-*`         | `utils/**`         |    `11 total` | helper rows                    | `text-units-contract.ts`                                                  | `mirrored now` + `explicit skip`                               | surviving string-unit value is mirrored; deleted `deep-equal/**` rows are explicit skip                                              | [2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md)       | `major file/test deletion review` |
| `packages/slate/test/index.js`                   | `index.js`         |           `1` | test entrypoint                | none                                                                      | `explicit skip`                                                | old fixture-harness root entrypoint is replaced by direct contract files plus package-local Mocha globs                              | [2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md)       | `major file/test deletion review` |
| `packages/slate/test/jsx.d.ts`                   | `jsx.d.ts`         |           `1` | test typing entrypoint         | none                                                                      | `explicit skip`                                                | old JSX typing shim belonged to the deleted fixture harness, not the current direct-contract lane                                    | [2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-utils-and-root-test-entrypoint-closure.md)       | `major file/test deletion review` |

Closure rule:

- no family is done until its matrix rows reconcile to the audit counts exactly
- no new proof lands unless the matrix cites the existing proof it does not
  duplicate
- every `supportable next` row that is not restored must be reclassified to
  `explicit skip` with a stated incompatibility reason
- this batch closes only `major file/test deletion review` in
  [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
  when all `1048` deleted `packages/slate/test/**` rows are mapped and every
  surviving uncovered public-value delta has direct proof or an explicit skip
  note
- this batch does not by itself close broader True Slate RC lanes

## Non-Redundancy Gate

No restore may land unless the closure matrix cites the existing proof rows it
does not duplicate.

Known proof owners to audit first:

- [snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- [interfaces-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts)
- [operations-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts)
- [normalization-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts)
- [text-units-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts)
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)

## Acceptance Criteria

1. Every still-open deleted `packages/slate/test/**` family has a written
   classification:
   - `mirrored now`
   - `supportable next`
   - `explicit skip`
2. Every cluster initially marked `supportable next` is either restored in
   code-bearing proof or reclassified to `explicit skip` with a stated
   incompatibility reason.
3. Any package-code gap exposed by restored proof is fixed in the package, not
   hand-waved in docs.
4. Every restored or cut family is wired into:
   - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
   - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
5. Every family has a closeout note explaining why no more restore work is
   needed.
6. Batch-local verification passes after each landed family batch:
   - restored family tests
   - `yarn test:mocha`
   - `yarn workspace slate-react run test`
   - `yarn workspace slate-dom test`
   - `yarn test:custom`
   - `yarn lint:typescript`
7. Final closeout reruns the parent release-gate evidence or states explicitly
   why unchanged lanes were not reopened.

## Risks

- skipping classification first can create duplicate proof and fake progress
- restoring too many literal legacy rows can waste time on dead seams
- restoring too few rows can leave maintainers unconvinced
- touching low-level transform behavior can regress the already-green snapshot
  / clipboard / runtime proof stack

## Mitigations

- classify before restoring
- order work by uncovered proof delta, not family labels
- force matrix accounting before each restore
- extend existing proof files when that is cleaner than minting new ones
- keep the family-by-family representative strategy
- require full package verification after each family
- prefer explicit skip decisions once a family has enough representative
  evidence

## ADR

### Decision

Close the remaining deleted `packages/slate/test/**` bucket by restoring
representative family contracts in descending value order, instead of bulk
restoring the whole deleted fixture tree.

### Drivers

- real code/proof progress matters more than raw restored file count
- maintainers need auditable evidence, not vibes
- the current engine already supports a lot of these families when expressed on
  the new seams

### Alternatives Considered

- bulk restore the entire deleted fixture tree
- stop restoring and better-cut everything now

### Why Chosen

- representative restores give the best signal-to-cost ratio

### Consequences

- more deliberate judgment required
- lower noise than bulk restoration
- stronger maintainer story than premature cuts

## Verification

Batch-local:

- restored family tests
- `yarn test:mocha`
- `yarn workspace slate-react run test`
- `yarn workspace slate-dom test`
- `yarn test:custom`
- `yarn lint:typescript`

Final closeout:

- rerun the parent release-gate evidence or state explicitly why unchanged
  lanes were not reopened
- relevant ledger/docs formatting checks
