---
"@platejs/core": patch
---

- Fix `useElement` and `usePath` re-rendering every descendant element when an ancestor element changes, such as every cell of a table on each keystroke in one cell. They now re-render only when their own element or path changes.
