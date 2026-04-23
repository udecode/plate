---
date: 2026-04-09
topic: slate-react-deleted-test-family-closure-consensus-plan
status: approved
source: /Users/zbeyens/.codex/skills/ralplan/SKILL.md
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-react-deleted-test-family-closure-20260409T115734Z.md
---

# Slate React Deleted Test-Family Closure Consensus Plan

## RALPLAN-DR Summary

### Principles

1. restore contributor-facing proof, not dead internal machinery
2. keep file accounting exact: every deleted row ends as mirrored, restored, or
   explicit skip
3. do not bloat `runtime.tsx` into unreadable garbage when one focused contract
   file is cleaner
4. cut legacy internals directly when the current architecture no longer owns
   them

### Decision Drivers

1. `packages/slate-react/test/**` is now the highest-value remaining
   deleted-test family
2. the deleted files mix real public behavior with obvious dead internals
3. `runtime.tsx` already proves a lot, but it should not become the only place
   every React claim goes to die

### Viable Options

#### Option A: Add one self-contained focused contract file and keep `runtime.tsx` for the already-mirrored rows

Pros:

- keeps restored React-family proof readable
- preserves exact deleted-row accounting
- avoids fake legacy resurrection
- fastest path to execution without test-harness refactoring first

Cons:

- adds one more test artifact to maintain
- duplicates a small amount of mount/setup code unless extraction becomes worth
  it

#### Option B: Extract shared `slate-react` test helpers from `runtime.tsx`, then split restored proof into focused files

Pros:

- cleanest long-term test architecture
- avoids helper duplication between `runtime.tsx` and the new contract file

Cons:

- slower batch
- risks turning a deletion-closure task into a test-harness refactor

#### Option C: Widen `packages/slate-react/test/runtime.tsx` until it covers everything

Pros:

- no new test file
- reuses the current runtime harness

Cons:

- keeps stuffing unrelated proof into a giant file
- makes maintainer mapping harder, not easier

#### Option D: Restore the deleted upstream files as-is

Pros:

- easiest raw diff comparison
- lowest up-front judgment cost

Cons:

- reintroduces dead harness and dead architecture
- lies about the current package shape
- fights the roadmap rule against file-for-file resurrection

### Chosen Option

- `Option A`

Why chosen:

- it gives one clean owner for the still-uncovered React-family value without
  pretending the old test tree still deserves to exist

## Task Statement

Close the deleted `packages/slate-react/test/**` family by mapping each deleted
file to current proof, restoring the still-relevant public-value gaps into one
focused current contract, and explicitly cutting the dead internal residue.

## Scope

### In Scope

- the eight deleted `packages/slate-react/test/**` rows
- current proof ownership mapping into:
  - `packages/slate-react/test/runtime.tsx`
  - one new focused React-family contract file
- package code only if restored proof exposes a real `slate-react` behavior gap
- ledger and roadmap-note updates needed to close the family honestly
- one family closeout note

### Out of Scope

- `packages/slate-history/test/**`
- supporting example/browser deletion families
- new runtime experiments outside the current Slate React contract
- resurrecting the deleted chunking implementation tree

## Decision

Treat this family as three buckets:

1. `mirrored now`
   - deleted rows whose contributor-facing claim is already proved in
     `packages/slate-react/test/runtime.tsx`
2. `restore now`
   - deleted rows whose public-value claim still belongs but is not yet directly
     proved on the current surface
3. `explicit skip`
   - deleted rows tied to dead internal chunking or dead harness setup

Execution shape:

1. freeze the file-accounting table below before edits
2. keep `packages/slate-react/test/runtime.tsx` as the owner for already
   mirrored rows
3. add one new focused file:
   - `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`
   - this file does not exist yet and must be created, then assigned explicit
     proof ownership in the ledgers
4. use that file for the still-uncovered public-value rows:
   - `ReactEditor.focus` initializes selection from `null`
   - `ReactEditor.focus` does not spuriously fire `onValueChange`
   - structured render-surface mount stability
   - `Editable` translate attribute
   - `useSelected` plus structured path-rebasing stability
   - `surface-contract.tsx` starts self-contained; only extract shared helpers
     from `runtime.tsx` if a second restore case would otherwise duplicate the
     same mount/setup logic again
5. explicitly skip dead internal chunking and the deleted test-local
   `tsconfig.json`
6. create the family closeout note:
   - `/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-react-deleted-test-family-closure.md`
   - this file also does not exist yet and must be wired into the roadmap stack
7. update the file-review and proof ledgers so both new artifacts have explicit
   ownership instead of being implied

## Deleted File Accounting

