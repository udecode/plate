---
"@udecode/plate-core": minor
---

New `editor` field:
- `stagingEditor: PlateEditor<V>` - used to have an error-free editor. The core plugin will first apply operations on `stagingEditor` and will apply on `editor` only if it does not throw any error. 