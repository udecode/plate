---
"@udecode/plate-node-id": patch
---

Default `idCreator` option is now a basic random operation (`Math.random().toString(36).substring(2, 7)`) instead of `Date.now()`
