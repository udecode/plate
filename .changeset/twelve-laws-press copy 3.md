---
'@udecode/plate-markdown': minor
---

- `editor.api.markdown.deserialize`:
  - Improve support for indented lists: nested lists, mixed ordered and unordered lists
  - Fix: markdown codeblock without language should not set `lang: undefined` to the node
  - Add options:
    - `memoize`: Enable block-level memoization with `_memo` property, so it is compatible with `PlateStatic` memoization.
    - `filterTokens`: Filter out specific markdown token types (e.g. 'space')
    - `processor`: Customize the markdown processor
- Add `parseMarkdownBlocks`: Extract and filter markdown tokens using marked lexer
- Fix `editor.api.markdown.serialize` indenting should be 3 spaces instead of 2.
