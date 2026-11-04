---
'plitejs': patch
---

- Fix undo dropping a teammate's paragraph after you press Enter inside a quote or another container and the teammate inserts a paragraph next to the new line. The undo now joins your lines and keeps the teammate's paragraph in the container, as it already did at the top level. This also holds when the teammate changes the container's properties, adds blocks outside it, or adds the paragraph before an empty line that follows yours.
- Fix undo dropping an empty paragraph a teammate adds right after a line you split, and merging a teammate's paragraph into your line when you undo a line break at the end of a line and a second one from the empty line it made.
