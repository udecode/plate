---
'plitejs': patch
---

Fix an editor keeping every earlier document snapshot and its node index in memory. Memory grew with every edit, and with pending suggestions it grew by about the size of the document on each one.
