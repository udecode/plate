---
'plitejs': patch
---

- Fix `unique.holder` in an authored preview or a projected document view returning the stored document's key and path, or nothing. A read that finds a node by a unique id, such as a board's `read.board.shape`, now works there.
