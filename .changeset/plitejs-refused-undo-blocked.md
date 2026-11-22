---
'plitejs': patch
---

- Return `{ reason, status: 'blocked' }` from `editor.api.history.undo()` and `redo()` when the editor refuses the replay, instead of throwing. The step stays in history.
- Pass that blocked result to the Editable's `onHistoryReplay` when the editor refuses an undo or redo from the keyboard, instead of `{ status: 'failed' }` and a lifecycle error.
- Finish a session undo or redo, such as a comment thread restore, once its effect owner has run, so the editor keeps the outcome the outside state already holds and history is never left busy.
- Send an edit that a plugin makes in reaction to a remote Yjs import or another collaboration update to the other peers, instead of treating it as part of that remote change.
- Fix the authored plugin's `subscribeRefusals`, which passed on refusals from other plugins, such as a node write veto, as authored refusals.
