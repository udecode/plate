---
'plitejs': major
---

Use `editor.update.selection.setNodes(targets, { anchor, focus, mode })` or `tx.selection.setNodes(targets, { anchor, focus, mode })` for directional one-or-many node selection. `NodeSelection` stores canonical `paths`, exact `anchorPath` and `focusPath`, and `mode`: `'block'` (the default) for a block selection, or `'object'` for one selected object node such as an image. `SelectionApi.nodes(paths, { mode })` constructs detached values and requires `mode`. Read it with `editor.read.selection.nodeMode()`.

Read the active plain directed `Range` with `editor.read.selection()`, `state.selection()`, or `tx.selection()`. Use `selection.ranges()` for every exact range and `selection.nodes()` for exact selected-node membership. The public `primaryRange()` and `replacementRange()` projections are not part of the selection surface.

Apply marks and block formatting across the content of every selected node container.
