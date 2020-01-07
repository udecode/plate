# Changelog

This is a list of changes to Slate with each new release. Until 1.0.0 is released, breaking changes will be added as minor version bumps, and smaller, patch-level changes won't be noted since the library is moving quickly while in beta.

---

### `0.57.5` — January 7, 2020

###### BREAKING

- `withList` has been removed and its logic is now inside `withBlock` with the new option `unwrapTypes`

###### NEW

- `withDeleteStartReset`: on delete at the start of an empty block in types, replace it with a new paragraph.
- `withBreakEmptyReset`: on insert break at the start of an empty block in types, replace it with a new paragraph.
- styles
