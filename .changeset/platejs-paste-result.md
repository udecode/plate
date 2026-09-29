---
'platejs': patch
---

- Add `onPasteResult` to `EditorContent`. It receives `{ inserted, diagnostics }` once for each paste that the editor's built-in formats handle, including the reports that plugin `dataTransferFormats` decoders send through `report(diagnostic)`.
- HTML, Word and Markdown paste report what they leave out, such as an unmapped image (`lossy`) or a removed script link destination (`lossless`).
- Export `decodeHtmlDataTransfer` from `platejs/html` for a transfer format that prepares HTML first, such as Word paste. It returns the slice to insert and reports what it changed, or returns `null` so the next format can decode the payload.
