---
'plitejs': patch
---

- Fix a drag selection that moves onto another root of a multi-root document, which threw `Cannot resolve view-boundary point` on every mouse move. The selection stays in the root where the drag started.
