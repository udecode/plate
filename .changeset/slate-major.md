---
'@udecode/slate': major
---

- Replaced `editor.api.shouldMergeNodesRemovePrevNode` with `editor.api.shouldMergeNodes`. `shouldMergeNodes` is now controlling the remove + merge behavior

  - Returns `true` if the default merging behavior should be applied.
  - Returns `false` if the default merging behavior should not be applied. This is used by Plate to prevent void blocks deletion, and to prioritize empty block deletion over merging.

  ```ts
  // Before
  editor.api.shouldMergeNodesRemovePrevNode(prev, current);

  // After
  editor.api.shouldMergeNodes(prev, current);
  ```

- Replace `editor.api.fragment` option `structuralTypes` with `unwrap`.

  ```ts
  // Before
  editor.api.fragment(editor.selection, { structuralTypes: ['table'] });

  // After
  editor.api.fragment(editor.selection, { unwrap: ['table'] });
  ```
