---
'plitejs': patch
---

Cancel an author's own proposed content when they remove or restore it, and show only the remaining text, formatting, structure, or move in suggestion reviews. Preserve cancellation through undo, redo, persistence, and collaboration, including edits spanning multiple proposals.

Keep text typed in Editing mode inside a pending suggestion as direct text that survives the suggestion's rejection. Read contiguous deletions as one review part, list proposals across statuses with `changes({ proposals: true })` (each page names its `documentId`, and a cursor from a replaced document restarts at the first page), and block rejecting a suggestion that another pending suggestion is inserted in or deletes from until both are rejected together.

Yjs shared effects that use a collaboration transport accept only their current persistence version; effects without a transport still decode their legacy versions.
