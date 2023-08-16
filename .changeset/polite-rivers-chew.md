---
"@udecode/plate-node-id": minor
---

New plugin option: `idOverrideKey`. Default is `_id`. To manually insert a node with a custom id, use this node key. For example, inserting a node with `_id: 1` using `editor.insertNodes` will result into `_id: 1` being replaced by `id: 1`, not overridden by plugin default behavior.
