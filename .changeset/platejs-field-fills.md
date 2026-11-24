---
'platejs': patch
---

- Add `fillsField(field, value)` to `platejs/field`. It says whether a value is a filled answer for a field. `required`, the `filled` and `blank` condition tests and the refusal of an answer on a skipped field use the same rule. A checkbox is filled only when it is ticked. Any other field is filled by a value that fits its kind, and a text or signature answer also needs a character that JavaScript's `\s` does not match.
