---
'@platejs/slate': patch
---

- Added `combineTransformMatchOptions` utility for combining match predicates in transforms. This utility provides default matching behavior that matches the native Slate transform behavior when no match is provided.
- Added `editor.meta.isNormalizing` flag to track when the editor is normalizing nodes. This flag is automatically set to `true` during `editor.tf.normalizeNode` and `plugin.normalizeInitialValue` and restored to its previous value when normalization completes.
