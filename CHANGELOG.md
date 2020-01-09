# Changelog

This is a list of changes to Slate with each new release. Until 1.0.0 is released, breaking changes will be added as minor version bumps, and smaller, patch-level changes won't be noted since the library is moving quickly while in beta.

---

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
