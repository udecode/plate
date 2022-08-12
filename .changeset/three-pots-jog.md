---
"@udecode/plate-link": patch
---

fix:
- overall, marks should be kept on link insert/edit
- `unwrapLink`: new option `split`
  - if true: split the link above anchor/focus before unwrapping
- `upsertLink`:
  - replaced `update` option by `insertTextInLink`: if true, insert text when selection is in url
  - `upsertLinkText`: If the text is different than the link above text, replace link children by a new text. The new text has the same marks than the first text replaced.
- specs:
  - https://github.com/udecode/editor-protocol/issues/47
  - https://github.com/udecode/editor-protocol/issues/50
  - https://github.com/udecode/editor-protocol/issues/58
  - https://github.com/udecode/editor-protocol/issues/59
  - https://github.com/udecode/editor-protocol/issues/60
