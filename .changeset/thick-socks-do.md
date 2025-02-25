---
'@udecode/plate-core': patch
---

- `editor.id` now defaults to `nanoid()` if no `id` was specified when creating the editor.
- Fix: Using Plate hooks such as `useEditorRef` inside PlateController causes React to throw an error about hook order.
