---
'platejs': patch
---

Make `useModelEditor()` under `EditorController` return the document editor of the `EditorRoot` used last, where it threw. Controls under `EditorController` get the editor, the document editor and the read-only answer that controls inside that `EditorRoot` get outside its editing areas.
