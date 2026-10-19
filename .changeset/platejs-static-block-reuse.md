---
'platejs': patch
---

Re-render only changed blocks when `EditorStatic` or `EditorPreview` renders another document of the same editor, such as each preview of a streamed response: a block renders again when it, a block before it, or a decoration inside it changed. Declare `render: { readsDocument: true }` on a plugin whose element reads later content; the table of contents does
