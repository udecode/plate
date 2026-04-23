---
date: 2026-04-14
topic: slate-v2-doc-drift-fix
status: active
---

# Slate v2 Doc Drift Fix Plan

## Goal

Fix the remaining public-doc lies found in the drift audit.

## Scope

- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md`
- `/Users/zbeyens/git/slate-v2/docs/api/transforms.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/02-nodes.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

## Phases

1. Confirm legacy wording and current source signatures.
2. Patch only implementation-forced drift.
3. Add any new repeatable drift-review rule exposed by this pass.
4. Read back the changed docs against source.

## Current Notes

- `Editor` and `Transforms` docs were narrowed below the real exported option
  types.
- `Slate.onChange` docs still describe value-only behavior.
- `Editable` docs omit live exported props.
- `02-nodes.md` contradicts the current built-in inline spacer normalization.
- `docs/api/transforms.md` now uses the live exported option aliases in the
  signatures, documents the recovered `wrapNodes` / `unwrapNodes` /
  `liftNodes` option bags, and documents the current `setSelection(...)`
  insert-text fallback.

## Ledger Recovery Candidates

- recovered in this turn:
  - `wrapNodes` public options now expose `match` / `mode` / `split` / `voids`
  - `unwrapNodes` public options now expose `match` / `mode` / `split` /
    `voids`
  - `liftNodes` public options now expose `match` / `mode` / `voids`
  - exact transform ledger rows were re-greened for those recovered seams
  - `moveNodes/selection` + `moveNodes/voids-true` closeout row now matches the
    exact ledger and public contract
- lower-confidence stale-cluster candidates that need fixture inspection:
  - `insertNodes/*`
  - `mergeNodes/*`
  - `splitNodes/*`
  - `removeNodes/*`
  - `insertText/*`
  - likely issue is either:
    - grouped closeout row stayed too narrow after later API recovery
    - or exact rows still overclaim omitted-options/runtime fallback behavior
