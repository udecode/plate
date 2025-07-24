---
'@platejs/table': patch
---

- Fixed table cell selection transforms interfering with normalization by checking `editor.meta.isNormalizing` before applying overrides.
- Updated `setNodes` to use `combineTransformMatchOptions` for proper node matching in table cell operations.
- Fixed `removeMark` to use `setNodes` with null value for consistency.