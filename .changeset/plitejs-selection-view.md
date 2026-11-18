---
'plitejs': patch
---

Add `useSelectionView(editor)` to `plitejs/react`. It returns the mounted view whose root holds the selection when that view's Editable sits inside the Editable of `editor`, such as a board note inside the page. It returns `editor` when no such view is mounted. A toolbar beside the page's Editable uses it to act on note text.
