---
'platejs': patch
---

- Add `fillsField(field, value)` to `platejs/field` to check whether a value fills a field. `required`, the `filled` and `blank` conditions and the refusal of an answer on a skipped field all use it. A checkbox fills only when ticked. A text or signature answer needs a character other than whitespace. Any other field needs a value of its kind.
