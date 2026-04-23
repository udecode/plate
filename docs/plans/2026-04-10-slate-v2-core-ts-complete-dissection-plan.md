---
date: 2026-04-10
topic: slate-v2-core-ts-complete-dissection
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 `core.ts` Complete Dissection Plan

## Goal

Finish the dissection of
[core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts) so we stop
doing it half-way.

The end state is:

- every public/core behavior that deserves its own path lives in its own file
  under
  [/Users/zbeyens/git/slate-v2/packages/slate/src/core](/Users/zbeyens/git/slate-v2/packages/slate/src/core)
- `core.ts` no longer hides major exported runtime behavior
- dead compatibility paths are removed instead of preserved as fake ownership
- helper/infrastructure code that is shared across many core path files can stay
  shared, but it must be explicitly treated as internal support, not accidental
  omnibus ownership

## Governing Rule

Only keep drift that strengthens the better engine direction:

1. data-model-first
2. operation- and collaboration-friendly
3. transaction-first engine semantics
4. React-optimized runtime
5. explicit adapters later

For `packages/slate/src/**` specifically:

- keep one-file-per-method topology for public/core surface code
- if a drift does not clearly support that better engine direction, revert it
- never keep a fake wrapper when the path is supposed to be a real owner
- never invent dead compatibility files just to make the tree look familiar

## Current State

### Already extracted into real `src/core/*` owners

- [apply.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts)
- [get-dirty-paths.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-dirty-paths.ts)
- [get-fragment.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-fragment.ts)
- [normalize-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts)
- [should-normalize.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/should-normalize.ts)
- [get-current-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-node.ts)
- [get-current-selection.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-selection.ts)
- [get-current-marks.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-marks.ts)
- [get-current-children.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-children.ts)
- [get-current-range-for-path.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-range-for-path.ts)
- [get-snapshot.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-snapshot.ts)
- [subscribe.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/subscribe.ts)
- [get-current-index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-index.ts)
- [get-current-replace-epoch.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-current-replace-epoch.ts)
- [set-current-marks.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/set-current-marks.ts)
- [get-range-refs.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-range-refs.ts)
- [initialize-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/initialize-editor.ts)
- [replace-snapshot.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/replace-snapshot.ts)
- [range-ref.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/range-ref.ts)

### Already extracted into explicit internal support modules

- [path-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/path-helpers.ts)
- [node-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/node-helpers.ts)
- [draft-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/draft-helpers.ts)
- [transaction-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts)
- [fragment-rebase-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/fragment-rebase-helpers.ts)
- [fragment-helpers.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/fragment-helpers.ts)

### Already cut as dead paths

- [batch-dirty-paths.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/batch-dirty-paths.ts)
- [update-dirty-paths.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/update-dirty-paths.ts)

### Still implemented directly in `core.ts`

- none beyond shared type declarations and `INTERNAL`

## Decision Matrix

### A. Should become explicit internal shared modules, not stay in `core.ts`

These are still needed by multiple extracted path files, but they are not
themselves the reviewer-facing behavior names users think about:

- mixed-inline and block-container fragment support
- fragment slice/split helpers
- insert-fragment rebasing helpers
- scratch-editor fragment simulation

Recommended destination:

- one explicit internal support file under `packages/slate/src/core/`
- working name:
  - `fragment-helpers.ts`

Do not create one file per tiny helper if the only result is fragmentation
without semantic gain.

### B. Remaining real exported core owners

This tranche is already done:

- [get-state.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-state.ts)
- [step-current-point.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/step-current-point.ts)
- [apply-operation.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply-operation.ts)
- [with-transaction.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core/with-transaction.ts)

## Execution Order

### Phase 1: Freeze the current tranche

Before more extraction:

- keep the current extracted files green
- do not reopen dead paths unless the current engine actually uses them again
- update
  [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
  immediately when a path changes status

### Phase 2: Move exported runtime owners out of `core.ts`

Do in this order:

1. `get-state.ts`
2. `step-current-point.ts`
3. `apply-operation.ts`
4. `with-transaction.ts`

Reason:

- these are the exported runtime pieces still making `core.ts` feel like the
  real owner
- moving them gets the biggest truth win without forcing every tiny helper into
  its own file first

### Phase 3: Carve internal shared helpers out of `core.ts`

Status:

- path helpers: done
- node helpers: done
- draft/snapshot helpers: done
- transaction publish helpers: done
- fragment rebasing/simulation helpers: done
- mixed-inline and block-container fragment helpers: done
- fragment slice/split helpers: done
- fragment insertion helpers: done

Rules:

- group by coherent responsibility
- avoid one-file-per-trivial-helper nonsense
- keep imports boring and obvious

### Phase 4: Flatten `core.ts`

Done:

- `core.ts` is now an explicit export surface, not the real home of the engine
- there is no blanket `export *` fallback
- every re-export points at an actual owner/support file

## What not to do

- do not restore dead paths like `batch-dirty-paths.ts` or
  `update-dirty-paths.ts` unless the current engine really uses them again
- do not extract tiny helpers one by one just to hit an aesthetic ideal
- do not leave fake wrappers for public/core behavior names
- do not keep `core.ts` as the secret real owner after the path files exist

## Verification rule for each extraction slice

For every slice:

1. read the exact git diff for the target files
2. make sure the new owner file contains real logic, not a shim
3. rerun a narrow `tsc --noEmit --skipLibCheck --target es2022 --module esnext --moduleResolution bundler ...` probe over the touched files and direct callers
4. update
   [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
   with concrete old-vs-current file drift
5. if a path turns out not to be a real current concept, cut it instead of
   keeping it as compatibility theater

## Completion criteria

The dissection is complete when:

- `core.ts` no longer contains major exported runtime behavior bodies
- every surviving exported `src/core/*` path is a real owner
- dead compatibility paths are gone
- `pr-description.md` explains the surviving drift concretely, file by file
- no row in the maintainer doc still uses fake “owns logic” filler
