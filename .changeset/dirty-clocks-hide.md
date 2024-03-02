---
"@udecode/plate-diff": minor
---

- Remove `shouldDiffDescendants` option in favour of `elementsAreRelated`.
- The `elementsAreRelated` option controls whether `computeDiff` treats a given pair of elements as "related" and thus tries to diff them. By default, elements are related if they have the same `children` OR they differ only in their `children`. Return null to use the default logic for a pair of elements.

  - Use case: In addition to supporting the same use case as the deprecated `shouldDiffDescendants`, `elementsAreRelated` can be used to ensure that `computeDiff` compares the correct pair of paragraphs.

    For example, by default, `computeDiff` would compare `My slightly modified paragraph.` with `New paragraph` in the following diff.

    ```diff
    - My slightly modified paragraph.
    + New paragraph
    + My slightly modified paragraph!
    ```

    If a custom `elementsAreRelated` function is provided that returns true for mostly similar paragraphs, `computeDiff` would instead compare `My slightly modified paragraph.` with `My slightly modified paragraph!`.
