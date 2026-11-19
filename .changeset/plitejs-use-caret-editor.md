---
'plitejs': patch
---

- Add `useCaretEditor()` to `plitejs/react`. It returns an editor for the root that holds the caret, such as a board note, or for the primary root while nothing is selected, so a toolbar outside every `Editable` acts where the caret is. It renders again only when the caret moves to another root.
