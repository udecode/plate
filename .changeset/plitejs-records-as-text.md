---
'plitejs': patch
---

Open a document's saved records faster. Each record loads once as text and parses the first time something reads it. Records read back from `editor.read.value()` now always list their keys in sorted order, as records written after the open already did
