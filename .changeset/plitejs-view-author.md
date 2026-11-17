---
'plitejs': patch
---

- Name a view's author with `createEditorView(editor, { authorId })`. Every write the view records, and every withdrawal through it, names that author. A view made or projected from it keeps the author unless it names its own. An empty `authorId`, or one with a NUL character, throws
- Call an `authored({ authorId })` callback with the view the write runs through, or the editor when the write runs on it
