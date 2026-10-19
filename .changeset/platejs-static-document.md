---
'platejs': patch
---

Render a document through an editor's plugins with `<EditorStatic editor={editor} document={document} />` or `<EditorPreview document={document} />`, without editing the editor. Plugin reads on the rendered editor, such as the table of contents, see the document; reading an editor captured when the plugin was created throws during that render, with an error that names the fix. It replaces `PlateStatic`'s `value`, which overwrote `editor.children`; copying from `EditorPreview` copies the rendered document.
