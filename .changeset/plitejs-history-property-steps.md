---
'plitejs': patch
---

Undo history now merges a run of updates that write only properties of the same nodes into one undo step inside the merge window, as it already did for one node. This holds in one root or across several, whatever properties each update writes. A `new-batch` update still starts its own step.
