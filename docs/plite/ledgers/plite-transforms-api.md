---
date: 2026-07-20
topic: plite-transforms-api-ledger
status: active
---

# Plite Transforms API Ledger

- owner: `packages/plite`
- public write boundary: `editor.update`
- transaction surface: semantic `tx` groups plus canonical changes

## Contract

Transforms mutate one isolated transaction draft and publish one canonical
`DocumentChange`. Reads inside the transaction use the transaction view;
ambient editor reads remain committed. Pure commands return a frozen
`TransactionSpec` and dispatch it once against its checked base revision.

Primitive draft steps may temporarily violate representation rules. Final
construction merges equal adjacent text, removes redundant empty leaves,
preserves inline caret spacers, fills compiled schema defaults, and maps
selection and runtime identity before publication.

External direct changes are strict. Fragment and paste callers pass an intact
`ContentSlice` through `state.slice.fit(...)` or `tx.slice.replace(...)`.
Closed application content uses `tx.fragment.replace(...)` instead of
maintaining transform-specific insertion branches.

Extension corrections run from classified changed paths to a deterministic
fixed point. `editor.update.value.repair()` is the explicit all-root
maintenance entrypoint.

## Proof owners

- `packages/plite/test/transaction-contract.ts`
- `packages/plite/test/command-spec.test.ts`
- `packages/plite/test/transforms-contract.ts`
- `packages/plite/test/clipboard-contract.ts`
- `packages/plite/test/slice-fit-contract.test.ts`
- `packages/plite/test/normalization-contract.ts`
- `packages/plite/test/runtime-contracts.test.ts`

The public surface contains no operation middleware, `EditorIntent`,
`applyIntent`, or transform-specific fragment choreography.
