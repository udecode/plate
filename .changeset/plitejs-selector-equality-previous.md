---
'plitejs': patch
---

Fix selector hooks calling a custom `equalityFn` with `null` before the first result. `equalityFn` now takes `(a: T, b: T) => boolean`.
