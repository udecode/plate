# Slate: commands and transforms

## Insertion targets

- Upstream Slate insertNodes accepts a literal location and otherwise falls back through selection to document end; a block-sibling relation is derived separately by callers. The July 2026 comparison read ianstormtaylor/slate@945a484:packages/slate/src/transforms-node/insert-nodes.ts, reported as Slate 0.124.1 (c70bacbd4a:docs/plans/2026-07-13-plite-block-relative-insertion-api.md:470). Here Slate means upstream Slate, not the fork's earlier draft. This source comparison establishes the low-level insertion distinction, without proving that its fallback is appropriate for every named relative-insertion API.
