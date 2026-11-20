---
'plitejs': patch
---

Run a plugin's `update` factory the first time an update or a correction reads its group, not at the start of every update, so updates that never read a group skip it
