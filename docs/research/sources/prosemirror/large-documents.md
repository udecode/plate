# ProseMirror: large documents

## Pagination

- A ProseMirror forum thread on implementing pagination (https://discuss.prosemirror.net/t/implementing-pagination-with-prosemirror/6336, read 2026-06-13) frames the tradeoff: keep presentation outside the schema, avoid forking `EditorView`, and expect selection and interaction problems when nodes split across pages; hiding off-page content with decorations avoids slicing the document but may get expensive for book-length documents.

- The community `prosemirror-pagination` plugin paginates through the schema: it measures page overflow in the DOM, dispatches pagination metadata in a transaction, then appends transactions that remove and re-add header and footer nodes, split the document into page nodes, rejoin tables around split points, adjust the selection and scroll into view; its height calculation walks document nodes with table-specific split logic, including a TODO in first-row handling. Evidence: `todorstoev/prosemirror-pagination@f74f42c4b038a243950cb65c01e3baf83a3df1d1:src/paginationPlugin.ts:104-141`, `:146-189`, `:284-313`, `:315-423` (TODO at `:400`), checked 2026-10-08 at the local clone.

- Badon Writer, a ProseMirror-based editor, says its long-document pagination with headers and footers relies mostly on CSS layout and avoids splitting nodes or computing dimensions (https://discuss.prosemirror.net/t/a-new-text-editor-with-pagination/6667, read 2026-06-13). No source was available, so this is a public claim only.
