---
date: 2026-04-13
topic: slate-react-api
generated: true
---

# Plite React API Audit Matrix

- Exact audit rows generated from the live exact ledgers for `packages/plitejs/src/react/*.tsx` surfaces.
- Statuses are inherited from the current exact ledgers and tightened as recovery lands.

```tsv
legacy_row	status	proof_owner	source_owner	docs_owner	note
packages/plitejs/test/react/chunking.spec.ts	explicit-skip	none	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	dead chunking architecture, not current contributor-facing proof
packages/plitejs/test/react/decorations.spec.tsx	explicit-skip	none	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	exact legacy decorate and redecorate semantics are not part of the kept public surface; the surviving projection-driven renderer value is already owned separately in the release file-review ledger and current proof owners
packages/plitejs/test/react/editable.spec.tsx	mapped-mixed	packages/plitejs/test/react/provider-hooks-contract.tsx; packages/plitejs/test/react/editable-behavior.tsx; packages/plitejs/test/react/surface-contract.tsx	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	callback partition is mirrored, while translate policy and structured split/merge mount identity are recovered on the current surface
packages/plitejs/test/react/react-editor.spec.tsx	mapped-mixed	packages/plitejs/test/react/react-editor-contract.tsx; packages/plitejs/test/react/surface-contract.tsx	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	mounted window and helper surface are mirrored, while the focus/null-selection and mid-transform safety branch is recovered on the current mounted bridge
packages/plitejs/test/react/tsconfig.json	explicit-skip	none	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	deleted test-local harness config has no current value
packages/plitejs/test/react/use-selected.spec.tsx	mapped-mixed	packages/plitejs/test/react/provider-hooks-contract.tsx; packages/plitejs/test/react/surface-contract.tsx	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	selection-overlap rerender is mirrored, path-rebasing stability is recovered, and the chunking-specific branch is explicit skip because chunking is not the kept architecture
packages/plitejs/test/react/use-slate-selector.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	selector equality and replacement are mirrored in provider-hook proof
packages/plitejs/test/react/use-slate.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx	packages/plitejs/src/react/*.tsx	docs/libraries/plite-react/*.md	provider editor and version exposure are mirrored in provider-hook proof
```
