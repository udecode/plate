---
'plitejs': patch
---

- Render a read-only `Editable` as static text with `contenteditable="false"`, as Slate does. A click no longer focuses it or shows a caret, and the browser's context menu no longer offers Cut or Paste. Pointer selection and copy still work. `useEditorFocused()` stays `false` for a read-only editor, and Shift+Arrow does not select inside one. A read-only content root from `slots.contentRoot` is not a Tab stop either.
- Fix Undo, Redo and `editor.api.dom.editable()` when one editor renders in several views. They act on the view the user last clicked or focused, even after focus moves to a button outside the editor. A click past the end of a line or on a view's padding focuses the view it lands in, even while another view has focus.
