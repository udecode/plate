---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use independent DOCX entrypoints for paste, file import, and export.

Compose the operations needed by the application:

- `DocxPlugin` from `platejs/docx` owns pasted CSS inlining and Word clipboard normalization.
- `importDocx(editor, buffer, options)` from `platejs/docx/import` returns decoded nodes, comments, and warnings without inserting them or requiring a plugin.
- `exportToDocx(value, options)` from `platejs/docx/export` returns a DOCX `Blob`, including caller-provided metadata, styles, bookmarks, and preserved indentation. The application owns downloading or saving it.

The import entrypoint requires Mammoth; the export entrypoint owns the HTML-to-DOCX conversion dependencies. The paste entrypoint loads neither conversion graph. Juice and Word normalization helpers are private implementation details. Copied import and export toolbars load their DOCX converters on demand.
