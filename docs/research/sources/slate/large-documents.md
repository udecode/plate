# Slate: large documents

## Huge-document example

- Legacy Slate's huge-document example (`site/examples/ts/huge-document.tsx`) is chunking-first, with a content-visibility option, and its Playwright test (`playwright/integration/examples/huge-document.test.ts:1-10`) only checks the chunk count; it proves nothing about native selection, screenshots, undo or performance. Treat it as a baseline, not a quality bar. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/README.md:31-32`, `:120-121` and `read-log.tsv:20-21`, which say "legacy Plite" for legacy Slate after the rename. Limit: an unpinned local `ianstormtaylor/slate` checkout read on 2026-06-12.

## Chunking

- Legacy Slate's chunking groups reconciliation work but has no DOM effect until a renderer adds chunk wrappers, and its CSS containment advice carries separate tradeoffs (ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:docs/walkthroughs/09-performance.md:50-120; read 2026-09-11). The full DOM stays present, so chunking is not equivalent to omitting blocks, and the page's browser-performance figures are historical source claims, not current timings (docs/plite/research/2026-09-11-large-documents-contract/shards/003-package-and-initial-render.md:47-51; read-log.tsv:27).
