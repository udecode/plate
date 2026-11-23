---
'platejs': patch
---

- Add `read.board.strokePath(id)`, which returns the SVG path a board draws for a pen line with its box's width and height, or `null` when `id` names no pen line. It needs no mounted board.
- Move `BoardStrokePath` from `platejs/board/react` to `platejs/board`. Import it from `platejs/board`.
