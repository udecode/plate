---
date: 2026-04-13
topic: slate-react-api
generated: true
---

# Slate React API Audit Matrix

- Exact audit rows generated from the live exact ledgers for `packages/slate-react/src/*.tsx` surfaces.
- Statuses are inherited from the current exact ledgers and tightened as recovery lands.

```tsv
legacy_row	status	proof_owner	source_owner	docs_owner	note
packages/slate-react/test/chunking.spec.ts	explicit-skip	none	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	dead chunking architecture, not current contributor-facing proof
packages/slate-react/test/decorations.spec.tsx	explicit-skip	none	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	exact legacy decorate and redecorate semantics are not part of the kept public surface; the surviving projection-driven renderer value is already owned separately in the release file-review ledger and current proof owners
packages/slate-react/test/editable.spec.tsx	mapped-mixed	packages/slate-react/test/provider-hooks-contract.tsx; packages/slate-react/test/editable-behavior.tsx; packages/slate-react/test/surface-contract.tsx	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	callback partition is mirrored, while translate policy and structured split/merge mount identity are recovered on the current surface
packages/slate-react/test/react-editor.spec.tsx	mapped-mixed	packages/slate-react/test/react-editor-contract.tsx; packages/slate-react/test/surface-contract.tsx	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	mounted window and helper surface are mirrored, while the focus/null-selection and mid-transform safety branch is recovered on the current mounted bridge
packages/slate-react/test/tsconfig.json	explicit-skip	none	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	deleted test-local harness config has no current value
packages/slate-react/test/use-selected.spec.tsx	mapped-mixed	packages/slate-react/test/provider-hooks-contract.tsx; packages/slate-react/test/surface-contract.tsx	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	selection-overlap rerender is mirrored, path-rebasing stability is recovered, and the chunking-specific branch is explicit skip because chunking is not the kept architecture
packages/slate-react/test/use-slate-selector.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	selector equality and replacement are mirrored in provider-hook proof
packages/slate-react/test/use-slate.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx	packages/slate-react/src/*.tsx	docs/libraries/slate-react/*.md	provider editor and version exposure are mirrored in provider-hook proof
```