| deleted file                                            | current concept                                                                    | disposition     | current proof owner                                                            | restore target if needed                                                     | notes                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/slate-react/test/use-slate-selector.spec.tsx` | selector subscription equality and selector identity swap                          | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | already proved by the current equality/identity test                                                                                                                                                                                                                          |
| `packages/slate-react/test/use-slate.spec.tsx`          | provider editor + version counter exposure                                         | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | already proved by `useSlateWithV` and hook-surface runtime coverage                                                                                                                                                                                                           |
| `packages/slate-react/test/react-editor.spec.tsx`       | mounted window sync and helper surface                                             | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | current mounted-bridge proof already covers helper and window behavior                                                                                                                                                                                                        |
| `packages/slate-react/test/react-editor.spec.tsx`       | `ReactEditor.focus` initializes selection from `null` and stays safe mid-transform | `restore now`   | not currently proved                                                           | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` | current source touchpoints are `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`                                                                               |
| `packages/slate-react/test/react-editor.spec.tsx`       | `ReactEditor.focus` must not fire `onValueChange`                                  | `restore now`   | not currently proved                                                           | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` | current source touchpoints are `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts`, `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`, and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx` |
| `packages/slate-react/test/editable.spec.tsx`           | `onChange` / `onValueChange` / `onSelectionChange` partition                       | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | callback partition already proved                                                                                                                                                                                                                                             |
| `packages/slate-react/test/editable.spec.tsx`           | `Editable` translate attr                                                          | `restore now`   | not currently proved                                                           | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` | current source touchpoint is `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`; low-level DOM root surface still owns this and may require source + proof                                                                                        |
| `packages/slate-react/test/editable.spec.tsx`           | split/merge mount identity on the structured render surface                        | `restore now`   | partial in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx` | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` | current value belongs to `EditableBlocks` / `EditableTextBlocks`, not raw `Editable`                                                                                                                                                                                          |
| `packages/slate-react/test/use-selected.spec.tsx`       | selection overlap rerender                                                         | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | current element-hook runtime test already covers selection switching                                                                                                                                                                                                          |
| `packages/slate-react/test/use-selected.spec.tsx`       | hook result stays stable across structured path rebasing after structural edits    | `restore now`   | partial in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx` | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` | current value comes from `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-selected.tsx` plus runtime-id/path rebasing in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`                                            |
| `packages/slate-react/test/use-selected.spec.tsx`       | chunking-specific branch                                                           | `explicit skip` | none                                                                           | none                                                                         | current package no longer ships the old chunking tree                                                                                                                                                                                                                         |
| `packages/slate-react/test/decorations.spec.tsx`        | render-leaf split metadata and projection-local decoration rerenders               | `mirrored now`  | `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`            | none                                                                         | current package keeps the value through `renderLeaf` plus projection-store proof                                                                                                                                                                                              |
| `packages/slate-react/test/decorations.spec.tsx`        | exact `decorate` API parity                                                        | `explicit skip` | none                                                                           | none                                                                         | current package is projection-first here; `decorate` is not a live public surface                                                                                                                                                                                             |
| `packages/slate-react/test/chunking.spec.ts`            | internal chunk-tree reconcile logic                                                | `explicit skip` | none                                                                           | none                                                                         | dead internal architecture; do not resurrect it                                                                                                                                                                                                                               |
| `packages/slate-react/test/tsconfig.json`               | deleted test-local harness config                                                  | `explicit skip` | package root TS/Jest config                                                    | none                                                                         | no current value in reviving a test-local tsconfig                                                                                                                                                                                                                            |

Family accounting rule:

- deleted file count must still reconcile to `8`
- split rows above are claim clusters, not extra deleted files
- the closeout note must still name all eight deleted files and their final
  disposition

## Execution Phases

### Phase 0: Freeze The Family Matrix

Goal:

- write the per-file disposition into the execution artifact before code work

Exit:

- all eight deleted rows have an initial disposition and proof owner

### Phase 1: Confirm Mirrored Rows

Goal:

- verify the `mirrored now` rows against current runtime proof so nobody
  hand-waves them later

Actions:

- cite the exact runtime test owners for:
  - `useSlateSelector`
  - `useSlateWithV`
  - current hook surface
  - mounted window/root helper surface
  - callback partition

Exit:

- mirrored rows are named precisely in the family closeout note

### Phase 2: Restore The Uncovered Public-Value Rows

Goal:

- add one focused contract file for the still-open React-family value

Target file:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`

Execution rule:

- `surface-contract.tsx` starts self-contained
- only extract shared helpers from `runtime.tsx` if the second restored case
  would otherwise duplicate the same mount/setup logic again

Required restored cases:

1. `ReactEditor.focus` initializes selection from `null` and stays safe
   mid-transform without DOM target drift or `toDOMNode` failures
2. `ReactEditor.focus` does not trigger `onValueChange`
3. the structured render surface keeps element mount identity stable across
   `splitNodes`
4. the structured render surface keeps mount identity stable across
   `mergeNodes`
5. `Editable` defaults `translate=\"no\"` and still allows override
6. `useSelected` stays stable when the selected element path shifts after
   structural edits

Constraint:

- do not recreate the deleted `chunking` internals just to satisfy old tests
- do not smuggle the dead `decorate` prop back in; use projections only where
  that value already exists in the live package

