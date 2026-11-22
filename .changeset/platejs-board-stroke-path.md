---
'platejs': patch
---

- Add `read.board.strokePath(id)`, which returns the SVG path a board draws for a pen line with its box's width and height, or `null` when `id` names no pen line. It needs no mounted board.
- Export `BoardStrokePath` from `platejs/board`. `platejs/board/react` still exports it.
