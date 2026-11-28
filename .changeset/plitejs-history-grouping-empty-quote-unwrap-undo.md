---
'plitejs': patch
---

- Group consecutive typing over a text selection in Suggesting mode or over a block selection in Editing mode into one undo step
- Preserve empty block containers without inserting text leaves during history serialization, replay, and undo/redo around peer moves
- Keep a peer-deleted paragraph removed when undoing a merged unwrap and line split
