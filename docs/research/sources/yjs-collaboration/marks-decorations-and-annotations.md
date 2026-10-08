# Yjs collaboration: marks decorations and annotations

## Rich-text deltas

- **Rich-text deltas.** yjs pins these delta rules (`yjs/yjs@da05230083:tests/y-text.tests.js`):
  - Two peers' overlapping concurrent `format` calls reach the other peer as one minimal delta (:1233).
  - Basic formatting round-trips (:1291).
  - A line attribute on a newline survives deleting the newline before it (:1399).
  - Embeds and their attributes appear in deltas (:1424, :1527).
  - Snapshots read earlier deltas (:1461).
  - A `format` call that changes one of several attributes emits a delta with only that attribute, the same on both peers (:1588).

  y-prosemirror's delta harness syncs two docs and compares their deep deltas after each ProseMirror step, including mark, delete-range and wrap steps (`yjs/y-prosemirror@9200946f0e:tests/delta.test.js:60-104`; Yjs 14 prerelease; `docs/editor-test-harvester/yjs-collaboration/report.md:75`). Plite's nearest Yjs tests are 'converges concurrent … exclusive mark writes on … ranges' and 'preserves three authors through every … delivery order and a move' in `packages/plitejs/test/yjs/exclusive-property-contract.spec.ts`, and 'does not rewrite semantically unchanged object attributes' in `packages/plitejs/test/yjs/attributes-contract.spec.ts`. Whether they match each yjs case was not checked.
