---
'@udecode/slate': patch
---

Change type of `editor.id` from `any` to `string`. The previous value of `any` was causing `NodeIn<Value>['id']` to have type `any`.
