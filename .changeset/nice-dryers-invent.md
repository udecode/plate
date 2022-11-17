---
"@udecode/plate-mention": patch
---

Fix mention espace keydown handler: it always prevents default on Escape but it should only happen when there is a mention input
