---
'@platejs/list': patch
---

- Fixed `toggleList` to respect list plugin's inject match when applying list transforms. This ensures list operations work correctly within constrained contexts like table cells.