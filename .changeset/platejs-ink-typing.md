---
'platejs': patch
---

Speed up typing, drawing, scrolling and deleting many marked blocks in documents with many ink marks. `read.marks()` keeps each mark's object while its saved mark and the snapshots it names stay the same, so a pen-up decodes only the mark it changes.
