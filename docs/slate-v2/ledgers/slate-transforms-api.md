---
date: 2026-04-16
topic: slate-transforms-api-ledger
status: active
---

# Slate Transforms API Ledger

- owner: `packages/slate`
- tranche: 3
- rule: recover transform contracts before dependent helper or runtime cleanup

## Current Read

- transforms-family deleted-test closure is already banked
- current package-local `slate` transform behavior is green on:
  - `packages/slate/test/**`
  - `bunx turbo build --filter=./packages/slate`
  - `bunx turbo typecheck --filter=./packages/slate`
  - `bun run lint:fix`
  - `bun run lint`
- tranche-3 transform/fragment/range-ref owners are now landed:
  - `transforms-contract.ts`
  - `clipboard-contract.ts`
  - `range-ref-contract.ts`
- the `#6038` benchmark lane now exists and runs:
  - `bun run bench:slate:6038:local`
- the old broad-helper explicit-skip read is stale for `packages/slate`, but
  is no longer an active owner problem for this package
- `Transforms.applyBatch(...)` is now recovered again as the public batch entry
  point, backed by the real draft transaction owner `Editor.withTransaction(...)`
- the package is reopened for one explicit transform-family cut:
  - legacy ordinary-op adjacent-text/spacer canonicalization rows are no longer
    kept by default
  - owner:
    `/Users/zbeyens/git/slate-v2/packages/slate/test/fixture-claim-overrides.ts`
  - live rule:
    heavier adjacent-text/spacer cleanup stays explicit, not automatic on every
    ordinary structural op

That means the active transforms problem for `packages/slate` is no longer
"missing owner files".
It is explicit claim width.

## Sources

- [2026-04-18-slate-v2-slate-claim-width-classification.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-claim-width-classification.md)
- [2026-04-09-slate-v2-transforms-family-deleted-test-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-transforms-family-deleted-test-closure.md)

## Tranche 3 Rule

- legacy transform width wins by default unless a narrower cut is explicitly
  justified as no longer relevant to keep
- recover only the transform rows that still belong in the kept live claim
- for `packages/slate`, the named owner files now exist and the benchmark owner
  exists
- do not let draft helper modules or green shaped harness rows silently widen
  or silently narrow the transform claim

Recovered transform grouping is good when it rides the same engine seam. Do not
fork batch behavior behind a second implementation path.

For the perfect-redesign lane:

- transform compatibility survives only where it still earns its keep
- do not keep a worse transform surface alive just because legacy shipped it
