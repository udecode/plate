---
'platejs': patch
---

- Fix Tab and Shift+Tab with `TabbablePlugin` so focus visits the tabbable elements inside void nodes in document order and leaves the editor at either end, instead of skipping a void's buttons or looping between two voids
- Fix Tab with `TabbablePlugin` skipping the controls inside the element that holds the caret; Shift+Tab from that element now moves to the controls before it
- Fix Tab and Shift+Tab with `TabbablePlugin` selecting a void when focus leaves the void's controls; focus now moves to the adjacent void's controls, or the caret goes to the nearest text outside the void
- Fix Tab and Shift+Tab with `TabbablePlugin` starting from the anchor of a selected range; Tab now starts after the range's end and Shift+Tab before its start
- Fix a click on the empty editor padding placing no caret in Firefox, or moving the caret to the start of the document in Chrome, when `NodeSelectionDrag` is mounted; the click now places the caret at the nearest text position, so typing works at once
