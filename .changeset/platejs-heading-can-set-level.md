---
'platejs': patch
---

Add `editor.plugin(BaseHeadingPlugin).read.canSetLevel(level)`, which answers whether `setLevel(level)` can apply to every selected block. A menu can disable a heading level the caret's parent cannot hold.
