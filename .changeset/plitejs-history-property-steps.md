---
'plitejs': patch
---

Undo history now merges an update that writes only properties of several nodes into the step before it inside the merge window. Both updates must write the same properties on the same nodes, in one root or across several. An update on one node keeps merging whatever properties it writes. Two updates in one composition that write properties across several roots merge only when they touch the same roots. A `new-batch` update still starts its own step.
