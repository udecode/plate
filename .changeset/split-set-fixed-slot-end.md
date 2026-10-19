---
'plitejs': patch
---

Fix `nodes.set` with `split: true` moving the end of a block whose slot fixes its type, such as a required title, into the next position as the new type. The update now throws, as it already did for the start or middle of that block.
