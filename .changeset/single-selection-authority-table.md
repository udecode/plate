---
'platejs': major
---

Store multi-cell selection in directional core `NodeSelection`. Derive table geometry, merge and split eligibility, borders, and cell background updates through the Table plugin.

Keep table-cell highlights attached through React Strict Mode effect and ref replay, with detached hosts releasing their paint and caret overrides.

Grow table column-width metadata with structural cell paste so right-edge and bottom-right paste render complete, usable rectangles. Keep the complete paste in one undoable and redoable history action.
