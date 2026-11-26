---
'plitejs': patch
---

In an editor whose elements store ids, such as with Plate's `ElementIdPlugin`, undo after a collaborator moves or deletes a line as an editor without ids does. After an Enter at a line's start, the undo could skip a step, drop the letters the collaborator typed or give back the wrong lines.
