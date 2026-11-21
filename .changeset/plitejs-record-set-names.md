---
'plitejs': patch
---

Add `namedBy` to a schema record set, so a set declares which set's records point at its records through a `names` function that lists the ids a record points at.

- An editor created on a saved value leaves out, without reading them, the records of that set that no record points at and `keep` does not accept, so the next save drops them. A `names` that returns `null` or throws keeps every record of the set.
- `tx.history.restore` stops undo before a saved step whose replay would point a record at a missing one, or drop a record that another record still points at, and stops redo at the first such step.
- Undo and redo leave out writes to a record set the current schema retains, even in a step saved before the set became retained, and skip a step left with nothing to apply.
