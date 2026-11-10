---
'plitejs': patch
---

- Speed up typing, Enter, Backspace, Delete and mark toggles in a large named content root, such as a board of thousands of shapes, in Editing and Suggesting, and on a teammate's peer that receives the edit through Yjs
- Speed up typing in a content root, such as a board note, inside a long document
- Fix decorations in a content-root view, such as a board note's, painting at their old offsets after a typed character until their next refresh
- Speed up typing in Suggesting when the document holds many pending suggestions
- Speed up typing right after a teammate's edit in a large document
- Speed up accepting or rejecting a suggestion inside one block of a large document
- Fix a Yjs room that stopped accepting updates when a teammate deleted the last block under your caret in a content root, or when two peers restored the same content root at once
- Report a merge that replaces this peer's copy of a content root through the lifecycle error sink, with `source: 'yjs'`, `phase: 'merge'`, the root and the lost copy
- Name each copied content root `<root>:copy:<clientID>:<n>` when collaborating and `<root>:copy:<n>` otherwise, so copies never share a name within a session
- Fix Enter doing nothing in a block inside an object element, such as a paragraph in a board note
- Free a deleted content root's indexes
- Fix `DocumentChange.apply` returning the unwritten blocks of a frozen input array with their children still mutable
- Speed up typing in an editor that mounts only the blocks in view, which checked each key's insert twice
