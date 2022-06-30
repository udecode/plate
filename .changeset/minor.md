---
'@udecode/plate-core': minor
---

- `focusEditor` new option to set selection before focusing the editor
  - `target`: if defined:
    - deselect the editor (otherwise it will focus the start of the editor)
    - select the editor
    - focus the editor
- re-exports `createStore` from `@udecode/zustood`, so the other packages don't have to install it
