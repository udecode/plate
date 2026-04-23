---
date: 2026-04-16
topic: slate-editor-api-ledger
status: active
---

# Slate Editor API Ledger

- owner: `packages/slate`
- tranche: 3
- rule: recover exported editor contracts before fixing consumers

## Current Read

- deleted editor-family archaeology is already banked through the legacy exact
  ledger and April 9 closeout docs
- recovered editor seams are live, but the public API hierarchy is reopened
  under the absolute-api replan
- the draft-backed public accessor/transaction seam is now recovered for:
  - `getChildren`
  - `getOperations`
  - `setChildren`
  - `getSnapshot`
  - `replace`
  - `reset`
  - `subscribe`
  - `withTransaction`
- the query/location audit for:
  - `before`
  - `after`
  - `positions`
  showed those files are already source-close enough that they were not the
  best first code spend
- direct query owner proof is now live and green in:
  - `../slate-v2/packages/slate/test/query-contract.ts`
- direct `Editor.nodes/**` oracle proof is now live and green in:
  - `../slate-v2/packages/slate/test/legacy-editor-nodes-fixtures.ts`
- package-local closeout is green on:
  - `bun test ./packages/slate/test`
  - `bunx turbo build --filter=./packages/slate`
  - `bunx turbo typecheck --filter=./packages/slate`
  - `bun run lint:fix`
  - `bun run lint`
- tranche-3 editor/public-surface seams are now landed, including:
  - `surface-contract.ts`
  - `transaction-contract.ts`
  - `bookmark-contract.ts`
  - `range-ref-contract.ts`
  - `extension-contract.ts`
  - `Editor.bookmark(...)`
- current narrowing now made explicit in proof:
  - `Transforms.setSelection(...)` is a patch helper
  - when there is no live selection, callers must seed it with
    `Transforms.select(...)` instead of expecting `setSelection(...)` to create
    one from a partial patch
- current public-state hierarchy now has one stronger draft/store split:
  - `editor.operations` is a compatibility mirror over internal op state
  - `Editor.getOperations(editor)` is the canonical operations read seam
  - `Editor.apply(editor, op)` is now the explicit public single-op writer
    over the transaction seam
  - `Editor.withTransaction(editor, tx => ...)` now exposes explicit draft
    reads through:
    - `tx.children`
    - `tx.selection`
    - `tx.marks`
    - `tx.operations`
  - `tx.apply(op)` now exists as the first explicit transaction-owned write seam
  - `applyOperation(editor, op)` now exists as the internal helper/transform
    writer seam
- that write seam is now used by transaction-owned source paths instead of only
  tests/helpers:
  - `interfaces/transforms/general.ts`
  - `editor/insert-break.ts`
  - `transforms-node/move-nodes.ts`
  - `transforms-text/delete-text.ts`
- additional helper/transform code now routes through the internal writer seam:
  - `interfaces/transforms/text.ts`
  - `transforms-selection/select.ts`
  - `transforms-selection/deselect.ts`
  - `transforms-selection/set-selection.ts`
  - `transforms-node/remove-nodes.ts`
  - `transforms-node/set-nodes.ts`
  - `transforms-node/split-nodes.ts`
  - `transforms-node/insert-nodes.ts`
  - `transforms-node/merge-nodes.ts`
- `tx.apply(op)` is now backed by the base core writer instead of delegating
  through an overridden `editor.apply`
- `Editor.apply(editor, op)` now rides that same stronger writer instead of
  treating wrapped `editor.apply(op)` as the public default
- commit subscribers now fire before `editor.onChange()`
- `editor.onChange()` therefore reads more honestly as a legacy compatibility
  callback over the snapshot-store seam, not the primary commit owner
- the public `editor.apply(op)` seam therefore reads more honestly as
  compatibility pressure, while transaction-owned code keeps moving onto the
  stronger writer path
- exact `interfaces/Editor/**` fixture proofs now also read through explicit
  accessors instead of ambient property mirrors by default
- the remaining direct property pressure is concentrated in deliberate
  compatibility-owner files, not spread across the wider interface fixture tree
- mutable editor fields are now classified more honestly:
  - `editor.children` is a compatibility mirror over explicit child/snapshot
    seams, not a primary read seam
  - `editor.selection` is a compatibility mirror over explicit
    snapshot/transaction selection seams, not a primary read seam
  - `editor.marks` is a compatibility mirror over explicit
    snapshot/query/transaction marks seams, not a primary read seam
- current direct property-owner inventory is now down to the explicit keepers:
  - source:
    - `core/public-state.ts`
    - `interfaces/editor.ts`
  - tests:
    - `accessor-transaction.test.ts`
    - `interfaces-contract.ts`
    - `snapshot-contract.ts`
    - `surface-contract.ts`
    - `transaction-contract.ts`
- direct `editor.marks` property writes are now explicitly proved as a live
  compatibility seam in:
  - `snapshot-contract.ts`
- internal hot-path source reads now also route more explicitly:
  - `delete-text.ts`
  - `get-default-insert-location.ts`
  now use `Editor.getChildren(editor)` instead of reading `editor.children`
  directly for live draft state
- current non-legacy contract wrappers now follow that same direction:
  - `normalization-contract.ts`
  - `extension-contract.ts`
  use `Editor.getChildren(editor)` for live draft reads in app-owned
  normalization examples
- `insertText` now avoids direct `editor.selection` source reads in its
  null-selection guard by using an explicit public-selection helper instead
- `slate-react` provider callbacks now read through `Editor.getChildren`,
  `Editor.getOperations`, and `Editor.getLiveSelection` instead of ambient
  mirrors
- `slate-react` browser input selection checks now read through
  `Editor.getLiveSelection`; read-only mark and child checks use
  `Editor.marks` / `Editor.getChildren`
- the Android input manager now reads selection through
  `Editor.getLiveSelection`; its mark writes remain an explicit compatibility
  owner
- `slate-dom` focus and DOM-selection synchronization now reads selection
  through `Editor.getLiveSelection`
- the huge-document example uses `Editor.subscribe` for performance
  instrumentation instead of monkey-patching `editor.apply`
- current failed probes, intentionally not landed:
  - a direct committed-mirror cut for `editor.children`
  - direct committed-mirror cuts for `editor.selection` / `editor.marks`
  - read:
    those hard cuts are not the live claim today
    the live claim is compatibility-only, with future cuts still open

## Sources

- [2026-04-18-slate-v2-slate-claim-width-classification.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-18-slate-v2-slate-claim-width-classification.md)
- [2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-exhaustive-api-contract-recovery-plan.md)
- [2026-04-09-slate-v2-core-deleted-test-family-closeout.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-core-deleted-test-family-closeout.md)

## Tranche 3 Rule

Audit each kept exported row against:

1. legacy contract
2. current shipped surface
3. live proof owner

Do not promote a row to mirrored just because the helper name survived or a
green harness exists nearby.

Current narrowing is no longer presumed bad by default. If the better API is
cleaner and the old surface is baggage, cut or demote it explicitly.

Restored direct contract owners outrank source closeness when they disagree.

Recovered public names do not automatically recover every deeper legacy semantic
behind them. Keep explicit cuts explicit.
