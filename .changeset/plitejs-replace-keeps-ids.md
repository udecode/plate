---
'plitejs': patch
---

Keep element ids when content is replaced

- In an editor whose elements store ids, `tx.value.replace`, `tx.nodes.replace` and `tx.nodes.replaceChildren` give each incoming element without an id the id of the old element it replaces. Elements pair by equal content, in order, then by order between those pairs. Replacing a document with equal content keeps every id and records no change.
- An id an incoming element already holds stays on that element. An element with no counterpart gets a new id.
