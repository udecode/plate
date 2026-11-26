---
'plitejs': patch
---

In an editor whose elements store ids, such as with Plate's `ElementIdPlugin`, insert pasted lines as an editor without ids does. The paste replaced a piece of the line, so undoing it after a collaborator's concurrent move could drop the letters they typed.
