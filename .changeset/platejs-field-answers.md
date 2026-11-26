---
'platejs': patch
---

- Add `fieldSubmission` and `readFieldAnswers` to `platejs/field`. `fieldSubmission(template, role, values, options?)` builds one role's submission from a record keyed by field name, so an app sends its own data without mapping names to ids. `readFieldAnswers(document, options?)` reads a saved document's answers back by role and name. Each answer is a `FieldAnswer` whose `kind` narrows its `value`, or one that names the problem `answer-conflict` or `name-conflict`.
- Add `startFieldValues(template, submissions, start, options?)` to `platejs/field`. It replays the roles that already submitted, as `applyFieldValues` does, and returns the filled document a role starts from, with each value `start` gives written on its field and on every other field of its name. A field `start` leaves out starts blank, even one with a default, and so does a field that skips or waits on a role that has not submitted. The person who fills keeps, changes or clears each starting value and submits it as their own answer. A `start` that gives one name two values is refused as `answer-conflict`.
