---
'platejs': patch
---

Keep ink marks attached to their words across edits elsewhere in the same paragraph and across line wraps with shape-aware reflow (`flow`, `box`, `span`, `rigid`), add `BaseInkPlugin.read.liveMarks()`, and support live-block passages (`InkPassage.block`) and `{ block, start, end }` ranges in `read.range` and `InkPlugin.api.images`.
