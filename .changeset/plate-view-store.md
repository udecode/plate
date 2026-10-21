---
'platejs': patch
---

Add per-view plugin state. Declare it with `initialViewState`; read and write it through `viewStore` in the `api` factory and on the plugin portal, through `viewStoreOf(state)` and `viewStoreOf(tx)` in `.extend` callbacks, and subscribe to it with `useViewStore(plugin, selector)` from `platejs/react`. Each `EditorRoot` and the base editor keep separate copies, and the `EditorContent`s inside one `EditorRoot` share one copy and one caret. `createEditorView(view)` keeps its source's copy.

`upload.submit` without `at`, `after`, `before` or `slot` inserts at the caret in whichever root holds it.
