---
'plitejs': patch
---

Keep a separate caret for each `EditorRoot` on one editor.

- Restore a root's own caret when you click, tab, type or press a caret key in it, moved through the edits other roots made meanwhile.
- Restore each root's caret on undo and redo, unless that root placed a newer caret since the edit.
- Move a root's caret to the end of a section's title when that root collapses or hides the section holding it.
- Share one caret across the Editables, windowed and paged surfaces inside one `EditorRoot`, and keep the source's caret in `createEditorView(view)`.
- Give the caret to the root you click, drag, touch or press a caret key in. When code places a caret in another root before that gesture's selection arrives, keep the gesture's point as the root's own caret.
- Keep the caret where it is when Plite's own selection writes or most edits in another root change the browser selection.
- Show each root's own caret in its DOM, so the next key in a root lands where that root shows it.
- Add `writeDOMSelection` and `readDOMSelectionRange` to `plitejs/dom`. Write the browser selection with `writeDOMSelection`, so Plite tells your writes from the user's.
