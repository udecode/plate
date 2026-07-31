---
'@platejs/plite': patch
---

Tighten schema authoring and runtime contracts. Complete schemas use direct root
content with closed defaults, `schema.element.textBlock()` preserves exact
option inference, unvalidated JSON properties stay generic, property metadata
is placement-owned, and external validation uses narrowing assertions. Rename
the runtime constructor and markable-void predicate to `create` and
`isMarkableVoid`.
