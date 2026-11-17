---
'platejs': patch
---

Add `useEditorScrollElementRef` to `platejs/react`. An app whose page scrolls an element outside `EditorContainer` puts the returned ref on that element, with the editor from `useCreateEditor` or `useEditor()`. Table-of-contents jumps, virtualized editables and `editor.api.dom.scroll()` then scroll that element. Without it, `EditorContainer` stays the scroll container.
