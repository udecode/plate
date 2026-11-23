---
'plitejs': patch
---

- Return `{ reason, status: 'blocked' }` from `editor.api.history.undo()` and `redo()` when the editor refuses the replay, instead of throwing, and pass it to the Editable's `onHistoryReplay` for a keyboard undo or redo. The step stays in history.
- Fix history left busy after a session undo or redo, such as a comment thread restore.
- Send an edit that a plugin makes in reaction to a remote Yjs import or another collaboration update to the other peers.
- Fix the authored plugin's `subscribeRefusals` passing on refusals from other plugins, such as a node write veto.
