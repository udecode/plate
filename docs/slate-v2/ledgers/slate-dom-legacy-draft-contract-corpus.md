---
date: 2026-04-18
topic: slate-dom-legacy-draft-contract-corpus
status: active
---

# Slate DOM Legacy + Draft Contract Corpus

- owner: `packages/slate-dom`
- tranche: 5
- rule: browser-boundary truth is kept only when backed by package proof and user-facing runtime value

## Inputs

Draft contract rows:

- `/Users/zbeyens/git/slate-v2-draft/packages/slate-dom/test/bridge.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-dom/test/clipboard-boundary.ts`
- draft release/deletion/docs owners under:
  - [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/release-file-review-ledger.md)
  - [package-end-state-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/archive/package-end-state-roadmap.md)

Legacy pressure:

- old DOMEditor/browser-boundary expectations in the legacy repo and docs
- legacy behavior-bearing rows referenced through the draft file-review ledger

Current live owners:

- `../slate-v2/packages/slate-dom/src/index.ts`
- `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `../slate-v2/packages/slate-dom/src/utils/**`
- `../slate-v2/packages/slate-dom/test/bridge.ts`
- `../slate-v2/packages/slate-dom/test/bridge.test.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.test.ts`

## `keep-now`

- bridge translation contract
- clipboard boundary contract
- DOM point/range/path mapping behavior that still belongs in the kept package
  claim

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate-dom/test/bridge.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`

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

`slate-dom` should not be widened just because legacy had more DOM helpers.

But it also should not be declared done until the bridge and clipboard
contracts from the draft/current proof owners are green in the live package.
