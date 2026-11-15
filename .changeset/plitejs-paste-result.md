---
'plitejs': patch
---

- Add `report(diagnostic)` to the DataTransfer decode context so formats can report what a pasted payload leaves out, as `{ impact: 'lossless' | 'lossy', message }`.
- Add `Editable.onPasteResult`. It receives `{ inserted, diagnostics }` once for each paste that the editable's built-in formats handle: after the paste commits, when no format can insert it, when a format claims it with an empty slice, or when the update that ran the paste ends with no change. It is not called for pastes that `onPaste` or a plugin command handles without the built-in formats, or after the editable unmounts; an `onPaste` handler that inserts through `insertData` during the paste gets that insertion's result. The result gains one `lossy` report, `Some content did not fit here and was left out.`, when `maxLength` cuts the pasted content, or when a format's content does not fit and a later format inserts instead.
