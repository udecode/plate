---
'plitejs': patch
---

Skip the extra `EditableDOMRoot` render when an `EditorRoot` turns read-only in the same render that already passes `readOnly={true}` to its editable, and scope the editable's read-only view-state subscription to `readOnly` changes.
