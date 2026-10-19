---
'plitejs': patch
---

- Make updates on large documents cost in proportion to the change, including updates made with `history: 'skip'` and edits after a whole-document replacement
- Speed up text edits in documents with thousands of top-level blocks in JavaScriptCore, the engine in Safari and Bun (measured in Bun)
- Stop freezing the top-level array that `editor.read.children()` returns after an edit. It is still read-only, and the next edit throws after a write that changes its length
- Speed up the first saved edit after many history-skipped updates, such as a streamed AI response
- Stop undo from replacing unrelated content after a history-skipped edit elsewhere in the document
- Validate a document that shares frozen blocks with an earlier validated one in proportion to its new blocks, such as each preview of a streamed response
- Look up plugins on editor views without rebuilding the editor's plugin configuration on every call
