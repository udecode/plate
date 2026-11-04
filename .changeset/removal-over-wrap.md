---
'plitejs': patch
---

- Fix removing a block while a teammate wraps a line inside it. The merged document copied the block after the removed one into the teammate's new wrapper, or dropped the next line of an enclosing quote. The removal now takes the teammate's wrapper with it and keeps a block the teammate added beside the wrap. A redo of removing a quote, after a redo of merging a line into that quote and a teammate's wrap of the merged line in between, no longer copies the next paragraph.
