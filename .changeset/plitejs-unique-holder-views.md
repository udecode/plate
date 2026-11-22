---
'plitejs': patch
---

- Fix `unique.holder` in an authored preview or a projected document view, which returned the stored document's key and path, or nothing. It now returns the holder's key and path in the document the view shows, so a read that finds a node by a unique id, such as a board's `read.board.shape`, works there.
