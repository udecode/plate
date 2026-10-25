# Yjs collaboration: commands and transforms

## Local transactions and durable positions

- Yjs relative positions preserve anchors across edits, while transactions group synchronous local mutations; these are different jobs. The July 2026 comparison read yjs/yjs@da05230:src/utils/RelativePosition.js and src/utils/Transaction.js, reported as Yjs 14.0.0-rc.2 (c70bacbd4a:docs/plans/2026-07-13-plite-block-relative-insertion-api.md:472). A local structural placement resolved and applied inside one editor transaction does not by itself require a CRDT-relative-position parameter. This is an architectural distinction from a source comparison, not a concurrency test or a promise about Plite's current change encoding.
