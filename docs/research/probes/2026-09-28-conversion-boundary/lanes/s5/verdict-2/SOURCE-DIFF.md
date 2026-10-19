# Verdict-2 source identity against the final tree

Verdict-2 measured the snapshot in `snapshot-files.sha256` (2026-09-29T11:59:28Z).
Three product source files differ from that snapshot in the final tree. None of
the changes reaches the continued `parseSlice` path that the matrix measured.

| File | Change | Why the matrix still applies |
| --- | --- | --- |
| `packages/platejs/src/markdown/lib/internal/markdownConversion.ts` | `parseMarkdownDocumentWithRuntime` normalizes without a frozen snapshot | Reverting only that function reproduces the snapshot hash `080b9b26…` exactly. `parseSlice` never calls the document path. |
| `packages/platejs/src/markdown/lib/MarkdownPlugin.ts` | The `previous` JSDoc names the definitions fallback | Reverting only the JSDoc reproduces the snapshot hash. |
| `packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx` | `renderToStaticMarkup` loads `react-dom/server.edge` in Node-like runtimes and `.browser` otherwise | Static HTML export only; the streaming previews render with React DOM, not this function. |

The other changed files are specs, test setup, docs, plans and receipts.

Current-tree continued parse (`../../formats/continued-parse-current.json`) was
measured headless with 64-character chunks. Every strict final equals a fresh
strict parse.

| Source | Preview parses, no hint → hint | Final parse | Blocks reused |
| --- | --- | --- | --- |
| Rich 10 KB | 887 → 63 ms | 10.2 → 0.2 ms | 97% |
| CJK 10 KB | 1,821 → 80 ms | 24.0 → 0.2 ms | 98% |
| Rich 50 KB | 33.4 → 0.39 s | 65.8 → 0.5 ms | 99% |
| Definition + rich 10 KB | 938 → 917 ms | 10.0 → 11.4 ms | 0% |
| Definition + rich 50 KB | 32.8 → 27.2 s (one run) | 108 → 60 ms | 0% |

A source with a link reference or footnote definition parses whole on every
call, as documented. The hint neither helps nor costs there.
