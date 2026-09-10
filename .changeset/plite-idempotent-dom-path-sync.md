---
'plitejs': patch
---

Skip unchanged DOM path and node-key attribute writes during editor synchronization. Preserve path bindings and repair stale attributes while avoiding unnecessary mutation observer work.
