---
'plitejs': patch
---

- Fix `nodes.byId`, `unique.holder` and `at: { id }` targets in a transaction over a view of another document. They find the element that held the value in the view's document, where a copy the transaction inserted before that element used to take the value. This holds in the main root and in named roots, and inside a `collaboration`-tagged update of the source editor.
- Refuse a spec that a transaction over a view of another document built when the source editor applies it, with `Cannot apply a transaction spec outside its base state.`
