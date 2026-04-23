---
date: 2026-04-02
topic: slate-react-v2-runtime-proof-ralph
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-react-v2-runtime-proof-20260402T221100Z.md
---

# Slate React v2 Runtime Proof Ralph Plan

## Goal

Ship the first honest `slate-react-v2` proof slice:

- `../slate-v2/packages/slate-react-v2`

The slice must prove selector-first committed-snapshot reads, controlled replacement without effect mirroring, and clean dependency on `slate-dom-v2` for browser ownership.

## Locked Constraints

- React `19.2+` only
- no broad context subscriptions
- no effect-driven mirror state
- no DOM translation logic owned here
- no product helpers, examples, or migration shims

## Planned Proof Slice

Primary target:

- provider/store seam
- selector hook
- controlled replacement helper path
- stale-editor-instance and slice-rerender proof

Representative pressure:

- `#5709`
- `#5488`
- `#5131`
- `#4612`

## Execution Plan

### Phase 1: Repo Grounding

Status: `completed`

- inspect current `slate-react` package shape and test seams
- inspect what can be reused from the isolated proof harness
- identify the smallest package surface that still counts as a real runtime package

### Phase 2: Slice Definition

Status: `completed`

- freeze the first public seam
- freeze the first proof tests
- freeze what `slate-react-v2` is allowed to ask from `slate-dom-v2`

### Phase 3: Implement `packages/slate-react-v2`

Status: `completed`

- scaffold package
- move or adapt the proof harness logic into package code
- add provider plus selector hooks
- add controlled replacement and editor-instance proof tests
- keep DOM ownership delegated to `slate-dom-v2`

### Phase 4: Verification And Review

Status: `completed`

- targeted install/build/typecheck/test
- repo-integrated build/lint checks
- architect review
- deslop pass
- regression re-verification

## Known Failure Conditions

- selector hooks widen back into broad rerenders
- controlled replacement requires `useEffect`
- runtime reads mutable editor state instead of committed snapshots
- `slate-react-v2` has to re-own `slate-dom-v2` concerns to stay coherent

## Progress Log

### 2026-04-02

- created new Ralph context snapshot for the React runtime branch
- loaded the locked `slate-react-v2` contract and prior `slate-v2` / `slate-dom-v2` proof artifacts
- next step is mapping current `slate-react` seams and the smallest honest package proof
- explorer findings confirmed the right cut:
  - keep the proof on the v2 seam, not the old React 18 Jest harness
  - reuse selector ideas, not the old provider and DOM timing soup
- implemented `packages/slate-react-v2` with:
  - provider
  - `useSlateStatic`
  - `useSlateSelector`
  - `useSlateReplace`
  - `useSlateRootRef`
  - `useSlateNodeRef`
- added proof tests for:
  - selector-scoped rerenders
  - controlled replacement without effect mirroring
  - editor-instance switching
  - delegation of DOM ownership to `slate-dom-v2`
- architect review approved the settled proof slice
- deslop pass was a no-op after the final hook cleanup; there was no honest simplification left without weakening the proof
- post-deslop regression re-verification is green:
  - `fnm exec --using 22 yarn install`
  - `fnm exec --using 22 yarn tsc --project packages/slate-react-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn workspace slate-react-v2 test`
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
  - `fnm exec --using 22 yarn node -e "require('slate-v2'); require('slate-dom-v2'); require('slate-react-v2')"`
  - `lsp diagnostics directory` for `packages/slate-react-v2`: `0` errors
