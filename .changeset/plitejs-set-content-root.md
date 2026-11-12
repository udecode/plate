---
'plitejs': patch
---

- Add `structure: { kind: 'set' }` to an exclusive content root of a void block. Its top-level blocks become members of a set: a text selection stays in one member, a range removal never crosses two, and `compare` from `plitejs/diff` reports a changed member as one change
- Add `editor.read.unique.holder(property, value)` and `tx.unique.holder(property, value)`, which return the key, path and root of the node that holds one value of a `unique` property, without a scan
