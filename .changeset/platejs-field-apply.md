---
'platejs': patch
---

- Add `applyFieldValues(template, submissions, options?)` to `platejs/field`. It checks each role's submission, in the order the roles submitted, against a template whose fields hold no answer. It returns a `FieldApplyResult`: the filled document with `pending`, the roles that still have to submit, or the refusals as `FieldRefusal` objects. A submitted role's unanswered checkbox reads as `false` while it applies, and a required checkbox that applies counts as answered only when it is ticked. An app that renamed the field element with `schema.override` passes its type as `options.type`.
