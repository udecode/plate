---
"@udecode/plate-line-height": patch
---

`useLineHeightDropdownMenuState`:
- fix: get line height from the block above instead of the top one.
- fix: return undefined if the selection is expanded as selection may contain blocks with multiple line height values.
