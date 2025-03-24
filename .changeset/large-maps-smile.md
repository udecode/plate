---
'@udecode/plate-core': patch
---

Fix: `PlatePlugin.render.beforeEditable` and `afterEditable` should be siblings to `aboveEditable` instead of children. `aboveSlate` should be used for that scenario.
