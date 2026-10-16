---
'plitejs': patch
---

- Add explicit external-text adapters for exact-one-Text elements while keeping canonical text, selection, history, composition, decorations, and collaboration in Plite
- Validate external text projections once per mounted view batch and deliver the current selection before focus
- Keep nested text editors synchronized with their mounted view's read-only mode
- Keep the caret's column when ArrowUp or ArrowDown moves into or out of an external text view: a view may answer `offsetAt({ edge, x })` with the offset under that column, and `navigateOut` takes the caret's goal `x` for vertical exits only
