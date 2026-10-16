---
'plitejs': patch
---

Fix `nodes.lift` throwing when the schema does not allow the lifted block at its new position, such as a required title. The lift now leaves that block where it is.
