---
'platejs': patch
---

Render a document through an editor's plugins with `<EditorStatic editor={editor} document={document} />` or `<EditorPreview document={document} />`, without editing the editor. Plugin reads on the rendered editor, such as the table of contents, see the document. It replaces `PlateStatic`'s `value`, which overwrote `editor.children`; copying from `EditorPreview` copies the rendered document.
