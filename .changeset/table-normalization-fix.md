---
'@platejs/slate': patch
---

- Added `editor.meta.isNormalizing` flag to track when the editor is normalizing nodes. This flag is automatically set to `true` during normalization and restored to its previous value when normalization completes.