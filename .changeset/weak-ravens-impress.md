---
'@udecode/plate-dnd': patch
---

Fix: `onDropNode` uses a stale `element` object for the dragged node, resulting in incorrect drag operations.
