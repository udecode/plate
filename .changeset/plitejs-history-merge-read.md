---
'plitejs': patch
---

Undo history no longer reads a document's whole top-level list when it merges an update into the undo step before it. In a document of 10,000 paragraphs, each merged keystroke read all 10,000 before this change and reads none now.
