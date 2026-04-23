---
date: 2026-04-13
topic: legacy-slate-react-test-files
generated: true
---

# Legacy Slate React Test Files Ledger

- Exact 1:1 ledger for legacy `packages/slate-react/test/**` files.
- Total legacy files: `8`
- explicit-skip: `2`
- mapped-mixed: `1`
- mapped-mirrored: `5`

```tsv
legacy_file	mapping_status	current_owner	note
packages/slate-react/test/chunking.spec.ts	explicit-skip	none	dead chunking architecture, not current contributor-facing proof
packages/slate-react/test/decorations.spec.tsx	mapped-mixed	packages/slate-react/test/primitives-contract.tsx; packages/slate-react/test/projections-and-selection-contract.tsx	projection-local decoration behavior is mirrored; exact decorate parity is explicit skip
packages/slate-react/test/editable.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx; packages/slate-react/test/editable-behavior.tsx; packages/slate-react/test/surface-contract.tsx	direct legacy editable parity is proved across the dedicated current proof owners
packages/slate-react/test/react-editor.spec.tsx	mapped-mirrored	packages/slate-react/test/react-editor-contract.tsx; packages/slate-react/test/surface-contract.tsx	direct legacy ReactEditor parity is proved across the dedicated current proof owners
packages/slate-react/test/tsconfig.json	explicit-skip	none	deleted test-local harness config has no current value
packages/slate-react/test/use-selected.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx; packages/slate-react/test/surface-contract.tsx	direct legacy useSelected parity is proved across the dedicated current proof owners
packages/slate-react/test/use-slate-selector.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx	selector equality and replacement are mirrored in provider-hook proof
packages/slate-react/test/use-slate.spec.tsx	mapped-mirrored	packages/slate-react/test/provider-hooks-contract.tsx	provider editor and version exposure are mirrored in provider-hook proof
```
