---
'@udecode/slate': patch
---

- Add `RangeApi.contains` to check if a range fully contains another range (both start and end points).
- Add `editor.api.isSelected(target, { contains?: boolean })` to check if a path or range is selected by the current selection. When `contains` is true, checks if selection fully contains the target.
