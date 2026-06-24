---
date: 2026-04-18
topic: slate-hyperscript-legacy-draft-contract-corpus
status: active
---

# Plite Hyperscript Legacy + Draft Contract Corpus

- owner: `packages/plite-hyperscript`
- tranche: 4
- rule: preserve fixture/runtime construction behavior, not just current loader luck

## Inputs

Legacy package truth:

- `/Users/zbeyens/git/slate/packages/plite-hyperscript/src/**`
- `/Users/zbeyens/git/slate/packages/plite-hyperscript/test/**`

Draft contract rows:

- `/Users/zbeyens/git/plite-draft/packages/plite-hyperscript/test/index.js`
- `/Users/zbeyens/git/plite-draft/packages/plite-hyperscript/test/smoke.js`
- `/Users/zbeyens/git/plite-draft/packages/plite-hyperscript/test/fixtures/**`

Current live owners:

- `packages/plite-hyperscript/src/**`
- `packages/plite-hyperscript/test/index.spec.ts`
- `packages/plite-hyperscript/test/smoke-contract.ts`
- `packages/plite-hyperscript/test/fixtures/**`

## `keep-now`

- public creation surface:
  - `createHyperscript`
  - `createEditor`
  - `createText`
  - `jsx`
- fixture parsing/cursor/selection construction represented by the draft
  fixture corpus
- smoke-level package behavior from the draft `smoke.js` owner

Immediate current proof owners to preserve:

- `packages/plite-hyperscript/test/index.spec.ts`
- `packages/plite-hyperscript/test/smoke-contract.ts`
- `packages/plite-hyperscript/test/fixtures/**`

## `keep-later`

- any broader type-only helper polish that does not change runtime behavior

## `explicit-cut`

- none by default beyond pure harness typing shims if they stop carrying
  behavior value

## `post RC`

- no current `post RC` contract rows identified for this package

## Immediate Execution Consequence

The package is “small” only in surface area.

Its fixture corpus is the contract.

Its direct smoke rows matter too.

Preserve that corpus, keep the small public creation surface honest, and do not
pretend stale Mocha-era proof language still owns the package.
