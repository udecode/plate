---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use independent DOCX entrypoints for paste, file import, and export.

Compose the operations needed by the application:

- `WordPastePlugin` from `platejs/docx/paste` owns pasted CSS inlining and Word clipboard normalization.
- `importDocx(editor, source, options)` from `platejs/docx/import` bounds untrusted ZIP/XML work and returns either one complete editor document with rich comment facts and structured diagnostics or an explicit failure.
- `exportToDocx(editor, options)` from `platejs/docx/export` captures one editor snapshot and returns an explicit accepted, proposed, or review DOCX result with structured diagnostics.

Preserve supported Word revisions as authored changes and validate an exact native review envelope against every package part and visible projection before restoring it. Keep comment storage and file download behavior application-owned.

The import entrypoint requires Mammoth; the export entrypoint owns the HTML-to-DOCX conversion dependencies. The paste entrypoint loads neither conversion graph. Copied import and export toolbars load their DOCX converters on demand.

Use `useModelEditor()` from `platejs/react` when a mounted control loads, replaces, persists, or converts the complete document. `useEditor()` remains the mounted command view for root-scoped commands, DOM access, and selection.
