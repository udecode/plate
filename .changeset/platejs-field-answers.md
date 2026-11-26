---
'platejs': patch
---

- Add `fieldSubmission` and `readFieldAnswers` to `platejs/field`. `fieldSubmission(template, role, values, options?)` builds one role's submission from a record keyed by field name, so an app sends its own data without mapping names to ids. `readFieldAnswers(document, options?)` reads a saved document's answers back by role and name. Each answer is a `FieldAnswer` whose `kind` narrows its `value`, or one that names the problem `answer-conflict` or `name-conflict`.
