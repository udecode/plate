# Plite: history and undo

## Selection repair after undo

- When undo or redo restores an expanded view selection, the history focus repair asks only for a force render, and only when history requires one; it never asks for a caret repair, because the view-selection projection draws an expanded selection rather than one native caret. A collapsed selection still gets a focused `repair-caret` that prefers the model selection (`packages/plitejs/src/react/editable/history-focus.ts:135-155`). The skip came from the June 2026 200k-block undo-delete work, where restoring an expanded projected selection had paid DOM caret repair. Source: `docs/plite/research/2026-06-12-huge-doc-architecture/README.md:736-769`. Limit: the June numbers ran on the removed staged lane and are not repeated here.

## Transaction extenders and undo batches

- **Extender edits stay in one batch.** When a transaction extender adds edits to a command, those edits must stay in that command's isolated undo and redo batch. The Plite regression 'keeps extender-added edits in one isolated undo and redo batch' in `packages/plitejs/test/history/integrity-contract.ts` (near line 160) wraps `insertText` with `state.transaction.extend` to add `!`. It then checks the extender text and an adjacent explicit batch across two undos and two redos. The file passed 12/12 on 2026-09-02. Donor: Wordgard `wordgard/wordgard@b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54:test/test-history.ts` lines 410-428 (docs/editor-test-harvester/wordgard/report.md:120, 164).
