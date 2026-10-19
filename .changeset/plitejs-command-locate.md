---
'plitejs': patch
---

- Add `locate` and `selection: true` to `defineCommand`, and `txLocate`, `locateAt` and `txSelection` for plugin update methods. They declare where the locations a command or method takes land when it runs on the document with every pending suggestion accepted; `place.location` from the new `EditorCommandPlace` type maps each one.
