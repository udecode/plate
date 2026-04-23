---
date: 2026-04-18
topic: slate-react-legacy-draft-contract-corpus
status: active
---

# Slate React Legacy + Draft Contract Corpus

- owner: `packages/slate-react`
- tranche: 6
- rule: keep user-facing runtime behavior from both legacy and draft contracts; do not let current architecture preference erase that surface silently

## Inputs

Legacy exact rows:

- [legacy-slate-react-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2-draft/ledgers/legacy-slate-react-test-files.md)

Draft contract rows:

- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/provider-hooks-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/react-editor-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/primitives-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/editable-behavior.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/projections-and-selection-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/annotation-store-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/widget-layer-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/app-owned-customization.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/large-doc-and-scroll.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/surface-contract.tsx`
- `/Users/zbeyens/git/slate-v2-draft/packages/slate-react/test/with-react-contract.tsx`

Current live owners:

- [slate-react-api.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/slate-react-api.md)
- [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
- `../slate-v2/packages/slate-react/src/**`
- `../slate-v2/packages/slate-react/test/**`
- `../slate-v2/site/examples/ts/**`
- `../slate-v2/playwright/integration/examples/**`

## `keep-now`

### Legacy user-facing runtime rows

- `editable.spec.tsx`
- `react-editor.spec.tsx`
- `use-selected.spec.tsx`
- `use-slate-selector.spec.tsx`
- `use-slate.spec.tsx`

These rows still describe real user-facing behavior and should stay alive.

### Draft runtime contract rows

- provider hook behavior
- ReactEditor helper behavior
- primitive render/runtime helpers
- editable behavior
- projection/annotation/widget runtime behavior
- app-owned customization behavior
- large-doc/runtime behavior
- surface contract behavior
- with-react composition behavior

These are intended v2 value and should not be lost just because they are newer
than legacy.

Immediate current proof owners to restore or create:

- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/react-editor-contract.tsx`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `../slate-v2/packages/slate-react/test/widget-layer-contract.tsx`
- `../slate-v2/packages/slate-react/test/app-owned-customization.tsx`
- `../slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/with-react-contract.tsx`

## `keep-later`

- legacy `decorations.spec.tsx` exact `decorate` / redecorate semantics
  beyond the kept user-facing replacement claim
- legacy chunking-specific behavior unless the merged example/browser corpus
  proves it still belongs

These rows are not silently cut. They are reopened for explicit decision later.

## `explicit-cut`

- pure harness/config residue like legacy test-local `tsconfig.json`

## `post RC`

- specialist platform/browser rows that remain outside the kept package claim
  after example/browser corpus classification

## Immediate Execution Consequence

Do not let current React architecture preference silently cut:

- legacy editable/runtime behavior
- draft provider/projection/annotation/widget behavior

`slate-react` closure requires both sets of rows, plus example/browser proof,
to agree.
