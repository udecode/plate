# Wordgard: commands and transforms

## Document change algebra

- **One delta for everything.** `test/test-change.ts` lines 34-230 at b5ad0d0 pin one canonical document delta that applies mixed text, structure, property, split, join, wrap and fit edits, and rejects invalid structure. Plite covers it in `packages/plitejs/test/document-change.test.ts`, `document-change-structural-transform.test.ts`, `transforms-contract.ts` and `schema-contract.ts` (report.md:87).

- **Algebraic laws.** `test/test-change.ts` lines 231-574 at b5ad0d0 pin compose, inverse, JSON round trips (including generated changes), changed ranges and point association as deterministic algebraic laws. Plite's `packages/plitejs/test/document-change.test.ts` and `document-change-laws.test.ts` cover compose, inverse, JSON, ranges, affinity, roots, correction, deterministic vectors and generated serialization (report.md:88). Limit: the report cited lines 455-803 of the laws file; its generated laws now sit at lines 482-827.

## Transactions

- **Atomic updates.** `test/test-state.ts` lines 7-126 at b5ad0d0 pin that several sibling and sequential update specs commit atomically, with selections and typed effects mapped once through the combined change. The Plite owners named on 2026-09-02 were `transaction-contract.ts`, `native-transaction-spec-contract.test.ts` and `document-state-effect-contract.ts`, all still under `packages/plitejs/test/`, plus `transaction-extension-contract.ts`. That last file was deleted in e0c1500b95 (2026-09-15) (report.md:90; checked 2026-10-08).

## Block commands

- **Block commands.** `test/test-commands.ts` lines 130-662 and 792-876 at b5ad0d0 pin that lift, hard break, split, Enter, selection deletion, joins, wrap and unwrap, block type and mark toggling all keep structure and selection valid. Plite covers the substrate in `packages/plitejs/test/transforms-contract.ts`, `delete-contract.ts`, `snapshot-contract.ts`, `transforms/liftNodes/selection/block-nested.tsx` and `transforms/setNodes/block/block.tsx` (report.md:102).

## List commands

- **List toggling.** `test/test-commands.ts` lines 650-778 at b5ad0d0 pin list toggling over collapsed, expanded, nested, mixed and multi-range targets without leaking the selection. Plate owns this, and `packages/platejs/src/features/list/lib/BaseListPlugin.slow.tsx` covers the cases (report.md:103).

- **Join into nested list items.** `test/test-commands.ts` lines 394-401 at b5ad0d0 pin a forward join from a paragraph into the first block of a nested list item that holds several blocks, keeping the rest of the list structure. Wordgard issue #68 reported this case building an invalid document (issues.md:76, title only). Plate represents lists as flat list-item properties (`packages/platejs/src/features/list/lib/BaseListPlugin.ts`), not as nested multi-block containers, so the case has no Plate counterpart (report.md:125, 169).
