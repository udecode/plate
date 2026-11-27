---
'platejs': patch
---

- Add experimental `read.passages(ids)` and `read.range({ copy, start, end })` on `BaseInkPlugin` (with `InkPassage`, `InkPassageMark`, `InkPassageWord`, and `InkRangeInput` types) to read marked line passages and resolve saved copy character offsets to live ranges.
