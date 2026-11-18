---
'platejs': patch
---

Add `EditorSelectionView` and `useEditableRef()` to `platejs/react`. Inside `EditorSelectionView`, `useEditor()`, `useEditableRef()`, `useEditorFocused()` and `useFocusedLast()` read the view that holds the selection, such as a board note's view, so toolbar buttons act on note text. `useFocusedLast()` counts focus in a board note's Editable as focus of the note's view and of the page around it.
