---
"@platejs/toc": major
---

Move TOC insertion to `editor.update.toc.insert` and use Plite editor, DOM, and transaction APIs

**Migration:** Replace `editor.tf.insert.toc(options)` with `editor.update.toc.insert(options)` and pass `container` instead of `containerRef` to `useContentController`.
