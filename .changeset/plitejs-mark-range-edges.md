---
'plitejs': patch
---

Fix `marks.add`, and `nodes.set` with `split`, restyling a leaf that the range only touches at its edge. A selection that starts at the end of one leaf, or ends at the start of the next, no longer changes that leaf.
