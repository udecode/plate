---
'platejs': patch
---

- Report `condition-loop` on each field of a loop of conditions, such as A naming B while B names A, and refuse an `update` whose condition would close one.
- Refuse a `fieldId` in the settings of `insert` or the patch of `update`.
- Check a condition that names its own field against the kind the same `update` sets.
- List the page's fields in `read.fields()` from a board note's view, in reading order.
- Add `applies` to each read from `read.field` and `read.fields()`. It says whether the field applies under its condition, as the field's own role sees the answers the document holds. It is `null` while that depends on an answer another role has not given yet. `useFieldRead` renders again when it changes.
