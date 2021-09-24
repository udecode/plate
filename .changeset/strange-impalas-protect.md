---
"@udecode/plate-list": patch
---

fix: 
- `toggleList` works as expected
- `moveListItemDown` wrap transformations in `withoutNormalizing` (it caused a pathing issue since the normalization would remove the created empty list)