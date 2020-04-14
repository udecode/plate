# Changelog

This is a list of changes to Slate with each new release. Until 1.0.0 is released, breaking changes will be added as minor version bumps, and smaller, patch-level changes won't be noted since the library is moving quickly while in beta.

---

### `0.57.12` — April 14, 2020

###### FIX

- Deserializer: pasting html or markdown with Elements inside Text tags works correctly now. 

### `0.57.11` — March 3, 2020

###### NEW

- `paste-md` plugin + story: markdown can be pasted into the editor

### `0.57.10` — February 25, 2020

###### FIX

This fix attempt to solve issues with list toggle:

- make sure list item is removed when unwrapping
- if multiple paragraphs are selected when pressing toggle - they should end up as separate list items..

### `0.57.9` — February 25, 2020

###### FIX

- The default toggleBlock function creates several code blocks if there are multiple paragraphs selected. This fix creates a toggleCode function that just wraps the whole selection in a code block - or unwraps if it is already in a block.

### `0.57.8` — February 5, 2020

###### NEW

- Table actions
  - Insert table
  - Delete table
  - Add/delete row
  - Add/delete cell

### `0.57.7` — February 2, 2020

###### BREAKING

- Each list item now has a paragraph child.

###### NEW

- Nested lists
  - Press `Tab` on a list item (except the first one) to indent the current list.
  - Press `Shift+Tab`, `Enter` or `Backspace` to unindent the current list.

### `0.57.6` — January 8, 2020

###### FIX

- `line-height` of heading

### `0.57.5` — January 7, 2020

###### BREAKING

- `withList` has been removed and its logic is now inside `withBlock` with the new option `unwrapTypes`.
- `p` tag was the default one if no `type` was provided. The new default is `div`.
- `withShortcuts`: removed `deleteBackward` logic as its covered by `withDeleteStartReset`.

###### NEW

Editor plugins:

- `withDeleteStartReset`: on delete at the start of an empty block in types, replace it with a new paragraph.
- `withBreakEmptyReset`: on insert break at the start of an empty block in types, replace it with a new paragraph.

Queries:

- `isList`

Styles

- action item.
- removed the element styling from `globalStyle` as it is not exported.
- a lot of spacing changes.
