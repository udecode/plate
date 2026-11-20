---
'plitejs': patch
---

- Return `stale` from an external-text view's `dispatch` when the editor refuses the edit, such as one Suggesting cannot record, and reset the view to the editor's text. A CodeMirror code block no longer keeps text the editor refused.
- Keep the undo boundary when the editor refuses an external-text edit, so the next edit after a composition still gets its own undo step.
