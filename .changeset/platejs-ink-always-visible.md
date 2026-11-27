---
'platejs': patch
---

Keep ink strokes visible across edits, wraps, RTL, and narrow viewports, support drawing on block-level void elements (such as images and videos with `[data-ink-box]`, scaling proportionally on resize), delete ink atomically when its block or marked paragraph is deleted (`Cmd+Z` restores both), and remove `InkSign`, `InkCopyView`, `InkSignPlace`, the `InkContent` `sign` prop, and the `ink-gone` record set.

**Migration:** Remove `InkSign`, `InkCopyView`, and `InkSignPlace` imports and drop the `sign` prop from `<InkContent {...props} />`. If your app persists older beta document snapshots containing `records['ink-gone']`, strip that key before loading.
