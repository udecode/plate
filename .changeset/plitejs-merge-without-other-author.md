---
'plitejs': patch
---

Fix accepting a join, or rejecting a split, that merges a line another author inserted or struck, which returned `blocked` until that author's change was decided. The merge now applies, and the other author's change stays pending on its text. Accepting the deletion of a line while another author's join onto it is pending keeps the line empty until the join is decided, as Google Docs does. Decisions of different authors can still give different results in different orders.
