---
'plitejs': patch
---

Fix a crash when a view switches to the accepted preview after an undo that rebuilds the whole preview, such as undoing Accept all after a struck word was dragged. The preview now shows the accepted text.
