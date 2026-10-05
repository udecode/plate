---
'platejs': patch
---

Keep the escape on a dollar sign before an escaped character when serializing Markdown with `remark-math`, so text like `x$*$y` reads back as text instead of inline math.
