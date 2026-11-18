---
'plitejs': patch
---

Fix a Yjs peer that failed to load a shared document after one peer retyped an element while another set a property only the old type holds. The loading peer now drops that property, as live peers already do.
