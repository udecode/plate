---
'plitejs': patch
---

Store a core-generated `id` on every element in every editor

- Every editor whose schema declares no `id` element property now stores a unique non-empty string `id` on every element, including kept elements under `preserve` schemas, and supports `nodes.byId(id)` and `at: { id }` without declaring an `id` property.
- New elements created by insert, split, wrap, paste, or live duplicate repair receive `<scope>.<counter>` ids from each editor's own mint, while loading a document without ids fills missing ids deterministically as `fill.<n>` across roots, spare lines, and Yjs rooms.
- Empty strings and non-string element ids are refused locally, from peers, and on load with `EditorSchemaValidationError`.
- Schema fingerprints now include the reserved `id`, so saved envelopes, native sync rooms, Yjs rooms, and saved history created before this change refuse to open with a schema-mismatch error; pass the plain document value to load it with filled ids.
