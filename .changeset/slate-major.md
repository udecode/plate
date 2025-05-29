---
'@udecode/slate': major
---

- Removed `editor.api.fragment` option `structuralTypes` to `containerTypes`.

  ```ts
  // Before
  editor.api.fragment(editor.selection, { structuralTypes: ['table'] });

  // After
  editor.api.fragment(editor.selection, { containerTypes: ['table'] });
  ```
