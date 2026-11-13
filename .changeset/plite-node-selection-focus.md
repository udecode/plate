---
'plitejs': patch
---

- Add the `nodeSelectionFocus` content-root slot option, a ref to an element that takes focus in place of the root's editable when the editor moves focus into the root, as after an undo, while there is no selection or a node selection holds only the root's top-level blocks
- After an undo or redo, focus the view that holds the restored selection rather than the view whose content changed
- Restore selection and focus after an undo or redo when an announcement, or another commit that changes no document, selection, marks or state, follows it
