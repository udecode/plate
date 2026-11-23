---
'plitejs': patch
---

Add `nodes.byId(id)` to reads and transactions, and accept `{ id }` as a node target

- `editor.read.nodes.byId(id)`, or `tx.nodes.byId(id)` inside an update, returns the element that holds the stored `id` as `{ key, node, path, root? }`, or `null` when no element holds it. `root` is there only for an element in a named root.
- Node reads and node transforms accept `at: { id }`, and a write reaches the element in its own root.
- Both need a schema that declares `id` as a generated, unique string property on every element type, with no content that admits undeclared element types, as Plate's `ElementIdPlugin` does. With any other schema they throw.

**Migration:** In an editor whose elements store ids, `unique.holder('id', value)` throws. Use `nodes.byId(value)`.