Exit:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`
  exists
- every `restore now` row has a direct current proof owner

### Phase 3: Explicitly Cut The Dead Residue

Goal:

- close the rows that no longer belong instead of leaving them vague

Explicit skips:

- `packages/slate-react/test/chunking.spec.ts`
- chunking-only branches inside `use-selected.spec.tsx`
- exact `decorate` API parity from `decorations.spec.tsx`
- `packages/slate-react/test/tsconfig.json`

Required note:

- explain that the current architecture owns selection/path stability and
  rendering behavior through the structured surface and projection store, but
  does not own the deleted chunk-tree reconcile module or the old `decorate`
  prop

### Phase 4: Ledger And Closeout Sync

Goal:

- make the closure auditable from the roadmap stack

Required artifacts:

- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/overview.md`
- `docs/slate-v2/release-file-review-ledger.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/plans/2026-04-09-slate-v2-slate-react-deleted-test-family-closure.md`

Required ownership updates:

- `surface-contract.tsx` enters `true-slate-rc-proof-ledger.md` as class
  `public surface`
- the family closeout note enters the roadmap stack as class
  `maintainer context`
- `runtime.tsx` remains the owner only for the rows it already mirrors

Closeout note must say:

- what was already mirrored
- what was restored now
- what was explicitly skipped
- why no more `packages/slate-react/test/**` restore work is needed

Batch-exit rule:

- after the family closes, refresh:
  - `master-roadmap.md`
  - `overview.md`
  - `release-file-review-ledger.md`
  - `true-slate-rc-proof-ledger.md`

## Acceptance Criteria

1. all eight deleted `packages/slate-react/test/**` rows are classified in one
   place with no vague residue
2. the live public-value rows are owned by either:
   - `packages/slate-react/test/runtime.tsx`
   - `packages/slate-react/test/surface-contract.tsx`
3. both new artifacts are created and wired into the ledger/proof stack:
   - `packages/slate-react/test/surface-contract.tsx`
   - `docs/plans/2026-04-09-slate-v2-slate-react-deleted-test-family-closure.md`
4. `chunking.spec.ts` is not resurrected and is instead cut explicitly with
   rationale
5. `tsconfig.json` is closed explicitly instead of being left as ghost harness
   debt
6. the ledger stack changes from “remaining open deletion review includes
   slate-react” to “slate-react deleted-family bucket closed”
7. the roadmap stack is refreshed per the batch-exit rule
8. the execution batch ends with fresh same-turn evidence, not doc theater

## Verification

Direct family proof must include:

- `yarn workspace slate-react run test`
- `yarn lint:typescript`

Cross-package regression evidence:

- `yarn test:custom`

Escalate verification if source outside `slate-react` changes:

- `yarn test:mocha`
- `yarn workspace slate-dom test`

Planning artifact verification:

- `bunx prettier --check docs/plans/2026-04-09-slate-react-deleted-test-family-closure-consensus-plan.md`

## ADR

### Decision

Close the Slate React deleted test-family bucket with one focused current
contract file plus the existing broad runtime proof.

### Drivers

- exact deleted-row accounting matters
- hook/editable/structured-rendering public behavior still matters
- chunk-tree internals do not

### Alternatives Considered

- extract shared `slate-react` test helpers first, then split restored proof
- widen `runtime.tsx` only
- resurrect the deleted file tree

### Why Chosen

- best mix of readable proof, honest cuts, and maintainers-facing accounting

### Consequences

- one new focused React-family proof file appears
- `runtime.tsx` stays the owner for already-restored broad runtime coverage
- dead chunking internals are cut plainly instead of haunting the ledger

### Follow-Ups

- execute this batch before `packages/slate-history/test/**`
- reconsolidate the roadmap stack after the family closes

## Agent Roster And Staffing

Available useful agent types for execution:

- `planner`
- `architect`
- `critic`
- `executor`
- `researcher`
- `verifier`

### Ralph Path

Use `$ralph` when you want one controlled batch:

1. freeze the matrix
2. restore `surface-contract.tsx`
3. touch package code only if the restored proof fails honestly
4. sync ledgers and closeout note
5. refresh `master-roadmap.md` and `overview.md`
6. rerun verification

Suggested reasoning:

- `high` for the first restore pass
- `medium` for ledger/doc sync

### Team Path

Use `$team` when you want parallel excavation:

- lane 1: mirrored-row evidence extraction from `runtime.tsx`
- lane 2: `surface-contract.tsx` restore implementation
- lane 3: ledger + closeout artifact drafting
- main thread: integration, roadmap refresh, and final verification

Suggested launch hint:

```bash
omx team 3:executor "Execute the Slate React deleted test-family closure in /Users/zbeyens/git/slate-v2 using the approved plan at /Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-react-deleted-test-family-closure-consensus-plan.md. Freeze the eight-row family matrix first, restore the uncovered public-value rows into packages/slate-react/test/surface-contract.tsx, keep runtime.tsx as proof owner for already mirrored rows, explicitly skip dead chunking and test-local tsconfig residue, sync the ledgers plus /Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md and /Users/zbeyens/git/plate-2/docs/slate-v2/overview.md, and stop only with fresh evidence from yarn workspace slate-react run test, yarn test:custom, and yarn lint:typescript."
```

### Team Verification Path

1. merge the mirrored-row evidence notes before code review
2. verify the new contract file stays limited to restored public-value claims
3. rerun the required commands from the integration thread
4. refuse closure if any deleted row still lacks a final disposition
