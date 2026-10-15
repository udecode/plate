---
'plitejs': patch
---

Make `useEditor` build one editor per component under React Strict Mode, as it does in production. A `useEditor` editor with a `yjs()` plugin no longer throws "already has an independent binding" in development.
