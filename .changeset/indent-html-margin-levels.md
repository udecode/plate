---
'platejs': patch
---

- Read a block's or list item's HTML `margin-left` as its indent level. A margin between two levels, such as `36px` with the default `24px` offset, rounds to the nearer level
- Leave out a `data-indent` or `aria-level` that is not a positive whole number when parsing HTML, and report a left-out `data-indent` as a warning
