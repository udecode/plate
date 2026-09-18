---
'plitejs': patch
---

Fix retained range targets so atomic replacements inherit their identity while later unrelated typing stays detached across undo, redo, reload, and authored reverts. Keep Editing-mode changes direct unless the complete edit targets one pending suggestion, including mixed ranges and edits merely adjacent to deleted suggestions.
