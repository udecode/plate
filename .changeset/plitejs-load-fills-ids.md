---
'plitejs': patch
---

- In an editor whose elements store ids, give each element a load finds without an id a `fill.<n>` id, so every editor that loads one document holds the same ids. A repeated id stays on its first element. `createEditor` with an `initialValue` no longer throws on an element without an id, and a loaded element under Plate's `ElementIdPlugin` gets a `fill.` id instead of an `element-` id.
