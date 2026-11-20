---
'plitejs': patch
---

Make `editor.plugin(Plugin)` on a React view editor, such as the one `useRootEditor()` returns, return the same object on every call, so a hook that lists it as a dependency no longer runs again on each render.
