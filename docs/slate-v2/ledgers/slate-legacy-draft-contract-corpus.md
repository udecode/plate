---
date: 2026-04-18
topic: slate-legacy-draft-contract-corpus
status: active
---

# Slate Legacy + Draft Contract Corpus

- owner: `packages/slate`
- tranche: 3
- rule: legacy and draft rows are evidence, not automatic veto power over the
  better API

## Purpose

Merge the three competing sources of truth for `slate` package work:

1. legacy exact tests/docs
2. draft contract tests/docs
3. current proof owners

This corpus is execution evidence for tranche-3 redesign.

It is stricter than source-diff nostalgia, but it is no longer allowed to force
a worse retrofit API when the redesign direction is clearer and better.

## Inputs

Legacy exact rows:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-test-files.md)
- legacy source/docs under:
  - `/Users/zbeyens/git/slate/packages/slate/src/**`
  - `/Users/zbeyens/git/slate/packages/slate/test/**`
  - `/Users/zbeyens/git/slate/docs/**`

Draft contract rows:

- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/query-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/transforms-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/operations-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/interfaces-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/surface-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/transaction-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/snapshot-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/range-ref-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/bookmark-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/clipboard-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/normalization-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/headless-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/text-units-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/legacy-editor-nodes-fixtures.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/legacy-interfaces-fixtures.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate/test/legacy-transforms-fixtures.ts`

Current live owners:

- [slate-editor-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-editor-api.md)
- [slate-interfaces-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-interfaces-api.md)
- [slate-transforms-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-transforms-api.md)
- `/Users/zbeyens/git/slate-v2/packages/slate/src/**`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/**`

## Row Classes

- `both`
  - a behavior or API row is supported by both legacy and draft evidence
- `legacy-only`
  - legacy requires it; draft does not materially strengthen it
- `draft-only`
  - draft adds intended v2 value not contradicted by kept legacy rows
- `dead`
  - harness-only, manifest-only, or otherwise outside the kept public claim

Execution dispositions:

- `keep-now`
- `keep-later`
- `explicit-cut`
- `post RC`

## `keep-now`

### Legacy-backed public editor/query rows

- `Editor.before(...)`
- `Editor.after(...)`
- `Editor.next(...)`
- `Editor.previous(...)`
- `Editor.nodes(...)`
- `Editor.levels(...)`
- `Editor.positions(...)`
- `Editor.unhangRange(...)`
- `Editor.node(...)`
- `Editor.path(...)`
- `Editor.point(...)`
- `Editor.range(...)`
- `Editor.start(...)`
- `Editor.end(...)`
- `Editor.string(...)`

Class:

- mostly `both`
- these rows now also have draft or current proof pressure through
  `query-contract.ts`, `surface-contract.ts`, and current API ledgers

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`

Current read:

- restored and green:
  - `query-contract.ts`
  - `legacy-editor-nodes-fixtures.ts`

### Legacy-backed interface and utility rows

- `Path.*`
- `Point.*`
- `Range.*`
- `Node.*`
- `Element.*`
- `Text.*`
- `Operation.*`
- `Scrubber.*`

Class:

- mostly `both`

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate/test/interfaces-contract.ts`
- `../slate-v2/packages/slate/test/legacy-interfaces-fixtures.ts`

Current read:

- restored and green:
  - `legacy-interfaces-fixtures.ts`
- still pending:
  - `interfaces-contract.ts`

### Legacy-backed transform and operation rows

- kept `Transforms.move(...)`
- kept `Transforms.delete(...)`
- kept `Transforms.select(...)`
- kept `Transforms.setPoint(...)`
- kept `Transforms.setSelection(...)`
- kept node transform families already represented in the exact legacy ledger

Class:

- mostly `both`

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate/test/transforms-contract.ts`
- `../slate-v2/packages/slate/test/operations-contract.ts`
- `../slate-v2/packages/slate/test/legacy-transforms-fixtures.ts`

### Draft-backed public transaction/snapshot/store rows

- `Editor.getChildren(...)`
- `Editor.getOperations(...)`
- `Editor.setChildren(...)`
- `Editor.getSnapshot(...)`
- `Editor.replace(...)`
- `Editor.reset(...)`
- `Editor.subscribe(...)`
- `Editor.withTransaction(...)`
- transaction draft visibility through `withTransaction(editor, tx => ...)`
- `Transforms.applyBatch(...)`
- snapshot publication and transaction visibility semantics
- bookmark and range-ref public durability seams

Class:

- mostly `draft-only`, but compatible with kept legacy public behavior

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate/test/surface-contract.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/bookmark-contract.ts`
- `../slate-v2/packages/slate/test/range-ref-contract.ts`

### Draft-backed current contract rows that still matter to product truth

- clipboard contract
- normalization contract
- headless contract
- text-units contract

Class:

- `draft-only`
- keep because they describe intended v2 runtime behavior not covered well by
  the old exact legacy rows

Immediate current proof owners to restore or keep alive:

- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/normalization-contract.ts`
- `../slate-v2/packages/slate/test/headless-contract.ts`
- `../slate-v2/packages/slate/test/text-units-contract.ts`

## `keep-later`

- legacy `CustomTypes` rows
  - current live docs said explicit skip
  - the broader redesign doctrine reopens them for explicit re-evaluation
  - do not silently keep or cut them
- broader draft helper-module adoption with no immediate kept-row pressure:
  - `draft-helpers`
  - `transaction-helpers`
  - `text-units` implementation shape beyond kept behaviors
  - other draft-only source helpers whose value is still indirect
- benchmark/perf harness promotion beyond already kept runtime rows

## `explicit-cut`

- legacy harness-only rows with no behavior value:
  - `packages/slate/test/index.js`
  - `packages/slate/test/jsx.d.ts`
  - old batch matrix manifests
  - old perf manifest files
- exact legacy partial-commit batch failure semantics already replaced by
  atomic rollback under the kept transaction contract
- dead deep-equal helper family outside the kept public surface
- legacy ordinary-op adjacent-text/spacer canonicalization rows that conflict
  with the live explicit-only normalization contract
  - owner:
    `/Users/zbeyens/git/slate-v2/packages/slate/test/fixture-claim-overrides.ts`
  - read:
    these rows expected ordinary transforms like `moveNodes`, `insertNodes`,
    `insertFragment`, `mergeNodes`, `wrapNodes`, and related delete/split
    helpers to coalesce adjacent text or strip spacer text automatically
  - live claim:
    that cleanup is explicit-only unless a narrower kept row proves otherwise

## `post RC`

- draft-only architecture helpers that may still be valuable after the
  replacement claim is honest
- broader benchmark/root proof command adoption
- any future widening driven by product value rather than parity pressure

## Immediate Execution Consequence

The next `slate` code batches must be planned from these proof owners, not from
source similarity:

1. `query-contract.ts` + `legacy-editor-nodes-fixtures.ts`
2. `interfaces-contract.ts` + `legacy-interfaces-fixtures.ts`
3. `transforms-contract.ts` + `operations-contract.ts` +
   `legacy-transforms-fixtures.ts`
4. `surface-contract.ts` + `transaction-contract.ts` +
   `snapshot-contract.ts`
5. `bookmark-contract.ts` + `range-ref-contract.ts` +
   `clipboard-contract.ts` + `normalization-contract.ts`

If current `../slate-v2/packages/slate/src/**` cannot satisfy those rows
cleanly, rewrite it.
