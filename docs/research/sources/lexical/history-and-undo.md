# Lexical: history and undo

## History tests

- **History tests.** `LexicalHistory.test.tsx` in `lexical-history` (`facebook/lexical@dd5c41b1:packages/lexical-history/src/__tests__/unit/LexicalHistory.test.tsx:256-542`) reports undo state through `CAN_UNDO_COMMAND` and `CAN_REDO_COMMAND` and clears history with `CLEAR_HISTORY_COMMAND`. Its portable rows are:
  - a block-property change (to a quote) that undoes and redoes;
  - a change after an undo, which clears redo; regression #1055 also undoes that new change back to empty, so it is an undo entry of its own (`facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs:21`);
  - #6409: marking nodes dirty without a change records nothing, while a text change and a change to only a custom node property each record one entry (`:484-542`).

  The rest is Lexical-specific: one history shared by a parent editor and its nested editors, NodeSelection ownership in that stack, and a `SharedHistoryExtension` that creates the parent editor. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:252-257`, `:942-943`; the command names and test titles were checked at dd5c41b1. Limit: at dd5c41b1 the file also tests `HistoryExtension` canUndo and canRedo signals (`:544-661`) and a `maxDepth` option that evicts the oldest undo entries first (`:679-719`), which the 2026-05-09 ledger does not list.

## Merge policy

- Lexical's history decides per update whether to merge, push or discard (`HISTORY_MERGE`, `HISTORY_PUSH`, `DISCARD_HISTORY_CANDIDATE`): an update during active composition is discarded as a history candidate, the explicit `HISTORY_PUSH_TAG` and `HISTORY_MERGE_TAG` tags force the choice, and otherwise a delay and the kind of change decide whether typing merges. Evidence: `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-history/src/index.ts:47-49`, `:113-125`, `:313-346`, checked 2026-10-08; the run read `:170-360` unpinned.

## History entries

- Lexical history entries hold whole `EditorState` snapshots, restored with `setEditorState` on undo and redo, rather than ProseMirror-style step maps or Plite's operation and state-patch batches; Plite does not copy full-state snapshot history. Evidence: `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-history/src/index.ts:60`, `:408`, `:444`, checked 2026-10-08.
