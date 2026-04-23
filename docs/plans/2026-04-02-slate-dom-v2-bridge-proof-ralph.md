---
date: 2026-04-02
topic: slate-dom-v2-bridge-proof-ralph
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-dom-v2-bridge-proof-20260402T214350Z.md
---

# Slate DOM v2 Bridge Proof Ralph Plan

## Goal

Ship the first honest DOM-boundary proof for Slate v2:

- `../slate-v2/packages/slate-dom-v2`
- one narrow bridge over `slate-v2` snapshots and runtime ids

The slice must prove that DOM lookup and boundary containment can work without path-only weak-map luck.

## Locked Constraints

- no full React runtime rewrite
- no history
- no clipboard lane yet
- no IME gauntlet yet
- no browser-state logic inside `slate-v2`
- stop if DOM ownership still leaks between nested editors

## Planned Proof Slice

Primary target:

- identity-backed DOM path lookup
- nested-editor root containment
- explicit rejection of points outside the editor boundary

Representative pressure:

- `#5947`
- `#5938`
- `#4789`

## Execution Plan

### Phase 1: Repo Grounding

Status: `completed`

- inspect current `slate-dom` seams and reusable patterns
- inspect current test seams for DOM utilities
- decide the smallest `slate-dom-v2` package shape

### Phase 2: Slice Definition

Status: `completed`

- freeze the minimal public surface
- freeze the first red-test lanes
- freeze the bridge ownership model for nested editors

### Phase 3: Implement `packages/slate-dom-v2`

Status: `completed`

- scaffold package
- implement editor-root registration
- implement element-to-runtime-id registration
- implement runtime-id-backed `findPath`
- implement guarded `toSlatePoint` or equivalent boundary-safe point lookup
- add tests

### Phase 4: Verification And Review

Status: `completed`

- targeted typecheck
- targeted tests
- root build or lint wiring if needed
- architect review
- deslop pass
- regression re-verification

## Known Failure Conditions

- parent editor can still resolve child editor DOM
- path lookup still depends on stale path-only maps
- outside points still resolve into the wrong editor
- the bridge needs render-timed React state to stay coherent

## Progress Log

### 2026-04-02

- created new Ralph context snapshot for the DOM bridge branch
- read the locked v2 DOM contract and current `slate-dom` entrypoints
- selected the first proof slice around runtime-id lookup and nested-editor containment
- explorer findings confirmed the right cut: start from containment plus a brand-new runtime-id registry, not the current `DOMEditor` tarpit
- implemented `packages/slate-dom-v2` with:
  - editor root mounting
  - per-editor DOM node to runtime-id binding
  - runtime-id-backed `findPath`
  - guarded `toSlatePoint`
- added proof tests for:
  - nested editor containment
  - id-backed path lookup after reorder
  - outside-point rejection
- green so far:
  - `fnm exec --using 22 yarn install`
  - `fnm exec --using 22 yarn tsc --project packages/slate-dom-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn workspace slate-dom-v2 test`
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
  - `lsp diagnostics directory` for `packages/slate-dom-v2`: `0` errors
- waiting on architect verification before the deslop pass
- architect review first rejected the slice for three real blockers:
  - broken CommonJS consumption for the new proof packages
  - stale root ownership after remount
  - element-container DOM points not normalizing into text points
- those blockers were fixed and pinned with extra tests
- final architect verdict: `APPROVED`
- deslop pass was a no-op after the blocker fixes; there was no further honest simplification left in the changed files without weakening the proof
- post-deslop regression re-verification is green:
  - `fnm exec --using 22 yarn install`
  - `fnm exec --using 22 yarn tsc --project packages/slate-dom-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn workspace slate-dom-v2 test`
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
  - `fnm exec --using 22 yarn node -e "require('slate-v2'); require('slate-dom-v2')"`
  - `lsp diagnostics directory` for `packages/slate-dom-v2`: `0` errors
