---
'plitejs': patch
'platejs': patch
---

Scope `createAnnotationStore` to its view's own root so views never project another root's range or read other roots' decoration keys, and replace `BaseCommentsPlugin`'s per-view named-root watcher with one document-wide thread index driven by `changed.anchors()`, `changed.rootPlacements()`, and per-root decoration keys.
