---
"@udecode/plate-node-id": patch
---

fix:
- checks if there is a node with the same id in the editor to avoid
  duplicate ids
- `query` now works when splitting nodes