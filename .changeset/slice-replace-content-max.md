---
'plitejs': patch
---

Fix `tx.slice.replace` throwing `EditorSchemaValidationError` when the slice would give a parent more children than its schema `max` allows. It now returns `false` and leaves the document unchanged.
