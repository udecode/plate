---
'@udecode/plate-selection': patch
---

- Block selection area: prevent selecting selectable descendants
- `editor.api.blockSelection`:
  - Add `add`, `clear`, `delete`, `deselect`, `has`, `set`
  - Deprecate `addSelectedRow`, use `add` instead
  - Deprecate `unselect`, use `deselect` instead
  - Deprecate `resetSelectedIds`, use `clear` instead
  - `selectedAll` -> `selectAll`
- Deprecate `data-plate-prevent-unselect`, use `data-plate-prevent-deselect` instead
