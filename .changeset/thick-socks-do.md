---
'@udecode/plate-core': patch
---

Fix: Using Plate hooks such as `useEditorRef` inside PlateController causes React to throw an error about hook order.
