---
'@udecode/slate': minor
---

- New `editor.api.scrollIntoView` - Scrolls the editor to a specified position.
- New `editor.tf.withScrolling` - Wraps a function and automatically scrolls the editor after `insertNode` and `insertText` operations (configurable).
- New `editor.api.isScrolling` - Boolean flag indicating whether the editor is currently in a scrolling operation initiated by `withScrolling`.
