---
'plitejs': patch
---

- Keep a view that sets its own authored mode showing that mode while the editor it comes from shows a review preview. The view `EditorRoot` mounts copies the editor's mode when it mounts, so call `setView` on that mounted view to change what it shows.
- Fix a document view read throwing while the editor it comes from shows a review preview.
