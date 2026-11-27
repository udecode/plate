---
'platejs': patch
---

- Update `InkPlugin` and `InkContent` placement, lasso, Backspace, and Delete to read shown marks via `read.shownMarks()`, skipping digitized marks on default passes and leaving faded digitized marks untouched by the eraser, Backspace, and Delete.
- Add experimental `editor.plugin(InkPlugin).api.setShowDigitized(value)` (with `showDigitized` on `InkViewState` and optional `digitized` on `InkSign`) to show digitized marks faded over their words or as separate digitized signs and let the lasso pick them.
