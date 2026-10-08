# Slate: large documents

## Huge-document example

- Legacy Slate's huge-document example (`site/examples/ts/huge-document.tsx`) is chunking-first, with a content-visibility option, and its Playwright test (`playwright/integration/examples/huge-document.test.ts:1-10`) only checks the chunk count; it proves nothing about native selection, screenshots, undo or performance. Treat it as a baseline, not a quality bar. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/README.md:31-32`, `:120-121` and `read-log.tsv:20-21`, which say "legacy Plite" for legacy Slate after the rename. Limit: an unpinned local `ianstormtaylor/slate` checkout read on 2026-06-12.
