---
date: 2026-04-18
topic: plite-dom-legacy-draft-contract-corpus
status: active
---

# Plite DOM Legacy + Draft Contract Corpus

- owner: `packages/plite-dom`
- tranche: 5
- rule: browser-boundary truth is kept only when backed by package proof and user-facing runtime value

## Inputs

Draft contract rows:

- `/Users/zbeyens/git/plite-draft/packages/plite-dom/test/bridge.ts`
- `/Users/zbeyens/git/plite-draft/packages/plite-dom/test/clipboard-boundary.ts`
- draft release/deletion/docs owners under:
  - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/plite-draft/release-file-review-ledger.md)
  - [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/plite-draft/archive/package-end-state-roadmap.md)

Legacy pressure:

- old DOMEditor/browser-boundary expectations in the legacy repo and docs
- legacy behavior-bearing rows referenced through the draft file-review ledger

Current live owners:

- `packages/plite-dom/src/index.ts`
- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-dom/src/plugin/with-dom.ts`
- `packages/plite-dom/src/utils/**`
- `packages/plite-dom/test/bridge.ts`
- `packages/plite-dom/test/bridge.test.ts`
- `packages/plite-dom/test/clipboard-boundary.ts`
- `packages/plite-dom/test/clipboard-boundary.test.ts`

## `keep-now`

- bridge translation contract
- clipboard boundary contract
- DOM point/range/path mapping behavior that still belongs in the kept package
  claim

Immediate current proof owners to restore or keep alive:

- `packages/plite-dom/test/bridge.ts`
- `packages/plite-dom/test/clipboard-boundary.ts`

Current read:

- `bridge.ts` is now restored as a direct package proof owner
- `clipboard-boundary.ts` is now restored as a direct package proof owner

## `keep-later`

- any broader DOM helper or convenience surface not yet demanded by the merged
  browser/example corpus

## `explicit-cut`

- broad legacy DOMEditor baggage that the draft and current docs already treat
  as outside the kept package claim

## `post RC`

- EditContext or broader future DOM/input exploration

## Immediate Execution Consequence

`plite-dom` should not be widened just because legacy had more DOM helpers.

But it also should not be declared done until the bridge and clipboard
contracts from the draft/current proof owners are green in the live package.
