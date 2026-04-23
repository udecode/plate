---
"@platejs/core": patch
---

Skip inactive mark renderers in `pipeRenderLeaf` and `pipeRenderText` to reduce mark-heavy mount cost

Keep the plain element fast path when inject props are pathless and no wrapper is active for the current element

Handle simple active leaf marks directly in `pipeRenderLeaf` to reduce bundled mark mount cost

Avoid per-leaf mark activation allocation and sorting in the shared mark pipes while keeping plain leaves cheap
