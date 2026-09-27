---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Use independent DOCX entrypoints for paste, file import, and export.

Compose the operations needed by the application:

- `WordPastePlugin` from `platejs/docx/paste` owns pasted CSS inlining and Word clipboard normalization.
- `importDocx(source, { plugins, ...options })` from `platejs/docx/import` compiles a detached target without activating plugins, bounds untrusted ZIP/XML work, and returns either one complete editor document with rich comment facts and structured diagnostics or an explicit failure.
- `exportDocx(editor, options)` from `platejs/docx/export` captures one editor revision before asynchronous work and returns an explicit accepted, proposed, or review DOCX result with structured diagnostics. Accepted and proposed exports warn about pending changes and conflicts; review export refuses conflicts that Word revisions cannot represent faithfully.

Preserve supported Word revisions as authored changes and validate an exact native review envelope against every package part and visible projection before restoring it. Ordinary review export omits Plate-native state; set `nativeState: 'attach'` only for a trusted exact-round-trip review file. Keep comment storage and file download behavior application-owned.

Use the pure `projectAuthoredDocument`, `projectAuthoredReview`, and `projectAuthoredRange` helpers from `platejs/authored` to project detached complete documents, inspect review markup and property changes, and map ranges without constructing an editor runtime.

The import entrypoint requires Mammoth; the export entrypoint owns the HTML-to-DOCX conversion dependencies. The paste entrypoint loads neither conversion graph. Copied import and export toolbars load their DOCX converters on demand.

Use `useModelEditor()` from `platejs/react` when a mounted control loads, replaces, persists, or converts the complete document. `useEditor()` remains the mounted command view for root-scoped commands, DOM access, and selection.
