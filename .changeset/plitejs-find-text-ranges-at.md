---
'plitejs': patch
---

- Add an `at` path to `NodeApi.findTextRanges` options, which searches only that node and its descendants and keeps range paths from the root.
- Accept a transaction or state view as the `findTextRanges` root. It joins text across inline elements and honors `content: true` there, as it does on the editor.
