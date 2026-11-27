---
'platejs': patch
---

- Add free text to boards (`BaseBoardTextPlugin`, `BoardTextPlugin`, `setTool('text')` with the `T` shortcut, and double-clicking an empty spot on the board). Clicking places auto-sized text that grows in width and height as you type (`autoSize: true`); dragging or resizing locks a fixed wrapping width (`autoSize: false`). In Editing mode, leaving an unmodified newly clicked text box discards it without adding an undo step. Typing near a board edge pans the camera to keep the caret in view without changing the document, and `exportPicture` measures both width and height of auto-sized free text.
