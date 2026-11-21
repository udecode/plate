---
'plitejs': patch
---

Add `editor.read.schema.canPlace(nodes, { at, replace, root })`, which answers whether `nodes` can land at a slot, or take the place of the child there, under the rule `tx.blocks.insert` enforces. A menu can disable what the parent cannot hold.
