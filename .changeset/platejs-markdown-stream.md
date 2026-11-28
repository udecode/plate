---
'platejs': patch
---

Replace stateless `partial` and `previous` streaming options on `editor.api.markdown.parse*` with stateful `editor.api.markdown.stream({ mode, incompleteLinks, lossPolicy, limits })`.

`editor.api.markdown.stream()` owns single-pass bounded tail healing (emphasis, strikethrough, inline code, inline and block math, links, images, GFM tables, and half-typed registered tags), incremental segment reuse, fixed-width table row and open fence fast paths, revisioned `MarkdownStreamDelta` patches, and strict `finish()` parity with `parseSlice` / `parseInline`.

**Migration:**

- Replace `parseSlice(accumulated, { lossPolicy: 'allow', partial: true, previous })` with `const stream = editor.api.markdown.stream()` followed by `stream.append(chunk)` (or `stream.set(accumulated)`) and `stream.finish()`.
- Remove `partial` from `parse`, `parseSlice`, and `parseInline` option objects, and remove `previous` from `parseSlice` option objects.
