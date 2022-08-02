---
'@udecode/plate-core': minor
---

- `ElementProvider` now has `SCOPE_ELEMENT='element'` scope in addition to the plugin key, so `useElement()` can be called without parameter (default = `SCOPE_ELEMENT`). You'll need to use the plugin key scope only to get an ancestor element. 