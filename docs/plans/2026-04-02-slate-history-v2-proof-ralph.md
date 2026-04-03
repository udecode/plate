---
date: 2026-04-02
topic: slate-history-v2-proof-ralph
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-history-v2-proof-20260402T224054Z.md
---

# Slate History v2 Proof Ralph Plan

## Goal

Ship the first honest `slate-history-v2` proof slice:

- `../slate/packages/slate-history-v2`

The slice must prove transaction-aware undo units and explicit grouping semantics on top of `slate-v2`.

## Locked Constraints

- no clipboard implementation sweep yet
- no DOM timing heuristics
- no React ownership here
- no per-operation history model pretending to be transaction-aware

## Planned Proof Slice

Primary target:

- history wrapper or package surface
- undo stack built from committed snapshots
- redo stack
- explicit “saving” boundary
- selection-only transactions excluded from saved history

Representative pressure:

- `#5587`
- `#4559`
- `#5533`

## Execution Plan

### Phase 1: Repo Grounding

Status: `completed`

- inspect current `slate-history` package shape and tests
- inspect issue-derived history pressure and candidate proof tests
- identify the smallest real public seam for `slate-history-v2`

### Phase 2: Slice Definition

Status: `completed`

- freeze the first history public surface
- freeze the first proof tests
- freeze what explicit grouping means in the proof

### Phase 3: Implement `packages/slate-history-v2`

Status: `completed`

- scaffold package
- add transaction-aware undo/redo state
- add explicit save suppression or grouping seam
- add proof tests

### Phase 4: Verification And Review
Status: `completed`

- targeted install/build/typecheck/test
- repo-integrated build/lint checks
- architect review
- deslop pass
- regression re-verification

## Known Failure Conditions

- one transaction still produces multiple history units
- undo/redo fails to restore committed snapshot state cleanly
- selection-only transactions still pollute saved history
- grouping still depends on incidental timing instead of explicit boundaries

## Progress Log

### 2026-04-02

- created new Ralph context snapshot for the history branch
- loaded the locked Phase 4 roadmap and requirements
- next step is mapping current `slate-history` seams and the smallest honest proof slice
- explorer findings confirmed the right cut:
  - keep clipboard deferred for this slice
  - extract a pure history core instead of copying the old `withHistory` timing soup
- implemented `packages/slate-history-v2` with:
  - pure `history-state` helpers
  - explicit save and merge boundaries
  - transaction-aware undo and redo over committed snapshots
- added proof tests for:
  - one outer transaction equals one undo unit
  - selection-only commits are not saved
  - explicit `withoutSaving`
  - explicit `withMerging`
  - selection restore on undo
- architect review first rejected the slice for one real blocker:
  - history capture sat downstream of `editor.onChange`, making it depend on callback ordering luck
- fixed that by moving `slate-v2` subscriber notification ahead of `editor.onChange`, then re-ran the full v2 proof stack
- final architect verdict: `APPROVED`
- deslop pass was a no-op after the history-core extraction; there was no further honest simplification left without weakening the proof
- post-deslop regression re-verification is green:
  - `fnm exec --using 22 yarn install`
  - `fnm exec --using 22 yarn tsc --project packages/slate-history-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn mocha --require ./config/babel/register.cjs ./packages/slate-history-v2/test/**/*.ts`
  - `fnm exec --using 22 yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/**/*.ts`
  - `fnm exec --using 22 yarn workspace slate-dom-v2 test`
  - `fnm exec --using 22 yarn workspace slate-react-v2 test`
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
  - `fnm exec --using 22 yarn node -e "require('slate-v2'); require('slate-dom-v2'); require('slate-react-v2'); require('slate-history-v2')"`
  - `lsp diagnostics directory` for `packages/slate-history-v2`: `0` errors
