---
"@platejs/test-utils": major
---

Use Plite hyperscript primitives for typed Plate fixtures, preserve custom
factory exports, and correct clipboard mock writes. Remove the unused
`getHtmlDocument` wrapper; call `DOMParser` directly in DOM-facing tests.
Pass `Map<string, string>` directly to `createDataTransfer` instead of
importing `DataTransferDataMap`.
Emit `hth` fixtures as `tableCell` nodes with `header: true`.
