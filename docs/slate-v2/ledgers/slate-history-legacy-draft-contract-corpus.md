---
date: 2026-04-18
topic: slate-history-legacy-draft-contract-corpus
status: active
---

# Slate History Legacy + Draft Contract Corpus

- owner: `packages/slate-history`
- tranche: 4
- rule: preserve kept history behavior across both legacy and draft evidence

## Inputs

Legacy exact rows:

- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-history-test-files.md)
- `/Users/zbeyens/git/slate/packages/slate-history/test/**`

Draft contract rows:

- `/Users/zbeyens/git/slate-v2-draft/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-history/test/integrity-contract.ts`

Current live owners:

- [slate-history-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-history-api.md)
- `../slate-v2/packages/slate-history/src/**`
- `../slate-v2/packages/slate-history/test/**`

## `keep-now`

- legacy `History.isHistory(...)` rows
- legacy undo/redo rows in `legacy-slate-history-test-files.md`
- legacy cursor/selection restore rows
- draft `history-contract.ts`
- draft `integrity-contract.ts`

Immediate current proof owners to restore or create:

- `../slate-v2/packages/slate-history/test/history-contract.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`

Current read:

- restored and green:
  - `history-contract.ts`
- restored and green:
  - `integrity-contract.ts`
- still pending:
  - no missing direct proof owner files remain

Source owners:

- `../slate-v2/packages/slate-history/src/history.ts`
- `../slate-v2/packages/slate-history/src/history-editor.ts`
- `../slate-v2/packages/slate-history/src/with-history.ts`
- `../slate-v2/packages/slate-history/src/index.ts`

## `keep-later`

- any draft-only history grouping refinement that does not affect the kept
  public surface immediately

## `explicit-cut`

- legacy harness-only rows:
  - `packages/slate-history/test/index.js`
  - `packages/slate-history/test/jsx.d.ts`
- legacy non-contiguous timing-based auto-merge heuristic row if it remains
  outside the kept claim

## `post RC`

- richer history metadata or future tag/bookmark refinements not needed for the
  kept replacement claim

## Immediate Execution Consequence

Do not treat current small test count as safety.

`slate-history` needs both:

1. legacy undo/redo parity rows
2. draft history/integrity contract rows

before it can be called closed.
