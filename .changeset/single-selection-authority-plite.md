---
'@platejs/plite': major
---

Use `editor.update.selection.setNodes(targets, { anchor, focus })` or `tx.selection.setNodes(targets, { anchor, focus })` for directional one-or-many node selection. `NodeSelection` stores canonical `paths` plus exact `anchorPath` and `focusPath`; `SelectionApi.nodes` constructs detached values.

Read the active plain directed `Range` with `editor.read.selection()`, `state.selection()`, or `tx.selection()`. Use `selection.ranges()` for every exact range and `selection.nodes()` for exact selected-node membership. The public `primaryRange()` and `replacementRange()` projections are not part of the selection surface.
