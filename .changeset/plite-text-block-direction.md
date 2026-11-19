---
'plitejs': patch
---

Set `dir` on each text block from its first letter, so a Hebrew or Arabic paragraph lays out right-to-left beside a left-to-right one. A block whose first letter changes direction while typing flips with it, and `RenderElementProps.attributes.dir` passes the direction to custom renderers.
