# Lexical: history and undo

## History tests

- **History tests.** `LexicalHistory.test.tsx` in `lexical-history` (`facebook/lexical@dd5c41b1:packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:256-542`) reports undo state through `CAN_UNDO_COMMAND` and `CAN_REDO_COMMAND` and clears history with `CLEAR_HISTORY_COMMAND`. Its portable rows are:
  - a block-property change (to a quote) that undoes and redoes;
  - a change after an undo, which clears redo; regression #1055 also undoes that new change back to empty, so it is an undo entry of its own (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:21`);
  - #6409: marking nodes dirty without a change records nothing, while a text change and a change to only a custom node property each record one entry (`:484-542`).

  The rest is Lexical-specific: one history shared by a parent editor and its nested editors, NodeSelection ownership in that stack, and a `SharedHistoryExtension` that creates the parent editor. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:252-257`, `:942-943`; the command names and test titles were checked at dd5c41b1. Limit: at dd5c41b1 the file also tests `HistoryExtension` canUndo and canRedo signals (`:544-661`) and a `maxDepth` option that evicts the oldest undo entries first (`:679-719`), which the 2026-05-09 ledger does not list.
