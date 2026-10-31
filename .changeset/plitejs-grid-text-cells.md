---
'plitejs': patch
---

Fix editing grid cells that hold their text directly, such as cells declared with `schema.content.text()`, and pasting into any grid cell:

- Deleting or typing over a range across cells empties each covered cell in place and keeps every row and cell.
- Inserting a block node at a caret in such a cell, or over a range whose removal lands in one, changes nothing instead of splitting the cell or throwing.
- A paste of paragraphs that cannot fit inside the cell it lands in changes nothing instead of splitting the cell, its row or the grid.
