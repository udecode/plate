---
'plitejs': patch
---

Fix accepting a line typed right after another author's pending join, which returned `blocked` until that join was decided. The accept now applies. The line stays where it is stored, and accepting the join later still places it after the joined line, as deciding both at once does.
