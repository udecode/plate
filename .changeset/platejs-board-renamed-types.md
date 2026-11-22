---
'platejs': patch
---

- Fix board pen lines, geo shapes and notes whose type an app renames through `schema.override`. They now draw, erase, take the toolbar's styles and get announced like shapes of the default type. A type renamed to `boardFrame` or `boardArrow`, the frame's and the arrow's own types, still cannot be inserted.
