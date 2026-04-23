---
date: 2026-04-02
topic: slate-v2-core-react-proof-ralph
context_snapshot: /Users/zbeyens/git/plate-2/.omx/context/slate-v2-core-react-proof-20260402T210617Z.md
source_prd: /Users/zbeyens/git/plate-2/.omx/plans/prd-slate-v2-core-react-proof.md
source_test_spec: /Users/zbeyens/git/plate-2/.omx/plans/test-spec-slate-v2-core-react-proof.md
---

# Slate v2 Core React Proof Ralph Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Ship the first honest proof slice for Slate v2:

- `../slate-v2/packages/slate-v2`
- `../slate-v2/support/slate-v2-react-proof`

The slice must prove the snapshot/store/replacement contract can support selector-first React `19.2+` reads without effect mirroring.

## Locked Constraints

- no real DOM editing surface
- no history package
- no migration or compatibility work
- no broad bug-family payoff
- keep core data-model-first
- keep operations first-class externally
- stop if the harness still needs effect mirroring or mutable-editor reads

## Execution Plan

### Phase 1: Repo Grounding

Status: `completed`

- inspect `../slate-v2` workspace/build/test constraints
- inspect whether `support/slate-v2-react-proof` can stay private and non-workspace
- identify the smallest package and command surface needed for the spike

### Phase 2: Core Slice Definition

Status: `completed`

- freeze the first implementation seam:
  - `createEditor`
  - `editor.apply`
  - `Editor.withTransaction`
  - `getSnapshot`
  - `subscribe`
  - explicit replacement seam
- freeze the smallest transform subset needed to prove those seams

### Phase 3: Implement `packages/slate-v2`

Status: `completed`

- scaffold package
- implement provisional snapshot store and transaction runner
- implement explicit replacement
- implement enough op lowering and transforms for the proof subset
- add targeted unit/integration tests

### Phase 4: Implement React Proof Harness

Status: `completed`

- scaffold `support/slate-v2-react-proof`
- wire React `19.2+`
- add selector-first `useSyncExternalStore` reads
- prove no effect mirroring
- add targeted tests

### Phase 5: Verification And Review

Status: `completed`

- targeted package build
- targeted package typecheck
- targeted tests
- proof harness verification
- architect review
- deslop pass
- regression re-verification

## Delegation Lanes

- implementation lane: local main thread unless a bounded parallel worker slice becomes obvious
- evidence/regression lane: separate agent after core and harness exist
- architect sign-off lane: separate agent after verification is green

## Known Failure Conditions

- React proof requires effect mirroring
- React proof requires reading mutable in-flight editor state
- explicit replacement cannot preserve coherent snapshot semantics
- provisional package boundaries force React 19.2 assumptions into the existing workspace

## Progress Log

### 2026-04-02

- created Ralph context snapshot
- created durable execution plan
- reading current `../slate-v2` constraints and proof artifacts before code changes
- implemented `packages/slate-v2` with a minimal transaction/snapshot core
- added the isolated `support/slate-v2-react-proof` React `19.2+` harness
- wired root Slate build, TypeScript references, and Mocha test discovery for `slate-v2`
- green so far:
  - `fnm exec --using 22 yarn tsc --project packages/slate-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/**/*.ts`
  - `npm run typecheck` in `support/slate-v2-react-proof`
  - `npm test` in `support/slate-v2-react-proof`
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
  - `rg -n "useEffect\\(" src` in `support/slate-v2-react-proof` returns no matches
- waiting on architect verification before the deslop pass
- architect feedback found two real contract holes, then one React proof gap, and those blockers were fixed instead of argued away
- architect approval obtained on the settled proof seam
- deslop pass removed the dead `createEmptyIndex` helper and unused `Root` type import
- post-deslop regression re-verification is green:
  - `fnm exec --using 22 yarn tsc --project packages/slate-v2/tsconfig.json --noEmit`
  - `fnm exec --using 22 yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/**/*.ts`
  - `npm run typecheck` in `support/slate-v2-react-proof`
  - `npm test` in `support/slate-v2-react-proof`
  - `rg -n "useEffect\\(" src` in `support/slate-v2-react-proof` returns no matches
  - `fnm exec --using 22 yarn build:rollup`
  - `fnm exec --using 22 yarn lint:eslint`
  - `fnm exec --using 22 yarn lint:prettier`
