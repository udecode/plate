# CSV and spreadsheet ingress

Page: https://claude.ai/artifact/DJPGknWi38Ff3ou9J6GWmJ

Plate has no CSV plugin. Spreadsheet copies paste as tables through their HTML, and Table reads tab-separated text pasted onto a rectangular selection of two or more cells, one field per cell. Comma text and CSV stay text. The 2026-10-04 audit's Pursue verdict was adopted by [the 2026-10-14 plan](../2026-10-14-csv-review.md), which deleted `platejs/csv`. The scope's review and plan history prints with `node tooling/scripts/review-ledger.mjs show csv`.

## Public API

The editor kit lists no CSV parser; Table's own kit covers tab-separated paste.

```ts
// apps/www/src/registry/components/editor/plugins.ts
export const EditorKit = [
  // Parsers
  WordPastePlugin,
  ...MarkdownKit,
] as const;
```

Tab-separated paste and copy have no options and no public call. An app that converts a CSV string parses it with its own library and inserts table nodes.

## Main changes

- Table's private grammar in `packages/platejs/src/features/table/lib/internal/tabularText.ts` reads and writes tab-separated text. Its writer quotes a field that holds a tab, CR or LF or starts with a quote, and doubles its inner quotes. Its reader takes a quoted field only when the writer would have written it, so every grid the writer writes reads back to itself.
- `BaseTablePlugin` declares a `text/plain` paste format at priority 30. It claims a paste only with no `text/html`, `text/markdown` or files, a tab in the text, and a complete rectangular selection of two or more cells. It keeps min(rows, selection height) rows and min(widest row, selection width) fields, and reports the non-empty fields it leaves out as one lossy diagnostic. Table reads a node selection as the range between its endpoints, so the format does too.
- Table's React plugin writes only tab-separated `text/plain` when the user copies several cells, beside the editor's own copy and HTML. A merged cell writes an empty field for each slot it spans.

## Open work

- Table crops HTML, Markdown and fragment pastes onto a smaller selection silently, and a ragged pasted table pads its whole rectangle before cropping. Reporting needs the paste outcome to carry the fitter's loss, a Plite change. owner: zbeyens. stop: a Table clipboard fitting plan, or 2026-11-30.
- Table's structural plain-text mapping, which copies a table inside a larger selection, joins cells with tabs and turns line breaks into spaces without quoting. owner: zbeyens. stop: a Table plain-text review, or 2026-11-30.
- Several selected cells and pasted HTML or multi-line text without tabs still repeat the whole content in every cell. owner: zbeyens. stop: the same Table clipboard fitting plan, or 2026-11-30.
- Table reads a node selection as the range between its endpoints. So a node selection of three cells, or of diagonal cells, can be claimed by the tab-separated format and filled off the selected cells. Cut can clear cells that were not selected. Removing non-adjacent rows deletes the whole table. The fix keeps the anchor and focus paths when it reads the selected nodes, checks completeness in `removeRow` and `removeColumn`, deletes on cut the cells the writer copied, and caches the derived view per state. owner: zbeyens. stop: a Table node-selection plan lands, or 2026-11-30.
- A node selection that mixes table cells and an outside paragraph pastes into empty table rows. owner: zbeyens. stop: the same Table node-selection plan, or 2026-11-30.
- The generated API reference manifest still lists `PLUGINS.csv`. owner: zbeyens. stop: the next `pnpm --filter www api-reference` run after the plitejs build passes.
- `/blocks/installation-next-demo` throws "localStorage is not defined" during server render. owner: zbeyens. stop: that demo reads storage only after mount.

## What other editors do

A Codex seat read each editor's default clipboard path at the commits below on 2026-10-14; none was run in a browser. Spreadsheet paste works through HTML tables everywhere. Only Lexical parses tabular plain text, and only while table cells are selected.

| Editor | Reads tabular text into a table | Grammar | Inside an existing table | Copies cells as CSV or TSV |
| --- | --- | --- | --- | --- |
| ProseMirror (view and tables) | No; HTML before plain text | None; plain text becomes paragraphs | prosemirror-tables fits parsed slices, padding ragged rows | No |
| Tiptap | No | None | ProseMirror table fitting for HTML cells | No |
| Lexical | Only `text/plain` while a table cell selection is active | Line feed and tab split, no comma, quotes or quoted newlines | Fills from the anchor cell and can grow the table | Unescaped TSV in `text/plain` |
| Slate | No default table parser | Plain text splits into lines | Up to the app | No |
| BlockNote | No; Markdown in plain text can win over HTML | Markdown, not CSV | ProseMirror table fitting | No; HTML and Markdown |
| CKEditor 5 | No; HTML first, with a Google Sheets normalizer | Tabs become spaces | HTML table fitting grows from one cell | No |
| Quill | No | None | No rectangular fitting | No |
| Milkdown | No; plain text goes to Markdown | Markdown | ProseMirror table fitting under GFM | No |

Sources: `ProseMirror/prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534:src/input.ts`, `ProseMirror/prosemirror-tables@eb522f25959a1e4515a4ff5ce7e3a939f19c55e9:src/copypaste.ts`, `ueberdosis/tiptap@91c51be53c4655ef07e29ec489471524debfa0ca:packages/extension-table/src/table/table.ts`, `facebook/lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988:packages/lexical-table/src/LexicalTableSelection.ts`, `ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:packages/slate-dom/src/plugin/with-dom.ts`, `TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/core/src/api/clipboard/fromClipboard/pasteExtension.ts`, `ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-table/src/tableclipboard.ts`, `slab/quill@539cbffd0a13b18e9c65eb84dd35e6596e403158:packages/quill/src/modules/clipboard.ts` and `Milkdown/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/plugins/plugin-clipboard/src/index.ts`.
