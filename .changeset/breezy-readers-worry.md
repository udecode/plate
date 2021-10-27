---
'@udecode/plate-font': minor
---

- These plugins are now using `overrideProps` and `withOverrides`:
  - `createFontBackgroundColorPlugin`
  - `createFontColorPlugin`
  - `createFontSizePlugin`
- New plugins:
  - `createFontFamilyPlugin`
  - `createFontWeightPlugin`
- Previously, we had these mark components that can be removed now:

```ts
[MARK_COLOR]: withStyledProps(StyledLeaf, {
  leafProps: {
    [MARK_COLOR]: ['color'],
  },
}),
[MARK_BG_COLOR]: withStyledProps(StyledLeaf, {
  leafProps: {
    [MARK_BG_COLOR]: ['backgroundColor'],
  },
}),
[MARK_FONT_SIZE]: withStyledProps(StyledLeaf, {
  leafProps: {
    [MARK_FONT_SIZE]: ['fontSize'],
  },
}),
```