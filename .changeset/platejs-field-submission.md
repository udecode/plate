---
'platejs': patch
---

- Add `read.submission(role)` to the field plugin. It returns a `FieldSubmission`, `{ role, values }`, with the `value` of each of that role's fields keyed by `fieldId`. A field with no `value` is left out.
- Add `applyFieldValues(template, submissions, options?)` to `platejs/field`. It checks each role's submission against an empty template, in the order the roles submitted, and returns a `FieldApplyResult`: the filled document, the roles that still have to submit as `pending`, or the refusals as `FieldRefusal` objects. A required checkbox counts as answered only when it is ticked. Pass a renamed field type as `options.type`.
