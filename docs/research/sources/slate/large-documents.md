# Slate: large documents

## Huge-document example

- Legacy Slate's huge-document example (`site/examples/ts/huge-document.tsx`) is chunking-first, with a content-visibility option, and its Playwright test (`playwright/integration/examples/huge-document.test.ts:1-10`) only checks the chunk count; it proves nothing about native selection, screenshots, undo or performance. Treat it as a baseline, not a quality bar. Source: `docs/plite/research/2026-06-12-huge-doc-native-selection/README.md:31-32`, `:120-121` and `read-log.tsv:20-21`, which say "legacy Plite" for legacy Slate after the rename. Limit: an unpinned local `ianstormtaylor/slate` checkout read on 2026-06-12.

## Chunking

- Legacy Slate's chunking groups reconciliation work but has no DOM effect until a renderer adds chunk wrappers, and its CSS containment advice carries separate tradeoffs (ianstormtaylor/slate@945a484df2497e4c448b33f417b0de2a49840032:docs/walkthroughs/09-performance.md:50-120; read 2026-09-11). The full DOM stays present, so chunking is not equivalent to omitting blocks, and the page's browser-performance figures are historical source claims, not current timings (docs/plite/research/2026-09-11-large-documents-contract/shards/003-package-and-initial-render.md:47-51; read-log.tsv:27).

## Transform cost on wide documents

- Legacy Slate's per-path `setNodes` slows with sibling-array width. An April 2026 local benchmark took 73.35 ms on 5,000 flat paragraphs but 22.09 ms with the same paragraphs under 100 sections, and 241.36 against 66.19 ms at 10,000; a direct `apply(set_node)` and a bare `modifyDescendant` showed the same shape at 10,000 (147.71 against 22.16 ms and 140.11 against 7.25 ms). Timed `apply` phases put the cost in the transform step while normalization, dirty-path work and ref transforms stayed small, so the cost is the immutable rewrite of wide sibling arrays. A repeated transform that gets much cheaper when the same nodes are grouped points at ancestor-array copying, not at normalization or React. Source: `c70bacbd4a:docs/performance/plate-vs-plite-benchmarks.md:1004-1029`, `:1739`. Limit: unpinned; the script, `set-nodes-bench.js` in the zbeyens/slate fork's test tree (a path the rename rewrote to `plite`), no longer exists.
