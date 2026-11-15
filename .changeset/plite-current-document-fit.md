---
'plitejs': patch
---

Return a document that `fitDocument` or `fitDocumentWithSelection` finds already current without rebuilding it, so loading a saved document through `migrateDocument` and the editor no longer rebuilds it twice. A current document keeps its keys in the order they were saved in.
