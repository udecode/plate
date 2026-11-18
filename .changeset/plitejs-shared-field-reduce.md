---
'plitejs': patch
---

Refuse `reduce` on a shared state field. `defineStateField` throws for `collab: 'shared'` with `reduce`, and installing a state field object that `defineStateField` did not create throws too. A reduced value never reached late joiners, and reached no other collaborator when a local effect triggered it. Set a shared field with `tx.setField`; a local field keeps `reduce`.
