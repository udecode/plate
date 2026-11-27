---
'platejs': patch
---

Add `read.conditionTargets(fieldId)` to `BaseFieldPlugin` to return the field ids in document order that a condition on `fieldId` may target without closing a loop, plus any field the condition already names. Check name-group condition conflicts without recursion so deep chains of named fields do not overflow the stack.
