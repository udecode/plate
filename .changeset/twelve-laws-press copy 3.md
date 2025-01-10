---
'@udecode/plate-markdown': minor
---

- Add `deserializeMd` options:
  - `memoize`: Enable block-level memoization with `_memo` property, so it is compatible with `PlateStatic` memoization.
  - `filterTokens`: Filter out specific markdown token types (e.g. 'space')
  - `processor`: Customize the markdown processor
- Add `parseMarkdownBlocks`: Extract and filter markdown tokens using marked lexer
