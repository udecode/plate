---
'platejs': patch
---

- Block ink tool activation and pen, eraser, or lasso edits while a view is in Authored Preview
- Store optional inline-void display labels on `InkCopy` so `InkCopyView` renders mention text instead of raw `U+FFFC`
- Translate text marks horizontally when their block shifts, prune unreferenced `ink-gone` records in `dropDigitized`, and restore viewport-scoped ink placement on `afterprint`
- Remove experimental `54.0.0-beta.2` ink record compatibility; saved ink uses the packed format only
