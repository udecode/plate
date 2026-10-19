# ProseKit: large documents

## Pagination

- ProseKit's page rendering adds a decoration per top-level block, and its layout leader batches work and scans page chunks to set padding: this is full-DOM pagination, not viewport virtualization, so the feature name earns no virtualization speed score. Its pagination and virtual-selection tests still carry portable selection, measurement and teardown invariants. Read at `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e`. Source: `docs/plite/research/2026-09-09-editor-performance-iteration-2/virtualization.md:21-22`.
