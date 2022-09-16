---
"@udecode/plate-core": patch
---

fix: Plate without `initialValue` or `value` prop should use `editor.children` as value. If `editor.children` is empty, use default value (empty paragraph).
