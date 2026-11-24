---
'plitejs': patch
---

Add `nodes.byId(id)` to reads and transactions, and accept `{ id }` as a node target

- `editor.read.nodes.byId(id)`, or `tx.nodes.byId(id)` inside an update, returns the element that holds the stored `id` as `{ key, node, path, root? }`, or `null` when no element holds it.
- Node reads and node transforms accept `at: { id }`, such as `editor.update.nodes.move({ at: { id }, to })`, and a write reaches the element in its own root. An id that no element holds changes nothing.
- Add `WithNodeTarget<Options>` and `PlacedTarget<T>` to type a plugin method whose `at` takes every node target.
- Both need a schema that declares `id` as a generated, unique string on every element type, as Plate's `ElementIdPlugin` does. With any other schema they throw.

**Migration:** In an editor whose elements store ids, `unique.holder('id', value)` throws. Use `nodes.byId(value)`.
