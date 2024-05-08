# @udecode/plate-diff

## 33.0.2

### Patch Changes

- [#3187](https://github.com/udecode/plate/pull/3187) by [@zbeyens](https://github.com/zbeyens) – Fix types

## 33.0.0

## 32.0.0

## 31.0.0

## 30.9.0

### Minor Changes

- [#3011](https://github.com/udecode/plate/pull/3011) by [@12joan](https://github.com/12joan) –

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

## 30.8.0

### Minor Changes

- [#3009](https://github.com/udecode/plate/pull/3009) by [@12joan](https://github.com/12joan) –
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

## 30.6.1

### Patch Changes

- [#2984](https://github.com/udecode/plate/pull/2984) by [@12joan](https://github.com/12joan) – Fix: Node equivalency checking is incorrectly dependent on the key order of the node object

## 30.6.0

### Minor Changes

- [#2982](https://github.com/udecode/plate/pull/2982) by [@12joan](https://github.com/12joan) – `computeDiff`: Add `lineBreakChar?: string` option to replace `\n` characters in inserted and removed text with a character such as '¶'. Without this option, added or removed line breaks may be difficult to notice in the diff.

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.5.2

### Patch Changes

- [#2961](https://github.com/udecode/plate/pull/2961) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.5.0

### Minor Changes

- [#2945](https://github.com/udecode/plate/pull/2945) by [@12joan](https://github.com/12joan) – Refactor `slateDiff` into `@udecode/plate-diff` and add `diffToSuggestions` instead
