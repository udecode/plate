---
date: 2026-04-09
topic: slate-v2-deletion-closure-protocol
---

# Slate v2 Deletion Closure Protocol

> Reference doc. Closure mechanics only, not live verdict or queue ownership.

## Purpose

Prevent deletion-closure drift between:

- batch scope
- file-truth
- front-door roadmap wording

This doc owns deletion-closure mechanics and examples.

It does **not** own:

- live status
- verdict
- proof truth
- tranche order

Live status stays in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

Specialist lane ownership stays in
[docs/slate-browser/proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md).

## Core Rules

### 1. Batch Name Must Equal Audited Scope

Allowed:

- `Slate React deleted test-family closure: packages/slate-react/test/**`
- `Slate React deleted source-family closure: packages/slate-react/src/**`

Not allowed:

- `Slate React closure`
- `Slate React deletion closure`

The exact audited glob must appear in:

- the plan title
- the closeout note
- ledger wording

### 2. Parent / Child Closure Tree Is Mandatory For Split Packages

If a package has multiple deleted child buckets, define a parent row and child
rows.

Example parent:

- `packages/slate-react/**`

Example children:

- `packages/slate-react/test/**`
- `packages/slate-react/src/**`
- narrower source children derived from the frozen inventory

The child tree must come from the frozen deleted inventory, not from memory.

### 3. Promotion Gate

Closing a child bucket does not close the parent bucket.

Allowed:

- ``packages/slate-react/test/**` is closed`
- `Slate React test-family is closed`

Not allowed unless the parent row reconciles:

- `Slate React is closed`
- `Slate React deletion review is closed`
- removing the package from remaining-open roadmap bullets

### 4. Residual-Open Disclosure

New or refreshed deletion closeout notes must include:

- `Scope closed`
- `Sibling buckets still open`
- `What this batch does NOT close`

Historic closeouts are grandfathered unless they are actively refreshed.

### 5. Frozen Inventory Gate

Before refreshing deletion wording, capture the deleted-path inventory once from
the target repo and freeze it for the batch.

Example:

```bash
git -C /Users/zbeyens/git/slate-v2 diff --diff-filter=D --name-only -- packages/slate-react
```

Then reconcile every frozen path as:

- already closed in ledger
- closed by this batch
- still open
- explicit skip

Do not rerun the raw diff later and treat it as a new source of truth.

### 6. Existing Proof Surfaces And Existing Lane IDs Only

When deletion work touches runtime behavior, cite:

- existing proof surfaces from
  - `true-slate-rc-proof-ledger.md`
  - `release-file-review-ledger.md`
- existing lane ids from
  - `docs/slate-browser/proof-lane-matrix.md`

Do not invent a second owner taxonomy.

Allowed:

- `runtime/browser`
- `public surface`
- `yarn test:slate-browser:ime:local`
- `yarn test:slate-browser:dom`

Not allowed:

- freeform owner labels like `selection-sync`

### 7. Front-Door Docs Must Follow File-Truth

When the frozen inventory still has open child rows:

- `master-roadmap.md`
- `overview.md`

must keep the parent package visibly open.

## Command Order

### `reconsolidate-roadmap.md`

Use when sequence/front-door wording changes.

Before refresh:

1. freeze deleted inventory for the affected package/scope
2. reconcile parent/child rows in the ledger
3. then refresh `master-roadmap.md` and `overview.md`

### `refresh-file-review-ledger.md`

Use when file-truth changes.

Before refresh:

1. freeze deleted inventory for the affected package/scope
2. update package parent/child rows in the ledger
3. record any explicit skips or still-open rows

## Representative Proving Case

Representative case:

- a child bucket like `packages/slate-react/test/**` can be closed
- while the parent package like `packages/slate-react/**` stays open until the
  remaining child rows reconcile

That exact distinction is the kind of thing this protocol exists to protect.
