---
'plitejs': patch
---

- Add `report(diagnostic)` to the DataTransfer decode context so formats can report what a pasted payload leaves out, as `{ impact: 'lossless' | 'lossy', message }`.
- Add `Editable.onPasteResult`. It receives `{ inserted, diagnostics }` once for each paste that the editable's built-in formats handle: after the paste commits, or when no format can insert it. It is not called for pastes that `onPaste` or a plugin command handles without the built-in formats, or after the editable unmounts; an `onPaste` handler that inserts through `insertData` during the paste gets that insertion's result.
