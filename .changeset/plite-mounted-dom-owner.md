---
'plitejs': patch
---

Resolve DOM operations through the active mounted surface when several Editables share an editor. Retiring one surface preserves node and point resolution in the surviving focused surface. DOM-scope hooks follow focus changes and mounted-view retirement.

Run `editor.api.dom` calls on the editor `createEditor` returns in a mounted `EditorRoot` view of the root the call is about. That view holds the caret. With no caret in that root, it is the only view of the root, else the focused one, also when that view sits in an iframe or a shadow root. While the caret's view is hidden or has no Editable, those calls find no DOM. A call that passes a DOM node or an event runs in the view that renders it, wherever the caret is. `resolveRange` is the exception on this editor and on a `useRootEditor()` editor. It still runs on the editor you call, so resolve a DOM range in a named root's view with that view's own editor. `focus()` on that editor now focuses the view instead of doing nothing, and `drag.start()` starts the drag in a view of the dragged node's root. `resolveDropTarget()` with coordinates and no `target`, and `drag.autoScroll()`, run in the view under the pointer. Points and event ranges it resolves from a view of a named root carry that `root`. `useEditorEditableElement(editor)`, `useEditorRootElement(editor)` and `useEditorScrollElement(editor)` return that view's elements and follow the caret.

An editor from `useRootEditor()` runs its calls in its own mounted view. Its lookups of a node, point or range in another root return `null`, and its `assert*` lookups throw. A view's own editor, such as the one `useEditorContext()` returns inside the view, now does the same for a point or range in another root, where it used to answer from its own root's DOM. On every editor, `hasRange` checks each point in the root that point names. While a view of the editor is mounted, a DOM lookup of a range whose points name different roots throws, as other location reads do.

Cancel pending scrolling with the cleanup function returned by `editor.api.dom.scrollIntoView(target, options)`.
