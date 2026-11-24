---
'platejs': patch
---

- Add `read.submission(role)` to the field plugin. It returns a `FieldSubmission`, `{ role, values }`, where `values` holds the `value` of each field of that role, keyed by `fieldId`. It keeps a `false`, a `0`, an empty text, a text of spaces and a value that no longer fits its field's kind, and leaves out a field with no `value`.
