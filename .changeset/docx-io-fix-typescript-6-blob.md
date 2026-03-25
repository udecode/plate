---
'@platejs/docx-io': patch
---

- Fix `htmlToDocxBlob` failing TypeScript 6 `BlobPart` checks when wrapping generated `Uint8Array` output.
