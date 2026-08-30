---
date: 2026-04-13
topic: legacy-slate-react-test-files
generated: true
---

# Legacy Plite React Test Files Ledger

- Exact 1:1 ledger for legacy `packages/plitejs/test/react/**` files.
- Total legacy files: `8`
- explicit-skip: `2`
- mapped-mixed: `1`
- mapped-mirrored: `5`

```tsv
legacy_file	mapping_status	current_owner	note
packages/plitejs/test/react/chunking.spec.ts	explicit-skip	none	dead chunking architecture, not current contributor-facing proof
packages/plitejs/test/react/decorations.spec.tsx	mapped-mixed	packages/plitejs/test/react/primitives-contract.tsx; packages/plitejs/test/react/projections-and-selection-contract.tsx	projection-local decoration behavior is mirrored; exact decorate parity is explicit skip
packages/plitejs/test/react/editable.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx; packages/plitejs/test/react/editable-behavior.tsx; packages/plitejs/test/react/surface-contract.tsx	direct legacy editable parity is proved across the dedicated current proof owners
packages/plitejs/test/react/react-editor.spec.tsx	mapped-mirrored	packages/plitejs/test/react/react-editor-contract.tsx; packages/plitejs/test/react/surface-contract.tsx	direct legacy ReactEditor parity is proved across the dedicated current proof owners
packages/plitejs/test/react/tsconfig.json	explicit-skip	none	deleted test-local harness config has no current value
packages/plitejs/test/react/use-selected.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx; packages/plitejs/test/react/surface-contract.tsx	direct legacy useSelected parity is proved across the dedicated current proof owners
packages/plitejs/test/react/use-slate-selector.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx	selector equality and replacement are mirrored in provider-hook proof
packages/plitejs/test/react/use-slate.spec.tsx	mapped-mirrored	packages/plitejs/test/react/provider-hooks-contract.tsx	provider editor and version exposure are mirrored in provider-hook proof
```
