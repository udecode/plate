---
'plitejs': patch
---

Add `namedBy` to a schema record set, so a set declares which set's records point at its records through a `names` function that lists the ids a record points at.

- `tx.history.restore` stops undo before a saved step whose replay would point a record at a missing one, or drop a record that another record still points at, and stops redo at the first such step.
- Undo and redo leave out writes to a record set the current schema retains, even in a step saved before the set became retained, and skip a step left with nothing to apply.
