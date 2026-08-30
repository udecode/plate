---
date: 2026-04-18
topic: slate-history-legacy-draft-contract-corpus
status: active
---

# Plite History Legacy + Draft Contract Corpus

- owner: `packages/plite-history`
- tranche: 4
- rule: preserve kept history behavior across both legacy and draft evidence

## Inputs

Legacy exact rows:

- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/plite-draft/ledgers/legacy-slate-history-test-files.md)
- `/Users/zbeyens/git/slate/packages/plitejs/test/history/**`

Draft contract rows:

- `/Users/zbeyens/git/plite-draft/packages/plitejs/test/history/history-contract.ts`
- `/Users/zbeyens/git/plite-draft/packages/plitejs/test/history/integrity-contract.ts`

Current live owners:

- [slate-history-api.md](/Users/zbeyens/git/plate-2/docs/plite/ledgers/slate-history-api.md)
- `packages/plitejs/src/history/**`
- `packages/plitejs/test/history/**`

## `keep-now`

- legacy `History.isHistory(...)` rows
- legacy undo/redo rows in `legacy-slate-history-test-files.md`
- legacy cursor/selection restore rows
- draft `history-contract.ts`
- draft `integrity-contract.ts`

Immediate current proof owners to restore or create:

- `packages/plitejs/test/history/history-contract.ts`
- `packages/plitejs/test/history/integrity-contract.ts`

Current read:

- restored and green:
  - `history-contract.ts`
- restored and green:
  - `integrity-contract.ts`
- still pending:
  - no missing direct proof owner files remain

Source owners:

- `packages/plitejs/src/history/history.ts`
- `packages/plitejs/src/history/history-editor.ts`
- `packages/plitejs/src/history/with-history.ts`
- `packages/plitejs/src/history/index.ts`

## `keep-later`

- any draft-only history grouping refinement that does not affect the kept
  public surface immediately

## `explicit-cut`

- legacy harness-only rows:
  - `packages/plitejs/test/history/index.js`
  - `packages/plitejs/test/history/jsx.d.ts`
- legacy non-contiguous timing-based auto-merge heuristic row if it remains
  outside the kept claim

## `post RC`

- richer history metadata or future tag/bookmark refinements not needed for the
  kept replacement claim

## Immediate Execution Consequence

Do not treat current small test count as safety.

`plite-history` needs both:

1. legacy undo/redo parity rows
2. draft history/integrity contract rows

before it can be called closed.
