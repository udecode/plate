---
'plitejs': patch
---

Fix `tx.blocks.toggle(props, { wrap: true })` wrapping each selected block in its own wrapper. Adjacent selected blocks with the same parent now share one wrapper.
