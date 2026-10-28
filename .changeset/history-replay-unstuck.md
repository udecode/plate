---
'plitejs': patch
---

- Fix undo and redo throwing on every press after a collaborator deletes a block that your offline edits split or merged
- Fix undo throwing when it restores an inline element beside an empty text that only an earlier caret kept
- Drop an undo or redo entry whose replay throws while it maps or applies, so the next press replays the entry below. A press that fails reports the error to `lifecycleErrorSink` and returns `{ status: 'failed' }` instead of throwing
