---
'plitejs': patch
---

- Fix history redo of an inline link wrap over a teammate's overlapping link wrap so it splits the teammate's overlapping link around the replayed link without throwing a nesting error.
- Fix history redo over a teammate's replaced or deleted paragraph so edits targeting the removed block drop without overwriting the replacement or typing into a following paragraph.
- Fix history undo of a block split when a teammate wraps the first half and edits inside it so the wrapper and teammate edits stay intact.
