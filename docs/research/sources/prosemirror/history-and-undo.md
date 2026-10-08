# ProseMirror: history and undo

## Selection in history

- ProseMirror's history tests assert the selection, not only the document: `restores selection on undo` expects undo to bring back the exact selection the undone replacement had, and redo the selection after it, and `rebases selection on undo` expects the restored selection to be mapped through a later insert kept out of history (`addToHistory: false`), so its head moves from 3 to 6 (`ProseMirror/prosemirror-history@768b7420:test/test-history.ts:221-243`). Source: `docs/plite/research/2026-06-14-selection-paste-undo-oracles/read-log.tsv:4`; the tests were reread on 2026-10-08 at the commit of the local clone, last changed 2026-04-01, before the run's 2026-06-14 read.

## ProseMirror test families

- **PM-07 history.** `history/test/test-history.ts` checks undo and redo, grouping by `newGroupDelay` and adjacency, changes kept outside history and overlapping or unsynced deletes, compression, restoring and rebasing the selection on undo, undo and redo depth, truncation, appended transactions and collaborative rebasing (`ProseMirror/prosemirror-history@768b74205ad59919ed54d75e197312964ddcf3c2:test/test-history.ts:31-402`). Plite counterparts: `packages/plitejs/test/history/history-contract.ts`, `history-branch-contract.spec.ts` and `history-soak-contract.slow.ts`; Plite does not persist ProseMirror-style steps. Source: `docs/editor-test-harvester/prosemirror/report.md:146`.

## Edits outside history

- ProseMirror's history keeps a step map beside every undoable step in its branches, so a transaction with `addToHistory: false` or a remote change still adds its maps, and older undo events are remapped or dropped through them; edits made outside history stay authoritative instead of being undone. `test/test-history.ts` covers this with 'allows changes that aren't part of the history', 'supports overlapping edits' and 'supports overlapping unsynced deletes'. Evidence: `ProseMirror/prosemirror-history@768b74205ad59919ed54d75e197312964ddcf3c2:src/history.ts:24-150` (Branch, `remapping`, rebase) and `test/test-history.ts:94-170`, checked 2026-10-08 at the local checkout; the run read `src/history.ts:1-120`, `:260-420` unpinned.
