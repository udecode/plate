---
'plitejs': patch
---

Fix `EditorRoot`'s `readOnly` letting a write through in the render that sets it, such as from a removed control's cleanup or a custom element's `connectedCallback`. That write now throws through an `Editable`, `PagedEditable` or `VirtualizedEditable`, also when the render mounts, removes, hides or suspends it. An `EditorReadOnlyProvider` that sets no `readOnly` no longer makes those editables writable.
