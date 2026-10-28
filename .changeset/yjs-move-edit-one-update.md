---
'plitejs': patch
---

- Fix Yjs peers ending with different documents when one update moves a block and also changes the document elsewhere, such as typing in the moved block, moving another block past it, inserting or removing a block, or setting a property or mark on another block. The other peers used to lose text, a block, a property or a mark, or duplicate a block.
