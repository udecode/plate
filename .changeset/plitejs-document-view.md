---
'plitejs': patch
---

Add `createEditorView(editor, { document })`: a read-only view that reads an immutable document through the editor's schema and plugins, including plugin reads and APIs, without editing the editor; plugin code that reads the source editor while the view reads throws
