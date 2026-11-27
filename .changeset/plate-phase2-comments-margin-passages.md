---
'platejs': patch
---

Add optional `withHistory` callback to `CreateCommentThreadInput` on `BaseCommentsPlugin` for atomic record-only history writes after comment creation commits, and include margin notes in `BaseInkPlugin.read.passages` with `margin` side metadata on `InkPassageMark`.
