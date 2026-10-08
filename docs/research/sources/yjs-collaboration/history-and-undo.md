# Yjs collaboration: history and undo

## Undo with remote edits

- **Undo with remote edits.** y-prosemirror pins these rules (`yjs/y-prosemirror@9200946f0e:tests/undo.test.js`):
  - Content present before the `UndoManager` existed is not undoable (:831).
  - A local undo removes only the local paragraph and keeps a concurrent remote one (:859).
  - A remote update applied with the default null origin clears the redo stack, because `Y.UndoManager` tracks the null origin by default (:922).
  - Undo moves the cursor to the undone change (:113, :414).
  - One `UndoManager` survives view destroy and recreate without leaking handlers (:450-663).

  yjs `testUndoText` and `testUndoArray` undo only the local insert after a peer's concurrent insert and delete, and redo restores only what survived (`yjs/yjs@da05230083:tests/undo-redo.tests.js:52`, :240; Yjs 14 prerelease; `docs/editor-test-harvester/yjs-collaboration/report.md:73`). Plite's binding does not use `Y.UndoManager`: no file in `packages/plitejs/src` or `packages/platejs/src` names it (searched 2026-10-08), and undo runs through Plite history. Remote imports skip local history (`packages/plitejs/test/collab-history-runtime-contract.ts:258`), and local undo and redo rebase across an earlier remote text commit (:513). Over Yjs, `packages/plitejs/test/yjs/collaborative-history-contract.slow.ts` replays offline undo and redo, invalidates redo after a new local edit and restores the historic selection (tests 'invalidates redo after a new local edit' and 'restores the Plite historic selection'). No Plite test is named for a remote edit that arrives between an undo and its redo, so Plite's answer to y-prosemirror's redo-clearing case is unproven.
