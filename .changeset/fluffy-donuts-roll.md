---
"@udecode/plate-diff": minor
---

- Add `shouldDiffDescendants` option to `computeDiff` to control whether a pair of descendant lists should be diffed. If false, the parent node will be deleted and re-inserted. Defaults to `() => true`.
  - Example use case: To prevent `computeDiff` from diffing the text of unrelated paragraphs, use a text similarity checking algorithm to determine whether the paragraphs are sufficiently similar, and return false if not.
- When multiple consecutive nodes have been deleted and inserted, `computeDiff` now groups all consecutive deletions together and does the same with all consecutive insertions.
  - Example of a diff prior to this change:
    ```diff
    - Old paragraph 1
    + New paragraph 1
    - Old paragraph 2
    + New paragraph 2
    ```
  - Example of a diff after this change:
    ```diff
    - Old paragraph 1
    - Old paragraph 2
    + New paragraph 1
    + New paragraph 2
    ```
