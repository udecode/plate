---
'plitejs': patch
---

Fix `EditorRoot`'s `readOnly` letting a write through in the render that sets it. A write from a removed control's cleanup or a custom element's `connectedCallback` in that render now throws. This holds through an `Editable`, `PagedEditable` or `VirtualizedEditable` with `root` that the render keeps, mounts, removes, hides or suspends, and when the render moves the `EditorRoot` to another root. When `readOnly` turns off, writes through those editables stay refused until React has removed and inserted the nodes of that render. An `EditorReadOnlyProvider` that sets no `readOnly` no longer makes those editables writable.
