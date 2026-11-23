---
'plitejs': patch
---

Make `useRootEditor()` and `useCaretEditor()` return one editor per root under an `EditorRoot`, so a lock set through that editor holds after the caret leaves its root and comes back. A renderer inside an editing area, such as a shape on a board, gets an editor of its own, so a lock set from outside never reaches it. The editor's `isFocused()`, `isComposing()`, `focus()` and `blur()` act on the editing area that shows its root, and throw while none does.
