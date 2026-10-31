---
'plitejs': patch
---

- Fix dragging or moving content that holds pending suggestions, which an editor with any correction plugin refused as lossy. A move still refuses when a correction writes during it and another author's pending change deletes or unwraps a moved block
