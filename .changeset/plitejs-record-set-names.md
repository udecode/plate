---
'plitejs': patch
---

Add `namedBy` to a schema record set, so a set declares which set's records point at its records through a `names` function that lists the ids a record points at.

- An editor created on a saved value leaves out the records of that set that nothing points at and `keep` does not accept, so the next save drops them.
- `tx.history.restore` stops undo or redo before a step whose replay would point a record at a missing one.
- Undo and redo skip writes to a record set the current schema retains.
