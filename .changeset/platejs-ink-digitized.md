---
'platejs': patch
---

- Add experimental digitized ink state on `BaseInkPlugin`: the `ink-digitized` record set, `tx.plugin(BaseInkPlugin).setDigitized(ids, value)` and `editor.plugin(BaseInkPlugin).read.shownMarks()`. Digitized marks stay saved without showing signs or deleted signs, leave with `remove`, and drop orphan digitized records on load.
